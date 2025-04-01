import { db } from './server/db';
import { announcements, properties } from './shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('Testing highlighted content in database...');
  
  // Check announcements schema
  console.log('\n--- Announcements Table Schema ---');
  const announcementsColumns = Object.keys(announcements);
  console.log('Columns:', announcementsColumns);
  
  // Check announcements data
  console.log('\n--- Announcements Data ---');
  const allAnnouncements = await db.select().from(announcements);
  console.log(`Total announcements: ${allAnnouncements.length}`);
  console.log('All announcements:', JSON.stringify(allAnnouncements, null, 2));
  
  // Query highlighted announcements
  console.log('\n--- Highlighted Announcements Query ---');
  const highlightedAnnouncements = await db
    .select()
    .from(announcements)
    .where(eq(announcements.isHighlighted, true));
  console.log(`Highlighted announcements: ${highlightedAnnouncements.length}`);
  console.log('Highlighted announcements data:', JSON.stringify(highlightedAnnouncements, null, 2));
  
  // Try with raw SQL to see if there's a difference
  console.log('\n--- Raw SQL Query ---');
  const { rows } = await db.execute(
    'SELECT * FROM announcements WHERE is_highlighted = true'
  );
  console.log(`Raw SQL result count: ${rows.length}`);
  console.log('Raw SQL results:', JSON.stringify(rows, null, 2));
  
  // Check if there are any announcements with highlighted flag
  console.log('\n--- Checking each announcement ---');
  allAnnouncements.forEach((ann, index) => {
    console.log(`Announcement ${index + 1} (ID: ${ann.id}):`, 
      `Title: ${ann.title},`,
      `isHighlighted property: ${ann.isHighlighted},`,
      `isHighlighted value: ${ann.isHighlighted === true ? 'true' : 'false'}`
    );
  });
  
  // Try adding a highlighted announcement
  console.log('\n--- Adding a test highlighted announcement ---');
  try {
    const [newAnnouncement] = await db
      .insert(announcements)
      .values({
        title: "Test Highlighted Announcement",
        content: "This is a test announcement that should be highlighted",
        isHighlighted: true,
        isActive: true,
        startDate: new Date(),
      })
      .returning();
    
    console.log('New announcement created:', newAnnouncement);
    
    // Check if it was added correctly
    const verifyAnnouncement = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, newAnnouncement.id));
    
    console.log('Verification query result:', verifyAnnouncement);
  } catch (error) {
    console.error('Error adding test announcement:', error);
  }
  
  // Also check properties
  console.log('\n--- Properties Highlighted Check ---');
  const highlightedProperties = await db
    .select()
    .from(properties)
    .where(eq(properties.isHighlighted, true));
  console.log(`Highlighted properties: ${highlightedProperties.length}`);
}

main()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err))
  .finally(() => process.exit());