#!/usr/bin/env node
import { spawn, exec } from 'child_process';

function killProcessesOnPort(port) {
  return new Promise((resolve) => {
    exec(`ss -tulpn | grep :${port}`, (error, stdout) => {
      if (stdout) {
        const lines = stdout.split('\n');
        const pids = [];
        lines.forEach(line => {
          const match = line.match(/pid=(\d+)/);
          if (match) pids.push(match[1]);
        });
        
        if (pids.length > 0) {
          console.log(`Killing processes on port ${port}:`, pids);
          exec(`kill -9 ${pids.join(' ')}`, () => resolve());
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  });
}

async function forceRestart() {
  console.log('🔄 Force restarting server...');
  
  // Kill processes on common ports
  await killProcessesOnPort(5000);
  await killProcessesOnPort(3000);
  await killProcessesOnPort(8000);
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Start the server
  console.log('🚀 Starting server...');
  const child = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  child.on('error', (err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
}

forceRestart().catch(console.error);