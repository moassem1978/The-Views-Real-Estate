import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create a router
const router = express.Router();

// Ensure uploads directory exists
const ensureDirectory = () => {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
    console.log(`Created upload directory: ${uploadDir}`);
  }
  return uploadDir;
};

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = ensureDirectory();
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a sanitized filename with timestamp
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1000);
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `simple-${timestamp}-${random}${ext}`;
    console.log(`Generated filename: ${filename}`);
    cb(null, filename);
  }
});

// Create the multer upload instance
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
    files: 10 // Maximum 10 files at once
  }
});

// Simple upload endpoint - doesn't require authentication
router.post('/simple-upload', upload.array('files', 10), (req: Request, res: Response) => {
  try {
    console.log('==== SIMPLE UPLOAD ENDPOINT CALLED ====');
    
    // Log request details
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Request method:', req.method);
    
    // No files received
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      console.log('No files found in request');
      return res.status(400).json({
        success: false,
        message: 'No files received. Please try again.'
      });
    }
    
    // Process the uploaded files
    const files = req.files as Express.Multer.File[];
    console.log(`Successfully received ${files.length} files`);
    
    // Create file URLs
    const uploadedFiles = files.map(file => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/properties/${file.filename}`
    }));
    
    // Generate the URLs for the files
    const urls = uploadedFiles.map(file => file.url);
    console.log('File URLs:', urls);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${files.length} files`,
      files: uploadedFiles,
      urls: urls
    });
  } catch (error) {
    console.error('Error in /simple-upload:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Even simpler upload endpoint with minimal processing
router.post('/basic-upload', (req: Request, res: Response) => {
  try {
    console.log('==== BASIC UPLOAD ENDPOINT CALLED ====');
    
    // Create upload handler
    const uploadDir = ensureDirectory();
    const basicUpload = upload.array('files', 10);
    
    // Use the upload middleware
    basicUpload(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(500).json({
          success: false,
          message: 'Upload middleware error',
          error: err.message
        });
      }
      
      // No files received
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        console.log('No files found in request after processing');
        return res.status(400).json({
          success: false, 
          message: 'No files received'
        });
      }
      
      // Process the uploaded files
      const files = req.files as Express.Multer.File[];
      console.log(`Successfully processed ${files.length} files in basic-upload`);
      
      // Generate URLs
      const urls = files.map(file => `/uploads/properties/${file.filename}`);
      
      // Return success
      return res.status(200).json({
        success: true,
        message: 'Files uploaded successfully',
        imageUrls: urls
      });
    });
  } catch (error) {
    console.error('Error in /basic-upload:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;