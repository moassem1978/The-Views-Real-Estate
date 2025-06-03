
const { pool } = require('./server/db.ts');

async function checkDatabaseHealth() {
  try {
    console.log('🔍 Checking database health...');
    
    // Test connection
    const timeResult = await pool.query('SELECT NOW()');
    console.log('✅ Database connection: OK');
    console.log('Current time:', timeResult.rows[0].now);
    
    // Check properties table
    const propertiesResult = await pool.query('SELECT COUNT(*) as count FROM properties');
    console.log(`📊 Properties count: ${propertiesResult.rows[0].count}`);
    
    // Check for properties with images
    const withImagesResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM properties 
      WHERE images IS NOT NULL 
      AND images != '[]' 
      AND images != ''
    `);
    console.log(`🖼️ Properties with images: ${withImagesResult.rows[0].count}`);
    
    // Check users table
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Users count: ${usersResult.rows[0].count}`);
    
    console.log('✅ Database health check completed');
    
  } catch (error) {
    console.error('❌ Database health check failed:', error);
  } finally {
    await pool.end();
  }
}

checkDatabaseHealth();
