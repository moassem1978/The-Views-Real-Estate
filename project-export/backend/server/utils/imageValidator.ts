
import { existsSync, statSync } from 'fs';
import path from 'path';

export interface ImageValidationResult {
  isValid: boolean;
  filePath?: string;
  error?: string;
  fileSize?: number;
  exists?: boolean;
}

export class ImageValidator {
  private static readonly IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  private static readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  private static readonly BASE_UPLOAD_PATH = 'public/uploads/properties';
  private static readonly BASE_IMAGES_PATH = 'public/images';

  /**
   * Validate if an image file exists and is accessible
   */
  static validateImageExists(filename: string): ImageValidationResult {
    try {
      // Clean filename and construct full path
      const cleanFilename = filename.replace(/^\/+/, '').replace('/uploads/properties/', '');
      const uploadPath = path.join(this.BASE_UPLOAD_PATH, cleanFilename);
      const imagesPath = path.join(this.BASE_IMAGES_PATH, cleanFilename);
      
      console.log(`Validating image: ${filename} -> ${uploadPath} or ${imagesPath}`);

      // Check if file exists in either location
      let fullPath = uploadPath;
      let exists = existsSync(uploadPath);
      
      if (!exists) {
        fullPath = imagesPath;
        exists = existsSync(imagesPath);
      }

      if (!exists) {
        return {
          isValid: false,
          error: `File not found: ${filename}`,
          filePath: uploadPath,
          exists: false
        };
      }

      // Check file stats
      const stats = statSync(fullPath);
      
      // Check if it's a file
      if (!stats.isFile()) {
        return {
          isValid: false,
          error: `Path is not a file: ${filename}`,
          filePath: fullPath,
          exists: true
        };
      }

      // Check file size
      if (stats.size === 0) {
        return {
          isValid: false,
          error: `File is empty: ${filename}`,
          filePath: fullPath,
          fileSize: stats.size,
          exists: true
        };
      }

      if (stats.size > this.MAX_FILE_SIZE) {
        return {
          isValid: false,
          error: `File too large: ${filename} (${Math.round(stats.size / 1024 / 1024)}MB)`,
          filePath: fullPath,
          fileSize: stats.size,
          exists: true
        };
      }

      // Check file extension
      const ext = path.extname(cleanFilename).toLowerCase();
      if (!this.IMAGE_EXTENSIONS.includes(ext)) {
        return {
          isValid: false,
          error: `Invalid image extension: ${filename}`,
          filePath: fullPath,
          fileSize: stats.size,
          exists: true
        };
      }

      console.log(`✅ Image validated successfully: ${filename} (${Math.round(stats.size / 1024)}KB)`);
      
      return {
        isValid: true,
        filePath: fullPath,
        fileSize: stats.size,
        exists: true
      };

    } catch (error) {
      console.error(`Error validating image ${filename}:`, error);
      return {
        isValid: false,
        error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        filePath: undefined,
        exists: false
      };
    }
  }

  /**
   * Validate multiple images and return results - used in restore operations
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

      if (result.isValid && result.exists) {
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
   * Enhanced for restore scripts to check file existence before DB insertion
   */
  static async validateBeforeRestore(propertyId: number, imagesToRestore: string[]): Promise<{
    canRestore: boolean;
    validImages: string[];
    missingImages: string[];
    errors: string[];
    existingFiles: string[];
  }> {
    console.log(`🔍 Validating ${imagesToRestore.length} images for property ${propertyId} restore`);

    const validation = this.validateImageList(imagesToRestore);
    
    const errors: string[] = [];
    const missingImages: string[] = [];
    const existingFiles: string[] = [];

    validation.invalidImages.forEach(invalid => {
      errors.push(`${invalid.filename}: ${invalid.error}`);
      missingImages.push(invalid.filename);
    });

    validation.validationResults.forEach((result, index) => {
      if (result.exists) {
        existingFiles.push(imagesToRestore[index]);
      }
    });

    const canRestore = validation.validImages.length > 0;

    if (!canRestore) {
      errors.unshift('No valid images found for restore operation');
    }

    console.log(`Restore validation result for property ${propertyId}:`);
    console.log(`- Can restore: ${canRestore}`);
    console.log(`- Valid images: ${validation.validImages.length}`);
    console.log(`- Missing images: ${missingImages.length}`);
    console.log(`- Existing files: ${existingFiles.length}`);

    return {
      canRestore,
      validImages: validation.validImages,
      missingImages,
      errors,
      existingFiles
    };
  }

  /**
   * Check if photo files exist before database insertion (for restore scripts)
   */
  static validatePhotosForDBInsertion(photos: Array<{ filename: string; [key: string]: any }>): {
    validPhotos: Array<{ filename: string; [key: string]: any }>;
    invalidPhotos: Array<{ filename: string; error: string }>;
  } {
    const validPhotos: Array<{ filename: string; [key: string]: any }> = [];
    const invalidPhotos: Array<{ filename: string; error: string }> = [];

    photos.forEach(photo => {
      const validation = this.validateImageExists(photo.filename);
      
      if (validation.isValid && validation.exists) {
        validPhotos.push(photo);
      } else {
        invalidPhotos.push({
          filename: photo.filename,
          error: validation.error || 'File does not exist'
        });
      }
    });

    console.log(`DB insertion validation: ${validPhotos.length} valid, ${invalidPhotos.length} invalid photos`);
    
    return { validPhotos, invalidPhotos };
  }
}
