import fs from 'fs';
import path from 'path';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixImageReferences() {
  try {
    console.log("Starting comprehensive image reference cleanup...");
    
    // Get list of actual files in uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
    const existingFiles = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    console.log(`Found ${existingFiles.length} files in uploads directory`);
    
    // Get all properties with image references
    const result = await pool.query(`
      SELECT id, title, images::text as images_text 
      FROM properties 
      WHERE images IS NOT NULL 
        AND images != '[]'::jsonb 
        AND images != '""'::jsonb
        AND images::text != 'null'
      ORDER BY id
    `);
    
    console.log(`Found ${result.rows.length} properties with image references`);
    
    let updatedCount = 0;
    
    for (const property of result.rows) {
      let images = [];
      
      // Parse the images field safely
      try {
        const parsedImages = JSON.parse(property.images_text);
        if (Array.isArray(parsedImages)) {
          images = parsedImages;
        }
      } catch (e) {
        console.log(`Property ${property.id}: Failed to parse images, clearing field`);
        await pool.query('UPDATE properties SET images = $1 WHERE id = $2', ['[]', property.id]);
        updatedCount++;
        continue;
      }
      
      if (images.length === 0) continue;
      
      // Filter out missing images
      const validImages = [];
      const missingImages = [];
      
      for (const imagePath of images) {
        if (!imagePath || typeof imagePath !== 'string') continue;
        
        const filename = path.basename(imagePath);
        const fileExists = existingFiles.includes(filename);
        
        if (fileExists) {
          // Normalize path format
          const normalizedPath = `/uploads/properties/${filename}`;
          validImages.push(normalizedPath);
        } else {
          missingImages.push(imagePath);
        }
      }
      
      // Update if there are missing images
      if (missingImages.length > 0) {
        console.log(`Property ${property.id} "${property.title}": Removing ${missingImages.length} missing images, keeping ${validImages.length} valid images`);
        
        await pool.query('UPDATE properties SET images = $1 WHERE id = $2', [JSON.stringify(validImages), property.id]);
        updatedCount++;
      }
    }
    
    console.log(`Cleanup complete. Updated ${updatedCount} properties.`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await pool.end();
  }
}

fixImageReferences();