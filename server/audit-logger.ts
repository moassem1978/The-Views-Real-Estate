
export interface AuditEvent {
  timestamp: string;
  userId: number;
  username: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: number;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

class AuditLogger {
  private static logFile = 'logs/audit.log';

  static async log(event: AuditEvent) {
    const fs = await import('fs');
    const path = await import('path');
    
    // Ensure logs directory exists
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logEntry = JSON.stringify(event) + '\n';
    
    try {
      fs.appendFileSync(this.logFile, logEntry);
      
      // Also log critical actions to console
      if (this.isCriticalAction(event.action)) {
        console.log(`🚨 AUDIT LOG: ${event.action} by ${event.username} (${event.userRole}) on ${event.resource} at ${event.timestamp}`);
      }
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  private static isCriticalAction(action: string): boolean {
    const criticalActions = [
      'PROPERTY_DELETE',
      'PROPERTY_UPDATE',
      'IMAGE_DELETE', 
      'BULK_IMAGE_DELETE',
      'USER_ROLE_CHANGE',
      'SYSTEM_SETTINGS_CHANGE'
    ];
    return criticalActions.includes(action);
  }

  static async getAuditTrail(filters?: {
    userId?: number;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditEvent[]> {
    const fs = await import('fs');
    
    if (!fs.existsSync(this.logFile)) {
      return [];
    }

    const content = fs.readFileSync(this.logFile, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    let events: AuditEvent[] = [];
    
    for (const line of lines) {
      try {
        const event = JSON.parse(line);
        events.push(event);
      } catch (error) {
        console.error('Failed to parse audit log line:', line);
      }
    }

    // Apply filters
    if (filters) {
      events = events.filter(event => {
        if (filters.userId && event.userId !== filters.userId) return false;
        if (filters.action && event.action !== filters.action) return false;
        if (filters.resource && event.resource !== filters.resource) return false;
        if (filters.startDate && new Date(event.timestamp) < filters.startDate) return false;
        if (filters.endDate && new Date(event.timestamp) > filters.endDate) return false;
        return true;
      });
    }

    return events.reverse(); // Most recent first
  }
}

export default AuditLogger;
