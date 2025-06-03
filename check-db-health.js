
import { pool } from './server/db.ts';

async function checkDatabaseHealth() {
  try {
    console.log('🔍 Checking database health...');
    
    // Check connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Available tables:', tablesResult.rows.map(r => r.table_name));
    
    // Check properties count
    const propertiesCount = await client.query('SELECT COUNT(*) FROM properties');
    console.log('🏠 Properties count:', propertiesCount.rows[0].count);
    
    // Check projects count
    const projectsCount = await client.query('SELECT COUNT(*) FROM projects');
    console.log('🏗️ Projects count:', projectsCount.rows[0].count);
    
    client.release();
    console.log('✅ Database health check completed');
    
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

checkDatabaseHealth();
