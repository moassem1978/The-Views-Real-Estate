
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { ImageBackupManager } from './imageBackupManager';
import { ImageValidator } from './imageValidator';
import { storage as dbStorage } from '../storage';

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
  private static readonly IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
  private static readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  static async ensureDirectories(): Promise<void> {
    try {
      // Ensure both upload and images directories exist
      const directories = [this.UPLOAD_DIR, this.IMAGES_DIR];
      
      for (const dir of directories) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true, mode: 0o777 });
          console.log(`📁 Created directory: ${dir}`);
        }
        fs.chmodSync(dir, 0o777);
      }
    } catch (error) {
      console.error('Error ensuring directories:', error);
      throw new Error('Failed to create required directories');
    }
  }

  static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const uuid = uuidv4().split('-')[0]; // Use first part of UUID
    const ext = path.extname(originalName).toLowerCase() || '.jpg';
    const baseName = path.basename(originalName, ext)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 20);
    
    return `photo-${timestamp}-${uuid}-${baseName}${ext}`;
  }

  static createMulterStorage(): multer.StorageEngine {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        this.ensureDirectories().then(() => {
          cb(null, this.UPLOAD_DIR);
        }).catch(err => {
          cb(err, '');
        });
      },
      filename: (req, file, cb) => {
        const filename = this.generateUniqueFilename(file.originalname);
        console.log(`📸 Generated unique filename: ${filename} for ${file.originalname}`);
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

  static async processImageWithSharp(filePath: string): Promise<void> {
    try {
      const processedPath = path.join(this.IMAGES_DIR, path.basename(filePath));
      
      await sharp(filePath)
        .resize(1920, 1080, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 85, 
          progressive: true 
        })
        .toFile(processedPath);

      console.log(`🖼️ Processed image with Sharp: ${processedPath}`);
    } catch (error) {
      console.warn('Sharp processing failed, using original:', error);
    }
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
          // Process image with Sharp
          await this.processImageWithSharp(file.path);

          // Validate the uploaded file exists
          const validation = ImageValidator.validateImageExists(file.filename);
          
          if (!validation.isValid) {
            errors.push(`${file.originalname}: ${validation.error}`);
            continue;
          }

          // Create photo object with unique filename
          const photo = {
            filename: file.filename, // Already unique from multer
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

      // Get existing photos - preserve original filenames when editing
      const existingPhotos = Array.isArray(property.photos) ? property.photos : [];
      const existingImages = Array.isArray(property.images) ? property.images : [];

      // Add new photos to existing (preserving original filenames in photos array)
      const updatedPhotos = [
        ...existingPhotos,
        ...newPhotos.map((photo, index) => ({
          filename: photo.filename, // Keep unique filename
          altText: photo.altText,
          uploadedAt: new Date().toISOString(),
          order: existingPhotos.length + index
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
