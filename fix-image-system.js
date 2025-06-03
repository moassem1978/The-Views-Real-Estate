import { createClient } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

async function fixImageSystem() {
  const client = createClient({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Starting image system fix...');
    
    // First, get all existing image files
    const imageDir = path.join(__dirname, 'public/uploads/properties');
    const imageFiles = fs.readdirSync(imageDir).filter(file => 
      file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );
    
    console.log(`Found ${imageFiles.length} image files in storage`);
    
    // Get properties that should have images but don't
    const { rows: emptyImageProperties } = await client.query(`
      SELECT id, title, "createdAt" 
      FROM properties 
      WHERE (images IS NULL OR jsonb_array_length(images) = 0)
      AND id >= 60
      ORDER BY id DESC
      LIMIT 20
    `);
    
    console.log(`Found ${emptyImageProperties.length} properties with missing images`);
    
    // Try to match recent images to recent properties by timestamp
    const recentImages = imageFiles
      .filter(file => file.startsWith('images-'))
      .map(file => {
        const match = file.match(/images-(\d+)-/);
        return {
          filename: file,
          timestamp: match ? parseInt(match[1]) : 0,
          path: `/uploads/properties/${file}`
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
    
    console.log(`Found ${recentImages.length} timestamped images`);
    
    // Match images to properties based on creation time proximity
    for (let i = 0; i < Math.min(emptyImageProperties.length, 5); i++) {
      const property = emptyImageProperties[i];
      const propertyTime = new Date(property.createdAt).getTime();
      
      // Find images within 1 hour of property creation
      const matchingImages = recentImages
        .filter(img => Math.abs(img.timestamp - propertyTime) < 3600000) // 1 hour
        .slice(0, 4); // Max 4 images per property
      
      if (matchingImages.length > 0) {
        const imagePaths = matchingImages.map(img => img.path);
        
        await client.query(`
          UPDATE properties 
          SET images = $1::jsonb 
          WHERE id = $2
        `, [JSON.stringify(imagePaths), property.id]);
        
        console.log(`Updated property ${property.id} with ${imagePaths.length} images`);
      }
    }
    
    // Verify the fixes
    const { rows: updatedProperties } = await client.query(`
      SELECT id, title, jsonb_array_length(images) as image_count
      FROM properties 
      WHERE jsonb_array_length(images) > 0
      ORDER BY id DESC
      LIMIT 10
    `);
    
    console.log('Properties with images after fix:');
    updatedProperties.forEach(prop => {
      console.log(`- Property ${prop.id}: ${prop.title} (${prop.image_count} images)`);
    });
    
  } catch (error) {
    console.error('Error fixing image system:', error);
  } finally {
    await client.end();
  }
}

fixImageSystem();