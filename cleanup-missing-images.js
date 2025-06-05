import fs from 'fs';
import path from 'path';
import pg from 'pg';
const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function cleanupMissingImages() {
  try {
    console.log("Starting missing image cleanup...");
    
    // Get all properties with images, handling JSON parsing issues
    const propertiesQuery = 'SELECT id, title, images FROM properties WHERE images IS NOT NULL AND images != \'[]\' AND images != \'\' ORDER BY id';
    const propertiesResult = await pool.query(propertiesQuery);
    
    console.log(`Found ${propertiesResult.rows.length} properties with images`);
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
    const existingFiles = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    
    console.log(`Found ${existingFiles.length} files in uploads directory`);
    
    let cleanedCount = 0;
    
    for (const property of propertiesResult.rows) {
      let images = [];
      
      // Parse images field with better error handling
      try {
        if (typeof property.images === 'string') {
          // Skip empty or invalid JSON strings
          if (property.images.trim() === '' || property.images === 'null') {
            continue;
          }
          images = JSON.parse(property.images);
        } else if (Array.isArray(property.images)) {
          images = property.images;
        } else {
          // Handle other types of data
          console.log(`Property ${property.id}: Unexpected images type: ${typeof property.images}`);
          continue;
        }
      } catch (e) {
        console.log(`Property ${property.id}: JSON parse error - ${e.message}, raw data: ${property.images}`);
        // Try to fix common JSON issues
        try {
          let fixedJson = property.images.replace(/'/g, '"'); // Replace single quotes
          images = JSON.parse(fixedJson);
        } catch (e2) {
          console.log(`Property ${property.id}: Could not fix JSON, skipping`);
          continue;
        }
      }
      
      if (!Array.isArray(images) || images.length === 0) {
        continue;
      }
      
      // Check which images actually exist
      const validImages = [];
      const missingImages = [];
      
      for (const imagePath of images) {
        if (!imagePath) continue;
        
        const filename = path.basename(imagePath);
        const fileExists = existingFiles.includes(filename);
        
        if (fileExists) {
          // Ensure consistent path format
          const normalizedPath = `/uploads/properties/${filename}`;
          validImages.push(normalizedPath);
        } else {
          missingImages.push(imagePath);
        }
      }
      
      // If we have missing images, update the property
      if (missingImages.length > 0) {
        console.log(`Property ${property.id} "${property.title}": ${missingImages.length} missing images, ${validImages.length} valid images`);
        
        missingImages.forEach(missing => {
          console.log(`  Missing: ${missing}`);
        });
        
        // Update property with only valid images
        const updateQuery = 'UPDATE properties SET images = $1 WHERE id = $2';
        await pool.query(updateQuery, [JSON.stringify(validImages), property.id]);
        cleanedCount++;
      }
    }
    
    console.log(`Cleanup complete. Updated ${cleanedCount} properties.`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await pool.end();
  }
}

cleanupMissingImages();