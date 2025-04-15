import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure user is authenticated to use these endpoints
const requireAuth = (req: Request, res: Response, next: express.NextFunction) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
};

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Save to the public uploads directory for easy access
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
    }
    
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Generate a unique filename to prevent conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalExt = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + originalExt;
    
    cb(null, filename);
  }
});

// Create the multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 20 // Maximum 20 files at once
  },
  fileFilter: (_req, file, cb) => {
    // Accept only image files
    const filetypes = /jpeg|jpg|png|gif|webp|svg/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image files are allowed!'));
  }
});

// Main universal upload endpoint
router.post('/upload', requireAuth, (req: Request, res: Response) => {
  // Use upload.array for multiple files with 'images' as the field name
  upload.array('images', 20)(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        success: false, 
        message: err.message || 'Error uploading files' 
      });
    }
    
    try {
      // Get the files from multer
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No files were uploaded' 
        });
      }
      
      // Create public URLs for the uploaded files
      const urls = files.map(file => {
        // Convert from filesystem path to URL path
        const relativePath = path.relative(
          path.join(process.cwd(), 'public'),
          file.path
        ).replace(/\\/g, '/'); // Fix for Windows paths
        
        return `/${relativePath}`;
      });
      
      console.log(`Successfully uploaded ${files.length} files:`, urls);
      
      // Return success with URLs
      return res.status(200).json({
        success: true,
        message: `${files.length} files uploaded successfully`,
        count: files.length,
        urls: urls,
        files: files.map(f => ({
          originalname: f.originalname,
          size: f.size,
          mimetype: f.mimetype,
          url: `/${path.relative(path.join(process.cwd(), 'public'), f.path).replace(/\\/g, '/')}`
        }))
      });
    } catch (error) {
      console.error('Error processing uploaded files:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error processing uploaded files' 
      });
    }
  });
});

export default router;