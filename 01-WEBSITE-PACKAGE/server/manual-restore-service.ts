
import { pool } from './db';
import fs from 'fs';
import path from 'path';

export class ManualRestoreService {
  private backupDir = path.join(process.cwd(), 'backups');
  private attachedAssetsDir = path.join(process.cwd(), 'attached_assets');
  private publicUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties');

  async restoreImagesFromAssets(): Promise<void> {
    console.log('🔄 Starting image restoration from attached_assets...');
    
    // Ensure public uploads directory exists
    if (!fs.existsSync(this.publicUploadsDir)) {
      fs.mkdirSync(this.publicUploadsDir, { recursive: true });
    }

    // Copy all files from attached_assets to public/uploads/properties
    if (fs.existsSync(this.attachedAssetsDir)) {
      const files = fs.readdirSync(this.attachedAssetsDir);
      console.log(`Found ${files.length} files in attached_assets`);

      for (const file of files) {
        const sourcePath = path.join(this.attachedAssetsDir, file);
        const destPath = path.join(this.publicUploadsDir, file);

        if (!fs.existsSync(destPath)) {
          try {
            fs.copyFileSync(sourcePath, destPath);
            console.log(`✅ Restored: ${file}`);
          } catch (error) {
            console.error(`❌ Failed to restore ${file}:`, error);
          }
        } else {
          console.log(`⏭️  Skipped (exists): ${file}`);
        }
      }
    }
  }

  async rebuildPropertyImages(): Promise<void> {
    console.log('🔄 Rebuilding property image associations...');
    
    try {
      // Get all properties
      const propertiesResult = await pool.query('SELECT id, title, images FROM properties ORDER BY id');
      
      // Get all available image files
      const availableFiles = fs.readdirSync(this.publicUploadsDir);
      console.log(`Found ${availableFiles.length} available image files`);
      
      for (const property of propertiesResult.rows) {
        const currentImages = Array.isArray(property.images) ? property.images : [];
        const missingImages: string[] = [];
        const validImages: string[] = [];
        
        // Validate each image file exists before including in restoration
        for (const imageUrl of currentImages) {
          const filename = path.basename(imageUrl);
          const imagePath = path.join(this.publicUploadsDir, filename);
          
          if (!fs.existsSync(imagePath)) {
            console.warn(`⚠️  Missing file for property ${property.id}: ${filename}`);
            missingImages.push(imageUrl);
            
            // Try to restore from attached_assets if available
            const attachedAssetPath = path.join(this.attachedAssetsDir, filename);
            if (fs.existsSync(attachedAssetPath)) {
              try {
                fs.copyFileSync(attachedAssetPath, imagePath);
                console.log(`✅ Restored missing file from assets: ${filename}`);
                validImages.push(imageUrl);
              } catch (error) {
                console.error(`❌ Failed to restore ${filename} from assets:`, error);
              }
            }
          } else {
            // File exists, validate it's accessible and not corrupted
            try {
              const stats = fs.statSync(imagePath);
              if (stats.size > 0) {
                validImages.push(imageUrl);
              } else {
                console.warn(`⚠️  Empty file detected: ${filename}`);
                missingImages.push(imageUrl);
              }
            } catch (error) {
              console.warn(`⚠️  File access error for ${filename}:`, error);
              missingImages.push(imageUrl);
            }
          }
        }
        
        // Try to find missing images by filename matching
        for (const missingUrl of missingImages) {
          const missingFilename = path.basename(missingUrl);
          
          // Look for exact filename match
          if (availableFiles.includes(missingFilename)) {
            const restoredUrl = `/uploads/properties/${missingFilename}`;
            if (!validImages.includes(restoredUrl)) {
              validImages.push(restoredUrl);
              console.log(`🔗 Restored image for property ${property.id}: ${missingFilename}`);
            }
          }
        }
        
        // Update property if we found new images or need to clean up broken links
        if (validImages.length !== currentImages.length || missingImages.length > 0) {
          await pool.query(
            'UPDATE properties SET images = $1 WHERE id = $2',
            [JSON.stringify(validImages), property.id]
          );
          
          console.log(`📝 Updated property ${property.id} (${property.title}): ${validImages.length} images`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error rebuilding property images:', error);
      throw error;
    }
  }

  async fullRestore(): Promise<void> {
    console.log('🚀 Starting full restoration process...');
    
    try {
      // Step 1: Restore images from attached_assets
      await this.restoreImagesFromAssets();
      
      // Step 2: Rebuild property image associations
      await this.rebuildPropertyImages();
      
      console.log('✅ Full restoration completed successfully!');
      
    } catch (error) {
      console.error('❌ Full restoration failed:', error);
      throw error;
    }
  }

  async getRestorationReport(): Promise<any> {
    const report = {
      availableBackups: [] as string[],
      attachedAssets: 0,
      publicImages: 0,
      propertiesWithImages: 0,
      propertiesWithoutImages: 0,
      totalProperties: 0
    };

    // Check backups
    if (fs.existsSync(this.backupDir)) {
      report.availableBackups = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.sql') || file.endsWith('.json'))
        .sort()
        .reverse();
    }

    // Count attached assets
    if (fs.existsSync(this.attachedAssetsDir)) {
      report.attachedAssets = fs.readdirSync(this.attachedAssetsDir).length;
    }

    // Count public images
    if (fs.existsSync(this.publicUploadsDir)) {
      report.publicImages = fs.readdirSync(this.publicUploadsDir).length;
    }

    // Check properties
    try {
      const result = await pool.query('SELECT id, images FROM properties');
      report.totalProperties = result.rows.length;
      
      for (const property of result.rows) {
        const images = Array.isArray(property.images) ? property.images : [];
        if (images.length > 0) {
          report.propertiesWithImages++;
        } else {
          report.propertiesWithoutImages++;
        }
      }
    } catch (error) {
      console.error('Error getting property stats:', error);
    }

    return report;
  }
}
