
import { Request, Response, NextFunction } from 'express';
import { BackupService } from './backup-service';

export const protectionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const dangerousOperations = [
    'DELETE',
    req.path.includes('/delete'),
    req.path.includes('/clear'),
    req.body?.action === 'delete',
    req.body?.imagesToRemove?.length > 0
  ];

  const isDangerous = dangerousOperations.some(Boolean);

  if (isDangerous) {
    try {
      // Create automatic backup before any dangerous operation
      const backupService = BackupService.getInstance();
      const userId = req.user ? (req.user as any).id : null;
      const operation = `${req.method}-${req.path}`;
      
      await backupService.createBackup(operation, userId);
      console.log(`🔒 PROTECTION: Backup created before ${operation}`);
      
      // Add warning headers
      res.setHeader('X-Backup-Created', 'true');
      res.setHeader('X-Operation-Warning', 'Backup created before this operation');
      
    } catch (error) {
      console.error('❌ PROTECTION: Backup failed, blocking operation:', error);
      return res.status(500).json({ 
        error: 'Safety backup failed. Operation blocked for data protection.',
        message: 'Please contact administrator'
      });
    }
  }

  next();
};

export const ownerOnlyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const user = req.user as any;
  if (!user || user.role !== 'owner') {
    console.log(`🚫 BLOCKED: Non-owner ${user?.username} attempted dangerous operation: ${req.method} ${req.path}`);
    return res.status(403).json({ 
      message: "Only the owner can perform this operation",
      blocked: true,
      timestamp: new Date().toISOString()
    });
  }

  next();
};
