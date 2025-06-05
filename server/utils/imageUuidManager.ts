
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { pool } from '../db';

export interface ImageMapping {
  imageId: string;
  originalFilename: string;
  currentFilename: string;
  altText: string;
  order: number;
  propertyId: number;
  uploadedAt: string;
  fileSize?: number;
  mimeType?: string;
}

export interface PropertyImageBackup {
  propertyId: number;
  backupId: string;
  originalData: any;
  imageMapping: ImageMapping[];
  backupTimestamp: string;
}

export class ImageUuidManager {
  private static readonly UPLOAD_BASE_DIR = path.join(process.cwd(), 'public', 'uploads', 'properties');

  /**
   * Ensure upload directory exists for a property
   */
  static async ensurePropertyImageDir(propertyId: number): Promise<string> {
    const propertyDir = path.join(this.UPLOAD_BASE_DIR, propertyId.toString());
    
    if (!fs.existsSync(propertyDir)) {
      fs.mkdirSync(propertyDir, { recursive: true, mode: 0o755 });
    }
    
    return propertyDir;
  }

  /**
   * Generate unique image mapping for uploaded files
   */
  static async createImageMappings(
    files: Express.Multer.File[], 
    propertyId: number,
    startOrder: number = 0
  ): Promise<ImageMapping[]> {
    const mappings: ImageMapping[] = [];
    const propertyDir = await this.ensurePropertyImageDir(propertyId);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageId = uuidv4();
      const fileExtension = path.extname(file.originalname) || '.jpg';
      const newFilename = `${imageId}${fileExtension}`;
      const newFilePath = path.join(propertyDir, newFilename);

      // Move file to UUID-based location
      if (file.path && fs.existsSync(file.path)) {
        fs.renameSync(file.path, newFilePath);
      } else if (file.buffer) {
        fs.writeFileSync(newFilePath, file.buffer);
      }

      const mapping: ImageMapping = {
        imageId,
        originalFilename: file.originalname,
        currentFilename: newFilename,
        altText: `Property image ${startOrder + i + 1}`,
        order: startOrder + i,
        propertyId,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size,
        mimeType: file.mimetype
      };

      mappings.push(mapping);
    }

