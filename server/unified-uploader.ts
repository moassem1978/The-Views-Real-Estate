import express, { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create a router for unified image upload functionality
const router = Router();

// Configure storage for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the upload directory to be under public for direct access
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
    
    // Create directory if it doesn't exist with full permissions
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
      console.log(`Created upload directory: ${uploadDir}`);
    }
    
    // Set permissions to ensure writability
    fs.chmodSync(uploadDir, 0o777);
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const originalExt = path.extname(file.originalname) || '.jpg';
    
    // Use consistent naming pattern for all image files
    const filename = `images-${timestamp}-${randomSuffix}${originalExt}`;
    
    cb(null, filename);
  }
});

// Configure multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB file size limit
    files: 10 // Maximum 10 files per upload
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
      console.log(`Rejected non-image file: ${file.originalname} (${file.mimetype})`);
    }
  }
});

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: "Authentication required to upload images"
    });
  }
  next();
};

// Simple property images upload endpoint
router.post('/upload', requireAuth, (req: Request, res: Response) => {
  console.log("==== UNIFIED PROPERTY IMAGE UPLOAD STARTED ====");
  
  // Use the multer middleware on this request
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error("Multer upload error:", err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: "File too large. Maximum size is 15MB."
          });
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: "Too many files. Maximum is 10 files per upload."
          });
        } else {
          return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
          });
        }
      }
      return res.status(500).json({
        success: false,
        message: "Server error during file upload"
      });
    }
    
    // Check if files were uploaded
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded. Please select image files to upload."
      });
    }
    
    // Log successful upload
    const files = Array.isArray(req.files) ? req.files : [req.files];
    console.log(`Successfully received ${files.length} files`);
    
    // Process files to create URLs
    const imageUrls = files.map(file => {
      return `/uploads/properties/${file.filename}`;
    });
    
    // Log created URLs
    imageUrls.forEach((url, i) => {
      console.log(`[${i+1}] Created URL: ${url}`);
    });
    
    // Send success response
    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${files.length} images`,
      imageUrls: imageUrls,
      count: files.length
    });
  });
});

export default router;