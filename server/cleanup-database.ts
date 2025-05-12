
import { db } from './db';
import { properties } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function cleanupDatabase() {
  try {
    // Get all active properties
    const activeProps = await db.select().from(properties);
    console.log(`Found ${activeProps.length} active properties`);
    
    // Reset auto-increment to match actual count
    await db.execute(
      `ALTER SEQUENCE properties_id_seq RESTART WITH ${activeProps.length + 1}`
    );
    
    console.log('Reset auto-increment sequence');
    
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

cleanupDatabase();
