// This script updates the existing property with actual images from the directory
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

async function updatePropertyImages() {
  // Create database connection using the DATABASE_URL environment variable
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Connecting to database...');
    
    // Get current directory path in ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Read the property images directory to get actual image files
    const propertiesDir = path.join(__dirname, 'public', 'uploads', 'properties');
    const files = fs.readdirSync(propertiesDir);
    
    // Filter for image files only
    const imageFiles = files.filter(file => 
      file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.gif')
    );
    
    console.log(`Found ${imageFiles.length} image files in the directory`);
    
    // Create image paths for database
    const imagePaths = imageFiles.map(file => `/uploads/properties/${file}`);
    
    // If no images found, exit
    if (imagePaths.length === 0) {
      console.log('No image files found in the properties directory');
      return;
    }
    
    // Update the property with ID 1 (or whatever ID your property has)
    const propertyId = 1;
    
    // Convert array to PostgreSQL JSON array format
    const imagesJsonArray = JSON.stringify(imagePaths);
    
    // Update the property in the database
    const updateQuery = `
      UPDATE properties 
      SET images = $1::jsonb 
      WHERE id = $2
      RETURNING id, title, images
    `;
    
    const result = await pool.query(updateQuery, [imagesJsonArray, propertyId]);
    
    if (result.rows.length > 0) {
      console.log('Successfully updated property with actual images:');
      console.log(result.rows[0]);
    } else {
      console.log(`No property found with ID ${propertyId}`);
    }
  } catch (error) {
    console.error('Error updating property images:', error);
  } finally {
    // Close the connection
    await pool.end();
  }
}

// Run the function
updatePropertyImages();