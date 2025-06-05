import { pool } from '../db';
import { ImageValidator } from './imageValidator';
import { existsSync, copyFileSync, mkdirSync } from 'fs';
import path from 'path';
import fs from 'fs';

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
  static async createImageBackup(propertyId: number, legacyImages: string[], photoMetadata: any[] = []): Promise<void> {
    try {
      console.log(`📦 Creating image backup for property ${propertyId}`);

      // Extract and validate filenames from image URLs
      const validatedLegacyImages = legacyImages.map(img => {
        const filename = this.extractFilenameFromUrl(img);
        return {
          originalUrl: img,
          filename: filename,
          exists: this.validateImageFile(filename)
        };
      });

      // Validate photo metadata filenames
      const validatedPhotoMetadata = photoMetadata.map(photo => ({
        filename: photo.filename,
        altText: photo.altText,
        exists: this.validateImageFile(photo.filename)
      }));

      // Create comprehensive backup entry with filename mapping
      const backupData = {
        property_id: propertyId,
        backup_timestamp: new Date().toISOString(),
        legacy_images: JSON.stringify(validatedLegacyImages),
        photo_metadata: JSON.stringify(validatedPhotoMetadata),
        image_count: validatedLegacyImages.length + validatedPhotoMetadata.length,
        backup_type: 'filename_mapped',
        filename_map: JSON.stringify(this.createFilenameMap(validatedLegacyImages, validatedPhotoMetadata))
      };

      await pool.query(`
        INSERT INTO image_backups (property_id, backup_timestamp, legacy_images, photo_metadata, image_count, backup_type, filename_map)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (property_id, backup_timestamp) DO UPDATE SET
          legacy_images = EXCLUDED.legacy_images,
          photo_metadata = EXCLUDED.photo_metadata,
          image_count = EXCLUDED.image_count,
          filename_map = EXCLUDED.filename_map
      `, [
        backupData.property_id,
        backupData.backup_timestamp,
        backupData.legacy_images,
        backupData.photo_metadata,
        backupData.image_count,
        backupData.backup_type,
        backupData.filename_map
      ]);

      console.log(`✅ Image backup created for property ${propertyId} with ${backupData.image_count} images (filename-mapped)`);
    } catch (error) {
      console.error(`❌ Failed to create image backup for property ${propertyId}:`, error);
      throw error;
    }
  }

  private static extractFilenameFromUrl(url: string): string {
    // Extract filename from URL path
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1] || '';
  }

  private static validateImageFile(filename: string): boolean {
    if (!filename) return false;

    const possiblePaths = [
      path.join(process.cwd(), 'public', 'uploads', 'properties', filename),
      path.join(process.cwd(), 'uploads', 'properties', filename)
    ];

    return possiblePaths.some(filePath => {
      try {
        return fs.existsSync(filePath);
      } catch (error) {
        return false;
      }
    });
  }

  private static createFilenameMap(legacyImages: any[], photoMetadata: any[]): Record<string, any> {
    const map: Record<string, any> = {};

    legacyImages.forEach((img, index) => {
      if (img.filename) {
        map[img.filename] = {
          type: 'legacy',
          index: index,
          originalUrl: img.originalUrl,
          exists: img.exists
        };
      }
    });

    photoMetadata.forEach((photo, index) => {
      if (photo.filename) {
        map[photo.filename] = {
          type: 'photo_metadata',
          index: index,
          altText: photo.altText,
          exists: photo.exists
        };
      }
    });

    return map;
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