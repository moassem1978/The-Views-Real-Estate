import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const uploadsDir = './public/uploads/properties';
const maxSizeKB = 800;
const quality = 85;

async function optimizeImages() {
  console.log('Starting image optimization...\n');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('No uploads directory found');
    return;
  }

  const files = fs.readdirSync(uploadsDir)
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
    .map(file => path.join(uploadsDir, file));

  let totalSaved = 0;
  let processed = 0;

  for (const filePath of files) {
    try {
      const stats = fs.statSync(filePath);
      const originalSize = stats.size;
      
      // Skip if already small enough
      if (originalSize < maxSizeKB * 1024) continue;

      console.log(`Optimizing: ${path.basename(filePath)} (${(originalSize / 1024 / 1024).toFixed(1)}MB)`);

      // Create optimized version
      const optimizedBuffer = await sharp(filePath)
        .webp({ quality })
        .toBuffer();

      // Replace original if WebP is smaller
      if (optimizedBuffer.length < originalSize) {
        const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        fs.writeFileSync(webpPath, optimizedBuffer);
        fs.unlinkSync(filePath); // Remove original
        
        const saved = originalSize - optimizedBuffer.length;
        totalSaved += saved;
        processed++;
        
        console.log(`  Saved ${(saved / 1024 / 1024).toFixed(1)}MB -> ${path.basename(webpPath)}`);
      }
    } catch (error) {
      console.log(`  Error processing ${path.basename(filePath)}: ${error.message}`);
    }
  }

  console.log(`\nOptimization complete:`);
  console.log(`- Processed: ${processed} files`);
  console.log(`- Total saved: ${(totalSaved / 1024 / 1024).toFixed(1)}MB`);
}

optimizeImages().catch(console.error);