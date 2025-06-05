
```typescript
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

export interface ProcessedImage {
  id: string;
  originalName: string;
  filename: string;
  url: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  format?: string;
  validated: boolean;
  errors: string[];
}

export interface ImageProcessingResult {
  success: boolean;
  processedImages: ProcessedImage[];
  totalProcessed: number;
  totalErrors: number;
  errors: string[];
  fallbackMessage?: string;
}

export class StrictImageProcessor {
  private static readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'
  ];
  private static readonly MIN_DIMENSIONS = { width: 50, height: 50 };
  private static readonly MAX_DIMENSIONS = { width: 10000, height: 10000 };

  /**
   * Process uploaded files with strict validation and unique ID assignment
   */
  static async processUploadedFiles(files: Express.Multer.File[]): Promise<ImageProcessingResult> {
    console.log(`🔄 Processing ${files.length} uploaded files with strict validation`);
    
    const result: ImageProcessingResult = {
      success: false,
      processedImages: [],
      totalProcessed: 0,
      totalErrors: 0,
      errors: []
    };

    const uniqueFilenames = new Set<string>();

    for (const file of files) {
      const imageId = uuidv4();
      const processedImage: ProcessedImage = {
        id: imageId,
        originalName: file.originalname || 'unnamed',
        filename: file.filename || '',
        url: '',
        size: file.size || 0,
        validated: false,
        errors: []
      };

      try {
        // Basic file validation
        if (!file.filename || file.size === 0) {
          throw new Error('File is empty or has no filename');
        }

        // Check for duplicate filenames
        if (uniqueFilenames.has(file.filename)) {
          throw new Error(`Duplicate filename: ${file.filename}`);
        }
        uniqueFilenames.add(file.filename);

        // MIME type validation
        if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
          throw new Error(`Invalid file type: ${file.mimetype}. Allowed: ${this.ALLOWED_MIME_TYPES.join(', ')}`);
        }

        // File size validation
        if (file.size > this.MAX_FILE_SIZE) {
          throw new Error(`File too large: ${Math.round(file.size / 1024 / 1024)}MB. Maximum: 25MB`);
        }

        // File existence validation
        if (file.path && !fs.existsSync(file.path)) {
          throw new Error('Uploaded file not found on disk');
        }

        // Sharp validation (with fallback)
        try {
          const sharp = await import('sharp');
          const metadata = await sharp.default(file.path || file.buffer).metadata();
          
          if (!metadata.width || !metadata.height) {
            throw new Error('Invalid image: unable to read dimensions');
          }

          // Dimension validation
          if (metadata.width < this.MIN_DIMENSIONS.width || metadata.height < this.MIN_DIMENSIONS.height) {
            throw new Error(`Image too small: ${metadata.width}x${metadata.height}. Minimum: ${this.MIN_DIMENSIONS.width}x${this.MIN_DIMENSIONS.height}`);
          }

          if (metadata.width > this.MAX_DIMENSIONS.width || metadata.height > this.MAX_DIMENSIONS.height) {
            throw new Error(`Image too large: ${metadata.width}x${metadata.height}. Maximum: ${this.MAX_DIMENSIONS.width}x${this.MAX_DIMENSIONS.height}`);
          }

          processedImage.dimensions = {
            width: metadata.width,
            height: metadata.height
          };
          processedImage.format = metadata.format;

          console.log(`✅ Sharp validation passed: ${processedImage.originalName} (${metadata.width}x${metadata.height}, ${metadata.format})`);

        } catch (sharpError) {
          console.warn(`⚠️  Sharp validation failed for ${processedImage.originalName}:`, sharpError);
          processedImage.errors.push(`Sharp validation warning: ${sharpError instanceof Error ? sharpError.message : 'Unknown Sharp error'}`);
          // Continue without Sharp validation
        }

        // Generate URL
        processedImage.url = `/uploads/properties/${file.filename}`;
        processedImage.validated = true;
        result.processedImages.push(processedImage);
        result.totalProcessed++;

        console.log(`✅ Successfully processed: ${processedImage.originalName} -> ${processedImage.url} (ID: ${imageId})`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
        console.error(`❌ Failed to process ${processedImage.originalName}:`, errorMessage);
        
        processedImage.errors.push(errorMessage);
        result.errors.push(`${processedImage.originalName}: ${errorMessage}`);
        result.totalErrors++;
      }
    }

    // Determine overall success
    result.success = result.totalProcessed > 0;
    
    if (result.totalErrors > 0 && result.totalProcessed === 0) {
      result.fallbackMessage = "All files failed validation. Please check file types, sizes, and formats. Supported: JPEG, PNG, GIF, WebP (max 25MB, min 50x50px)";
    } else if (result.totalErrors > 0) {
      result.fallbackMessage = `${result.totalProcessed} files processed successfully, ${result.totalErrors} failed validation`;
    }

    console.log(`📊 Processing complete: ${result.totalProcessed} successful, ${result.totalErrors} failed`);
    return result;
  }

  /**
   * Validate existing image URLs
   */
  static async validateImageUrls(imageUrls: string[]): Promise<ImageProcessingResult> {
    console.log(`🔍 Validating ${imageUrls.length} existing image URLs`);
    
    const result: ImageProcessingResult = {
      success: false,
      processedImages: [],
      totalProcessed: 0,
      totalErrors: 0,
      errors: []
    };

    for (const url of imageUrls) {
      const imageId = uuidv4();
      const filename = path.basename(url);
      
      const processedImage: ProcessedImage = {
        id: imageId,
        originalName: filename,
        filename: filename,
        url: url,
        size: 0,
        validated: false,
        errors: []
      };

      try {
        // URL format validation
        if (!url || typeof url !== 'string' || url.trim() === '') {
          throw new Error('Invalid or empty URL');
        }

        // Check if file exists
        const possiblePaths = [
          path.join(process.cwd(), 'public', url),
          path.join(process.cwd(), 'public', 'uploads', 'properties', filename)
        ];

        let filePath: string | null = null;
        for (const testPath of possiblePaths) {
          if (fs.existsSync(testPath)) {
            filePath = testPath;
            break;
          }
        }

        if (!filePath) {
          throw new Error(`File not found: ${filename}`);
        }

        // Get file stats
        const stats = fs.statSync(filePath);
        if (!stats.isFile() || stats.size === 0) {
          throw new Error(`Invalid file: ${filename}`);
        }

        processedImage.size = stats.size;

        // Optional Sharp validation for existing files
        try {
          const sharp = await import('sharp');
          const metadata = await sharp.default(filePath).metadata();
          
          if (metadata.width && metadata.height) {
            processedImage.dimensions = {
              width: metadata.width,
              height: metadata.height
            };
            processedImage.format = metadata.format;
          }
        } catch (sharpError) {
          console.warn(`⚠️  Sharp validation skipped for existing file ${filename}:`, sharpError);
        }

        processedImage.validated = true;
        result.processedImages.push(processedImage);
        result.totalProcessed++;

        console.log(`✅ Validated existing image: ${url} (ID: ${imageId})`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
        console.error(`❌ Failed to validate ${url}:`, errorMessage);
        
        processedImage.errors.push(errorMessage);
        result.errors.push(`${url}: ${errorMessage}`);
        result.totalErrors++;
      }
    }

    result.success = result.totalProcessed > 0;
    
    if (result.totalErrors > 0 && result.totalProcessed === 0) {
      result.fallbackMessage = "All image URLs failed validation. Files may be missing or corrupted.";
    }

    console.log(`📊 URL validation complete: ${result.totalProcessed} valid, ${result.totalErrors} invalid`);
    return result;
  }

  /**
   * Clean filename for safe storage
   */
  static sanitizeFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(originalName).toLowerCase() || '.jpg';
    const baseName = path.basename(originalName, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 30);
    
    return `${baseName}_${timestamp}_${randomId}${ext}`;
  }

  /**
   * Create unique backup identifier
   */
  static generateBackupId(propertyId: number): string {
    return `backup_${propertyId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Optimize image with Sharp for web delivery
   */
  static async optimizeImageWithSharp(
    inputPath: string | Buffer, 
    outputPath: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    } = {}
  ): Promise<{ width: number; height: number; size: number }> {
    const {
      width = 1200,
      height = 1200,
      quality = 85,
      format = 'webp'
    } = options;

    try {
      const sharp = await import('sharp');
      
      const metadata = await sharp.default(inputPath)
        .resize({ 
          width, 
          height, 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .toFormat(format, { quality })
        .toFile(outputPath);

      console.log(`📐 Image optimized: ${metadata.width}x${metadata.height}, ${Math.round(metadata.size / 1024)}KB`);
      
      return {
        width: metadata.width,
        height: metadata.height,
        size: metadata.size
      };
    } catch (error) {
      console.error('Sharp optimization failed:', error);
      throw new Error(`Image optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
```
