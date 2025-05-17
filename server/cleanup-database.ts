
import { db } from './db';
import { properties, announcements } from '@shared/schema';

async function cleanupDatabase() {
  try {
    // Delete all properties
    await db.delete(properties);
    
    // Delete all announcements 
    await db.delete(announcements);
    
    // Reset auto-increment sequences
    await db.execute(
      `ALTER SEQUENCE properties_id_seq RESTART WITH 1;
       ALTER SEQUENCE announcements_id_seq RESTART WITH 1;`
    );
    
    console.log('Database cleaned and reset successfully');
    
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

cleanupDatabase();
