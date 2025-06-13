
export class HealthMonitor {
  private static instance: HealthMonitor;
  private healthStatus = {
    server: 'running',
    database: 'connected',
    memory: 0,
    uptime: 0,
    lastCheck: new Date()
  };

  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  startMonitoring(): void {
    // Simple health status update
    this.updateHealthStatus();
    
    // Check health every 60 seconds (reduced frequency)
    setInterval(() => {
      this.updateHealthStatus();
    }, 60000);
  }

  private async updateHealthStatus(): Promise<void> {
    try {
      let dbStatus = 'connected';
      try {
        // Try to import and test database connection
        const { pool } = await import('./db');
        await pool.query('SELECT 1');
      } catch (dbError) {
        console.error('Database health check failed:', dbError);
        dbStatus = 'disconnected';
      }

      this.healthStatus = {
        server: 'running',
        database: dbStatus,
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        uptime: Math.round(process.uptime()),
        lastCheck: new Date()
      };
    } catch (error) {
      console.error('Health monitor error:', error);
    }
  }

  getHealthStatus() {
    return this.healthStatus;
  }

  isHealthy(): boolean {
    return this.healthStatus.server === 'running' && 
           this.healthStatus.memory < 800; // Less than 800MB
  }
}
