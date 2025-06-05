
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ImageBackupManager } from './imageBackupManager';
import { ImageValidator } from './imageValidator';
import { storage as dbStorage } from '../storage';
import { convertImagesToPhotos } from './photoUtils';

export interface PhotoUploadResult {
  success: boolean;
  uploadedPhotos: Array<{
    filename: string;
    altText: string;
    url: string;
  }>;
  errors: string[];
  totalUploaded: number;
}

export class PhotoUploadHandler {
  private static readonly UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'properties');
  private static readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  static async ensureUploadDirectory(): Promise<void> {
    try {
      if (!fs.existsSync(this.UPLOAD_DIR)) {
        fs.mkdirSync(this.UPLOAD_DIR, { recursive: true, mode: 0o777 });
        console.log(`📁 Created upload directory: ${this.UPLOAD_DIR}`);
      }
      
      // Ensure proper permissions
      fs.chmodSync(this.UPLOAD_DIR, 0o777);
    } catch (error) {
      console.error('Error ensuring upload directory:', error);
      throw new Error('Failed to create upload directory');
    }
  }

  static createMulterStorage(): multer.StorageEngine {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        this.ensureUploadDirectory().then(() => {
          cb(null, this.UPLOAD_DIR);
        }).catch(err => {
          cb(err, '');
        });
      },
      filename: (req, file, cb) => {
        const timestamp = Date.now();
        const randomId = Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        const filename = `photo-${timestamp}-${randomId}${ext}`;
        
        console.log(`📸 Generated photo filename: ${filename} for ${file.originalname}`);
        cb(null, filename);
      }
    });
  }

  static createUploadMiddleware(): multer.Multer {
    return multer({
      storage: this.createMulterStorage(),
      limits: {
        fileSize: this.MAX_FILE_SIZE,
        files: 20
      },
      fileFilter: (req, file, cb) => {
        if (this.ALLOWED_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`));
        }
      }
    });
  }

  static async handlePhotoUpload(
    req: Request, 
    res: Response, 
    propertyId?: number
  ): Promise<PhotoUploadResult> {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        throw new Error('No files uploaded');
      }

      console.log(`🔄 Processing ${files.length} photos for property ${propertyId || 'unknown'}`);

      // Create backup if propertyId is provided
      if (propertyId) {
        await this.createPreUploadBackup(propertyId);
      }

      // Process uploaded files
      const uploadedPhotos = [];
      const errors = [];

      for (const file of files) {
        try {
          // Validate the uploaded file
          const validation = ImageValidator.validateImageExists(file.filename);
          
          if (!validation.isValid) {
            errors.push(`${file.originalname}: ${validation.error}`);
            continue;
          }

          // Create photo object
          const photo = {
            filename: file.filename,
            altText: this.generateAltText(file.originalname, uploadedPhotos.length),
            url: `/uploads/properties/${file.filename}`
          };

          uploadedPhotos.push(photo);
          console.log(`✅ Processed photo: ${photo.filename}`);

        } catch (error) {
          const errorMsg = `Failed to process ${file.originalname}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      // Update property if propertyId provided
      if (propertyId && uploadedPhotos.length > 0) {
        await this.updatePropertyWithPhotos(propertyId, uploadedPhotos);
      }

      const result: PhotoUploadResult = {
        success: uploadedPhotos.length > 0,
        uploadedPhotos,
        errors,
        totalUploaded: uploadedPhotos.length
      };

      console.log(`📊 Upload complete: ${result.totalUploaded} photos processed, ${errors.length} errors`);
      return result;

    } catch (error) {
      console.error('Photo upload handler error:', error);
      throw error;
    }
  }

  private static async createPreUploadBackup(propertyId: number): Promise<void> {
    try {
      const property = await dbStorage.getPropertyById(propertyId);
      if (property) {
        const legacyImages = property.images || [];
        const photoMetadata = property.photos || [];
        
        await ImageBackupManager.createImageBackup(propertyId, legacyImages, photoMetadata);
        console.log(`📦 Created pre-upload backup for property ${propertyId}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to create pre-upload backup for property ${propertyId}:`, error);
      // Don't throw - allow upload to continue
    }
  }

  private static async updatePropertyWithPhotos(
    propertyId: number, 
    newPhotos: Array<{ filename: string; altText: string; url: string }>
  ): Promise<void> {
    try {
      const property = await dbStorage.getPropertyById(propertyId);
      if (!property) {
        throw new Error(`Property ${propertyId} not found`);
      }

      // Get existing photos
      const existingPhotos = Array.isArray(property.photos) ? property.photos : [];
      const existingImages = Array.isArray(property.images) ? property.images : [];

      // Add new photos to existing
      const updatedPhotos = [
        ...existingPhotos,
        ...newPhotos.map(photo => ({
          filename: photo.filename,
          altText: photo.altText,
          uploadedAt: new Date().toISOString()
        }))
      ];

      // Also update legacy images for compatibility
      const updatedImages = [
        ...existingImages,
        ...newPhotos.map(photo => photo.url)
      ];

      // Update property
      await dbStorage.updateProperty(propertyId, {
        photos: updatedPhotos,
        images: updatedImages
      });

      console.log(`✅ Updated property ${propertyId} with ${newPhotos.length} new photos`);

    } catch (error) {
      console.error(`Error updating property ${propertyId} with photos:`, error);
      throw error;
    }
  }

  private static generateAltText(originalName: string, index: number): string {
    const baseName = path.basename(originalName, path.extname(originalName));
    const cleanName = baseName.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
    
    if (cleanName) {
      return `Property ${cleanName} - Image ${index + 1}`;
    }
    
    return `Property Image ${index + 1}`;
  }
}
