import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const router = Router();

// Ensure upload directories exist
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
const fallbackDir = path.join(process.cwd(), 'uploads', 'properties');

[uploadDir, fallbackDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o777 });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueHash = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `images-${Date.now()}-${uniqueHash}${ext}`);
  }
});

// Configure upload middleware
const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
    files: 10
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/i;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    cb(null, isValid);
  }
});

// Simple upload endpoint
router.post('/simple-upload', (req: Request, res: Response) => {
  upload.array('files', 10)(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Create URLs for the uploaded files
      const imageUrls = files.map(file => {
        // Save backup copy
        const backupPath = path.join(fallbackDir, file.filename);
        fs.copyFileSync(file.path, backupPath);

        return `/uploads/properties/${file.filename}`;
      });

      return res.status(200).json({
        success: true,
        message: `Successfully uploaded ${files.length} files`,
        imageUrls
      });
    } catch (error) {
      console.error('Error processing upload:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error processing upload'
      });
    }
  });
});

export default router;