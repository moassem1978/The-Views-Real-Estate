import { db } from './db';
import { properties, announcements, projects, users } from '@shared/schema';
import { monitoringService } from './monitoring';
import fs from 'fs';
import path from 'path';

export class BackupService {
  private static instance: BackupService;
  private backupDir = path.join(process.cwd(), 'backups');

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  constructor() {
    this.ensureBackupDirectory();
  }

  private ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup(operation: string, userId?: number): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedOperation = operation.replace(/[^a-zA-Z0-9-_]/g, '_');
    const backupFile = path.join(this.backupDir, `backup-${timestamp}-${sanitizedOperation}.json`);

    try {
      // Test database connection first
      const { testConnection } = await import('./db');
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }

      const allProperties = await db.select().from(properties);
      const allAnnouncements = await db.select().from(announcements);
      const allProjects = await db.select().from(projects);
      const allUsers = await db.select().from(users);

      const backup = {
        timestamp: new Date().toISOString(),
        operation,
        userId,
        data: {
          properties: allProperties,
          announcements: allAnnouncements,
          projects: allProjects,
          users: allUsers.map(u => ({ ...u, password: '[REDACTED]' }))
        }
      };

      fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
      console.log(`✅ Backup created: ${backupFile}`);

      // Send success alert
      await monitoringService.sendBackupAlert('success', `Backup created successfully: ${path.basename(backupFile)}`);
      monitoringService.captureMessage(`Backup created: ${operation}`, 'info', 'backup');

      return backupFile;
    } catch (error) {
      console.error('❌ Backup failed:', error);

      // Send failure alert and capture error
      await monitoringService.sendBackupAlert('failure', `Backup failed: ${error instanceof Error ? error.message : String(error)}`);
      monitoringService.captureError(error instanceof Error ? error : new Error(String(error)), 'backup', userId);

      throw error;
    }
  }

  async restoreFromBackup(backupFile: string): Promise<void> {
    try {
      const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

      // Clear existing data
      await db.delete(properties);
      await db.delete(announcements);
      await db.delete(projects);

      // Restore data
      if (backupData.data.properties?.length) {
        await db.insert(properties).values(backupData.data.properties);
      }
      if (backupData.data.announcements?.length) {
        await db.insert(announcements).values(backupData.data.announcements);
      }
      if (backupData.data.projects?.length) {
        await db.insert(projects).values(backupData.data.projects);
      }

      console.log(`✅ Restored from backup: ${backupFile}`);
      monitoringService.captureMessage(`Restore completed: ${path.basename(backupFile)}`, 'info', 'backup');
    } catch (error) {
      console.error('❌ Restore failed:', error);
      monitoringService.captureError(error instanceof Error ? error : new Error(String(error)), 'backup');
      throw error;
    }
  }

  getAvailableBackups(): string[] {
    return fs.readdirSync(this.backupDir)
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .sort()
      .reverse(); // Most recent first
  }
}