
import { Request, Response } from 'express';
import { EnhancedBackupScheduler } from './enhanced-backup-scheduler';
import { BackupService } from './backup-service';

export async function addBackupEndpoints(app: any) {
  const backupScheduler = EnhancedBackupScheduler.getInstance();
  const backupService = BackupService.getInstance();

  // Get backup status
  app.get('/api/admin/backup/status', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = req.user as any;
      if (user.role !== 'admin' && user.role !== 'owner') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const status = await backupScheduler.getBackupStatus();
      res.json(status);
    } catch (error) {
      console.error('Error getting backup status:', error);
      res.status(500).json({ message: 'Failed to get backup status' });
    }
  });

  // Create manual backup
  app.post('/api/admin/backup/create', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = req.user as any;
      if (user.role !== 'admin' && user.role !== 'owner') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { type = 'manual' } = req.body;
      const backupFile = await backupService.createBackup(type, user.id);
      
      res.json({ 
        success: true, 
        message: 'Backup created successfully',
        file: backupFile 
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      res.status(500).json({ message: 'Failed to create backup' });
    }
  });

  // List available backups
  app.get('/api/admin/backup/list', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = req.user as any;
      if (user.role !== 'admin' && user.role !== 'owner') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const backups = backupService.getAvailableBackups();
      res.json({ backups });
    } catch (error) {
      console.error('Error listing backups:', error);
      res.status(500).json({ message: 'Failed to list backups' });
    }
  });
}
