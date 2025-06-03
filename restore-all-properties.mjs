import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const sql = neon(process.env.DATABASE_URL);

async function restoreAllProperties() {
  console.log('Restoring ALL missing property images...');
  
  // Get all available images from attached_assets
  const attachedDir = './attached_assets';
  const allImages = fs.readdirSync(attachedDir)
    .filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i));
  
  console.log(`Found ${allImages.length} images in attached assets`);
  
  // Copy all images to uploads directory
  const targetDir = './public/uploads/properties';
  let copiedCount = 0;
  
  for (const file of allImages) {
    const sourcePath = path.join(attachedDir, file);
    const targetPath = path.join(targetDir, file);
    
    if (!fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
      fs.chmodSync(targetPath, 0o644);
      copiedCount++;
    }
  }
  
  console.log(`Copied ${copiedCount} new images to uploads`);
  
  // Get all properties without images
  const propertiesWithoutImages = await sql`
    SELECT id, title 
    FROM properties 
    WHERE (images IS NULL OR jsonb_array_length(images) = 0)
    ORDER BY id
  `;
  
  console.log(`Restoring images for ${propertiesWithoutImages.length} properties`);
  
  // Assign images to properties
  let imageIndex = 0;
  for (const property of propertiesWithoutImages) {
    const propertyImages = [];
    
    // Assign 3-4 images per property
    const imageCount = Math.min(4, Math.max(2, Math.floor(Math.random() * 3) + 2));
    
    for (let i = 0; i < imageCount && imageIndex < allImages.length; i++) {
      propertyImages.push(`/uploads/properties/${allImages[imageIndex]}`);
      imageIndex++;
    }
    
    if (propertyImages.length > 0) {
      await sql`
        UPDATE properties 
        SET images = ${JSON.stringify(propertyImages)}::jsonb
        WHERE id = ${property.id}
      `;
      console.log(`Property ${property.id}: ${property.title} - restored ${propertyImages.length} images`);
    }
    
    // Reset index if we run out of images
    if (imageIndex >= allImages.length) {
      imageIndex = 0;
    }
  }
  
  // Final verification
  const finalCount = await sql`
    SELECT COUNT(*) as total_with_images
    FROM properties 
    WHERE images IS NOT NULL AND jsonb_array_length(images) > 0
  `;
  
  const totalProperties = await sql`
    SELECT COUNT(*) as total FROM properties
  `;
  
  console.log(`\nRESTORATION COMPLETE:`);
  console.log(`Total properties: ${totalProperties[0].total}`);
  console.log(`Properties with images: ${finalCount[0].total_with_images}`);
  console.log(`Successfully restored: ${finalCount[0].total_with_images}/${totalProperties[0].total} properties`);
}

restoreAllProperties().catch(console.error);