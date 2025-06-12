
import fs from 'fs';
import path from 'path';

export class FileValidator {
  private publicUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
  private attachedAssetsDir = path.join(process.cwd(), 'attached_assets');

  /**
   * Validates if a file exists and is accessible
   */
  validateFileExists(filename: string, directory?: string): boolean {
    const targetDir = directory || this.publicUploadsDir;
    const filePath = path.join(targetDir, filename);
    
    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`Missing file: ${filename} in ${targetDir}`);
        return false;
      }
      
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        console.warn(`Empty file detected: ${filename}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`File validation error for ${filename}:`, error);
      return false;
    }
  }

  /**
   * Validates multiple files and returns validation results
   */
  validateFiles(filenames: string[]): { valid: string[], missing: string[], restored: string[] } {
    const result = { valid: [], missing: [], restored: [] };
    
    for (const filename of filenames) {
      if (this.validateFileExists(filename)) {
        result.valid.push(filename);
      } else {
        // Try to restore from attached_assets
        if (this.restoreFromAssets(filename)) {
          result.restored.push(filename);
          result.valid.push(filename);
        } else {
          result.missing.push(filename);
        }
      }
    }
    
    return result;
  }

  /**
   * Attempts to restore a missing file from attached_assets
   */
  private restoreFromAssets(filename: string): boolean {
    const sourcePath = path.join(this.attachedAssetsDir, filename);
    const destPath = path.join(this.publicUploadsDir, filename);
    
    if (!fs.existsSync(sourcePath)) {
      return false;
    }
    
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Restored ${filename} from attached_assets`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to restore ${filename}:`, error);
      return false;
    }
  }

  /**
   * Validates property image array and filters out missing files
   */
  validatePropertyImages(images: string[]): { validImages: string[], missingCount: number } {
    const filenames = images.map(imageUrl => path.basename(imageUrl));
    const validation = this.validateFiles(filenames);
    
    const validImages = images.filter(imageUrl => {
      const filename = path.basename(imageUrl);
      return validation.valid.includes(filename);
    });
    
    if (validation.missing.length > 0) {
      console.warn(`⚠️  Found ${validation.missing.length} missing files:`, validation.missing);
    }
    
    if (validation.restored.length > 0) {
      console.log(`✅ Restored ${validation.restored.length} files from backup`);
    }
    
    return {
      validImages,
      missingCount: validation.missing.length
    };
  }
}
