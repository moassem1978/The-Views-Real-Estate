
import { ImageBackupManager } from './imageBackupManager';
import { ImageValidator } from './imageValidator';
import { storage as dbStorage } from '../storage';
import { pool } from '../db';
import fs from 'fs';
import path from 'path';

export interface RestoreResult {
  success: boolean;
  restoredCount: number;
  errors: string[];
  restoredPhotos: Array<{
    filename: string;
    altText: string;
    source: 'backup' | 'assets' | 'existing';
  }>;
}

export class PhotoRestoreService {
  private static readonly ASSETS_DIR = path.join(process.cwd(), 'attached_assets');
  private static readonly UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'properties');

  /**
   * Restore photos for a specific property from backup
   */
  static async restorePropertyPhotos(propertyId: number): Promise<RestoreResult> {
    try {
      console.log(`🔄 Starting photo restore for property ${propertyId}`);

      // Try to restore from backup first
      const backupResult = await ImageBackupManager.restoreImagesFromBackup(propertyId);
      
      if (backupResult.success) {
        return {
          success: true,
          restoredCount: backupResult.restoredPhotos.length,
          errors: backupResult.errors,
          restoredPhotos: backupResult.restoredPhotos.map(photo => ({
            ...photo,
            source: 'backup' as const
          }))
        };
      }

      // If backup restore failed, try manual restore
      return await this.manualRestorePropertyPhotos(propertyId);

    } catch (error) {
      console.error(`Error restoring photos for property ${propertyId}:`, error);
      return {
        success: false,
        restoredCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown restore error'],
        restoredPhotos: []
      };
    }
  }

  /**
   * Restore all photos from attached_assets directory
   */
  static async restoreAllPhotosFromAssets(): Promise<RestoreResult> {
    try {
      console.log('🔄 Starting bulk photo restore from attached_assets');

      if (!fs.existsSync(this.ASSETS_DIR)) {
        throw new Error('attached_assets directory not found');
      }

      // Ensure uploads directory exists
      if (!fs.existsSync(this.UPLOADS_DIR)) {
        fs.mkdirSync(this.UPLOADS_DIR, { recursive: true, mode: 0o777 });
      }

      const assetFiles = fs.readdirSync(this.ASSETS_DIR);
      const imageFiles = assetFiles.filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );

      console.log(`📁 Found ${imageFiles.length} image files in attached_assets`);

      const restoredPhotos = [];
      const errors = [];

      for (const file of imageFiles) {
        try {
          const sourcePath = path.join(this.ASSETS_DIR, file);
          const destPath = path.join(this.UPLOADS_DIR, file);

          // Skip if file already exists
          if (fs.existsSync(destPath)) {
            console.log(`⏭️ Skipping existing file: ${file}`);
            continue;
          }

          // Copy file
          fs.copyFileSync(sourcePath, destPath);
          
          // Validate copied file
          const validation = ImageValidator.validateImageExists(file);
          if (validation.isValid) {
            restoredPhotos.push({
              filename: file,
              altText: `Restored Image - ${file}`,
              source: 'assets' as const
            });
            console.log(`✅ Restored: ${file}`);
          } else {
            errors.push(`Validation failed for ${file}: ${validation.error}`);
            // Remove invalid file
            if (fs.existsSync(destPath)) {
              fs.unlinkSync(destPath);
            }
          }

        } catch (error) {
          const errorMsg = `Failed to restore ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      return {
        success: restoredPhotos.length > 0,
        restoredCount: restoredPhotos.length,
        errors,
        restoredPhotos
      };

    } catch (error) {
      console.error('Error in bulk photo restore:', error);
      return {
        success: false,
        restoredCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown restore error'],
        restoredPhotos: []
      };
    }
  }

  /**
   * Rebuild property-photo associations based on filename patterns
   */
  static async rebuildPropertyPhotoAssociations(): Promise<RestoreResult> {
    try {
      console.log('🔄 Rebuilding property-photo associations');

      // Get all properties
      const propertiesResult = await dbStorage.getAllProperties(1, 1000);
      const properties = propertiesResult.data;

      // Get all available photos
      const availablePhotos = this.getAvailablePhotos();

      const restoredPhotos = [];
      const errors = [];

      for (const property of properties) {
        try {
          // Find photos that might belong to this property
          const matchedPhotos = this.matchPhotosToProperty(property, availablePhotos);

          if (matchedPhotos.length > 0) {
            // Update property with matched photos
            const updatedPhotos = matchedPhotos.map((filename, index) => ({
              filename,
              altText: `${property.title} - Image ${index + 1}`,
              uploadedAt: new Date().toISOString()
            }));

            const updatedImages = matchedPhotos.map(filename => `/uploads/properties/${filename}`);

            await dbStorage.updateProperty(property.id, {
              photos: updatedPhotos,
              images: updatedImages
            });

            restoredPhotos.push(...updatedPhotos.map(photo => ({
              ...photo,
              source: 'existing' as const
            })));

            console.log(`✅ Associated ${matchedPhotos.length} photos with property ${property.id}: ${property.title}`);
          }

        } catch (error) {
          const errorMsg = `Failed to rebuild associations for property ${property.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      return {
        success: restoredPhotos.length > 0,
        restoredCount: restoredPhotos.length,
        errors,
        restoredPhotos
      };

    } catch (error) {
      console.error('Error rebuilding property-photo associations:', error);
      return {
        success: false,
        restoredCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown restore error'],
        restoredPhotos: []
      };
    }
  }

  private static async manualRestorePropertyPhotos(propertyId: number): Promise<RestoreResult> {
    try {
      // Get property details
      const property = await dbStorage.getPropertyById(propertyId);
      if (!property) {
        throw new Error(`Property ${propertyId} not found`);
      }

      // Try to find photos based on property information
      const availablePhotos = this.getAvailablePhotos();
      const matchedPhotos = this.matchPhotosToProperty(property, availablePhotos);

      if (matchedPhotos.length === 0) {
        return {
          success: false,
          restoredCount: 0,
          errors: [`No photos found for property ${propertyId}`],
          restoredPhotos: []
        };
      }

      // Create photo objects
      const restoredPhotos = matchedPhotos.map((filename, index) => ({
        filename,
        altText: `${property.title} - Image ${index + 1}`,
        source: 'existing' as const
      }));

      return {
        success: true,
        restoredCount: restoredPhotos.length,
        errors: [],
        restoredPhotos
      };

    } catch (error) {
      return {
        success: false,
        restoredCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown restore error'],
        restoredPhotos: []
      };
    }
  }

  private static getAvailablePhotos(): string[] {
    try {
      if (!fs.existsSync(this.UPLOADS_DIR)) {
        return [];
      }

      return fs.readdirSync(this.UPLOADS_DIR)
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));

    } catch (error) {
      console.error('Error getting available photos:', error);
      return [];
    }
  }

  private static matchPhotosToProperty(property: any, availablePhotos: string[]): string[] {
    // Simple matching strategy - can be enhanced based on your needs
    const matched = [];

    // If property already has images, try to match those filenames
    if (property.images && Array.isArray(property.images)) {
      for (const imageUrl of property.images) {
        const filename = imageUrl.split('/').pop();
        if (filename && availablePhotos.includes(filename)) {
          matched.push(filename);
        }
      }
    }

    // If property has photos metadata, try to match those
    if (property.photos && Array.isArray(property.photos)) {
      for (const photo of property.photos) {
        if (photo.filename && availablePhotos.includes(photo.filename)) {
          matched.push(photo.filename);
        }
      }
    }

    return [...new Set(matched)]; // Remove duplicates
  }
}
