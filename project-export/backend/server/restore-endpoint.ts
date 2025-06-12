
import { Request, Response, NextFunction } from 'express';
import { ManualRestoreService } from './manual-restore-service';

export async function addRestoreEndpoints(app: any) {
  const restoreService = new ManualRestoreService();

  // Get restoration report
  app.get('/api/admin/restore/report', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = req.user as any;
      if (user.role !== 'admin' && user.role !== 'owner') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const report = await restoreService.getRestorationReport();
      res.json(report);
    } catch (error) {
      console.error('Error getting restoration report:', error);
      res.status(500).json({ message: 'Failed to get restoration report' });
    }
  });

  // Restore images from attached_assets
  app.post('/api/admin/restore/images', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = req.user as any;
      if (user.role !== 'admin' && user.role !== 'owner') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      await restoreService.restoreImagesFromAssets();
      res.json({ message: 'Images restored successfully from attached_assets' });
    } catch (error) {
      console.error('Error restoring images:', error);
      res.status(500).json({ message: 'Failed to restore images' });
    }
  });

  // Rebuild property image associations
  app.post('/api/admin/restore/rebuild', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = req.user as any;
      if (user.role !== 'admin' && user.role !== 'owner') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      await restoreService.rebuildPropertyImages();
      res.json({ message: 'Property image associations rebuilt successfully' });
    } catch (error) {
      console.error('Error rebuilding property images:', error);
      res.status(500).json({ message: 'Failed to rebuild property images' });
    }
  });

  // Full restoration
  app.post('/api/admin/restore/full', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = req.user as any;
      if (user.role !== 'admin' && user.role !== 'owner') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      await restoreService.fullRestore();
      res.json({ message: 'Full restoration completed successfully' });
    } catch (error) {
      console.error('Error during full restoration:', error);
      res.status(500).json({ message: 'Failed to complete full restoration' });
    }
  });
}
