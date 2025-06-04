
const { pool } = require('./server/db.ts');

async function checkHealth() {
  console.log('🔍 Checking server health...');
  
  try {
    // Check database connection
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW() as current_time, COUNT(*) as property_count FROM properties');
    console.log('✅ Database connected:', result.rows[0]);
  } catch (dbError) {
    console.error('❌ Database error:', dbError.message);
  }
  
  try {
    // Check if server is responding
    const response = await fetch('http://localhost:5000/health');
    console.log('✅ Server health status:', response.status);
    const data = await response.json();
    console.log('Server response:', data);
  } catch (serverError) {
    console.error('❌ Server not responding:', serverError.message);
  }
  
  process.exit(0);
}

checkHealth();
