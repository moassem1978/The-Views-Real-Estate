
// Image protection middleware
import { Request, Response, NextFunction } from 'express';

export const imageProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check if request involves image modifications
  const isImageModification = 
    req.path.includes('/upload/') || 
    (req.body && (req.body.images || req.body.imagesToRemove));

  if (isImageModification) {
    // Log all image modification attempts
    console.log(`IMAGE MODIFICATION ATTEMPT: ${req.method} ${req.path} by user ${req.user?.username || 'anonymous'} at ${new Date().toISOString()}`);
    
    // Ensure user is authenticated for any image operations
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        message: "Authentication required for image operations",
        timestamp: new Date().toISOString()
      });
    }

    // Add warning header
    res.setHeader('X-Image-Operation-Warning', 'This operation may modify property images');
  }

  next();
};
