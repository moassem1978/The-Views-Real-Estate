
export class HealthMonitor {
  private static instance: HealthMonitor;
  private healthStatus = {
    server: 'running',
    database: 'connected',
    memory: 0,
    uptime: 0,
    lastCheck: new Date(),
    dbErrors: 0,
    lastDbError: null as Date | null
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

  private updateHealthStatus(): void {
    try {
      this.healthStatus = {
        server: 'running',
        database: 'connected',
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
           this.healthStatus.memory < 800 && // Less than 800MB
           this.healthStatus.dbErrors < 5; // Less than 5 recent DB errors
  }

  recordDatabaseError(): void {
    this.healthStatus.dbErrors++;
    this.healthStatus.lastDbError = new Date();
    this.healthStatus.database = 'error';
  }

  resetDatabaseStatus(): void {
    this.healthStatus.dbErrors = 0;
    this.healthStatus.lastDbError = null;
    this.healthStatus.database = 'connected';
  }
}
