
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkServerHealth() {
  console.log('🏥 Server Health Check Starting...');
  
  try {
    // Check database connectivity
    console.log('📊 Checking database connection...');
    const dbResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected successfully:', dbResult.rows[0].current_time);
    
    // Check session table
    const sessionCheck = await pool.query('SELECT COUNT(*) as session_count FROM session');
    console.log(`✅ Session table accessible, ${sessionCheck.rows[0].session_count} active sessions`);
    
    // Check server port availability
    const net = require('net');
    const fs = require('fs');
    const port = 5000;
    
    const portCheck = new Promise((resolve, reject) => {
      const server = net.createServer();
      
      server.listen(port, '0.0.0.0', () => {
        server.close(() => {
          console.log(`❌ Port ${port} is available (server not running)`);
          resolve(false);
        });
      });
      
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`✅ Port ${port} is in use (server running)`);
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
    
    const serverRunning = await portCheck;
    
    // Check file system permissions
    const uploadsDir = './public/uploads';
    if (fs.existsSync(uploadsDir)) {
      const stats = fs.statSync(uploadsDir);
      console.log(`✅ Uploads directory accessible`);
    } else {
      console.log('❌ Uploads directory not found');
    }
    
    // Check logs directory
    const logsDir = './logs';
    if (fs.existsSync(logsDir)) {
      console.log('✅ Logs directory exists');
    } else {
      console.log('⚠️ Logs directory not found');
    }
    
    console.log('🎉 Health check completed successfully');
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run health check if script is executed directly
if (require.main === module) {
  checkServerHealth();
}

module.exports = { checkServerHealth };
