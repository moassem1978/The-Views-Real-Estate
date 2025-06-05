import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function killAllProcesses() {
  try {
    // Kill all node/tsx processes
    await execAsync('pkill -f "tsx|node" || true');
    
    // Wait for processes to fully terminate
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if any processes are still running on port 5000
    try {
      const result = await execAsync('ss -tulpn | grep :5000');
      if (result.stdout) {
        console.log('Found processes on port 5000, killing...');
        const lines = result.stdout.split('\n');
        for (const line of lines) {
          const match = line.match(/pid=(\d+)/);
          if (match) {
            await execAsync(`kill -9 ${match[1]} || true`);
          }
        }
      }
    } catch (e) {
      // Port 5000 is free, which is what we want
    }
    
    console.log('All processes killed successfully');
  } catch (error) {
    console.log('Process cleanup completed');
  }
}

async function startServer() {
  console.log('Starting fresh server instance...');
  
  const child = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    cwd: process.cwd(),
    detached: false
  });
  
  let serverStarted = false;
  
  child.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output);
    
    if (output.includes('Server running on port') && !serverStarted) {
      serverStarted = true;
      console.log('\n✅ Server started successfully');
      console.log('Authentication credentials:');
      console.log('Username: owner');
      console.log('Password: Views#14ever');
    }
  });
  
  child.stderr.on('data', (data) => {
    const output = data.toString();
    process.stderr.write(output);
  });
  
  child.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
  
  // Keep the process running
  process.on('SIGINT', () => {
    child.kill();
    process.exit();
  });
}

async function robustServerFix() {
  await killAllProcesses();
  await startServer();
}

robustServerFix();