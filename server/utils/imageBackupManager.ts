
import { pool } from '../db';
import { ImageValidator } from './imageValidator';
import { existsSync, copyFileSync, mkdirSync } from 'fs';
import path from 'path';

export interface ImageBackupEntry {
  propertyId: number;
  originalImages: string[];
  originalPhotos: Array<{ filename: string; altText?: string; order?: number }>;
  backupTimestamp: string;
  backupPath?: string;
}

export class ImageBackupManager {
  private static readonly BACKUP_TABLE = 'property_image_backups';

  /**
   * Create backup entry for property images with full metadata
   */
  static async createImageBackup(propertyId: number, imageList: string[], photoList?: Array<{ filename: string; altText?: string }>): Promise<boolean> {
    try {
      console.log(`📦 Creating comprehensive image backup for property ${propertyId}`);
      console.log(`   Legacy images: ${imageList.length}, Photo metadata: ${photoList?.length || 0}`);

      // Validate images before backup
      const validation = ImageValidator.validateImageList(imageList);
      
      if (validation.validImages.length === 0 && (!photoList || photoList.length === 0)) {
        console.warn(`⚠️  No valid images or photos to backup for property ${propertyId}`);
        return false;
      }

      // Create backup table if it doesn't exist
      await this.ensureBackupTableExists();

      // Prepare photo metadata with preserved order
      let validPhotos: Array<{ filename: string; altText?: string; order: number }> = [];
      
      if (photoList && photoList.length > 0) {
        // Validate each photo and preserve order
        validPhotos = photoList
          .map((photo, index) => ({
            filename: photo.filename,
            altText: photo.altText || `Property image ${index + 1}`,
            order: index
          }))
          .filter(photo => {
            const validation = ImageValidator.validateImageExists(photo.filename);
            if (!validation.isValid) {
              console.warn(`⚠️  Photo validation failed: ${photo.filename} - ${validation.error}`);
              return false;
            }
            return true;
          });
      } else if (validation.validImages.length > 0) {
        // Convert legacy images to photo format with preserved order
        validPhotos = validation.validImages.map((image, index) => ({
          filename: image,
          altText: `Property image ${index + 1}`,
          order: index
        }));
      }

      // Store comprehensive backup record
      const backupTimestamp = new Date().toISOString();
      await pool.query(
        `INSERT INTO ${this.BACKUP_TABLE} (property_id, original_images, original_photos, backup_timestamp, created_at) 
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (property_id) 
         DO UPDATE SET original_images = $2, original_photos = $3, backup_timestamp = $4, created_at = NOW()`,
        [
          propertyId, 
          JSON.stringify(validation.validImages), 
          JSON.stringify(validPhotos),
          backupTimestamp
        ]
      );

      console.log(`✅ Comprehensive backup created for property ${propertyId} at ${backupTimestamp}`);
      console.log(`   Valid legacy images: ${validation.validImages.length}`);
      console.log(`   Valid photos with metadata: ${validPhotos.length}`);
      
      if (validation.invalidImages.length > 0) {
        console.warn(`   Invalid images skipped: ${validation.invalidImages.length}`);
        validation.invalidImages.forEach(invalid => {
          console.warn(`     - ${invalid.filename}: ${invalid.error}`);
        });
      }

      return true;
    } catch (error) {
      console.error(`Error creating comprehensive backup for property ${propertyId}:`, error);
      return false;
    }
  }

