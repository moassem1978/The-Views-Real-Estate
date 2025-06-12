
import fs from 'fs';
import path from 'path';

interface ChangeRecord {
  timestamp: string;
  userId?: number;
  username?: string;
  operation: string;
  path: string;
  method: string;
  success: boolean;
  error?: string;
  backupCreated?: string;
}

export class ChangeTracker {
  private static instance: ChangeTracker;
  private logFile = path.join(process.cwd(), 'logs', 'changes.log');

  static getInstance(): ChangeTracker {
    if (!ChangeTracker.instance) {
      ChangeTracker.instance = new ChangeTracker();
    }
    return ChangeTracker.instance;
  }

  constructor() {
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  recordChange(record: ChangeRecord): void {
    const logEntry = JSON.stringify(record) + '\n';
    fs.appendFileSync(this.logFile, logEntry);
    
    // Also log to console for immediate visibility
    const status = record.success ? '✅' : '❌';
    console.log(`${status} CHANGE: ${record.username || 'anonymous'} - ${record.method} ${record.path} - ${record.success ? 'SUCCESS' : record.error}`);
  }

  getRecentChanges(count: number = 50): ChangeRecord[] {
    try {
      const content = fs.readFileSync(this.logFile, 'utf8');
      const lines = content.trim().split('\n').filter(Boolean);
      
      return lines
        .slice(-count)
        .map(line => JSON.parse(line))
        .reverse(); // Most recent first
    } catch (error) {
      console.error('Failed to read change log:', error);
      return [];
    }
  }
}
