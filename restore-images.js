
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function restoreImagesFromAssets() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    // Get all properties
    const propertiesResult = await pool.query('SELECT id, title, images, created_at FROM properties ORDER BY id');
    
    console.log(`Found ${propertiesResult.rows.length} properties`);
    
    // Check attached_assets directory
    const assetsDir = './attached_assets';
    const assetFiles = fs.readdirSync(assetsDir);
    
    console.log(`Found ${assetFiles.length} asset files`);
    
    // Copy assets to public/uploads/properties if they don't exist
    const uploadsDir = './public/uploads/properties';
    
    for (const assetFile of assetFiles) {
      const sourcePath = path.join(assetsDir, assetFile);
      const destPath = path.join(uploadsDir, assetFile);
      
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${assetFile} to uploads directory`);
      }
    }
    
    // List properties with missing images
    for (const property of propertiesResult.rows) {
      const images = property.images || [];
      let missingImages = 0;
      
      for (const imageUrl of images) {
        const filename = path.basename(imageUrl);
        const imagePath = path.join('./public', imageUrl);
        
        if (!fs.existsSync(imagePath)) {
          missingImages++;
        }
      }
      
      if (missingImages > 0) {
        console.log(`Property ${property.id} (${property.title}) has ${missingImages} missing images out of ${images.length}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

restoreImagesFromAssets();
