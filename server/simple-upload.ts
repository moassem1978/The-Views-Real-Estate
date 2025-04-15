import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
  console.log(`Created upload directory: ${uploadDir}`);
}

// Force directory permissions
fs.chmodSync(uploadDir, 0o777);

// Configure multer for reliable file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Ensure upload directory exists
    fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9]/g, '_');
    const ext = path.extname(safeFilename) || '.jpg';
    const filename = `images-${timestamp}-${random}${ext}`;
    console.log(`Generated filename: ${filename} for ${file.originalname}`);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
    files: 10
  }
});

// Basic upload endpoint
router.post('/simple-upload', upload.array('files', 10), (req: Request, res: Response) => {
  console.log('==== SIMPLE UPLOAD ENDPOINT CALLED ====');
  console.log(`Content-Type: ${req.headers['content-type']}`);

  try {
    // Check if files were uploaded
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      console.error('No files in request');
      
      // Try to log request details
      console.log('Request headers:', req.headers);
      console.log('Request body keys:', Object.keys(req.body || {}));
      
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }
    
    // Log the files we received
    const files = req.files as Express.Multer.File[];
    console.log(`Received ${files.length} files:`);
    files.forEach((file, index) => {
      console.log(`File ${index + 1}: ${file.originalname}, size: ${Math.round(file.size/1024)}KB, saved as: ${file.filename}`);
    });
    
    // Create URLs for the uploaded files
    const imageUrls = files.map(file => `/uploads/properties/${file.filename}`);
    
    console.log('Image URLs:', imageUrls);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${files.length} files`,
      imageUrls: imageUrls,
      urls: imageUrls // Include both names for broader compatibility
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing upload',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Ultra basic upload endpoint with minimal processing
router.post('/basic-upload', (req: Request, res: Response) => {
  console.log('==== BASIC UPLOAD ENDPOINT CALLED ====');
  console.log(`Content-Type: ${req.headers['content-type']}`);
  
  // Use multer only for this request
  const basicUpload = multer({
    dest: uploadDir,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB
  }).array('files', 10);
  
  basicUpload(req, res, function(err) {
    if (err) {
      console.error('Basic upload error:', err);
      return res.status(500).json({
        success: false,
        message: 'Upload failed with error',
        error: err.message
      });
    }
    
    // Check if we have files
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      console.log('No files found in basic upload request');
      console.log('Request headers:', req.headers);
      
      return res.status(400).json({
        success: false,
        message: 'No files were received'
      });
    }
    
    const files = req.files as Express.Multer.File[];
    console.log(`Received ${files.length} files in basic upload`);
    
    // Create URLs for client response
    const imageUrls = files.map(file => `/uploads/properties/${path.basename(file.path)}`);
    
    // Return success
    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${files.length} files`,
      imageUrls: imageUrls,
      urls: imageUrls // Include both names for broader compatibility
    });
  });
});

// Export the router
export default router;