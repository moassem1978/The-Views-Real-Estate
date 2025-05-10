import sharp from 'sharp';
import { Client } from '@replit/object-storage';
import path from 'path';

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

export async function optimizeImage(inputBuffer: Buffer, options = {}) {
  const {
    width = 1200,
    quality = 80,
    format = 'jpeg'
  } = options;

  try {
    const optimized = await sharp(inputBuffer)
      .resize(width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .toFormat(format, { quality })
      .toBuffer();

    return optimized;
  } catch (err) {
    console.error('Image optimization failed:', err);
    return inputBuffer; // Fallback to original
  }
}

export async function generateThumbnail(inputBuffer: Buffer) {
  try {
    const thumbnail = await sharp(inputBuffer)
      .resize(300, 300, {
        fit: 'cover'
      })
      .toFormat('jpeg', { quality: 70 })
      .toBuffer();

    return thumbnail;
  } catch (err) {
    console.error('Thumbnail generation failed:', err);
    return inputBuffer;
  }
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