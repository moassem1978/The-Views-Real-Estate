
import { BackupService } from './backup-service';
import { ChangeTracker } from './change-tracker';
import { FileValidator } from './utils/fileValidator';
import fs from 'fs';
import path from 'path';

export class AutoRestoreService {
  private static instance: AutoRestoreService;
  private backupService: BackupService;
  private changeTracker: ChangeTracker;

  private constructor() {
    this.backupService = BackupService.getInstance();
    this.changeTracker = ChangeTracker.getInstance();
  }

  static getInstance(): AutoRestoreService {
    if (!AutoRestoreService.instance) {
      AutoRestoreService.instance = new AutoRestoreService();
    }
    return AutoRestoreService.instance;
  }

  async autoRestoreFromLatest(): Promise<boolean> {
    try {
      console.log('Starting automatic restoration...');
      
      // Get the latest backup
      const backups = this.backupService.getAvailableBackups();
      if (backups.length === 0) {
        console.error('No backups available for restoration');
        return false;
      }

      // Sort by date and get the most recent
      const latestBackup = backups.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      console.log(`Restoring from backup: ${latestBackup.filename}`);

      // Restore database
      const backupPath = path.join(process.cwd(), 'backups', latestBackup.filename);
      await this.backupService.restoreFromBackup(backupPath);

      // Restore images
      await this.restoreImages();

      console.log('Automatic restoration completed successfully');
      return true;
    } catch (error) {
      console.error('Auto restoration failed:', error);
      return false;
    }
  }

  async restoreImages(): Promise<void> {
    console.log('Starting image restoration with validation...');
    
    const attachedAssetsDir = path.join(process.cwd(), 'attached_assets');
    const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
    const fileValidator = new FileValidator();

    // Ensure public uploads directory exists
    if (!fs.existsSync(publicUploadsDir)) {
      fs.mkdirSync(publicUploadsDir, { recursive: true });
    }

    if (fs.existsSync(attachedAssetsDir)) {
      const files = fs.readdirSync(attachedAssetsDir);
      console.log(`Found ${files.length} files in attached_assets`);

      let restoredCount = 0;
      let validatedCount = 0;

      for (const file of files) {
        const sourcePath = path.join(attachedAssetsDir, file);
        const destPath = path.join(publicUploadsDir, file);

        // Validate source file before attempting to restore
        if (!fileValidator.validateFileExists(file, attachedAssetsDir)) {
          console.warn(`⚠️  Skipping invalid source file: ${file}`);
          continue;
        }

        if (!fs.existsSync(destPath)) {
          try {
            fs.copyFileSync(sourcePath, destPath);
            
            // Validate the copied file
            if (fileValidator.validateFileExists(file, publicUploadsDir)) {
              console.log(`✅ Restored and validated: ${file}`);
              restoredCount++;
              validatedCount++;
            } else {
              console.error(`❌ Restored file failed validation: ${file}`);
              // Remove the invalid file
              fs.unlinkSync(destPath);
            }
          } catch (error) {
            console.error(`❌ Failed to restore ${file}:`, error);
          }
        } else {
          // File exists, just validate it
          if (fileValidator.validateFileExists(file, publicUploadsDir)) {
            validatedCount++;
          }
        }
      }

      console.log(`📊 Restoration complete: ${restoredCount} files restored, ${validatedCount} files validated`);
    }
  }

  async scheduleAutoBackups(): Promise<void> {
    // Create backups before any destructive operations
    const cron = await import('node-cron');
    
    // Daily backup at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Running scheduled backup...');
      await this.backupService.createBackup('scheduled', 1);
    });

    // Change tracker integration for backup monitoring
    console.log('Auto backup scheduling initialized successfully');
  }
}
