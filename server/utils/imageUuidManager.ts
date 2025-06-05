
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
   * Create backup before property modification
   */
  static async createPropertyBackup(propertyId: number): Promise<string> {
    try {
      const backupId = uuidv4();
      
      // Get current property data
      const propertyResult = await pool.query('SELECT * FROM properties WHERE id = $1', [propertyId]);
      const imageMappings = await this.getPropertyImageMappings(propertyId);

      const backupData: PropertyImageBackup = {
        propertyId,
        backupId,
        originalData: propertyResult.rows[0] || null,
        imageMapping: imageMappings,
        backupTimestamp: new Date().toISOString()
      };

      // Save backup
      await pool.query(`
        INSERT INTO property_backups (backup_id, property_id, backup_data, created_at)
        VALUES ($1, $2, $3, $4)
      `, [backupId, propertyId, JSON.stringify(backupData), new Date()]);

      console.log(`✅ Created backup ${backupId} for property ${propertyId}`);
      return backupId;
    } catch (error) {
      console.error('Error creating property backup:', error);
      throw error;
    }
  }

  /**
   * Restore from backup
   */
  static async restoreFromBackup(backupId: string): Promise<boolean> {
    try {
      const result = await pool.query(
        'SELECT * FROM property_backups WHERE backup_id = $1',
        [backupId]
      );

      if (result.rows.length === 0) {
        console.error(`Backup ${backupId} not found`);
        return false;
      }

      const backup: PropertyImageBackup = JSON.parse(result.rows[0].backup_data);

      // Restore property data
      if (backup.originalData) {
        const propertyData = backup.originalData;
        await pool.query(`
          UPDATE properties SET 
            title = $1, description = $2, images = $3, photos = $4
          WHERE id = $5
        `, [
          propertyData.title,
          propertyData.description,
          propertyData.images,
          propertyData.photos,
          backup.propertyId
        ]);
      }

      // Restore image mappings
      if (backup.imageMapping.length > 0) {
        // Clear existing mappings
        await pool.query('DELETE FROM property_image_mappings WHERE property_id = $1', [backup.propertyId]);
        
        // Restore mappings
        await this.saveImageMappings(backup.imageMapping);
      }

      console.log(`✅ Restored property ${backup.propertyId} from backup ${backupId}`);
      return true;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
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
