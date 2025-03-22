import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Sizes for responsive images
export const imageSizes = {
  thumbnail: { width: 300, height: 200 }, // For listings grid
  medium: { width: 800, height: 600 },    // For property detail
  large: { width: 1200, height: 900 }     // For fullscreen view
};

/**
 * Optimizes an image and creates multiple sizes for responsive loading
 * 
 * @param inputPath Path to the original uploaded image
 * @param outputDir Directory to save optimized images
 * @param filename Base filename to use (without extension)
 * @returns Object with paths to all generated images
 */
export async function optimizeImage(inputPath: string, outputDir: string, filename: string): Promise<{ 
  original: string, 
  thumbnail: string, 
  medium: string, 
  large: string 
}> {
  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get image info from the original
  const imageInfo = await sharp(inputPath).metadata();
  const ext = '.webp'; // WebP format for better compression

  // Create optimized original
  const originalFilename = `${filename}-original${ext}`;
  const originalPath = path.join(outputDir, originalFilename);
  
  await sharp(inputPath)
    .webp({ quality: 85 }) // Good quality but compressed
    .toFile(originalPath);

  // Create thumbnail
  const thumbnailFilename = `${filename}-thumbnail${ext}`;
  const thumbnailPath = path.join(outputDir, thumbnailFilename);
  
  await sharp(inputPath)
    .resize(imageSizes.thumbnail.width, imageSizes.thumbnail.height, {
      fit: 'cover',
      position: 'centre'
    })
    .webp({ quality: 70 }) // Lower quality is fine for thumbnails
    .toFile(thumbnailPath);

  // Create medium size
  const mediumFilename = `${filename}-medium${ext}`;
  const mediumPath = path.join(outputDir, mediumFilename);
  
  await sharp(inputPath)
    .resize(imageSizes.medium.width, imageSizes.medium.height, {
      fit: 'cover',
      position: 'centre'
    })
    .webp({ quality: 80 })
    .toFile(mediumPath);

  // Create large size
  const largeFilename = `${filename}-large${ext}`;
  const largePath = path.join(outputDir, largeFilename);
  
  await sharp(inputPath)
    .resize(imageSizes.large.width, imageSizes.large.height, {
      fit: 'cover',
      position: 'centre'
    })
    .webp({ quality: 85 })
    .toFile(largePath);

  // Return all paths (these are relative to the output directory)
  return {
    original: `uploads/properties/${originalFilename}`,
    thumbnail: `uploads/properties/${thumbnailFilename}`,
    medium: `uploads/properties/${mediumFilename}`,
    large: `uploads/properties/${largeFilename}`
  };
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