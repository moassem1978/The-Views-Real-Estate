import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import util from 'util';

/**
 * Helper class for handling file uploads with enhanced error handling and fallbacks
 */
export class UploadHelper {
  private static diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Determine the upload directory based on the endpoint
      let uploadPath = path.join(process.cwd(), 'public', 'uploads', 'properties');
      
      if (req.path.includes('logo')) {
        uploadPath = path.join(process.cwd(), 'public', 'uploads', 'logos');
      } else if (req.path.includes('announcement')) {
        uploadPath = path.join(process.cwd(), 'public', 'uploads', 'announcements');
      }
      
      // Ensure directory exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true, mode: 0o777 });
        console.log(`Created upload directory: ${uploadPath}`);
      }
      
      // Ensure directory has correct permissions
      fs.chmodSync(uploadPath, 0o777);
      
      cb(null, uploadPath);
    },
    
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      
      // Get original extension or use a default
      let ext = path.extname(file.originalname).toLowerCase();
      
      // If no extension, determine from mimetype
      if (!ext) {
        if (file.mimetype.includes('jpeg') || file.mimetype.includes('jpg')) {
          ext = '.jpg';
        } else if (file.mimetype.includes('png')) {
          ext = '.png';
        } else if (file.mimetype.includes('gif')) {
          ext = '.gif';
        } else {
          ext = '.jpg'; // Default to jpg
        }
      }
      
      // Create appropriate filename based on endpoint
      let filename;
      if (req.path.includes('property')) {
        filename = 'images-' + uniqueSuffix + ext;
      } else if (req.path.includes('announcement')) {
        filename = 'announcement-' + uniqueSuffix + ext;
      } else if (req.path.includes('logo')) {
        filename = 'logo-' + uniqueSuffix + ext;
      } else {
        filename = 'upload-' + uniqueSuffix + ext;
      }
      
      console.log(`Generated filename: ${filename}`);
      cb(null, filename);
    }
  });
  
  private static fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept image files only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      console.log(`Rejected file with mimetype: ${file.mimetype}`);
      cb(null, false);
      // Don't throw an error, just skip the file
    }
  };
  
  /**
   * Creates a multer middleware specifically for property image uploads
   */
  public static createPropertyImageUploader() {
    return multer({
      storage: this.diskStorage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 15 * 1024 * 1024, // 15MB max file size
        files: 10 // Up to 10 files at once
      }
    });
  }
  
  /**
   * Creates a multer middleware for logo uploads (smaller size)
   */
  public static createLogoUploader() {
    return multer({
      storage: this.diskStorage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB max for logos
        files: 1 // Only one logo at a time
      }
    });
  }
  
  /**
   * Universal upload handler that works with different browsers and clients
   */
  public static universalUploadHandler(fieldName: string, maxCount: number = 10) {
    const uploader = multer({
      storage: this.diskStorage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 15 * 1024 * 1024,
        files: maxCount
      }
    });
    
    // Create middleware array
    return [
      // Handle authentication check
      (req: Request, res: Response, next: NextFunction) => {
        // Check if user is authenticated
        if (!req.isAuthenticated()) {
          console.error("Upload failed: User not authenticated");
          return res.status(401).json({ 
            success: false,
            message: "Authentication required to upload files"
          });
        }
        
        // Log user attempting upload
        const user = req.user as Express.User;
        console.log(`User attempting upload: ${user.username} (${user.role})`);
        
        // Continue to next middleware
        next();
      },
      
      // Log request information for debugging
      (req: Request, res: Response, next: NextFunction) => {
        console.log("==== UNIVERSAL UPLOAD HANDLER START ====");
        console.log(`Endpoint: ${req.path}`);
        console.log(`Content-Type: ${req.headers['content-type']}`);
        console.log(`Content-Length: ${req.headers['content-length']}`);
        console.log(`User-Agent: ${req.headers['user-agent']}`);
        next();
      },
      
      // Create handler to catch multer errors
      (req: Request, res: Response, next: NextFunction) => {
        try {
          // Use array upload method based on field name
          const uploadMiddleware = uploader.array(fieldName, maxCount);
          
          uploadMiddleware(req, res, (err) => {
            if (err) {
              console.error('Multer upload error:', err);
              if (err instanceof multer.MulterError) {
                // A Multer error occurred
                if (err.code === 'LIMIT_FILE_SIZE') {
                  return res.status(400).json({
                    success: false,
                    message: "File too large. Maximum size is 15MB."
                  });
                } else if (err.code === 'LIMIT_FILE_COUNT') {
                  return res.status(400).json({
                    success: false,
                    message: `Too many files. Maximum count is ${maxCount}.`
                  });
                } else {
                  return res.status(400).json({
                    success: false,
                    message: `Upload error: ${err.message}`
                  });
                }
              } else {
                // An unknown error occurred
                return res.status(500).json({
                  success: false,
                  message: "Server error during file upload"
                });
              }
            }
            
            // Log upload success
            if (req.files) {
              const files = Array.isArray(req.files) ? req.files : [req.files];
              console.log(`Successfully uploaded ${files.length} files`);
              files.forEach((file, index) => {
                console.log(`[${index + 1}] ${file.originalname} -> ${file.filename} (${file.size} bytes)`);
              });
            } else {
              console.log("No files were uploaded");
            }
            
            // Continue to next middleware
            next();
          });
        } catch (error) {
          console.error('Unexpected error in upload middleware:', error);
          return res.status(500).json({
            success: false,
            message: "Unexpected server error during file upload"
          });
        }
      }
    ];
  }
  
  /**
   * Process uploaded files to return proper URLs and handle response
   */
  public static handleUploadResponse(req: Request, res: Response) {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({
          success: false,
          message: "No files were uploaded"
        });
      }
      
      // Use proper type for multer files
      const uploadedFiles = Array.isArray(req.files) ? req.files : [req.files];
      
      // Create URLs for all uploaded files
      const fileUrls = uploadedFiles.map(file => {
        // Extract upload type from path (e.g., properties, logos, announcements)
        const uploadType = file.destination.includes('properties') 
          ? 'properties' 
          : (file.destination.includes('logos') ? 'logos' : 'announcements');
        
        // Generate a URL that will map correctly to our static files
        return `/uploads/${uploadType}/${file.filename}`;
      });
      
      console.log(`Successfully processed ${fileUrls.length} files. Files:`, fileUrls);
      
      // Return success response
      return res.status(200).json({
        success: true,
        message: "Files uploaded successfully",
        imageUrls: fileUrls,
        count: fileUrls.length
      });
    } catch (error) {
      console.error('Error processing upload response:', error);
      return res.status(500).json({
        success: false,
        message: "Error processing uploaded files"
      });
    }
  }
}