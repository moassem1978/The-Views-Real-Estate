
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
           this.healthStatus.memory < 800; // Less than 800MB
  }
}
