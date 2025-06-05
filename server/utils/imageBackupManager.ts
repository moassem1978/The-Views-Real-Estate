
import { pool } from '../db';
import { ImageValidator } from './imageValidator';
import { existsSync, copyFileSync, mkdirSync } from 'fs';
import path from 'path';

export interface ImageBackupEntry {
  propertyId: number;
  originalImages: string[];
  backupTimestamp: string;
  backupPath?: string;
}

export class ImageBackupManager {
  private static readonly BACKUP_TABLE = 'property_image_backups';

  /**
   * Create backup entry for property images
   */
  static async createImageBackup(propertyId: number, imageList: string[]): Promise<boolean> {
    try {
      console.log(`📦 Creating image backup for property ${propertyId} with ${imageList.length} images`);

      // Validate images before backup
      const validation = ImageValidator.validateImageList(imageList);
      
      if (validation.validImages.length === 0) {
        console.warn(`⚠️  No valid images to backup for property ${propertyId}`);
        return false;
      }

      // Create backup table if it doesn't exist
      await this.ensureBackupTableExists();

      // Store backup record
      const backupTimestamp = new Date().toISOString();
      await pool.query(
        `INSERT INTO ${this.BACKUP_TABLE} (property_id, original_images, backup_timestamp, created_at) 
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (property_id) 
         DO UPDATE SET original_images = $2, backup_timestamp = $3, created_at = NOW()`,
        [propertyId, JSON.stringify(validation.validImages), backupTimestamp]
      );

      console.log(`✅ Image backup created for property ${propertyId} at ${backupTimestamp}`);
      console.log(`   Valid images backed up: ${validation.validImages.length}`);
      
      if (validation.invalidImages.length > 0) {
        console.warn(`   Invalid images skipped: ${validation.invalidImages.length}`);
        validation.invalidImages.forEach(invalid => {
          console.warn(`     - ${invalid.filename}: ${invalid.error}`);
        });
      }

      return true;
    } catch (error) {
      console.error(`Error creating image backup for property ${propertyId}:`, error);
      return false;
    }
  }

  /**
   * Restore images from backup with validation
   */
  static async restoreImagesFromBackup(propertyId: number): Promise<{
    success: boolean;
    restoredImages: string[];
    errors: string[];
  }> {
    try {
      console.log(`🔄 Restoring images for property ${propertyId} from backup`);

      // Get backup record
      const backupResult = await pool.query(
        `SELECT original_images, backup_timestamp FROM ${this.BACKUP_TABLE} WHERE property_id = $1`,
        [propertyId]
      );

      if (backupResult.rows.length === 0) {
        return {
          success: false,
          restoredImages: [],
          errors: ['No backup found for this property']
        };
      }

      const backup = backupResult.rows[0];
      const backupImages: string[] = JSON.parse(backup.original_images);

      console.log(`Found backup from ${backup.backup_timestamp} with ${backupImages.length} images`);

      // Validate images before restore
      const validation = await ImageValidator.validateBeforeRestore(propertyId, backupImages);

      if (!validation.canRestore) {
        return {
          success: false,
          restoredImages: [],
          errors: ['Cannot restore: no valid images found in backup', ...validation.errors]
        };
      }

      // Update property with validated images
      await pool.query(
        'UPDATE properties SET images = $1 WHERE id = $2',
        [JSON.stringify(validation.validImages), propertyId]
      );

      console.log(`✅ Successfully restored ${validation.validImages.length} images for property ${propertyId}`);
      
      const errors: string[] = [];
      if (validation.missingImages.length > 0) {
        errors.push(`${validation.missingImages.length} images from backup are missing from filesystem`);
        validation.missingImages.forEach(missing => {
          errors.push(`Missing: ${missing}`);
        });
      }

      return {
        success: true,
        restoredImages: validation.validImages,
        errors
      };

    } catch (error) {
      console.error(`Error restoring images for property ${propertyId}:`, error);
      return {
        success: false,
        restoredImages: [],
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
   * Ensure backup table exists
   */
  private static async ensureBackupTableExists(): Promise<void> {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${this.BACKUP_TABLE} (
          property_id INTEGER PRIMARY KEY,
          original_images JSONB NOT NULL,
          backup_timestamp TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
    } catch (error) {
      console.error('Error creating backup table:', error);
      throw error;
    }
  }
}
