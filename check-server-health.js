
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);

// Import pool from the TypeScript file using dynamic import
let pool;
try {
  const dbModule = await import('./server/db.ts');
  pool = dbModule.pool;
} catch (error) {
  console.error('Failed to import database pool:', error);
  process.exit(1);
}

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
      console.log(`✅ Uploads directory accessible, permissions: ${stats.mode.toString(8)}`);
    } else {
      console.log('⚠️ Uploads directory does not exist');
    }
    
    console.log('\n🎉 Health check completed successfully!');
    
    if (serverRunning) {
      console.log('✅ Server is running and healthy');
      process.exit(0);
    } else {
      console.log('❌ Server is not running');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  }
}

checkServerHealth();
