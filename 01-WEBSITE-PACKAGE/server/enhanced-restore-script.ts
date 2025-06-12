
import { db } from './db';
import { properties } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { ImageValidator } from './utils/imageValidator';
import fs from 'fs';
import path from 'path';

interface RestoreOptions {
  propertyId?: number;
  checkFileExistence?: boolean;
  backupMissingFiles?: boolean;
  dryRun?: boolean;
}

export class EnhancedRestoreService {
  
  /**
   * Restore images for a property with file existence validation
   */
  static async restorePropertyImages(
    propertyId: number, 
    options: RestoreOptions = {}
  ): Promise<{
    success: boolean;
    restoredImages: string[];
    missingFiles: string[];
    errors: string[];
  }> {
    const { checkFileExistence = true, dryRun = false } = options;
    
    console.log(`🔄 Starting enhanced restore for property ${propertyId}`);
    console.log(`Options: checkFileExistence=${checkFileExistence}, dryRun=${dryRun}`);
    
    try {
      // Get current property
      const [property] = await db.select().from(properties).where(eq(properties.id, propertyId));
      
      if (!property) {
        throw new Error(`Property ${propertyId} not found`);
      }
      
      // Get images from attached_assets directory
      const attachedAssetsDir = path.join(process.cwd(), 'attached_assets');
      const availableFiles = fs.existsSync(attachedAssetsDir) 
        ? fs.readdirSync(attachedAssetsDir).filter(file => 
            ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(path.extname(file).toLowerCase())
          )
        : [];
      
      console.log(`Found ${availableFiles.length} files in attached_assets`);
      
      // Current images in property
      const currentImages = Array.isArray(property.images) ? property.images : [];
      const currentPhotos = Array.isArray(property.photos) ? property.photos : [];
      
      console.log(`Property has ${currentImages.length} legacy images and ${currentPhotos.length} photos`);
      
      // Validate file existence if requested
      let imagesToRestore: string[] = [];
      let missingFiles: string[] = [];
      
      if (checkFileExistence) {
        const validation = await ImageValidator.validateBeforeRestore(
          propertyId, 
          availableFiles.map(file => `/uploads/properties/${file}`)
        );
        
        imagesToRestore = validation.validImages;
        missingFiles = validation.missingImages;
        
        console.log(`Validation complete: ${imagesToRestore.length} valid, ${missingFiles.length} missing`);
      } else {
        // Use all available files without validation
        imagesToRestore = availableFiles.map(file => `/uploads/properties/${file}`);
      }
      
      if (dryRun) {
        console.log(`DRY RUN: Would restore ${imagesToRestore.length} images`);
        return {
          success: true,
          restoredImages: imagesToRestore,
          missingFiles,
          errors: []
        };
      }
      
      // Copy files from attached_assets to uploads directory if they don't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
      const copiedFiles: string[] = [];
      
      for (const imageUrl of imagesToRestore) {
        const filename = imageUrl.split('/').pop() || '';
        const sourcePath = path.join(attachedAssetsDir, filename);
        const destPath = path.join(uploadsDir, filename);
        
        if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
          try {
            fs.copyFileSync(sourcePath, destPath);
            copiedFiles.push(filename);
            console.log(`📋 Copied ${filename} to uploads directory`);
          } catch (error) {
            console.error(`Failed to copy ${filename}:`, error);
          }
        }
      }
      
      // Create photos array with unique filenames preserved
      const restoredPhotos = imagesToRestore.map((imageUrl, index) => {
        const filename = imageUrl.split('/').pop() || '';
        return {
          filename: filename, // Preserve original filename
          altText: `Restored image ${index + 1}`,
          uploadedAt: new Date().toISOString(),
          order: index
        };
      });
      
      // Update property with restored images
      await db.update(properties)
        .set({
          images: imagesToRestore,
          photos: restoredPhotos,
          updatedAt: new Date()
        })
        .where(eq(properties.id, propertyId));
      
      console.log(`✅ Restored ${imagesToRestore.length} images for property ${propertyId}`);
      console.log(`📁 Copied ${copiedFiles.length} files to uploads directory`);
      
      return {
        success: true,
        restoredImages: imagesToRestore,
        missingFiles,
        errors: []
      };
      
    } catch (error) {
      console.error(`Error in enhanced restore for property ${propertyId}:`, error);
      return {
        success: false,
        restoredImages: [],
        missingFiles: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
  
  /**
   * Restore all properties with validation
   */
  static async restoreAllProperties(options: RestoreOptions = {}): Promise<{
    success: boolean;
    processedProperties: number;
    totalRestored: number;
    errors: string[];
  }> {
    console.log('🚀 Starting bulk restore with enhanced validation');
    
    try {
      const allProperties = await db.select().from(properties);
      console.log(`Found ${allProperties.length} properties to process`);
      
      let processedProperties = 0;
      let totalRestored = 0;
      const errors: string[] = [];
      
      for (const property of allProperties) {
        try {
          const result = await this.restorePropertyImages(property.id, options);
          
          if (result.success) {
            processedProperties++;
            totalRestored += result.restoredImages.length;
            
            if (result.missingFiles.length > 0) {
              console.log(`⚠️  Property ${property.id}: ${result.missingFiles.length} files missing`);
            }
          } else {
            errors.push(`Property ${property.id}: ${result.errors.join(', ')}`);
          }
          
        } catch (error) {
          const errorMsg = `Property ${property.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
      
      console.log(`✅ Bulk restore complete: ${processedProperties}/${allProperties.length} properties processed`);
      console.log(`📸 Total images restored: ${totalRestored}`);
      
      return {
        success: true,
        processedProperties,
        totalRestored,
        errors
      };
      
    } catch (error) {
      console.error('Error in bulk restore:', error);
      return {
        success: false,
        processedProperties: 0,
        totalRestored: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
}

// CLI usage
if (require.main === module) {
  const propertyId = process.argv[2] ? parseInt(process.argv[2]) : null;
  const dryRun = process.argv.includes('--dry-run');
  
  if (propertyId) {
    EnhancedRestoreService.restorePropertyImages(propertyId, { 
      checkFileExistence: true, 
      dryRun 
    }).then(result => {
      console.log('Restore result:', result);
      process.exit(result.success ? 0 : 1);
    });
  } else {
    EnhancedRestoreService.restoreAllProperties({ 
      checkFileExistence: true, 
      dryRun 
    }).then(result => {
      console.log('Bulk restore result:', result);
      process.exit(result.success ? 0 : 1);
    });
  }
}
