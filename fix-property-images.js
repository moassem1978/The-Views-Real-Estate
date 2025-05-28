import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

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

    // Based on your feedback, let's restore the correct images for properties 47 & 48
    const property47Images = [
      'IMG_6955.png',
      'IMG_6964.png'
    ];

    const property48Images = [
      'IMG_6965.png',
      'image_1748369721196.png'
    ];

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

    console.log('\nImage restoration completed successfully!');

  } catch (error) {
    console.error('Error fixing property images:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
fixPropertyImages();