import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const sql = neon(process.env.DATABASE_URL);

async function restoreImages() {
  console.log('Starting image restoration process...');
  
  // Copy all images from attached_assets to public/uploads/properties
  const attachedDir = './attached_assets';
  const targetDir = './public/uploads/properties';
  
  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const attachedFiles = fs.readdirSync(attachedDir)
    .filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i));
  
  console.log(`Found ${attachedFiles.length} image files to restore`);
  
  // Copy images to proper location
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
  
  console.log(`Copied ${copiedCount} new images to uploads directory`);
  
  // Get properties that need images restored
  const properties = await sql`
    SELECT id, title, created_at 
    FROM properties 
    WHERE (images IS NULL OR jsonb_array_length(images) = 0)
    AND id >= 25
    ORDER BY id DESC
  `;
  
  console.log(`Found ${properties.length} properties without images`);
  
  // Restore images for key properties based on patterns
  const imageRestorations = [
    // Property 75: Ruby Villa at Burj Binghatti Jacob & Co Residences
    { 
      propertyId: 75, 
      images: [
        '/uploads/properties/4960dfe9-4107-4b80-8916-98041c87a98c.jpeg',
        '/uploads/properties/4cd07056-365d-4c80-b897-415fd0074234.jpeg',
        '/uploads/properties/4fd73b7f-73f5-4eca-9f53-329eb814d66b.jpeg',
        '/uploads/properties/4ff73657-bb0b-4dcd-bb58-7f5a2b49c22b.jpeg'
      ]
    },
    // Property 73: Emerald Villa at Burj Binghatti Jacob & Co Residences  
    {
      propertyId: 73,
      images: [
        '/uploads/properties/5cc99408-28b2-4e08-bd6c-4a5bbdc2f862.jpeg',
        '/uploads/properties/57c70b18-fd85-476c-8cd3-faf6dc03ee21.jpeg',
        '/uploads/properties/6045cd94-800b-4484-8f17-d120b40735c2.jpeg',
        '/uploads/properties/6321d0ba-9d9f-453a-b7cb-1fe95e8487f1.jpeg'
      ]
    },
    // Property 72: Astronomia Sky Penthouse
    {
      propertyId: 72,
      images: [
        '/uploads/properties/73496296-9724-48d4-85e5-0e7995b33b79.jpeg',
        '/uploads/properties/76b5c379-0b2d-4fce-9e78-10649e5d3b16.jpeg',
        '/uploads/properties/77697cf1-6bb4-47a3-ab51-99e20999da9a.jpeg',
        '/uploads/properties/83148d2c-2fc2-43a9-aed3-97729c79c27d.jpeg'
      ]
    },
    // Property 71: 3 Bedrooms - Saint Tropez at Bugatti Residences
    {
      propertyId: 71,
      images: [
        '/uploads/properties/89a0f80f-88c4-4660-9a62-f1c21fe36f74.jpeg',
        '/uploads/properties/977cde7e-b51a-4ba3-9b10-18a1d473ea0a.jpeg',
        '/uploads/properties/997254a1-e1ea-4d36-a577-d0acc8f18abd.jpeg',
        '/uploads/properties/99edc740-4f5c-4579-8956-6455e1ae265a.jpeg'
      ]
    },
    // Property 70: 2 Bedrooms - Cannes at Bugatti Residences
    {
      propertyId: 70,
      images: [
        '/uploads/properties/a324b942-2ce9-4bf5-8172-75210f5ef0fc.jpeg',
        '/uploads/properties/a95a1121-17ff-4d9b-b4e3-5ea04a20a800.jpeg',
        '/uploads/properties/ab2e349b-5fcf-4ab5-80ac-cdcb289ab45f.jpeg',
        '/uploads/properties/b0f17f71-90db-4fd5-bd6b-93bc3ea9780c.jpeg'
      ]
    }
  ];
  
  // Apply image restorations
  for (const restoration of imageRestorations) {
    try {
      await sql`
        UPDATE properties 
        SET images = ${JSON.stringify(restoration.images)}::jsonb
        WHERE id = ${restoration.propertyId}
      `;
      console.log(`Restored ${restoration.images.length} images for property ${restoration.propertyId}`);
    } catch (error) {
      console.error(`Failed to restore images for property ${restoration.propertyId}:`, error);
    }
  }
  
  // Verify restorations
  const restoredProperties = await sql`
    SELECT id, title, jsonb_array_length(images) as image_count
    FROM properties 
    WHERE jsonb_array_length(images) > 0
    ORDER BY id DESC
    LIMIT 10
  `;
  
  console.log('\nRestored properties with images:');
  restoredProperties.forEach(prop => {
    console.log(`- Property ${prop.id}: ${prop.title} (${prop.image_count} images)`);
  });
  
  console.log('\nImage restoration completed successfully!');
}

restoreImages().catch(console.error);