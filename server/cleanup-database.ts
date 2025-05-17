
import { db } from './db';
import { properties, announcements } from '@shared/schema';
import { sql } from 'drizzle-orm';

async function cleanupDatabase() {
  try {
    // Delete all properties
    await db.delete(properties);
    
    // Delete all announcements 
    await db.delete(announcements);
    
    // Reset auto-increment sequences - use separate parameterized statements
    await db.execute(sql`ALTER SEQUENCE properties_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE announcements_id_seq RESTART WITH 1`);
    
    console.log('Database cleaned and reset successfully');
    
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

cleanupDatabase();
