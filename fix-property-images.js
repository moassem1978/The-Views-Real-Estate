
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixPropertyImages() {
  try {
    console.log('Starting image restoration for properties 47 & 48...');

    // First, let's see what images are currently assigned to these properties
    const currentQuery = `
      SELECT id, title, images 
      FROM properties 
      WHERE id IN (47, 48)
      ORDER BY id
    `;
    
    const currentResult = await pool.query(currentQuery);
    
    console.log('\nCurrent state:');
    currentResult.rows.forEach(property => {
      console.log(`Property ${property.id}: ${property.title}`);
      console.log(`Current images: ${JSON.stringify(property.images)}`);
    });

    // Get list of available images in attached_assets
    const attachedAssetsDir = './attached_assets';
    const availableImages = fs.readdirSync(attachedAssetsDir)
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .sort();

    console.log(`\nFound ${availableImages.length} images in attached_assets`);
    
    // Show recent images that might belong to these properties
    console.log('\nRecent images that might be for properties 47 & 48:');
    const recentImages = availableImages.slice(-20); // Show last 20 images
    recentImages.forEach((img, index) => {
      console.log(`${index + 1}. ${img}`);
    });

    // Interactive restoration - you can modify these arrays with the correct images
    const property47Images = [
      // Add the correct image filenames here from attached_assets
      // Example: 'IMG_6955.png', 'IMG_6964.png'
    ];

    const property48Images = [
      // Add the correct image filenames here from attached_assets  
      // Example: 'IMG_6965.png', 'image_1748369721196.png'
    ];

    // If you know the correct images, uncomment and modify the arrays above
    // Then uncomment the update sections below:

    /*
    // Update property 47
    if (property47Images.length > 0) {
      const property47ImagePaths = property47Images.map(img => `/attached_assets/${img}`);
      const updateQuery47 = `
        UPDATE properties 
        SET images = $1 
        WHERE id = 47
        RETURNING id, title, images
      `;
      
      const result47 = await pool.query(updateQuery47, [JSON.stringify(property47ImagePaths)]);
      console.log(`\nUpdated property 47 with ${property47Images.length} images:`);
      console.log(result47.rows[0]);
    }

    // Update property 48
    if (property48Images.length > 0) {
      const property48ImagePaths = property48Images.map(img => `/attached_assets/${img}`);
      const updateQuery48 = `
        UPDATE properties 
        SET images = $1 
        WHERE id = 48
        RETURNING id, title, images
      `;
      
      const result48 = await pool.query(updateQuery48, [JSON.stringify(property48ImagePaths)]);
      console.log(`\nUpdated property 48 with ${property48Images.length} images:`);
      console.log(result48.rows[0]);
    }
    */

    console.log('\nTo restore the images:');
    console.log('1. Identify the correct images from the list above');
    console.log('2. Edit this script and add the image filenames to property47Images and property48Images arrays');
    console.log('3. Uncomment the update sections');
    console.log('4. Run the script again');

  } catch (error) {
    console.error('Error fixing property images:', error);
  } finally {
    await pool.end();
  }
}

// Helper function to copy images from attached_assets to public/uploads
async function copyImagesToPublic(images, propertyId) {
  const targetDir = './public/uploads/properties';
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const copiedImages = [];
  
  for (const img of images) {
    const sourcePath = path.join('./attached_assets', img);
    const targetPath = path.join(targetDir, img);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      copiedImages.push(`/uploads/properties/${img}`);
      console.log(`Copied ${img} to public uploads`);
    } else {
      console.log(`Warning: ${img} not found in attached_assets`);
    }
  }
  
  return copiedImages;
}

fixPropertyImages();
