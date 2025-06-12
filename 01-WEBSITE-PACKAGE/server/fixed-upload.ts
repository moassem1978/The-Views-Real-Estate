import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
}

// Simple, reliable multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Fixed property image upload endpoint
router.post('/property/:id/images', upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    console.log(`=== PROPERTY IMAGE UPLOAD for ID ${req.params.id} ===`);
    
    // Check authentication
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const propertyId = parseInt(req.params.id);
    if (isNaN(propertyId)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    console.log(`Uploaded ${files.length} files for property ${propertyId}`);

    // Create image URLs
    const imageUrls = files.map(file => `/uploads/properties/${file.filename}`);
    
    // Get current property images
    const { dbStorage } = require('./storage');
    const property = await dbStorage.getPropertyById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Add new images to existing ones
    let currentImages = [];
    try {
      currentImages = Array.isArray(property.images) ? property.images : 
                     (typeof property.images === 'string' ? JSON.parse(property.images) : []);
    } catch (e) {
      currentImages = [];
    }

    const updatedImages = [...currentImages, ...imageUrls];
    
    // Update property with new images
    await dbStorage.updateProperty(propertyId, { images: updatedImages });

    console.log(`Successfully updated property ${propertyId} with ${files.length} new images`);

    res.json({
      success: true,
      message: "Images uploaded successfully",
      imageUrls: imageUrls,
      totalImages: updatedImages.length
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: "Upload failed", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;