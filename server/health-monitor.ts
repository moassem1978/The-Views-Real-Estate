
export class HealthMonitor {
  private static instance: HealthMonitor;
  private healthStatus = {
    server: 'starting',
    database: 'unknown',
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
    // Check health every 30 seconds
    setInterval(() => {
      this.updateHealthStatus();
    }, 30000);

    // Initial check
    this.updateHealthStatus();
  }

  private updateHealthStatus(): void {
    this.healthStatus = {
      server: 'running',
      database: 'connected', // Would check actual DB connection
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      uptime: Math.round(process.uptime()),
      lastCheck: new Date()
    };
  }

  getHealthStatus() {
    return this.healthStatus;
  }

  isHealthy(): boolean {
    return this.healthStatus.server === 'running' && 
           this.healthStatus.memory < 500; // Less than 500MB
  }
}
