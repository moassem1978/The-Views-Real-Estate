import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

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
 * Implements aggressive compression to keep total app size under 150MB
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

  // Helper function to optimize an image with size constraints
  const optimizeWithSizeConstraint = async (
    input: string, 
    output: string, 
    width: number | null, 
    height: number | null, 
    maxSizeBytes: number,
    startQuality = 80
  ) => {
    let quality = startQuality;
    let outputBuffer: Buffer;
    let fileSize = Infinity;
    
    // Start with a reasonable quality and decrease until we hit target size
    while (quality >= 30 && fileSize > maxSizeBytes) {
      const transformer = sharp(input);
      
      // Apply resize if dimensions are provided
      if (width && height) {
        transformer.resize(width, height, {
          fit: 'cover',
          position: 'centre'
        });
      }
      
      // Generate webp with current quality setting
      outputBuffer = await transformer
        .webp(compressionOptions.webp)
        .toBuffer();
      
      fileSize = outputBuffer.length;
      
      // If still too large, reduce quality for next iteration
      if (fileSize > maxSizeBytes) {
        quality -= 5; // Decrease quality in increments of 5
      }
    }
    
    // Write the final optimized buffer to file
    if (outputBuffer!) {
      await fs.promises.writeFile(output, outputBuffer!);
    }
    
    console.log(`Optimized ${path.basename(output)}: ${Math.round(fileSize! / 1024)}KB, quality: ${quality}`);
  };

  // Create optimized original (significantly compressed to save space)
  const originalFilename = `${filename}-original${ext}`;
  const originalPath = path.join(outputDir, originalFilename);
  
  await optimizeWithSizeConstraint(
    inputPath, 
    originalPath, 
    null, // Keep original dimensions
    null,
    500 * 1024, // 500KB max for originals (heavily compressed)
    75 // Start with lower quality for original
  );

  // Create thumbnail
  const thumbnailFilename = `${filename}-thumbnail${ext}`;
  const thumbnailPath = path.join(outputDir, thumbnailFilename);
  
  await optimizeWithSizeConstraint(
    inputPath,
    thumbnailPath,
    imageSizes.thumbnail.width,
    imageSizes.thumbnail.height,
    30 * 1024, // 30KB max for thumbnails
    65 // Start with even lower quality for thumbnails
  );

  // Create medium size
  const mediumFilename = `${filename}-medium${ext}`;
  const mediumPath = path.join(outputDir, mediumFilename);
  
  await optimizeWithSizeConstraint(
    inputPath,
    mediumPath,
    imageSizes.medium.width,
    imageSizes.medium.height,
    100 * 1024, // 100KB max for medium images
    70
  );

  // Create large size
  const largeFilename = `${filename}-large${ext}`;
  const largePath = path.join(outputDir, largeFilename);
  
  await optimizeWithSizeConstraint(
    inputPath,
    largePath,
    imageSizes.large.width,
    imageSizes.large.height,
    200 * 1024, // 200KB max for large images
    75
  );

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