
import { pool } from '../db';
import { storage as dbStorage } from '../storage';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface PropertyBackup {
  id: number;
  timestamp: string;
  originalData: any;
  backupPath?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class PropertyService {
  private static readonly BACKUP_DIR = path.join(process.cwd(), 'backups', 'properties');
  
  /**
   * Create comprehensive backup before property updates
   */
  static async backupProperty(propertyId: number, propertyData: any): Promise<string> {
    try {
      console.log(`📦 Creating backup for property ${propertyId}`);
      
      // Ensure backup directory exists
      if (!fs.existsSync(this.BACKUP_DIR)) {
        fs.mkdirSync(this.BACKUP_DIR, { recursive: true });
      }
      
      const timestamp = new Date().toISOString();
      const backupId = `${propertyId}-${Date.now()}`;
      const backupPath = path.join(this.BACKUP_DIR, `property-${backupId}.json`);
      
      // Create comprehensive backup data
      const backupData = {
        propertyId,
        timestamp,
        backupId,
        originalData: {
          ...propertyData,
          images: Array.isArray(propertyData.images) ? propertyData.images : [],
          backupReason: 'pre_update_safety'
        },
        metadata: {
          backupType: 'property_update',
          createdAt: timestamp,
          imageCount: Array.isArray(propertyData.images) ? propertyData.images.length : 0
        }
      };
      
      // Write backup to file
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      
      // Also store in database backup table for redundancy
      await pool.query(`
        INSERT INTO property_backups (property_id, backup_data, created_at)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [propertyId, JSON.stringify(backupData), timestamp]);
      
      console.log(`✅ Property backup created: ${backupId}`);
      return backupId;
      
    } catch (error) {
      console.error(`❌ Failed to create backup for property ${propertyId}:`, error);
      throw new Error(`Backup creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Restore property from backup
   */
  static async restoreFromBackup(backupId: string): Promise<boolean> {
    try {
      console.log(`🔄 Restoring from backup: ${backupId}`);
      
      const backupPath = path.join(this.BACKUP_DIR, `property-${backupId}.json`);
      
      if (!fs.existsSync(backupPath)) {
        // Try database backup
        const dbResult = await pool.query(
          'SELECT backup_data FROM property_backups WHERE backup_id = $1',
          [backupId]
        );
        
        if (dbResult.rows.length === 0) {
          throw new Error(`Backup ${backupId} not found in file system or database`);
        }
        
        const backupData = dbResult.rows[0].backup_data;
        return await this.performRestore(backupData.originalData, backupData.propertyId);
      }
      
      // Restore from file
      const backupContent = fs.readFileSync(backupPath, 'utf8');
      const backupData = JSON.parse(backupContent);
      
      return await this.performRestore(backupData.originalData, backupData.propertyId);
      
    } catch (error) {
      console.error(`❌ Failed to restore from backup ${backupId}:`, error);
      return false;
    }
  }
  
  private static async performRestore(originalData: any, propertyId: number): Promise<boolean> {
    try {
      // Validate images before restore
      const validatedImages = await this.validateAndFilterImages(originalData.images || []);
      
      // Update property with validated data
      const updatedProperty = await dbStorage.updateProperty(propertyId, {
        ...originalData,
        images: validatedImages.validImages
      });
      
      if (updatedProperty) {
        console.log(`✅ Successfully restored property ${propertyId}`);
        console.log(`   Restored ${validatedImages.validImages.length} valid images`);
        if (validatedImages.invalidCount > 0) {
          console.log(`   Skipped ${validatedImages.invalidCount} invalid/missing images`);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`❌ Restore operation failed:`, error);
      return false;
    }
  }
  
  /**
   * Generate UUID-based filename for uploaded images
   */
  static generateUuidFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename).toLowerCase() || '.webp';
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    const finalExt = validExtensions.includes(ext) ? ext : '.webp';
    return `${uuidv4()}${finalExt}`;
  }
  
  /**
   * Validate property data before update
   */
  static validatePropertyUpdate(updates: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    // Validate required fields
    if (updates.title !== undefined && (!updates.title || updates.title.trim().length === 0)) {
      result.errors.push('Title cannot be empty');
      result.isValid = false;
    }
    
    if (updates.price !== undefined && (isNaN(Number(updates.price)) || Number(updates.price) < 0)) {
      result.errors.push('Price must be a valid positive number');
      result.isValid = false;
    }
    
    // Validate images array
    if (updates.images !== undefined) {
      if (!Array.isArray(updates.images)) {
        result.errors.push('Images must be an array');
        result.isValid = false;
      } else {
        const invalidImages = updates.images.filter(img => 
          typeof img !== 'string' || img.trim().length === 0
        );
        
        if (invalidImages.length > 0) {
          result.warnings.push(`Found ${invalidImages.length} invalid image URLs that will be filtered out`);
        }
      }
    }
    
    // Validate numeric fields
    const numericFields = ['bedrooms', 'bathrooms', 'builtUpArea', 'plotSize', 'yearBuilt'];
    for (const field of numericFields) {
      if (updates[field] !== undefined && (isNaN(Number(updates[field])) || Number(updates[field]) < 0)) {
        result.errors.push(`${field} must be a valid positive number`);
        result.isValid = false;
      }
    }
    
    return result;
  }
  
  /**
   * Validate and filter image array, checking file existence
   */
  static async validateAndFilterImages(images: string[]): Promise<{
    validImages: string[];
    invalidCount: number;
    missingFiles: string[];
  }> {
    if (!Array.isArray(images)) {
      return { validImages: [], invalidCount: 0, missingFiles: [] };
    }
    
    const validImages: string[] = [];
    const missingFiles: string[] = [];
    
    for (const imageUrl of images) {
      if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
        continue; // Skip invalid URLs
      }
      
      const filename = path.basename(imageUrl.trim());
      const imagePaths = [
        path.join(process.cwd(), 'public', 'uploads', 'properties', filename),
        path.join(process.cwd(), 'uploads', 'properties', filename)
      ];
      
      const fileExists = imagePaths.some(imagePath => {
        try {
          return fs.existsSync(imagePath) && fs.statSync(imagePath).isFile();
        } catch {
          return false;
        }
      });
      
      if (fileExists) {
        validImages.push(imageUrl.trim());
      } else {
        missingFiles.push(filename);
      }
    }
    
    return {
      validImages,
      invalidCount: images.length - validImages.length,
      missingFiles
    };
  }
  
  /**
   * Get property by ID with error handling
   */
  static async getPropertyById(id: number): Promise<any | null> {
    try {
      if (!id || isNaN(id) || id <= 0) {
        throw new Error('Invalid property ID provided');
      }
      
      const property = await dbStorage.getPropertyById(id);
      return property;
      
    } catch (error) {
      console.error(`Error fetching property ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Update property with comprehensive error handling and backup
   */
  static async updatePropertyInDB(id: number, updates: any): Promise<any | null> {
    try {
      // Validate the update data
      const validation = this.validatePropertyUpdate(updates);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Log warnings if any
      if (validation.warnings.length > 0) {
        console.warn(`Property update warnings:`, validation.warnings);
      }
      
      // Get current property for backup
      const currentProperty = await this.getPropertyById(id);
      if (!currentProperty) {
        throw new Error(`Property ${id} not found`);
      }
      
      // Create backup before update
      const backupId = await this.backupProperty(id, currentProperty);
      
      // Validate and filter images if provided
      let processedUpdates = { ...updates };
      if (updates.images) {
        const imageValidation = await this.validateAndFilterImages(updates.images);
        processedUpdates.images = imageValidation.validImages;
        
        if (imageValidation.missingFiles.length > 0) {
          console.warn(`Skipped ${imageValidation.missingFiles.length} missing image files:`, 
            imageValidation.missingFiles);
        }
      }
      
      // Perform the update
      const updatedProperty = await dbStorage.updateProperty(id, processedUpdates);
      
      if (!updatedProperty) {
        // Attempt to restore from backup if update failed
        console.error(`Property update failed, attempting restore from backup ${backupId}`);
        await this.restoreFromBackup(backupId);
        throw new Error('Property update failed and was restored from backup');
      }
      
      console.log(`✅ Successfully updated property ${id} (backup: ${backupId})`);
      return updatedProperty;
      
    } catch (error) {
      console.error(`❌ Failed to update property ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * List available backups for a property
   */
  static async listPropertyBackups(propertyId: number): Promise<PropertyBackup[]> {
    try {
      const backups: PropertyBackup[] = [];
      
      // Check file system backups
      if (fs.existsSync(this.BACKUP_DIR)) {
        const files = fs.readdirSync(this.BACKUP_DIR);
        const propertyBackupFiles = files.filter(file => 
          file.startsWith(`property-${propertyId}-`) && file.endsWith('.json')
        );
        
        for (const file of propertyBackupFiles) {
          try {
            const filePath = path.join(this.BACKUP_DIR, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);
            
            backups.push({
              id: data.propertyId,
              timestamp: data.timestamp,
              originalData: data.originalData,
              backupPath: filePath
            });
          } catch (error) {
            console.warn(`Could not parse backup file ${file}:`, error);
          }
        }
      }
      
      // Check database backups
      const dbResult = await pool.query(
        'SELECT backup_data, created_at FROM property_backups WHERE property_id = $1 ORDER BY created_at DESC',
        [propertyId]
      );
      
      for (const row of dbResult.rows) {
        const data = row.backup_data;
        backups.push({
          id: data.propertyId,
          timestamp: row.created_at,
          originalData: data.originalData
        });
      }
      
      // Sort by timestamp, most recent first
      return backups.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
    } catch (error) {
      console.error(`Error listing backups for property ${propertyId}:`, error);
      return [];
    }
  }
}

// Export individual functions for compatibility
export const backupProperty = PropertyService.backupProperty.bind(PropertyService);
export const restoreFromBackup = PropertyService.restoreFromBackup.bind(PropertyService);
export const getPropertyById = PropertyService.getPropertyById.bind(PropertyService);
export const updatePropertyInDB = PropertyService.updatePropertyInDB.bind(PropertyService);
export const validatePropertyUpdate = PropertyService.validatePropertyUpdate.bind(PropertyService);
export const generateUuidFilename = PropertyService.generateUuidFilename.bind(PropertyService);
