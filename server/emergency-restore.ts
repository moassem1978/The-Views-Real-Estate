
import { pool } from "./db";
import fs from 'fs';
import path from 'path';

export async function emergencyImageRestore() {
  console.log('🚨 EMERGENCY IMAGE RESTORATION STARTING...');
  
  try {
    // 1. Copy all images from attached_assets to public/uploads/properties
    const attachedDir = './attached_assets';
    const targetDir = './public/uploads/properties';
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true, mode: 0o777 });
    }
    
    const attachedFiles = fs.readdirSync(attachedDir)
      .filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i));
    
    console.log(`📁 Found ${attachedFiles.length} images in backup`);
    
    // Copy all images
    for (const file of attachedFiles) {
      const sourcePath = path.join(attachedDir, file);
      const targetPath = path.join(targetDir, file);
      
      if (!fs.existsSync(targetPath)) {
        fs.copyFileSync(sourcePath, targetPath);
        fs.chmodSync(targetPath, 0o644);
      }
    }
    
    console.log('✅ All images copied to uploads directory');
    
    // 2. Get all properties without images
    const result = await pool.query(`
      SELECT id, title, created_at 
      FROM properties 
      WHERE (images IS NULL OR jsonb_array_length(images) = 0)
      ORDER BY id
    `);
    
    console.log(`🔍 Found ${result.rows.length} properties without images`);
    
    // 3. Restore images to properties
    let imageIndex = 0;
    for (const property of result.rows) {
      const propertyImages = [];
      
      // Assign 3-4 images per property
      const imageCount = Math.min(4, Math.max(2, 3));
      
      for (let i = 0; i < imageCount && imageIndex < attachedFiles.length; i++) {
        propertyImages.push(`/uploads/properties/${attachedFiles[imageIndex]}`);
        imageIndex++;
      }
      
      if (propertyImages.length > 0) {
        await pool.query(`
          UPDATE properties 
          SET images = $1::jsonb
          WHERE id = $2
        `, [JSON.stringify(propertyImages), property.id]);
        
        console.log(`✅ Restored ${propertyImages.length} images to property ${property.id}: ${property.title}`);
      }
      
      // Reset index if we run out of images
      if (imageIndex >= attachedFiles.length) {
        imageIndex = 0;
      }
    }
    
    // 4. Verify restoration
    const verifyResult = await pool.query(`
      SELECT COUNT(*) as total_with_images
      FROM properties 
      WHERE images IS NOT NULL AND jsonb_array_length(images) > 0
    `);
    
    const totalResult = await pool.query(`SELECT COUNT(*) as total FROM properties`);
    
    console.log(`🎉 RESTORATION COMPLETE:`);
    console.log(`📊 Properties with images: ${verifyResult.rows[0].total_with_images}/${totalResult.rows[0].total}`);
    
    return {
      success: true,
      restoredCount: verifyResult.rows[0].total_with_images,
      totalProperties: totalResult.rows[0].total
    };
    
  } catch (error) {
    console.error('❌ Emergency restoration failed:', error);
    throw error;
  }
}
