import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB max file size
const MAX_DIMENSION = 1920; // Max width/height

export async function optimizeImage(inputBuffer: Buffer, options = {}) {
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

    // Progressive optimization with quality reduction until size limit is met
    let quality = 85;
    let outputBuffer: Buffer;
    let fileSize = Infinity;

    while (quality >= 60 && fileSize > MAX_FILE_SIZE) {
      outputBuffer = await sharp(inputBuffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality, progressive: true })
        .toBuffer();

      fileSize = outputBuffer.length;
      quality -= 5;
    }

    return outputBuffer || inputBuffer;
  } catch (err) {
    console.error('Image optimization failed:', err);
    throw new Error('Image optimization failed - please ensure image is valid and under 2MB');
  }
}

export async function generateThumbnail(inputBuffer: Buffer) {
  try {
    return await sharp(inputBuffer)
      .resize(300, 300, {
        fit: 'cover'
      })
      .jpeg({ quality: 70 })
      .toBuffer();
  } catch (err) {
    console.error('Thumbnail generation failed:', err);
    throw new Error('Thumbnail generation failed');
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