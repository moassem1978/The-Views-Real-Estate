import sharp from 'sharp';
import { Client } from '@replit/object-storage';

// Initialize Object Storage client
const storage = new Client();

// Reduced sizes for better performance
export const imageSizes = {
  thumbnail: { width: 150, height: 100 }, // Smaller thumbnails
  medium: { width: 480, height: 320 },    // Reduced medium size
  large: { width: 800, height: 600 }      // Reduced large size
};

// Compression options
const compressionOptions = {
  jpeg: { quality: 80, progressive: true },
  webp: { quality: 75 }
};

/**
 * Optimizes an image and creates multiple sizes for responsive loading
 * Uses Object Storage for persistent storage
 */
export async function optimizeImage(inputBuffer: Buffer, filename: string): Promise<{ 
  original: string, 
  thumbnail: string, 
  medium: string, 
  large: string 
}> {
  const ext = '.webp'; // WebP format for better compression
  const basePath = 'properties';

  // Helper function to optimize and upload an image
  const optimizeAndUpload = async (
    input: Buffer,
    width: number | null,
    height: number | null,
    outputKey: string,
    maxSizeBytes: number,
    startQuality = 80
  ) => {
    let quality = startQuality;
    let outputBuffer: Buffer;
    let fileSize = Infinity;

    while (quality >= 30 && fileSize > maxSizeBytes) {
      const transformer = sharp(input);

      if (width && height) {
        transformer.resize(width, height, {
          fit: 'cover',
          position: 'centre'
        });
      }

      outputBuffer = await transformer
        .webp({ quality })
        .toBuffer();

      fileSize = outputBuffer.length;
      quality -= 5;
    }

    // Upload to Object Storage
    await storage.upload(outputKey, outputBuffer!);
    return outputKey;
  };

  // Generate paths
  const paths = {
    original: `${basePath}/${filename}-original${ext}`,
    thumbnail: `${basePath}/${filename}-thumbnail${ext}`,
    medium: `${basePath}/${filename}-medium${ext}`,
    large: `${basePath}/${filename}-large${ext}`
  };

  // Process and upload all sizes
  await Promise.all([
    // Original (compressed)
    optimizeAndUpload(inputBuffer, null, null, paths.original, 500 * 1024, 75),

    // Thumbnail
    optimizeAndUpload(
      inputBuffer,
      imageSizes.thumbnail.width,
      imageSizes.thumbnail.height,
      paths.thumbnail,
      30 * 1024,
      65
    ),

    // Medium
    optimizeAndUpload(
      inputBuffer,
      imageSizes.medium.width,
      imageSizes.medium.height,
      paths.medium,
      100 * 1024,
      70
    ),

    // Large
    optimizeAndUpload(
      inputBuffer,
      imageSizes.large.width,
      imageSizes.large.height,
      paths.large,
      200 * 1024,
      75
    )
  ]);

  // Return paths to stored images
  return paths;
}

/**
 * Create an image set object containing different sizes for responsive loading
 * This is useful when you already have the image paths and just need to structure them
 */
export function createImageSet(basePath: string, filename: string): {
  original: string, 
  thumbnail: string, 
  medium: string, 
  large: string 
} {
  const ext = path.extname(filename) || '.webp';
  const name = path.basename(filename, ext);
  
  return {
    original: `${basePath}/${name}-original${ext}`,
    thumbnail: `${basePath}/${name}-thumbnail${ext}`,
    medium: `${basePath}/${name}-medium${ext}`,
    large: `${basePath}/${name}-large${ext}`
  };
}

/**
 * A simplified utility for legacy images that don't have multiple sizes
 * Creates responsive image URLs with a standard pattern based on a single path
 */
export function getResponsiveImagePaths(imagePath: string): {
  original: string, 
  thumbnail: string, 
  medium: string, 
  large: string 
} {
  if (!imagePath) {
    return {
      original: '',
      thumbnail: '',
      medium: '',
      large: ''
    };
  }
  
  // For handling existing non-optimized images
  return {
    original: imagePath,
    thumbnail: imagePath,
    medium: imagePath,
    large: imagePath
  };
}