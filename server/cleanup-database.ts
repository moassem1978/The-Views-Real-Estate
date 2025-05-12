
import { db } from './db';
import { properties } from '@shared/schema';

async function cleanupDatabase() {
  try {
    // Delete all properties
    await db.delete(properties);
    
    // Reset auto-increment sequence
    await db.execute(
      `ALTER SEQUENCE properties_id_seq RESTART WITH 1`
    );
    
    console.log('Database cleaned and reset successfully');
    
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

cleanupDatabase();
