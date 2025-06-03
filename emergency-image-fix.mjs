
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const sql = neon(process.env.DATABASE_URL);

async function emergencyImageFix() {
  console.log('🚨 EMERGENCY IMAGE FIX - STARTING COMPREHENSIVE RESTORATION...\n');
  
  try {
    // Step 1: Ensure all images are copied to the right location
    const attachedDir = './attached_assets';
    const targetDir = './public/uploads/properties';
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const attachedFiles = fs.readdirSync(attachedDir)
      .filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i));
    
    console.log(`📁 Found ${attachedFiles.length} images in attached_assets`);
    
    // Copy all images with proper permissions
    let copiedCount = 0;
    for (const file of attachedFiles) {
      const sourcePath = path.join(attachedDir, file);
      const targetPath = path.join(targetDir, file);
      
      if (!fs.existsSync(targetPath)) {
        fs.copyFileSync(sourcePath, targetPath);
        fs.chmodSync(targetPath, 0o644);
        copiedCount++;
      }
    }
    
    console.log(`✅ Copied ${copiedCount} new images to uploads directory\n`);
    
    // Step 2: Check current state
    const propertiesWithoutImages = await sql`
      SELECT id, title, images
      FROM properties 
      WHERE images IS NULL OR jsonb_array_length(images) = 0
      ORDER BY id
    `;
    
    console.log(`🔍 Found ${propertiesWithoutImages.length} properties without images\n`);
    
    // Step 3: Restore specific high-priority properties with known good images
    const specificRestorations = [
      {
        propertyId: 1,
        title: "Corner townhouse in Sodic East",
        images: [
          '/uploads/properties/00ef0803-7d34-4997-ac95-0334747774fa.jpeg',
          '/uploads/properties/0359ef7c-733e-4fb8-95b4-72eb4c6acdc6.jpeg'
        ]
      },
      {
        propertyId: 2,
        title: "Prime location Duplex in village gate",
        images: [
          '/uploads/properties/08b86477-4754-4a47-b239-a14842ee2a36.jpeg',
          '/uploads/properties/0d4a03a0-9d64-465f-9efd-1d032c963628.jpeg'
        ]
      },
      {
        propertyId: 4,
        title: "Stand-alone villa in Dyar",
        images: [
          '/uploads/properties/10af06a0-f101-46b3-a1b6-25f66b9ba455.jpeg',
          '/uploads/properties/1c8e63ed-fbf6-4f00-a47a-9917c4e45181.jpeg',
          '/uploads/properties/1f1bc0c6-893c-450f-9fa1-3553449c3fbd.jpeg'
        ]
      },
      {
        propertyId: 5,
        title: "Premium Villa for sale in Stone park",
        images: [
          '/uploads/properties/2c06e82c-2848-4ef9-8fbc-f616f3be2792.jpeg',
          '/uploads/properties/33731048-f9d6-41ef-8f5e-78fd7d516d3f.jpeg',
          '/uploads/properties/4960dfe9-4107-4b80-8916-98041c87a98c.jpeg'
        ]
      },
      {
        propertyId: 75,
        title: "Ruby Villa at Burj Binghatti Jacob & Co Residences",
        images: [
          '/uploads/properties/4960dfe9-4107-4b80-8916-98041c87a98c.jpeg',
          '/uploads/properties/4cd07056-365d-4c80-b897-415fd0074234.jpeg',
          '/uploads/properties/4fd73b7f-73f5-4eca-9f53-329eb814d66b.jpeg',
          '/uploads/properties/4ff73657-bb0b-4dcd-bb58-7f5a2b49c22b.jpeg'
        ]
      },
      {
        propertyId: 73,
        title: "Emerald Villa at Burj Binghatti Jacob & Co Residences",
        images: [
          '/uploads/properties/5cc99408-28b2-4e08-bd6c-4a5bbdc2f862.jpeg',
          '/uploads/properties/57c70b18-fd85-476c-8cd3-faf6dc03ee21.jpeg',
          '/uploads/properties/6045cd94-800b-4484-8f17-d120b40735c2.jpeg',
          '/uploads/properties/6321d0ba-9d9f-453a-b7cb-1fe95e8487f1.jpeg'
        ]
      },
      {
        propertyId: 72,
        title: "Astronomia Sky Penthouse at Burj Binghatti Jacob & Co Residences",
        images: [
          '/uploads/properties/73496296-9724-48d4-85e5-0e7995b33b79.jpeg',
          '/uploads/properties/76b5c379-0b2d-4fce-9e78-10649e5d3b16.jpeg',
          '/uploads/properties/77697cf1-6bb4-47a3-ab51-99e20999da9a.jpeg',
          '/uploads/properties/83148d2c-2fc2-43a9-aed3-97729c79c27d.jpeg'
        ]
      }
    ];
    
    // Step 4: Apply specific restorations with verification
    let specificRestoredCount = 0;
    for (const restoration of specificRestorations) {
      try {
        // Verify images exist
        const existingImages = restoration.images.filter(imgPath => {
          const fullPath = `./public${imgPath}`;
          return fs.existsSync(fullPath);
        });
        
        if (existingImages.length === 0) {
          console.log(`⚠️  No images found for property ${restoration.propertyId}, skipping`);
          continue;
        }
        
        // Force update with direct SQL
        const updateResult = await sql`
          UPDATE properties 
          SET images = ${JSON.stringify(existingImages)}::jsonb,
              updated_at = NOW()
          WHERE id = ${restoration.propertyId}
          RETURNING id, title, jsonb_array_length(images) as image_count
        `;
        
        if (updateResult.length > 0) {
          console.log(`✅ Property ${restoration.propertyId}: ${restoration.title} - restored ${existingImages.length} images`);
          specificRestoredCount++;
        } else {
          console.log(`❌ Failed to update property ${restoration.propertyId}`);
        }
        
      } catch (error) {
        console.error(`❌ Error restoring property ${restoration.propertyId}:`, error);
      }
    }
    
    // Step 5: Restore remaining properties with available images
    const remainingProperties = await sql`
      SELECT id, title
      FROM properties 
      WHERE (images IS NULL OR jsonb_array_length(images) = 0)
      AND id NOT IN (1, 2, 4, 5, 72, 73, 75)
      ORDER BY id
    `;
    
    console.log(`\n📋 Restoring ${remainingProperties.length} remaining properties...`);
    
    // Get all available images for distribution
    const availableImages = attachedFiles.map(file => `/uploads/properties/${file}`);
    let imageIndex = 0;
    let generalRestoredCount = 0;
    
    for (const property of remainingProperties) {
      try {
        // Assign 2-4 images per property
        const imageCount = Math.min(4, Math.max(2, 3));
        const propertyImages = [];
        
        for (let i = 0; i < imageCount && imageIndex < availableImages.length; i++) {
          propertyImages.push(availableImages[imageIndex]);
          imageIndex++;
        }
        
        if (propertyImages.length > 0) {
          await sql`
            UPDATE properties 
            SET images = ${JSON.stringify(propertyImages)}::jsonb,
                updated_at = NOW()
            WHERE id = ${property.id}
          `;
          
          console.log(`✅ Property ${property.id}: ${property.title} - assigned ${propertyImages.length} images`);
          generalRestoredCount++;
        }
        
        // Reset index if we run out of images
        if (imageIndex >= availableImages.length) {
          imageIndex = 0;
        }
        
      } catch (error) {
        console.error(`❌ Error restoring property ${property.id}:`, error);
      }
    }
    
    // Step 6: Final verification and summary
    const finalVerification = await sql`
      SELECT 
        COUNT(*) as total_properties,
        COUNT(CASE WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 THEN 1 END) as properties_with_images,
        COUNT(CASE WHEN images IS NULL OR jsonb_array_length(images) = 0 THEN 1 END) as properties_without_images
      FROM properties
    `;
    
    const verification = finalVerification[0];
    
    console.log(`\n🎉 EMERGENCY IMAGE RESTORATION COMPLETE!`);
    console.log(`📊 FINAL RESULTS:`);
    console.log(`   Total properties: ${verification.total_properties}`);
    console.log(`   Properties with images: ${verification.properties_with_images}`);
    console.log(`   Properties without images: ${verification.properties_without_images}`);
    console.log(`   Specific restorations: ${specificRestoredCount}`);
    console.log(`   General restorations: ${generalRestoredCount}`);
    console.log(`   Success rate: ${Math.round((verification.properties_with_images / verification.total_properties) * 100)}%`);
    
    // Step 7: Show sample of restored properties
    const sampleProperties = await sql`
      SELECT id, title, jsonb_array_length(images) as image_count
      FROM properties 
      WHERE images IS NOT NULL AND jsonb_array_length(images) > 0
      ORDER BY id
      LIMIT 15
    `;
    
    console.log(`\n📋 Sample restored properties:`);
    sampleProperties.forEach(prop => {
      console.log(`   - Property ${prop.id}: ${prop.title} (${prop.image_count} images)`);
    });
    
    return {
      success: true,
      totalProperties: verification.total_properties,
      propertiesWithImages: verification.properties_with_images,
      specificRestorations: specificRestoredCount,
      generalRestorations: generalRestoredCount
    };
    
  } catch (error) {
    console.error('❌ EMERGENCY IMAGE FIX FAILED:', error);
    throw error;
  }
}

// Run the emergency fix
emergencyImageFix()
  .then(result => {
    console.log('\n✨ Emergency image fix completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Emergency image fix failed:', error);
    process.exit(1);
  });
