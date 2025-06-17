#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🖼️  Image Compression Script\n');

const uploadsDir = './public/uploads/properties';
const backupDir = './image-backups';

// Create backup directory
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Get all large images (>1MB)
function getLargeImages() {
  try {
    const result = execSync(
      `find "${uploadsDir}" -type f -size +1M -name "*.jpg" -o -name "*.jpeg" -o -name "*.png"`,
      { encoding: 'utf8' }
    );
    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

// Compress using sharp (already installed)
function compressImage(inputPath, outputPath, quality = 80) {
  try {
    // Use sharp to compress and convert to WebP
    const sharp = require('sharp');
    return sharp(inputPath)
      .webp({ quality })
      .toFile(outputPath);
  } catch (error) {
    console.log(`Error compressing ${inputPath}: ${error.message}`);
    return null;
  }
}

// Main compression function
async function compressImages() {
  const largeImages = getLargeImages();
  console.log(`Found ${largeImages.length} large images to compress\n`);
  
  let totalSaved = 0;
  
  for (const imagePath of largeImages) {
    const stats = fs.statSync(imagePath);
    const originalSize = stats.size;
    
    // Create WebP version
    const ext = path.extname(imagePath);
    const webpPath = imagePath.replace(ext, '.webp');
    
    console.log(`Compressing: ${path.basename(imagePath)} (${(originalSize / 1024 / 1024).toFixed(1)}MB)`);
    
    try {
      // Backup original
      const backupPath = path.join(backupDir, path.basename(imagePath));
      fs.copyFileSync(imagePath, backupPath);
      
      // Compress to WebP
      await compressImage(imagePath, webpPath, 85);
      
      // Check new size
      if (fs.existsSync(webpPath)) {
        const newStats = fs.statSync(webpPath);
        const newSize = newStats.size;
        const saved = originalSize - newSize;
        totalSaved += saved;
        
        console.log(`  ✅ Saved ${(saved / 1024 / 1024).toFixed(1)}MB (${((saved / originalSize) * 100).toFixed(1)}% reduction)`);
        
        // Remove original if WebP is smaller
        if (newSize < originalSize) {
          fs.unlinkSync(imagePath);
        }
      }
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
    }
  }
  
  console.log(`\n🎯 Total space saved: ${(totalSaved / 1024 / 1024).toFixed(1)}MB`);
}

compressImages().catch(console.error);