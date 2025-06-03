import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB max file size
const MAX_DIMENSION = 1920; // Max width/height
const THUMBNAIL_SIZE = 400; // Thumbnail size for listings

export async function optimizeImage(inputBuffer: Buffer, options: { generateThumbnail?: boolean, quality?: number } = {}) {
  try {
    // Get image metadata
    const metadata = await sharp(inputBuffer).metadata();

    // Calculate resize dimensions while maintaining aspect ratio
    let width = metadata.width || 0;
    let height = metadata.height || 0;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Convert to WebP for better compression and performance
    const quality = options.quality || 85;
    const outputBuffer = await sharp(inputBuffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ 
        quality,
        effort: 6, // High compression effort
        nearLossless: false
      })
      .toBuffer();

    // If file is still too large, reduce quality
    if (outputBuffer.length > MAX_FILE_SIZE && quality > 60) {
      return optimizeImage(inputBuffer, { ...options, quality: quality - 10 });
    }

    return outputBuffer;
  } catch (err) {
    console.error('Image optimization failed:', err);
    // Fallback to JPEG if WebP fails
    try {
      const fallbackBuffer = await sharp(inputBuffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80, progressive: true })
        .toBuffer();
      
      return fallbackBuffer;
    } catch (fallbackErr) {
      throw new Error('Image optimization failed - please ensure image is valid and under 2MB');
    }
  }
}

export async function generateThumbnail(inputBuffer: Buffer, size: number = THUMBNAIL_SIZE) {
  try {
    // Generate WebP thumbnail for better performance
    const webpBuffer = await sharp(inputBuffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ 
        quality: 75,
        effort: 4
      })
      .toBuffer();

    return webpBuffer;
  } catch (err) {
    console.error('Thumbnail generation failed:', err);
    // Fallback to JPEG
    try {
      return await sharp(inputBuffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 70 })
        .toBuffer();
    } catch (fallbackErr) {
      throw new Error('Thumbnail generation failed');
    }
  }
}

export async function generateMultipleSizes(inputBuffer: Buffer) {
  try {
    const sizes = [
      { name: 'thumbnail', width: 400, height: 300 },
      { name: 'medium', width: 800, height: 600 },
      { name: 'large', width: 1200, height: 900 }
    ];

    const results: { [key: string]: Buffer } = {};

    for (const size of sizes) {
      results[size.name] = await sharp(inputBuffer)
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 85, effort: 6 })
        .toBuffer();
    }

    return results;
  } catch (err) {
    console.error('Multiple sizes generation failed:', err);
    throw new Error('Multiple sizes generation failed');
  }
}

// Cleanup old images - run daily
export async function cleanupUnusedImages(uploadsDir: string, usedImages: string[]) {
  const files = await fs.promises.readdir(uploadsDir);
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const stats = await fs.promises.stat(filePath);

    // Delete if unused and older than 1 week
    if (!usedImages.includes(file) && now - stats.mtimeMs > oneWeek) {
      await fs.promises.unlink(filePath);
      console.log(`Deleted unused image: ${file}`);
    }
  }
}