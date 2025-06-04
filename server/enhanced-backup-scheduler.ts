
import cron from 'node-cron';
import { BackupService } from './backup-service';
import { AutoRestoreService } from './auto-restore-service';
import fs from 'fs';
import path from 'path';

export class EnhancedBackupScheduler {
  private static instance: EnhancedBackupScheduler;
  private backupService: BackupService;
  private autoRestoreService: AutoRestoreService;
  private isScheduled = false;

  private constructor() {
    this.backupService = BackupService.getInstance();
    this.autoRestoreService = AutoRestoreService.getInstance();
  }

  static getInstance(): EnhancedBackupScheduler {
    if (!EnhancedBackupScheduler.instance) {
      EnhancedBackupScheduler.instance = new EnhancedBackupScheduler();
    }
    return EnhancedBackupScheduler.instance;
  }

  async initializeScheduler(): Promise<void> {
    if (this.isScheduled) {
      console.log('⚠️ Backup scheduler already initialized');
      return;
    }

    console.log('🕒 Initializing enhanced backup scheduler...');

    // Daily backup at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('🔄 Running scheduled daily backup...');
      await this.performDailyBackup();
    });

    // Weekly comprehensive backup every Sunday at 3:00 AM
    cron.schedule('0 3 * * 0', async () => {
      console.log('🔄 Running weekly comprehensive backup...');
      await this.performWeeklyBackup();
    });

    // Hourly health check and emergency backup if needed
    cron.schedule('0 * * * *', async () => {
      await this.performHealthCheck();
    });

    // Cleanup old backups every day at 4:00 AM
    cron.schedule('0 4 * * *', async () => {
      console.log('🧹 Cleaning up old backups...');
      await this.cleanupOldBackups();
    });

    this.isScheduled = true;
    console.log('✅ Enhanced backup scheduler initialized');
  }

  private async performDailyBackup(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Create database backup
      const backupFile = await this.backupService.createBackup(`daily-${timestamp}`, 1);
      
      // Backup images directory
      await this.backupImagesDirectory();
      
      // Store backup metadata
      await this.storeBackupMetadata('daily', backupFile);
      
      console.log(`✅ Daily backup completed: ${backupFile}`);
    } catch (error) {
      console.error('❌ Daily backup failed:', error);
      // Log to error tracking system
      await this.logBackupError('daily', error);
    }
  }

  private async performWeeklyBackup(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Create comprehensive backup
      const backupFile = await this.backupService.createBackup(`weekly-${timestamp}`, 1);
      
      // Backup entire uploads directory
      await this.backupUploadsDirectory();
      
      // Create system state snapshot
      await this.createSystemSnapshot();
      
      // Store backup metadata
      await this.storeBackupMetadata('weekly', backupFile);
      
      console.log(`✅ Weekly backup completed: ${backupFile}`);
    } catch (error) {
      console.error('❌ Weekly backup failed:', error);
      await this.logBackupError('weekly', error);
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      // Check database health
      const { pool } = await import('./db');
      await pool.query('SELECT 1');
      
      // Check critical files exist
      const criticalPaths = [
        'public/uploads/properties',
        'attached_assets',
        'backups'
      ];
      
      for (const criticalPath of criticalPaths) {
        if (!fs.existsSync(criticalPath)) {
          console.warn(`⚠️ Critical path missing: ${criticalPath}`);
          await this.performEmergencyBackup();
          break;
        }
      }
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
      await this.performEmergencyBackup();
    }
  }

  private async performEmergencyBackup(): Promise<void> {
    try {
      console.log('🚨 Performing emergency backup...');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = await this.backupService.createBackup(`emergency-${timestamp}`, 1);
      
      // Try to restore from latest if needed
      if (await this.shouldAutoRestore()) {
        await this.autoRestoreService.autoRestoreFromLatest();
      }
      
      console.log(`✅ Emergency backup completed: ${backupFile}`);
    } catch (error) {
      console.error('❌ Emergency backup failed:', error);
    }
  }

  private async backupImagesDirectory(): Promise<void> {
    const sourceDir = 'public/uploads/properties';
    const backupDir = `backups/images-${new Date().toISOString().split('T')[0]}`;
    
    if (fs.existsSync(sourceDir)) {
      if (!fs.existsSync(path.dirname(backupDir))) {
        fs.mkdirSync(path.dirname(backupDir), { recursive: true });
      }
      
      // Create compressed backup of images
      const { exec } = require('child_process');
      await new Promise((resolve, reject) => {
        exec(`tar -czf ${backupDir}.tar.gz -C ${sourceDir} .`, (error) => {
          if (error) reject(error);
          else resolve(true);
        });
      });
      
      console.log(`📁 Images backed up to: ${backupDir}.tar.gz`);
    }
  }

  private async backupUploadsDirectory(): Promise<void> {
    const sourceDir = 'public/uploads';
    const backupDir = `backups/uploads-${new Date().toISOString().split('T')[0]}`;
    
    if (fs.existsSync(sourceDir)) {
      const { exec } = require('child_process');
      await new Promise((resolve, reject) => {
        exec(`tar -czf ${backupDir}.tar.gz -C ${sourceDir} .`, (error) => {
          if (error) reject(error);
          else resolve(true);
        });
      });
      
      console.log(`📁 Uploads backed up to: ${backupDir}.tar.gz`);
    }
  }

  private async createSystemSnapshot(): Promise<void> {
    const snapshot = {
      timestamp: new Date().toISOString(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      },
      directories: {
        backups: fs.existsSync('backups') ? fs.readdirSync('backups').length : 0,
        properties: fs.existsSync('public/uploads/properties') ? fs.readdirSync('public/uploads/properties').length : 0,
        attachedAssets: fs.existsSync('attached_assets') ? fs.readdirSync('attached_assets').length : 0
      }
    };
    
    const snapshotFile = `backups/system-snapshot-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2));
    console.log(`📊 System snapshot created: ${snapshotFile}`);
  }

  private async storeBackupMetadata(type: string, backupFile: string): Promise<void> {
    const metadata = {
      type,
      timestamp: new Date().toISOString(),
      file: backupFile,
      size: fs.existsSync(backupFile) ? fs.statSync(backupFile).size : 0
    };
    
    const metadataFile = 'backups/backup-metadata.json';
    let existingData: any[] = [];
    
    if (fs.existsSync(metadataFile)) {
      existingData = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
    }
    
    existingData.push(metadata);
    fs.writeFileSync(metadataFile, JSON.stringify(existingData, null, 2));
  }

  private async cleanupOldBackups(): Promise<void> {
    const backupDir = 'backups';
    if (!fs.existsSync(backupDir)) return;
    
    const files = fs.readdirSync(backupDir);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    for (const file of files) {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      
      // Keep weekly backups for 3 months, daily for 30 days
      const isWeekly = file.includes('weekly');
      const ageLimit = isWeekly ? 90 : 30;
      const fileAge = new Date(now.getTime() - stats.mtime.getTime());
      
      if (fileAge.getTime() > ageLimit * 24 * 60 * 60 * 1000) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Removed old backup: ${file}`);
      }
    }
  }

  private async shouldAutoRestore(): Promise<boolean> {
    // Check if critical data is missing
    try {
      const { pool } = await import('./db');
      const result = await pool.query('SELECT COUNT(*) FROM properties');
      return parseInt(result.rows[0].count) === 0;
    } catch {
      return true; // If we can't query, we probably need to restore
    }
  }

  private async logBackupError(type: string, error: any): Promise<void> {
    const errorLog = {
      timestamp: new Date().toISOString(),
      type,
      error: error.message || error,
      stack: error.stack
    };
    
    const errorFile = 'logs/backup-errors.log';
    fs.appendFileSync(errorFile, JSON.stringify(errorLog) + '\n');
  }

  async getBackupStatus(): Promise<any> {
    const backupDir = 'backups';
    const status = {
      isScheduled: this.isScheduled,
      totalBackups: 0,
      latestBackup: null,
      diskUsage: 0,
      lastDailyBackup: null,
      lastWeeklyBackup: null
    };

    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir);
      status.totalBackups = files.filter(f => f.includes('backup-')).length;
      
      // Calculate disk usage
      for (const file of files) {
        const filePath = path.join(backupDir, file);
        if (fs.statSync(filePath).isFile()) {
          status.diskUsage += fs.statSync(filePath).size;
        }
      }
      
      // Find latest backups
      const dailyBackups = files.filter(f => f.includes('daily')).sort().reverse();
      const weeklyBackups = files.filter(f => f.includes('weekly')).sort().reverse();
      
      if (dailyBackups.length > 0) status.lastDailyBackup = dailyBackups[0];
      if (weeklyBackups.length > 0) status.lastWeeklyBackup = weeklyBackups[0];
    }

    return status;
  }
}
