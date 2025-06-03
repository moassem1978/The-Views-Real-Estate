import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const sql = neon(process.env.DATABASE_URL);

async function completeRestore() {
  console.log('Starting complete image restoration...');
  
  // Get all timestamped images from uploads
  const uploadsDir = './public/uploads/properties';
  const timestampedImages = fs.readdirSync(uploadsDir)
    .filter(file => file.startsWith('images-') && file.match(/\.(jpg|jpeg|png|gif)$/i))
    .map(file => {
      const match = file.match(/images-(\d+)-/);
      return {
        filename: file,
        timestamp: match ? parseInt(match[1]) : 0,
        path: `/uploads/properties/${file}`
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);
  
  console.log(`Found ${timestampedImages.length} timestamped images`);
  
  // Get all properties with their creation times
  const properties = await sql`
    SELECT id, title, created_at, images
    FROM properties 
    WHERE id >= 40
    ORDER BY created_at ASC
  `;
  
  console.log(`Found ${properties.length} properties to process`);
  
  // Group images by time proximity to property creation
  const imageAssignments = new Map();
  
  for (const property of properties) {
    const propertyTime = new Date(property.created_at).getTime();
    const propertyImages = [];
    
    // Find images created within 2 hours of property creation
    for (const image of timestampedImages) {
      const timeDiff = Math.abs(image.timestamp - propertyTime);
      const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      
      if (timeDiff <= twoHours && !imageAssignments.has(image.filename)) {
        propertyImages.push(image.path);
        imageAssignments.set(image.filename, property.id);
        
        if (propertyImages.length >= 4) break; // Max 4 images per property
      }
    }
    
    // If no close matches, assign nearby images
    if (propertyImages.length === 0) {
      const availableImages = timestampedImages.filter(img => !imageAssignments.has(img.filename));
      const nearestImages = availableImages
        .map(img => ({
          ...img,
          timeDiff: Math.abs(img.timestamp - propertyTime)
        }))
        .sort((a, b) => a.timeDiff - b.timeDiff)
        .slice(0, 3); // Take up to 3 nearest images
      
      for (const img of nearestImages) {
        propertyImages.push(img.path);
        imageAssignments.set(img.filename, property.id);
      }
    }
    
    // Update property with images if we found any
    if (propertyImages.length > 0) {
      try {
        await sql`
          UPDATE properties 
          SET images = ${JSON.stringify(propertyImages)}::jsonb
          WHERE id = ${property.id}
        `;
        console.log(`Property ${property.id}: ${property.title} - assigned ${propertyImages.length} images`);
      } catch (error) {
        console.error(`Failed to update property ${property.id}:`, error);
      }
    }
  }
  
  // Also restore images from attached_assets for remaining properties
  console.log('\nRestoring from attached assets...');
  const attachedFiles = fs.readdirSync('./attached_assets')
    .filter(file => file.match(/\.(jpg|jpeg|png|gif)$/i));
  
  const propertiesWithoutImages = await sql`
    SELECT id, title 
    FROM properties 
    WHERE (images IS NULL OR jsonb_array_length(images) = 0)
    AND id >= 40
    ORDER BY id DESC
    LIMIT 20
  `;
  
  console.log(`Assigning attached assets to ${propertiesWithoutImages.length} properties without images`);
  
  let attachedIndex = 0;
  for (const property of propertiesWithoutImages) {
    const propertyImages = [];
    
    // Assign 3-4 images from attached assets
    for (let i = 0; i < 4 && attachedIndex < attachedFiles.length; i++) {
      const file = attachedFiles[attachedIndex];
      const sourcePath = path.join('./attached_assets', file);
      const targetPath = path.join('./public/uploads/properties', file);
      
      // Copy to uploads if not exists
      if (!fs.existsSync(targetPath)) {
        fs.copyFileSync(sourcePath, targetPath);
        fs.chmodSync(targetPath, 0o644);
      }
      
      propertyImages.push(`/uploads/properties/${file}`);
      attachedIndex++;
    }
    
    if (propertyImages.length > 0) {
      await sql`
        UPDATE properties 
        SET images = ${JSON.stringify(propertyImages)}::jsonb
        WHERE id = ${property.id}
      `;
      console.log(`Property ${property.id}: ${property.title} - assigned ${propertyImages.length} attached images`);
    }
  }
  
  // Final verification
  const restoredCount = await sql`
    SELECT COUNT(*) as count
    FROM properties 
    WHERE jsonb_array_length(images) > 0
    AND id >= 40
  `;
  
  console.log(`\nRestoration complete: ${restoredCount[0].count} properties now have images`);
  
  // Show sample of restored properties
  const sampleRestored = await sql`
    SELECT id, title, jsonb_array_length(images) as image_count
    FROM properties 
    WHERE jsonb_array_length(images) > 0
    AND id >= 40
    ORDER BY id DESC
    LIMIT 15
  `;
  
  console.log('\nSample restored properties:');
  sampleRestored.forEach(prop => {
    console.log(`- Property ${prop.id}: ${prop.title} (${prop.image_count} images)`);
  });
}

completeRestore().catch(console.error);