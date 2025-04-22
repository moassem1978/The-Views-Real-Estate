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

// Ensure the directory exists in new location too (for fallback)
const altUploadDir = path.join(process.cwd(), 'uploads', 'properties');
if (!fs.existsSync(altUploadDir)) {
  fs.mkdirSync(altUploadDir, { recursive: true, mode: 0o777 });
  console.log(`Created alternative upload directory: ${altUploadDir}`);
}

// Force directory permissions
fs.chmodSync(uploadDir, 0o777);
fs.chmodSync(altUploadDir, 0o777);

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
    files: 10,
    fieldSize: 25 * 1024 * 1024 // Match file size limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
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
    const imageUrls = files.map(file => {
      // Also save a copy to the alternative location for better compatibility
      try {
        const sourcePath = path.join(uploadDir, file.filename);
        const destPath = path.join(altUploadDir, file.filename);
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`Copied uploaded file to fallback location: ${destPath}`);
          fs.chmodSync(destPath, 0o666); // Ensure file permissions
        }
      } catch (copyError) {
        console.error(`Error copying to fallback location:`, copyError);
      }
      
      return `/uploads/properties/${file.filename}`;
    });
    
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