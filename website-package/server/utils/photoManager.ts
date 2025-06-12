import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { properties } from '@shared/schema';
import { eq } from 'drizzle-orm';
import sharp from 'sharp';

export interface PhotoData {
  filename: string;
  originalName: string;
  altText: string;
  uploadedAt: string;
  fileSize: number;
  mimeType: string;
  order: number;
}

export interface PhotoUploadResult {
  success: boolean;
  photos: PhotoData[];
  errors: string[];
  totalUploaded: number;
}

export class PhotoManager {
  private static readonly UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'properties');
  private static readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  private static readonly MAX_PHOTOS = 20;

  static async ensureUploadDirectory(): Promise<void> {
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      fs.mkdirSync(this.UPLOAD_DIR, { recursive: true, mode: 0o755 });
    }
  }

  static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(originalName).toLowerCase() || '.jpg';
    const safeName = path.basename(originalName, ext)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 20);
    return `${safeName}_${timestamp}_${randomString}${ext}`;
  }

  static createMulterStorage(): multer.StorageEngine {
    return multer.diskStorage({
      destination: async (req, file, cb) => {
        try {
          await this.ensureUploadDirectory();
          cb(null, this.UPLOAD_DIR);
        } catch (error) {
          cb(error as Error, '');
        }
      },
      filename: (req, file, cb) => {
        const filename = this.generateUniqueFilename(file.originalname);
        cb(null, filename);
      }
    });
  }

  static createUploadMiddleware(): multer.Multer {
    return multer({
      storage: this.createMulterStorage(),
      limits: {
        fileSize: this.MAX_FILE_SIZE,
        files: this.MAX_PHOTOS
      },
      fileFilter: (req, file, cb) => {
        if (this.ALLOWED_TYPES.includes(file.mimetype.toLowerCase())) {
          cb(null, true);
        } else {
          cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${this.ALLOWED_TYPES.join(', ')}`));
        }
      }
    });
  }

  static async optimizePhoto(filePath: string): Promise<void> {
    try {
      const optimizedPath = `${filePath}_optimized`;
      
      await sharp(filePath)
        .resize(1920, 1080, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 85, 
          progressive: true 
        })
        .toFile(optimizedPath);

      // Replace original with optimized version
      fs.renameSync(optimizedPath, filePath);
    } catch (error) {
      console.warn('Photo optimization failed:', error);
      // Continue without optimization if it fails
    }
  }

  static async uploadPhotos(files: Express.Multer.File[], propertyId?: number): Promise<PhotoUploadResult> {
    const result: PhotoUploadResult = {
      success: false,
      photos: [],
      errors: [],
      totalUploaded: 0
    };

    if (!files || files.length === 0) {
      result.errors.push('No files provided for upload');
      return result;
    }

    // Process each uploaded file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Optimize the photo
        await this.optimizePhoto(file.path);

        const photoData: PhotoData = {
          filename: file.filename,
          originalName: file.originalname,
          altText: `Property image ${i + 1}`,
          uploadedAt: new Date().toISOString(),
          fileSize: file.size,
          mimeType: file.mimetype,
          order: i
        };

        result.photos.push(photoData);
        result.totalUploaded++;
      } catch (error) {
        const errorMsg = `Failed to process ${file.originalname}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        
        // Clean up failed file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    // Update property with photos if propertyId provided
    if (propertyId && result.photos.length > 0) {
      try {
        await this.updatePropertyPhotos(propertyId, result.photos);
      } catch (error) {
        result.errors.push(`Failed to update property ${propertyId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    result.success = result.totalUploaded > 0;
    return result;
  }

  static async updatePropertyPhotos(propertyId: number, newPhotos: PhotoData[], replace: boolean = false): Promise<void> {
    // Get existing property
    const [property] = await db.select().from(properties).where(eq(properties.id, propertyId));
    
    if (!property) {
      throw new Error(`Property ${propertyId} not found`);
    }

    let allPhotos: PhotoData[];

    if (replace) {
      // Replace all photos with new ones
      allPhotos = newPhotos.map((photo, index) => ({
        ...photo,
        order: index
      }));
    } else {
      // Combine existing photos with new ones, maintaining order
      const existingPhotos = Array.isArray(property.photos) ? property.photos as PhotoData[] : [];
      const nextOrder = existingPhotos.length;
      
      // Update order for new photos
      const updatedNewPhotos = newPhotos.map((photo, index) => ({
        ...photo,
        order: nextOrder + index
      }));

      allPhotos = [...existingPhotos, ...updatedNewPhotos];
    }

    // Update property in database
    await db.update(properties)
      .set({ 
        photos: allPhotos as any,
        updatedAt: new Date()
      })
      .where(eq(properties.id, propertyId));
  }

  static async deletePhoto(propertyId: number, filename: string): Promise<boolean> {
    try {
      // Get property
      const [property] = await db.select().from(properties).where(eq(properties.id, propertyId));
      
      if (!property) {
        throw new Error(`Property ${propertyId} not found`);
      }

      const photos = Array.isArray(property.photos) ? property.photos as PhotoData[] : [];
      const updatedPhotos = photos.filter(photo => photo.filename !== filename);

      // Re-order remaining photos
      const reorderedPhotos = updatedPhotos.map((photo, index) => ({
        ...photo,
        order: index
      }));

      // Update database
      await db.update(properties)
        .set({ 
          photos: reorderedPhotos,
          updatedAt: new Date()
        })
        .where(eq(properties.id, propertyId));

      // Delete physical file
      const filePath = path.join(this.UPLOAD_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  }

  static async reorderPhotos(propertyId: number, photoOrder: string[]): Promise<boolean> {
    try {
      const [property] = await db.select().from(properties).where(eq(properties.id, propertyId));
      
      if (!property) {
        throw new Error(`Property ${propertyId} not found`);
      }

      const photos = Array.isArray(property.photos) ? property.photos as PhotoData[] : [];
      
      // Create a map of filename to photo data
      const photoMap = new Map(photos.map(photo => [photo.filename, photo]));
      
      // Reorder photos based on the provided order
      const reorderedPhotos = photoOrder
        .map((filename, index) => {
          const photo = photoMap.get(filename);
          if (photo) {
            return { ...photo, order: index };
          }
          return null;
        })
        .filter(photo => photo !== null) as PhotoData[];

      // Update database
      await db.update(properties)
        .set({ 
          photos: reorderedPhotos,
          updatedAt: new Date()
        })
        .where(eq(properties.id, propertyId));

      return true;
    } catch (error) {
      console.error('Error reordering photos:', error);
      return false;
    }
  }

  static async getPropertyPhotos(propertyId: number): Promise<PhotoData[]> {
    try {
      const [property] = await db.select().from(properties).where(eq(properties.id, propertyId));
      
      if (!property) {
        return [];
      }

      const photos = Array.isArray(property.photos) ? property.photos as PhotoData[] : [];
      return photos.sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error getting property photos:', error);
      return [];
    }
  }

  static getPhotoUrl(filename: string): string {
    return `/uploads/properties/${filename}`;
  }

  static async validatePhotoIntegrity(propertyId: number): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    try {
      const photos = await this.getPropertyPhotos(propertyId);
      
      for (const photo of photos) {
        const filePath = path.join(this.UPLOAD_DIR, photo.filename);
        if (!fs.existsSync(filePath)) {
          issues.push(`Missing file: ${photo.filename}`);
        }
      }

      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { valid: false, issues };
    }
  }

  static async cleanupOrphanedFiles(): Promise<{ cleaned: number; errors: string[] }> {
    const result = { cleaned: 0, errors: [] };
    
    try {
      // Get all photo filenames from database
      const allProperties = await db.select().from(properties);
      const usedFilenames = new Set<string>();
      
      for (const property of allProperties) {
        const photos = Array.isArray(property.photos) ? property.photos as PhotoData[] : [];
        photos.forEach(photo => usedFilenames.add(photo.filename));
      }

      // Check files in upload directory
      const files = fs.readdirSync(this.UPLOAD_DIR);
      
      for (const file of files) {
        if (!usedFilenames.has(file)) {
          try {
            const filePath = path.join(this.UPLOAD_DIR, file);
            fs.unlinkSync(filePath);
            result.cleaned++;
          } catch (error) {
            result.errors.push(`Failed to delete ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
    } catch (error) {
      result.errors.push(`Cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }
}