  /**
   * Restore images from backup with full metadata preservation
   */
  static async restoreImagesFromBackup(propertyId: number): Promise<{
    success: boolean;
    restoredImages: string[];
    restoredPhotos: Array<{ filename: string; altText?: string }>;
    errors: string[];
  }> {
    try {
      console.log(`🔄 Restoring comprehensive backup for property ${propertyId}`);

      // Get backup record with photo metadata
      const backupResult = await pool.query(
        `SELECT original_images, original_photos, backup_timestamp FROM ${this.BACKUP_TABLE} WHERE property_id = $1`,
        [propertyId]
      );

      if (backupResult.rows.length === 0) {
        return {
          success: false,
          restoredImages: [],
          restoredPhotos: [],
          errors: ['No backup found for this property']
        };
      }

      const backup = backupResult.rows[0];
      const backupImages: string[] = JSON.parse(backup.original_images || '[]');
      const backupPhotos: Array<{ filename: string; altText?: string; order?: number }> = 
        JSON.parse(backup.original_photos || '[]');

      console.log(`Found backup from ${backup.backup_timestamp}`);
      console.log(`  Legacy images: ${backupImages.length}`);
      console.log(`  Photo metadata: ${backupPhotos.length}`);

      // Validate and restore photo metadata first (preferred method)
      let restoredPhotos: Array<{ filename: string; altText?: string }> = [];
      let restoredImages: string[] = [];
      let errors: string[] = [];

      if (backupPhotos.length > 0) {
        // Restore with full metadata, preserving order
        const sortedPhotos = backupPhotos.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        for (const photo of sortedPhotos) {
          const validation = ImageValidator.validateImageExists(photo.filename);
          if (validation.isValid) {
            restoredPhotos.push({
              filename: photo.filename,
              altText: photo.altText || `Property image ${restoredPhotos.length + 1}`
            });
            restoredImages.push(photo.filename); // Keep legacy compatibility
          } else {
            errors.push(`Missing photo: ${photo.filename} - ${validation.error}`);
          }
        }

        console.log(`✅ Restored ${restoredPhotos.length} photos with metadata in correct order`);
      } else if (backupImages.length > 0) {
        // Fallback to legacy images
        const validation = await ImageValidator.validateBeforeRestore(propertyId, backupImages);
        
        if (validation.canRestore) {
          restoredImages = validation.validImages;
          // Convert to photo format for consistency
          restoredPhotos = validation.validImages.map((image, index) => ({
            filename: image,
            altText: `Property image ${index + 1}`
          }));
        }
        
        errors.push(...validation.errors);
        console.log(`✅ Restored ${restoredImages.length} legacy images`);
      }

      if (restoredPhotos.length === 0 && restoredImages.length === 0) {
        return {
          success: false,
          restoredImages: [],
          restoredPhotos: [],
          errors: ['Cannot restore: no valid images found in backup', ...errors]
        };
      }

      // Update property with both formats for compatibility
      await pool.query(
        'UPDATE properties SET images = $1, photos = $2 WHERE id = $3',
        [
          JSON.stringify(restoredImages), 
          JSON.stringify(restoredPhotos),
          propertyId
        ]
      );

      console.log(`✅ Successfully restored property ${propertyId} with complete metadata`);
      console.log(`   Images: ${restoredImages.length}, Photos: ${restoredPhotos.length}`);

      return {
        success: true,
        restoredImages,
        restoredPhotos,
        errors
      };

    } catch (error) {
      console.error(`Error restoring comprehensive backup for property ${propertyId}:`, error);
      return {
        success: false,
        restoredImages: [],
        restoredPhotos: [],
        errors: [error instanceof Error ? error.message : 'Unknown restore error']
      };
    }
  }

  /**
   * List available backups for a property
   */
  static async getImageBackupInfo(propertyId: number): Promise<ImageBackupEntry | null> {
    try {
      const result = await pool.query(
        `SELECT property_id, original_images, backup_timestamp FROM ${this.BACKUP_TABLE} WHERE property_id = $1`,
        [propertyId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        propertyId: row.property_id,
        originalImages: JSON.parse(row.original_images),
        backupTimestamp: row.backup_timestamp
      };
    } catch (error) {
      console.error(`Error getting backup info for property ${propertyId}:`, error);
      return null;
    }
  }

  /**
   * Ensure backup table exists with photo metadata support
   */
  private static async ensureBackupTableExists(): Promise<void> {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${this.BACKUP_TABLE} (
          property_id INTEGER PRIMARY KEY,
          original_images JSONB NOT NULL DEFAULT '[]',
          original_photos JSONB NOT NULL DEFAULT '[]',
          backup_timestamp TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      // Add photo column if it doesn't exist (for existing installations)
      await pool.query(`
        ALTER TABLE ${this.BACKUP_TABLE} 
        ADD COLUMN IF NOT EXISTS original_photos JSONB DEFAULT '[]'
      `);
    } catch (error) {
      console.error('Error creating/updating backup table:', error);
      throw error;
    }
  }
}
