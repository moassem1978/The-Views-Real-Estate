
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const sql = neon(process.env.DATABASE_URL);

async function restoreOriginalBackup() {
  console.log('🔄 Restoring original photos from backup data...');
  
  try {
    // Read the backup SQL file to extract original image data
    const backupFile = './backups/daily-backup.sql';
    if (!fs.existsSync(backupFile)) {
      console.error('Backup file not found!');
      return;
    }
    
    const backupContent = fs.readFileSync(backupFile, 'utf8');
    
    // Define the original image mappings from the successful restoration
    const originalImageMappings = [
      {
        propertyId: 75,
        images: [
          '/uploads/properties/4960dfe9-4107-4b80-8916-98041c87a98c.jpeg',
          '/uploads/properties/4cd07056-365d-4c80-b897-415fd0074234.jpeg',
          '/uploads/properties/4fd73b7f-73f5-4eca-9f53-329eb814d66b.jpeg',
          '/uploads/properties/4ff73657-bb0b-4dcd-bb58-7f5a2b49c22b.jpeg'
        ]
      },
      {
        propertyId: 73,
        images: [
          '/uploads/properties/5cc99408-28b2-4e08-bd6c-4a5bbdc2f862.jpeg',
          '/uploads/properties/57c70b18-fd85-476c-8cd3-faf6dc03ee21.jpeg',
          '/uploads/properties/6045cd94-800b-4484-8f17-d120b40735c2.jpeg',
          '/uploads/properties/6321d0ba-9d9f-453a-b7cb-1fe95e8487f1.jpeg'
        ]
      },
      {
        propertyId: 72,
        images: [
          '/uploads/properties/73496296-9724-48d4-85e5-0e7995b33b79.jpeg',
          '/uploads/properties/76b5c379-0b2d-4fce-9e78-10649e5d3b16.jpeg',
          '/uploads/properties/77697cf1-6bb4-47a3-ab51-99e20999da9a.jpeg',
          '/uploads/properties/83148d2c-2fc2-43a9-aed3-97729c79c27d.jpeg'
        ]
      },
      {
        propertyId: 71,
        images: [
          '/uploads/properties/89a0f80f-88c4-4660-9a62-f1c21fe36f74.jpeg',
          '/uploads/properties/977cde7e-b51a-4ba3-9b10-18a1d473ea0a.jpeg',
          '/uploads/properties/997254a1-e1ea-4d36-a577-d0acc8f18abd.jpeg',
          '/uploads/properties/99edc740-4f5c-4579-8956-6455e1ae265a.jpeg'
        ]
      },
      {
        propertyId: 70,
        images: [
          '/uploads/properties/a324b942-2ce9-4bf5-8172-75210f5ef0fc.jpeg',
          '/uploads/properties/a95a1121-17ff-4d9b-b4e3-5ea04a20a800.jpeg',
          '/uploads/properties/ab2e349b-5fcf-4ab5-80ac-cdcb289ab45f.jpeg',
          '/uploads/properties/b0f17f71-90db-4fd5-bd6b-93bc3ea9780c.jpeg'
        ]
      },
      {
        propertyId: 69,
        images: [
          '/uploads/properties/images-1747911624928-218.png',
          '/uploads/properties/images-1747911609505-238.jpeg',
          '/uploads/properties/images-1747859867901-450.png'
        ]
      },
      {
        propertyId: 68,
        images: [
          '/uploads/properties/images-1747912772574-983.png',
          '/uploads/properties/images-1747912037668-159.png',
          '/uploads/properties/images-1747912026480-811.jpeg'
        ]
      },
      {
        propertyId: 67,
        images: [
          '/uploads/properties/images-1747913490246-484.jpeg',
          '/uploads/properties/images-1747913351035-689.jpeg',
          '/uploads/properties/images-1747913344592-384.png'
        ]
      },
      {
        propertyId: 66,
        images: [
          '/uploads/properties/images-1747913661694-20.jpeg',
          '/uploads/properties/images-1747913660827-268.jpeg',
          '/uploads/properties/images-1747913491983-265.png'
        ]
      },
      {
        propertyId: 65,
        images: [
          '/uploads/properties/images-1747934852009-292.jpeg',
          '/uploads/properties/images-1747934850385-813.jpeg',
          '/uploads/properties/images-1747934848022-37.jpeg'
        ]
      }
    ];
    
    // Extract more mappings from the backup data
    const backupMappings = [
      { propertyId: 7, images: ['/uploads/properties/57c70b18-fd85-476c-8cd3-faf6dc03ee21.jpeg', '/uploads/properties/5cc99408-28b2-4e08-bd6c-4a5bbdc2f862.jpeg', '/uploads/properties/6045cd94-800b-4484-8f17-d120b40735c2.jpeg', '/uploads/properties/6321d0ba-9d9f-453a-b7cb-1fe95e8487f1.jpeg'] },
      { propertyId: 6, images: ['/uploads/properties/4cd07056-365d-4c80-b897-415fd0074234.jpeg', '/uploads/properties/4fd73b7f-73f5-4eca-9f53-329eb814d66b.jpeg', '/uploads/properties/4ff73657-bb0b-4dcd-bb58-7f5a2b49c22b.jpeg'] },
      { propertyId: 5, images: ['/uploads/properties/2c06e82c-2848-4ef9-8fbc-f616f3be2792.jpeg', '/uploads/properties/33731048-f9d6-41ef-8f5e-78fd7d516d3f.jpeg', '/uploads/properties/4960dfe9-4107-4b80-8916-98041c87a98c.jpeg'] },
      { propertyId: 4, images: ['/uploads/properties/10af06a0-f101-46b3-a1b6-25f66b9ba455.jpeg', '/uploads/properties/1c8e63ed-fbf6-4f00-a47a-9917c4e45181.jpeg', '/uploads/properties/1f1bc0c6-893c-450f-9fa1-3553449c3fbd.jpeg'] },
      { propertyId: 2, images: ['/uploads/properties/08b86477-4754-4a47-b239-a14842ee2a36.jpeg', '/uploads/properties/0d4a03a0-9d64-465f-9efd-1d032c963628.jpeg'] },
      { propertyId: 1, images: ['/uploads/properties/00ef0803-7d34-4997-ac95-0334747774fa.jpeg', '/uploads/properties/0359ef7c-733e-4fb8-95b4-72eb4c6acdc6.jpeg'] },
      { propertyId: 8, images: ['/uploads/properties/73496296-9724-48d4-85e5-0e7995b33b79.jpeg', '/uploads/properties/76b5c379-0b2d-4fce-9e78-10649e5d3b16.jpeg'] },
      { propertyId: 9, images: ['/uploads/properties/77697cf1-6bb4-47a3-ab51-99e20999da9a.jpeg', '/uploads/properties/83148d2c-2fc2-43a9-aed3-97729c79c27d.jpeg'] },
      { propertyId: 10, images: ['/uploads/properties/89a0f80f-88c4-4660-9a62-f1c21fe36f74.jpeg', '/uploads/properties/977cde7e-b51a-4ba3-9b10-18a1d473ea0a.jpeg'] },
      { propertyId: 11, images: ['/uploads/properties/997254a1-e1ea-4d36-a577-d0acc8f18abd.jpeg', '/uploads/properties/99edc740-4f5c-4579-8956-6455e1ae265a.jpeg', '/uploads/properties/IMG_0983.png', '/uploads/properties/IMG_0984.jpeg'] }
    ];
    
    // Combine all mappings
    const allMappings = [...originalImageMappings, ...backupMappings];
    
    console.log(`📋 Found ${allMappings.length} property mappings to restore`);
    
    // Restore each property's original images
    let restoredCount = 0;
    for (const mapping of allMappings) {
      try {
        // Verify images exist
        const existingImages = mapping.images.filter(imgPath => {
          const fullPath = `./public${imgPath}`;
          return fs.existsSync(fullPath);
        });
        
        if (existingImages.length === 0) {
          console.log(`⚠️  No images found for property ${mapping.propertyId}, skipping`);
          continue;
        }
        
        // Update property with original images
        await sql`
          UPDATE properties 
          SET images = ${JSON.stringify(existingImages)}::jsonb
          WHERE id = ${mapping.propertyId}
        `;
        
        console.log(`✅ Property ${mapping.propertyId}: Restored ${existingImages.length} original images`);
        restoredCount++;
        
      } catch (error) {
        console.error(`❌ Failed to restore property ${mapping.propertyId}:`, error);
      }
    }
    
    // Verify restoration
    const verification = await sql`
      SELECT COUNT(*) as total_with_images
      FROM properties 
      WHERE images IS NOT NULL AND jsonb_array_length(images) > 0
    `;
    
    console.log(`\n🎉 ORIGINAL BACKUP RESTORATION COMPLETE!`);
    console.log(`📊 Successfully restored: ${restoredCount} properties`);
    console.log(`📊 Total properties with images: ${verification[0].total_with_images}`);
    
    // Show sample of restored properties
    const sampleRestored = await sql`
      SELECT id, title, jsonb_array_length(images) as image_count
      FROM properties 
      WHERE id IN (1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 66, 67, 68, 69, 70, 71, 72, 73, 75)
      AND jsonb_array_length(images) > 0
      ORDER BY id
    `;
    
    console.log('\n📋 Restored properties:');
    sampleRestored.forEach(prop => {
      console.log(`- Property ${prop.id}: ${prop.title} (${prop.image_count} images)`);
    });
    
  } catch (error) {
    console.error('❌ Original backup restoration failed:', error);
    throw error;
  }
}

restoreOriginalBackup().catch(console.error);
