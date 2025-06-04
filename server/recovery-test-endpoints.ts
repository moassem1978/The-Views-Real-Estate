
import { Router } from 'express';
import { monitoringService } from './monitoring';

const router = Router();

// Simulate server crashes and errors for testing
router.post('/api/test/simulate-crash', async (req, res) => {
  try {
    const { type } = req.body;
    
    switch (type) {
      case 'memory_leak':
        // Simulate memory leak
        const largeArray: any[] = [];
        for (let i = 0; i < 1000000; i++) {
          largeArray.push(new Array(1000).fill('memory'));
        }
        break;
        
      case 'database_timeout':
        // Simulate database timeout
        await new Promise(resolve => setTimeout(resolve, 30000));
        break;
        
      case 'unhandled_error':
        // Throw unhandled error
        throw new Error('Simulated unhandled error for testing');
        
      case 'process_exit':
        // Simulate process crash
        process.exit(1);
        break;
        
      default:
        return res.status(400).json({ error: 'Unknown crash type' });
    }
    
    res.json({ message: `Simulated ${type} crash` });
  } catch (error) {
    monitoringService.captureError(error instanceof Error ? error : new Error(String(error)), 'test_crash');
    res.status(500).json({ error: 'Crash simulation failed' });
  }
});

// Test database connectivity
router.get('/api/test/database', async (req, res) => {
  try {
    const { pool } = await import('./db');
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ 
      status: 'connected',
      timestamp: result.rows[0].current_time 
    });
  } catch (error) {
    monitoringService.captureError(error instanceof Error ? error : new Error(String(error)), 'db_test');
    res.status(500).json({ 
      status: 'disconnected',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Test image upload failure
router.post('/api/test/image-upload-failure', (req, res) => {
  monitoringService.captureMessage('Simulating image upload failure', 'warning', 'test_upload');
  res.status(503).json({ error: 'Image upload service temporarily unavailable' });
});

// Test backup system
router.post('/api/test/backup-failure', async (req, res) => {
  try {
    monitoringService.captureError('Simulated backup failure', 'backup_test');
    await monitoringService.sendBackupAlert('failure', 'Simulated backup failure for testing');
    res.json({ message: 'Backup failure simulation completed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to simulate backup failure' });
  }
});

// Health check endpoint for recovery testing
router.get('/api/test/health', async (req, res) => {
  try {
    const { pool } = await import('./db');
    
    // Check database
    const dbResult = await pool.query('SELECT 1');
    const dbHealthy = dbResult.rows.length > 0;
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    const memHealthy = memUsage.heapUsed < 500 * 1024 * 1024; // 500MB threshold
    
    // Check disk space (simplified)
    const diskHealthy = true; // Would implement actual disk check in production
    
    const overall = dbHealthy && memHealthy && diskHealthy;
    
    res.status(overall ? 200 : 503).json({
      status: overall ? 'healthy' : 'unhealthy',
      checks: {
        database: dbHealthy,
        memory: memHealthy,
        disk: diskHealthy
      },
      metrics: {
        memoryUsage: memUsage,
        uptime: process.uptime(),
        pid: process.pid
      }
    });
  } catch (error) {
    monitoringService.captureError(error instanceof Error ? error : new Error(String(error)), 'health_check');
    res.status(503).json({ 
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
