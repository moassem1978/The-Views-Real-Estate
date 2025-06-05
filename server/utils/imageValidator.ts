
import { existsSync, statSync } from 'fs';
import path from 'path';

export interface ImageValidationResult {
  isValid: boolean;
  filePath?: string;
  error?: string;
  fileSize?: number;
}

export class ImageValidator {
  private static readonly IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  private static readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  private static readonly BASE_UPLOAD_PATH = 'public/uploads/properties';

  /**
   * Validate if an image file exists and is accessible
   */
  static validateImageExists(filename: string): ImageValidationResult {
    try {
      // Clean filename and construct full path
      const cleanFilename = filename.replace(/^\/+/, '');
      const fullPath = path.join(this.BASE_UPLOAD_PATH, cleanFilename);
      
      console.log(`Validating image: ${filename} -> ${fullPath}`);

      // Check if file exists
      if (!existsSync(fullPath)) {
        return {
          isValid: false,
          error: `File not found: ${filename}`,
          filePath: fullPath
        };
      }

      // Check file stats
      const stats = statSync(fullPath);
      
      // Check if it's a file
      if (!stats.isFile()) {
        return {
          isValid: false,
          error: `Path is not a file: ${filename}`,
          filePath: fullPath
        };
      }

      // Check file size
      if (stats.size === 0) {
        return {
          isValid: false,
          error: `File is empty: ${filename}`,
          filePath: fullPath,
          fileSize: stats.size
        };
      }

      if (stats.size > this.MAX_FILE_SIZE) {
        return {
          isValid: false,
          error: `File too large: ${filename} (${Math.round(stats.size / 1024 / 1024)}MB)`,
          filePath: fullPath,
          fileSize: stats.size
        };
      }

      // Check file extension
      const ext = path.extname(cleanFilename).toLowerCase();
      if (!this.IMAGE_EXTENSIONS.includes(ext)) {
        return {
          isValid: false,
          error: `Invalid image extension: ${filename}`,
          filePath: fullPath,
          fileSize: stats.size
        };
      }

      console.log(`✅ Image validated successfully: ${filename} (${Math.round(stats.size / 1024)}KB)`);
      
      return {
        isValid: true,
        filePath: fullPath,
        fileSize: stats.size
      };

    } catch (error) {
      console.error(`Error validating image ${filename}:`, error);
      return {
        isValid: false,
        error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        filePath: undefined
      };
    }
  }

  /**
   * Validate multiple images and return results
   */
  static validateImageList(imageList: string[]): {
    validImages: string[];
    invalidImages: Array<{ filename: string; error: string }>;
    validationResults: ImageValidationResult[];
  } {
    const validImages: string[] = [];
    const invalidImages: Array<{ filename: string; error: string }> = [];
    const validationResults: ImageValidationResult[] = [];

    imageList.forEach(image => {
      const result = this.validateImageExists(image);
      validationResults.push(result);

      if (result.isValid) {
        validImages.push(image);
      } else {
        invalidImages.push({
          filename: image,
          error: result.error || 'Unknown validation error'
        });
        console.warn(`⚠️  Invalid image: ${image} - ${result.error}`);
      }
    });

    console.log(`Image validation summary: ${validImages.length} valid, ${invalidImages.length} invalid`);

    return {
      validImages,
      invalidImages,
      validationResults
    };
  }

  /**
   * Restore images by validating they exist before updating property
   */
  static async validateBeforeRestore(propertyId: number, imagesToRestore: string[]): Promise<{
    canRestore: boolean;
    validImages: string[];
    missingImages: string[];
    errors: string[];
  }> {
    console.log(`🔍 Validating ${imagesToRestore.length} images for property ${propertyId} restore`);

    const validation = this.validateImageList(imagesToRestore);
    
    const errors: string[] = [];
    const missingImages = validation.invalidImages.map(invalid => {
      errors.push(`${invalid.filename}: ${invalid.error}`);
      return invalid.filename;
    });

    const canRestore = validation.validImages.length > 0;

    if (!canRestore) {
      errors.unshift('No valid images found for restore operation');
    }

    console.log(`Restore validation result for property ${propertyId}:`);
    console.log(`- Can restore: ${canRestore}`);
    console.log(`- Valid images: ${validation.validImages.length}`);
    console.log(`- Missing images: ${missingImages.length}`);

    return {
      canRestore,
      validImages: validation.validImages,
      missingImages,
      errors
    };
  }
}
