
import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";

// Simple upload configuration
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Get all properties
  app.get("/api/properties", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 24;
      const result = await dbStorage.getAllProperties(page, pageSize);
      res.json(result);
    } catch (error) {
      console.error('Error fetching properties:', error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Get property by ID
  app.get("/api/properties/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      const property = await dbStorage.getPropertyById(id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      console.error('Error fetching property:', error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Create property
  app.post("/api/properties", upload.array('images', 20), async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as any;
      const files = req.files as Express.Multer.File[];
      
      // Process uploaded images
      const imageUrls = files ? files.map(file => `/uploads/properties/${file.filename}`) : [];

      const propertyData = {
        ...req.body,
        photos: imageUrls,
        createdBy: user.id,
        agentId: user.id
      };

      // Convert numeric fields
      ['price', 'bedrooms', 'bathrooms', 'builtUpArea'].forEach(field => {
        if (propertyData[field]) {
          propertyData[field] = parseFloat(propertyData[field]) || 0;
        }
      });

      const property = await dbStorage.createProperty(propertyData);
      res.status(201).json({ success: true, property });
    } catch (error) {
      console.error('Error creating property:', error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  // Update property
  app.put("/api/properties/:id", upload.array('images', 20), async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const id = parseInt(req.params.id);
      const user = req.user as any;
      const files = req.files as Express.Multer.File[];
      const { imagesToRemove = [], images = [], ...rest } = req.body;

      // Get existing property
      const existingProperty = await dbStorage.getPropertyById(id);
      if (!existingProperty) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check permissions
      if (user.role !== 'admin' && user.role !== 'owner' && existingProperty.createdBy !== user.id) {
        return res.status(403).json({ message: "Permission denied" });
      }

      // Delete requested images from filesystem
      for (const url of imagesToRemove) {
        try {
          const filePath = path.join(__dirname, "../public/uploads/", path.basename(url));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted image: ${filePath}`);
          }
        } catch (deleteError) {
          console.error(`Failed to delete image ${url}:`, deleteError);
        }
      }

      // Handle new file uploads
      let finalImages = images;
      if (files && files.length > 0) {
        const newImages = files.map(file => `/uploads/properties/${file.filename}`);
        finalImages = [...images, ...newImages];
      }

      // Prepare update data
      const updateData = {
        title: req.body.title || existingProperty.title,
        description: req.body.description || existingProperty.description,
        price: parseFloat(req.body.price) || existingProperty.price,
        city: req.body.city || existingProperty.city,
        state: req.body.state || existingProperty.state,
        country: req.body.country || existingProperty.country,
        propertyType: req.body.propertyType || existingProperty.propertyType,
        listingType: req.body.listingType || existingProperty.listingType,
        bedrooms: parseInt(req.body.bedrooms) || existingProperty.bedrooms,
        bathrooms: parseFloat(req.body.bathrooms) || existingProperty.bathrooms,
        builtUpArea: parseFloat(req.body.builtUpArea) || existingProperty.builtUpArea,
        photos: finalImages,
        isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
        status: req.body.status || existingProperty.status,
        updatedAt: new Date()
      };

      console.log(`🔄 Updating property ${id} with data:`, updateData);

      const updatedProperty = await dbStorage.updateProperty(id, updateData);
      
      if (!updatedProperty) {
        return res.status(500).json({ message: "Failed to update property in database" });
      }

      console.log(`✅ Property ${id} updated successfully`);
      res.json({ success: true, property: updatedProperty });
    } catch (error) {
      console.error('Error updating property:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update property" });
    }
  });

  // Delete specific image from property
  app.delete("/api/properties/:propertyId/images/:imageUrl", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const propertyId = parseInt(req.params.propertyId);
      const imageUrl = decodeURIComponent(req.params.imageUrl);
      const user = req.user as any;

      // Get existing property
      const existingProperty = await dbStorage.getPropertyById(propertyId);
      if (!existingProperty) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check permissions
      if (user.role !== 'admin' && user.role !== 'owner' && existingProperty.createdBy !== user.id) {
        return res.status(403).json({ message: "Permission denied" });
      }

      // Remove image from file system
      try {
        const filePath = path.join(__dirname, "../public/uploads/", path.basename(imageUrl));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted image: ${filePath}`);
        }
      } catch (deleteError) {
        console.error("File deletion failed", deleteError);
      }

      // Update property photos array
      const currentPhotos = Array.isArray(existingProperty.photos) ? existingProperty.photos : [];
      const updatedPhotos = currentPhotos.filter(photo => photo !== imageUrl);

      const updatedProperty = await dbStorage.updateProperty(propertyId, {
        photos: updatedPhotos,
        updatedAt: new Date()
      });

      res.status(200).json({ success: true, property: updatedProperty });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  // Delete property
  app.delete("/api/properties/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const id = parseInt(req.params.id);
      const user = req.user as any;

      const existingProperty = await dbStorage.getPropertyById(id);
      if (!existingProperty) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check permissions
      if (user.role !== 'admin' && user.role !== 'owner' && existingProperty.createdBy !== user.id) {
        return res.status(403).json({ message: "Permission denied" });
      }

      const success = await dbStorage.deleteProperty(id);
      if (success) {
        res.json({ success: true, message: "Property deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete property" });
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Simple image upload
  app.post("/api/upload/images", upload.array('images', 20), async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const imageUrls = files.map(file => `/uploads/properties/${file.filename}`);
      res.json({ success: true, imageUrls });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ message: "Failed to upload images" });
    }
  });

  return createServer(app);
}
