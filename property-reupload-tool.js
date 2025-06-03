
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function propertyReuploadTool() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔄 Property Re-upload Tool Starting...');
    
    // First, let's see what we have
    const propertiesResult = await pool.query(`
      SELECT id, title, description, price, location, property_type, 
             bedrooms, bathrooms, area, images, created_at 
      FROM properties 
      ORDER BY id
    `);
    
    console.log(`\n📊 Found ${propertiesResult.rows.length} properties in database:`);
    
    propertiesResult.rows.forEach((property, index) => {
      const imageCount = property.images ? property.images.length : 0;
      console.log(`${index + 1}. ID: ${property.id} | ${property.title} | ${imageCount} images`);
    });
    
    // Check available images in both directories
    const publicImagesDir = './public/uploads/properties';
    const attachedAssetsDir = './attached_assets';
    
    let publicImages = [];
    let attachedImages = [];
    
    if (fs.existsSync(publicImagesDir)) {
      publicImages = fs.readdirSync(publicImagesDir).filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );
    }
    
    if (fs.existsSync(attachedAssetsDir)) {
      attachedImages = fs.readdirSync(attachedAssetsDir).filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );
    }
    
    console.log(`\n📸 Available Images:`);
    console.log(`- Public uploads: ${publicImages.length} images`);
    console.log(`- Attached assets: ${attachedImages.length} images`);
    
    // Copy all attached assets to public uploads
    console.log('\n📋 Copying attached assets to public uploads...');
    let copiedCount = 0;
    
    for (const imageFile of attachedImages) {
      const sourcePath = path.join(attachedAssetsDir, imageFile);
      const destPath = path.join(publicImagesDir, imageFile);
      
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(sourcePath, destPath);
        copiedCount++;
        console.log(`✅ Copied: ${imageFile}`);
      } else {
        console.log(`⏭️  Exists: ${imageFile}`);
      }
    }
    
    console.log(`\n✅ Copied ${copiedCount} new images to public uploads`);
    
    // Show options for re-upload
    console.log('\n🛠️  Re-upload Options:');
    console.log('1. Clear all property images and start fresh');
    console.log('2. Reset specific property images');
    console.log('3. Auto-assign available images to properties');
    console.log('4. Export property data for manual re-upload');
    
    // Option 1: Clear all images
    console.log('\n🧹 To clear all property images, run:');
    console.log('node property-reupload-tool.js clear-all');
    
    // Option 4: Export for manual re-upload
    const exportData = {
      properties: propertiesResult.rows.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        location: p.location,
        property_type: p.property_type,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        area: p.area,
        current_images: p.images || [],
        created_at: p.created_at
      })),
      available_images: [...publicImages, ...attachedImages].filter((v, i, a) => a.indexOf(v) === i)
    };
    
    fs.writeFileSync('property-export.json', JSON.stringify(exportData, null, 2));
    console.log('\n📁 Property data exported to property-export.json');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

// Handle command line arguments
const command = process.argv[2];

if (command === 'clear-all') {
  clearAllPropertyImages();
} else if (command === 'auto-assign') {
  autoAssignImages();
} else {
  propertyReuploadTool();
}

async function clearAllPropertyImages() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    console.log('🧹 Clearing all property images...');
    
    const result = await pool.query(`
      UPDATE properties 
      SET images = '[]'::jsonb 
      WHERE images IS NOT NULL
      RETURNING id, title
    `);
    
    console.log(`✅ Cleared images from ${result.rows.length} properties`);
    result.rows.forEach(p => console.log(`- ${p.id}: ${p.title}`));
    
  } catch (error) {
    console.error('❌ Error clearing images:', error);
  } finally {
    await pool.end();
  }
}

async function autoAssignImages() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    console.log('🤖 Auto-assigning images to properties...');
    
    // Get all available images
    const publicImagesDir = './public/uploads/properties';
    const availableImages = fs.readdirSync(publicImagesDir)
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => `/uploads/properties/${file}`);
    
    // Get properties without images
    const propertiesResult = await pool.query(`
      SELECT id, title 
      FROM properties 
      WHERE images IS NULL OR jsonb_array_length(images) = 0
      ORDER BY id
    `);
    
    console.log(`Found ${propertiesResult.rows.length} properties without images`);
    console.log(`Available images: ${availableImages.length}`);
    
    // Assign 3-5 random images to each property
    for (const property of propertiesResult.rows) {
      const imageCount = Math.min(Math.floor(Math.random() * 3) + 3, availableImages.length);
      const shuffled = [...availableImages].sort(() => 0.5 - Math.random());
      const assignedImages = shuffled.slice(0, imageCount);
      
      await pool.query(`
        UPDATE properties 
        SET images = $1::jsonb 
        WHERE id = $2
      `, [JSON.stringify(assignedImages), property.id]);
      
      console.log(`✅ Assigned ${imageCount} images to: ${property.title}`);
    }
    
  } catch (error) {
    console.error('❌ Error auto-assigning images:', error);
  } finally {
    await pool.end();
  }
}
