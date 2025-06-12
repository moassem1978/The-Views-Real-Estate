import express, { Request, Response } from 'express';
import { PhotoManager, PhotoData } from './utils/photoManager';
import { protectionMiddleware } from './protection-middleware';

const router = express.Router();

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: express.NextFunction) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
};

// Upload photos for a property
export const uploadPhotosForProperty = async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.propertyId);
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid property ID' 
      });
    }

    const upload = PhotoManager.createUploadMiddleware();
    
    // Process upload using promisified middleware
    await new Promise<void>((resolve, reject) => {
      upload.array('photos', 20)(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const files = req.files as Express.Multer.File[];
    const result = await PhotoManager.uploadPhotos(files, propertyId);

    if (result.success) {
      res.json({
        success: true,
        message: `Successfully uploaded ${result.totalUploaded} photos`,
        photos: result.photos,
        errors: result.errors,
        totalUploaded: result.totalUploaded
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Upload failed',
        errors: result.errors
      });
    }
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed'
    });
  }
};

// Upload photos without property association
export const uploadPhotos = async (req: Request, res: Response) => {
  try {
    const upload = PhotoManager.createUploadMiddleware();
    
    await new Promise<void>((resolve, reject) => {
      upload.array('photos', 20)(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const files = req.files as Express.Multer.File[];
    const result = await PhotoManager.uploadPhotos(files);

    res.json({
      success: result.success,
      message: result.success ? `Successfully uploaded ${result.totalUploaded} photos` : 'Upload failed',
      photos: result.photos,
      errors: result.errors,
      totalUploaded: result.totalUploaded
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed'
    });
  }
};

// Get photos for a property
export const getPropertyPhotos = async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.propertyId);
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid property ID' 
      });
    }

    const photos = await PhotoManager.getPropertyPhotos(propertyId);
    const photosWithUrls = photos.map(photo => ({
      ...photo,
      url: PhotoManager.getPhotoUrl(photo.filename)
    }));

    res.json({
      success: true,
      photos: photosWithUrls
    });
  } catch (error) {
    console.error('Error getting property photos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get photos'
    });
  }
};

// Delete a specific photo
export const deletePhoto = async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.propertyId);
    const filename = req.params.filename;
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid property ID' 
      });
    }

    const success = await PhotoManager.deletePhoto(propertyId, filename);
    
    if (success) {
      res.json({
        success: true,
        message: 'Photo deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete photo'
      });
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete photo'
    });
  }
};

// Reorder photos for a property
export const reorderPhotos = async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.propertyId);
    const { photoOrder } = req.body;
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid property ID' 
      });
    }

    if (!Array.isArray(photoOrder)) {
      return res.status(400).json({
        success: false,
        message: 'Photo order must be an array of filenames'
      });
    }

    const success = await PhotoManager.reorderPhotos(propertyId, photoOrder);
    
    if (success) {
      res.json({
        success: true,
        message: 'Photos reordered successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to reorder photos'
      });
    }
  } catch (error) {
    console.error('Error reordering photos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder photos'
    });
  }
};

// Update photo metadata
export const updatePhotoMetadata = async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.propertyId);
    const filename = req.params.filename;
    const { altText } = req.body;
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid property ID' 
      });
    }

    const photos = await PhotoManager.getPropertyPhotos(propertyId);
    const updatedPhotos = photos.map(photo => 
      photo.filename === filename 
        ? { ...photo, altText: altText || photo.altText }
        : photo
    );

    await PhotoManager.updatePropertyPhotos(propertyId, updatedPhotos);

    res.json({
      success: true,
      message: 'Photo updated successfully'
    });
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update photo'
    });
  }
};

// Validate photo integrity
export const validatePhotoIntegrity = async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.propertyId);
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid property ID' 
      });
    }

    const validation = await PhotoManager.validatePhotoIntegrity(propertyId);
    
    res.json({
      success: true,
      ...validation
    });
  } catch (error) {
    console.error('Error validating photos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate photos'
    });
  }
};

// Cleanup orphaned files
export const cleanupOrphanedFiles = async (req: Request, res: Response) => {
  try {
    // Check if user has admin privileges
    const user = req.user as any;
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required'
      });
    }

    const result = await PhotoManager.cleanupOrphanedFiles();
    
    res.json({
      success: true,
      message: `Cleaned up ${result.cleaned} orphaned files`,
      cleaned: result.cleaned,
      errors: result.errors
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Cleanup failed'
    });
  }
};