    return mappings;
  }

  /**
   * Get image URL with property-specific path
   */
  static getImageUrl(propertyId: number, filename: string): string {
    return `/uploads/properties/${propertyId}/${filename}`;
  }

  /**
   * Save image mappings to database
   */
  static async saveImageMappings(mappings: ImageMapping[]): Promise<void> {
    if (mappings.length === 0) return;

    const values = mappings.map(mapping => [
      mapping.imageId,
      mapping.propertyId,
      mapping.originalFilename,
      mapping.currentFilename,
      mapping.altText,
      mapping.order,
      mapping.uploadedAt,
      mapping.fileSize || 0,
      mapping.mimeType || 'image/jpeg'
    ]);

    const placeholders = values.map((_, index) => 
      `($${index * 9 + 1}, $${index * 9 + 2}, $${index * 9 + 3}, $${index * 9 + 4}, $${index * 9 + 5}, $${index * 9 + 6}, $${index * 9 + 7}, $${index * 9 + 8}, $${index * 9 + 9})`
    ).join(', ');

    const query = `
      INSERT INTO property_image_mappings (
        image_id, property_id, original_filename, current_filename, 
        alt_text, image_order, uploaded_at, file_size, mime_type
      ) VALUES ${placeholders}
      ON CONFLICT (image_id) DO UPDATE SET
        alt_text = EXCLUDED.alt_text,
        image_order = EXCLUDED.image_order
    `;

    await pool.query(query, values.flat());
  }

  /**
   * Get image mappings for a property
   */
  static async getPropertyImageMappings(propertyId: number): Promise<ImageMapping[]> {
    const result = await pool.query(
      'SELECT * FROM property_image_mappings WHERE property_id = $1 ORDER BY image_order',
      [propertyId]
    );

    return result.rows.map(row => ({
      imageId: row.image_id,
      propertyId: row.property_id,
      originalFilename: row.original_filename,
      currentFilename: row.current_filename,
      altText: row.alt_text,
      order: row.image_order,
      uploadedAt: row.uploaded_at,
      fileSize: row.file_size,
      mimeType: row.mime_type
    }));
  }

  /**
   * Update image order for property
   */
  static async reorderImages(propertyId: number, imageIds: string[]): Promise<void> {
    for (let i = 0; i < imageIds.length; i++) {
      await pool.query(
        'UPDATE property_image_mappings SET image_order = $1 WHERE image_id = $2 AND property_id = $3',
        [i, imageIds[i], propertyId]
      );
    }
  }

  /**
   * Delete image by UUID
   */
  static async deleteImage(imageId: string): Promise<boolean> {
    try {
      // Get image info first
      const result = await pool.query(
        'SELECT * FROM property_image_mappings WHERE image_id = $1',
        [imageId]
      );

      if (result.rows.length === 0) return false;

      const mapping = result.rows[0];
      const filePath = path.join(
        this.UPLOAD_BASE_DIR, 
        mapping.property_id.toString(), 
        mapping.current_filename
      );

      // Delete physical file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from database
      await pool.query('DELETE FROM property_image_mappings WHERE image_id = $1', [imageId]);

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Create comprehensive backup before property modification
   */
  static async createPropertyBackup(propertyId: number): Promise<string> {
    try {
      const backupId = uuidv4();
      console.log(`📦 Creating comprehensive backup ${backupId} for property ${propertyId}`);
      
      // Get current property data with error handling
      let propertyData = null;
      try {
        const propertyResult = await pool.query('SELECT * FROM properties WHERE id = $1', [propertyId]);
        propertyData = propertyResult.rows[0] || null;
      } catch (dbError) {
        console.error(`Failed to fetch property ${propertyId} for backup:`, dbError);
        throw new Error(`Database error during backup: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
      }

      if (!propertyData) {
        throw new Error(`Property ${propertyId} not found for backup`);
      }
      
      // Get image mappings with error handling
      let imageMappings: ImageMapping[] = [];
      try {
        imageMappings = await this.getPropertyImageMappings(propertyId);
      } catch (mappingError) {
        console.warn(`Failed to get image mappings for property ${propertyId}:`, mappingError);
        // Continue with empty mappings rather than failing
      }

      // Create comprehensive backup data
      const backupData: PropertyImageBackup = {
        propertyId,
        backupId,
        originalData: propertyData,
        imageMapping: imageMappings,
        backupTimestamp: new Date().toISOString()
      };

      // Validate backup data before saving
      if (!backupData.originalData) {
        throw new Error('Invalid backup data: missing property data');
      }

      // Save backup with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          await pool.query(`
            INSERT INTO property_backups (backup_id, property_id, backup_data, created_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (backup_id) DO UPDATE SET
              backup_data = EXCLUDED.backup_data,
              created_at = EXCLUDED.created_at
          `, [backupId, propertyId, JSON.stringify(backupData), new Date()]);
          
          break; // Success, exit retry loop
        } catch (saveError) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw new Error(`Failed to save backup after ${maxRetries} attempts: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`);
          }
          console.warn(`Backup save attempt ${retryCount} failed, retrying...`, saveError);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Progressive delay
        }
      }

      console.log(`✅ Successfully created backup ${backupId} for property ${propertyId} with ${imageMappings.length} image mappings`);
      return backupId;
      
    } catch (error) {
      console.error(`❌ Critical error creating backup for property ${propertyId}:`, error);
      throw new Error(`Backup creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Restore from backup with comprehensive error handling
   */
  static async restoreFromBackup(backupId: string): Promise<boolean> {
    console.log(`🔄 Attempting to restore from backup ${backupId}`);
    
    try {
      // Fetch backup with validation
      const result = await pool.query(
        'SELECT * FROM property_backups WHERE backup_id = $1',
        [backupId]
      );

      if (result.rows.length === 0) {
        console.error(`❌ Backup ${backupId} not found in database`);
        return false;
      }

      let backup: PropertyImageBackup;
      try {
        backup = JSON.parse(result.rows[0].backup_data);
      } catch (parseError) {
        console.error(`❌ Failed to parse backup data for ${backupId}:`, parseError);
        return false;
      }

      // Validate backup data structure
      if (!backup.propertyId || !backup.originalData) {
        console.error(`❌ Invalid backup data structure for ${backupId}`);
        return false;
      }

      console.log(`📋 Restoring property ${backup.propertyId} from backup created at ${backup.backupTimestamp}`);

      // Begin transaction for atomic restore
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Restore property data with comprehensive field mapping
        const propertyData = backup.originalData;
        await client.query(`
          UPDATE properties SET 
            title = $1, 
            description = $2, 
            images = $3, 
            photos = $4,
            updated_at = $5,
            city = $6,
            price = $7,
            property_type = $8,
            listing_type = $9,
            bedrooms = $10,
            bathrooms = $11
          WHERE id = $12
        `, [
          propertyData.title,
          propertyData.description,
          propertyData.images,
          propertyData.photos,
          new Date(), // Update timestamp to mark restore
          propertyData.city || propertyData.location,
          propertyData.price,
          propertyData.property_type || propertyData.propertyType,
          propertyData.listing_type || propertyData.listingType,
          propertyData.bedrooms,
          propertyData.bathrooms,
          backup.propertyId
        ]);

        // Restore image mappings if available
        if (backup.imageMapping && backup.imageMapping.length > 0) {
          console.log(`📸 Restoring ${backup.imageMapping.length} image mappings`);
          
          // Clear existing mappings
          await client.query('DELETE FROM property_image_mappings WHERE property_id = $1', [backup.propertyId]);
          
          // Restore mappings with error handling
          try {
            await this.saveImageMappingsWithTransaction(client, backup.imageMapping);
          } catch (mappingError) {
            console.warn(`⚠️  Failed to restore image mappings, continuing with property restore:`, mappingError);
          }
        }

        await client.query('COMMIT');
        console.log(`✅ Successfully restored property ${backup.propertyId} from backup ${backupId}`);
        
        return true;

      } catch (transactionError) {
        await client.query('ROLLBACK');
        console.error(`❌ Transaction failed during restore of backup ${backupId}:`, transactionError);
        return false;
      } finally {
        client.release();
      }

    } catch (error) {
      console.error(`❌ Critical error restoring from backup ${backupId}:`, error);
      return false;
    }
  }

  /**
   * Save image mappings within a transaction
   */
  private static async saveImageMappingsWithTransaction(client: any, mappings: ImageMapping[]): Promise<void> {
    if (mappings.length === 0) return;

    const values = mappings.map(mapping => [
      mapping.imageId,
      mapping.propertyId,
      mapping.originalFilename,
      mapping.currentFilename,
      mapping.altText,
      mapping.order,
      mapping.uploadedAt,
      mapping.fileSize || 0,
      mapping.mimeType || 'image/jpeg'
    ]);

    const placeholders = values.map((_, index) => 
      `($${index * 9 + 1}, $${index * 9 + 2}, $${index * 9 + 3}, $${index * 9 + 4}, $${index * 9 + 5}, $${index * 9 + 6}, $${index * 9 + 7}, $${index * 9 + 8}, $${index * 9 + 9})`
    ).join(', ');

    const query = `
      INSERT INTO property_image_mappings (
        image_id, property_id, original_filename, current_filename, 
        alt_text, image_order, uploaded_at, file_size, mime_type
      ) VALUES ${placeholders}
      ON CONFLICT (image_id) DO UPDATE SET
        alt_text = EXCLUDED.alt_text,
        image_order = EXCLUDED.image_order
    `;

    await client.query(query, values.flat());
  }

  /**
   * Convert legacy images to UUID system
   */
  static async migrateLegacyImages(propertyId: number, legacyImageUrls: string[]): Promise<ImageMapping[]> {
    const mappings: ImageMapping[] = [];
    const propertyDir = await this.ensurePropertyImageDir(propertyId);

    for (let i = 0; i < legacyImageUrls.length; i++) {
      const imageUrl = legacyImageUrls[i];
      const originalFilename = path.basename(imageUrl);
      const legacyPath = path.join(process.cwd(), 'public', imageUrl);

      if (fs.existsSync(legacyPath)) {
        const imageId = uuidv4();
        const fileExtension = path.extname(originalFilename);
        const newFilename = `${imageId}${fileExtension}`;
        const newPath = path.join(propertyDir, newFilename);

        // Copy to new location
        fs.copyFileSync(legacyPath, newPath);

        const stats = fs.statSync(newPath);
        const mapping: ImageMapping = {
          imageId,
          originalFilename,
          currentFilename: newFilename,
          altText: `Property image ${i + 1}`,
          order: i,
          propertyId,
          uploadedAt: new Date().toISOString(),
          fileSize: stats.size,
          mimeType: this.getMimeTypeFromExtension(fileExtension)
        };

        mappings.push(mapping);
      }
    }

    if (mappings.length > 0) {
      await this.saveImageMappings(mappings);
    }

    return mappings;
  }

  private static getMimeTypeFromExtension(ext: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext.toLowerCase()] || 'image/jpeg';
  }

  /**
   * Generate property image URLs from mappings
   */
  static generateImageUrls(mappings: ImageMapping[]): string[] {
    return mappings
      .sort((a, b) => a.order - b.order)
      .map(mapping => this.getImageUrl(mapping.propertyId, mapping.currentFilename));
  }

  /**
   * Validate all images exist for a property
   */
  static async validatePropertyImages(propertyId: number): Promise<{
    valid: boolean;
    missing: string[];
    total: number;
  }> {
    const mappings = await this.getPropertyImageMappings(propertyId);
    const propertyDir = path.join(this.UPLOAD_BASE_DIR, propertyId.toString());
    const missing: string[] = [];

    for (const mapping of mappings) {
      const filePath = path.join(propertyDir, mapping.currentFilename);
      if (!fs.existsSync(filePath)) {
        missing.push(mapping.currentFilename);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
      total: mappings.length
    };
  }
}
