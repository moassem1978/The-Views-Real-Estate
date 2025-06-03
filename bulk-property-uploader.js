
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Simple bulk property uploader - just run this after clearing everything
async function bulkPropertyUploader() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🚀 Bulk Property Uploader Starting...');
    
    // Sample property templates - modify these as needed
    const propertyTemplates = [
      {
        title: "Luxury Villa in New Capital",
        description: "Stunning villa with modern amenities and beautiful garden views.",
        price: 15000000,
        location: "New Administrative Capital",
        property_type: "villa",
        bedrooms: 4,
        bathrooms: 3,
        area: 350
      },
      {
        title: "Modern Apartment in Maadi",
        description: "Contemporary apartment in prime location with city views.",
        price: 8000000,
        location: "Maadi",
        property_type: "apartment",
        bedrooms: 3,
        bathrooms: 2,
        area: 180
      },
      {
        title: "Penthouse in Zamalek",
        description: "Exclusive penthouse with panoramic Nile views.",
        price: 25000000,
        location: "Zamalek",
        property_type: "penthouse",
        bedrooms: 4,
        bathrooms: 3,
        area: 280
      }
    ];
    
    // Get all available images
    const publicImagesDir = './public/uploads/properties';
    const availableImages = fs.readdirSync(publicImagesDir)
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => `/uploads/properties/${file}`);
    
    console.log(`Found ${availableImages.length} available images`);
    
    // Clear existing properties (optional)
    console.log('Clearing existing properties...');
    await pool.query('DELETE FROM properties');
    
    // Create new properties with images
    for (let i = 0; i < propertyTemplates.length; i++) {
      const template = propertyTemplates[i];
      
      // Assign 4-6 random images to each property
      const imageCount = Math.min(Math.floor(Math.random() * 3) + 4, availableImages.length);
      const shuffled = [...availableImages].sort(() => 0.5 - Math.random());
      const propertyImages = shuffled.slice(0, imageCount);
      
      const result = await pool.query(`
        INSERT INTO properties (
          title, description, price, location, property_type,
          bedrooms, bathrooms, area, images, featured, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, title
      `, [
        template.title,
        template.description,
        template.price,
        template.location,
        template.property_type,
        template.bedrooms,
        template.bathrooms,
        template.area,
        JSON.stringify(propertyImages),
        i < 2, // First 2 properties are featured
        'available'
      ]);
      
      console.log(`✅ Created: ${result.rows[0].title} (ID: ${result.rows[0].id}) with ${imageCount} images`);
    }
    
    console.log('\n🎉 Bulk upload completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

bulkPropertyUploader();
