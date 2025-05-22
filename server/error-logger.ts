import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

class ErrorLogger {
  private logDir: string;
  private errorLogFile: string;
  private maxLogSize: number = 5 * 1024 * 1024; // 5MB max log size
  private maxLogFiles: number = 5; // Keep 5 log files maximum

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.errorLogFile = path.join(this.logDir, 'error.log');
    this.ensureLogDir();
  }

  private ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
      console.log(`Created logs directory: ${this.logDir}`);
    }
  }

  public logError(error: Error | string, context: string = 'general', userId: number | string | null = null) {
    try {
      this.ensureLogDir();
      this.checkRotation();

      const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      const errorMessage = error instanceof Error ? error.message : error;
      const errorStack = error instanceof Error ? error.stack : '';
      
      const logEntry = `[${timestamp}][${context}][User:${userId || 'anonymous'}] ${errorMessage}\n${errorStack ? `Stack: ${errorStack}\n` : ''}\n`;
      
      fs.appendFileSync(this.errorLogFile, logEntry);
      console.error(`Logged error from ${context}:`, errorMessage);
    } catch (loggingError) {
      console.error('Error while logging error:', loggingError);
    }
  }

  private checkRotation() {
    try {
      if (!fs.existsSync(this.errorLogFile)) {
        return;
      }

      const stats = fs.statSync(this.errorLogFile);
      if (stats.size >= this.maxLogSize) {
        this.rotateLogFiles();
      }
    } catch (error) {
      console.error('Error checking log rotation:', error);
    }
  }

  private rotateLogFiles() {
    try {
      // First, remove the oldest log file if we're at the maximum
      const oldestLog = path.join(this.logDir, `error.${this.maxLogFiles}.log`);
      if (fs.existsSync(oldestLog)) {
        fs.unlinkSync(oldestLog);
      }

      // Shift all existing log files
      for (let i = this.maxLogFiles - 1; i >= 1; i--) {
        const currentLog = path.join(this.logDir, `error.${i}.log`);
        const nextLog = path.join(this.logDir, `error.${i + 1}.log`);
        
        if (fs.existsSync(currentLog)) {
          fs.renameSync(currentLog, nextLog);
        }
      }

      // Rename the current log file
      if (fs.existsSync(this.errorLogFile)) {
        fs.renameSync(this.errorLogFile, path.join(this.logDir, 'error.1.log'));
      }
    } catch (error) {
      console.error('Error rotating log files:', error);
    }
  }

  public getRecentErrors(count: number = 50): string[] {
    try {
      if (!fs.existsSync(this.errorLogFile)) {
        return [];
      }

      const logContent = fs.readFileSync(this.errorLogFile, 'utf8');
      const entries = logContent.split('\n\n').filter(Boolean);
      return entries.slice(-count).reverse(); // Return the most recent entries first
    } catch (error) {
      console.error('Error reading error log:', error);
      return [];
    }
  }

  public clearLogs(): boolean {
    try {
      if (fs.existsSync(this.errorLogFile)) {
        fs.unlinkSync(this.errorLogFile);
      }
      
      // Also clear rotated logs
      for (let i = 1; i <= this.maxLogFiles; i++) {
        const rotatedLog = path.join(this.logDir, `error.${i}.log`);
        if (fs.existsSync(rotatedLog)) {
          fs.unlinkSync(rotatedLog);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing logs:', error);
      return false;
    }
  }
}

export const errorLogger = new ErrorLogger();