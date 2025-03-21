import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { z } from "zod";
import { insertPropertySchema, insertTestimonialSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import path from "path";
import fs from "fs";

const searchFiltersSchema = z.object({
  location: z.string().optional(),
  propertyType: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minBedrooms: z.coerce.number().optional(),
  minBathrooms: z.coerce.number().optional(),
});

// Configure multer for file uploads
// Create uploads directory if it doesn't exist (directly in root for better accessibility)
const uploadsDir = path.join(process.cwd(), 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory at: ${uploadsDir}`);
}

const multerStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    // Determine which folder to use based on the file purpose
    const purpose = req.path.includes('property-images') ? 'properties' : 'logos';
    const targetDir = path.join(uploadsDir, purpose);
    
    // Create the target directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    // Get original extension or use a default
    let ext = path.extname(file.originalname);
    
    // Special handling for Adobe Illustrator files
    if (
      file.mimetype === 'application/postscript' || 
      file.mimetype === 'application/illustrator' || 
      ext.toLowerCase() === '.ai'
    ) {
      // Keep the AI extension for the file but store it properly
      console.log('Processing Adobe Illustrator file, preserving extension');
      // If no extension, add .ai as default for Illustrator files
      if (!ext) ext = '.ai';
    } else if (!ext) {
      // Default to jpg if no extension for all other files
      ext = '.jpg';
    }
    
    // Determine prefix based on file type
    const prefix = req.path.includes('property-images') ? 'property-' : 'logo-';
    
    // Create safe filename
    const filename = prefix + uniqueSuffix + ext;
    console.log(`Generated filename: ${filename} for original: ${file.originalname}`);
    
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: multerStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max file size
  fileFilter: (_req, file, cb) => {
    // Accept all file types but log for debugging
    console.log(`Received file: ${file.originalname}, mimetype: ${file.mimetype}`);
    
    // Support for Adobe Illustrator files - they may come with various MIME types
    // Common AI file MIME types: application/postscript, application/illustrator, application/pdf
    if (
      file.originalname.toLowerCase().endsWith('.ai') ||
      file.mimetype === 'application/postscript' ||
      file.mimetype === 'application/illustrator' ||
      file.mimetype === 'application/pdf'
    ) {
      console.log('Adobe Illustrator file detected, allowing upload');
    }
    
    cb(null, true);
  }
});

export async function registerRoutes(app: Express, customUpload?: any, customUploadsDir?: string): Promise<Server> {
  // Use either the provided upload and uploads directory or the defaults
  const finalUpload = customUpload || upload;
  const finalUploadsDir = customUploadsDir || uploadsDir;
  // API routes for properties
  app.get("/api/properties", async (req: Request, res: Response) => {
    try {
      const properties = await dbStorage.getAllProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/featured", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const properties = await dbStorage.getFeaturedProperties(limit);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured properties" });
    }
  });

  app.get("/api/properties/new", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const properties = await dbStorage.getNewListings(limit);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch new listings" });
    }
  });

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
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post("/api/properties", async (req: Request, res: Response) => {
    try {
      const propertyData = insertPropertySchema.parse(req.body);
      const property = await dbStorage.createProperty(propertyData);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to create property" });
      }
    }
  });

  app.put("/api/properties/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const propertyData = req.body;
      const property = await dbStorage.updateProperty(id, propertyData);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete("/api/properties/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const success = await dbStorage.deleteProperty(id);
      if (!success) {
        return res.status(404).json({ message: "Property not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  app.get("/api/properties/search", async (req: Request, res: Response) => {
    try {
      const filters = searchFiltersSchema.parse(req.query);
      const properties = await dbStorage.searchProperties(filters);
      res.json(properties);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to search properties" });
      }
    }
  });

  // API routes for testimonials
  app.get("/api/testimonials", async (_req: Request, res: Response) => {
    try {
      const testimonials = await dbStorage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  app.get("/api/testimonials/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid testimonial ID" });
      }

      const testimonial = await dbStorage.getTestimonialById(id);
      if (!testimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }

      res.json(testimonial);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch testimonial" });
    }
  });

  app.post("/api/testimonials", async (req: Request, res: Response) => {
    try {
      const testimonialData = insertTestimonialSchema.parse(req.body);
      const testimonial = await dbStorage.createTestimonial(testimonialData);
      res.status(201).json(testimonial);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to create testimonial" });
      }
    }
  });

  // API routes for site settings
  app.get("/api/site-settings", async (_req: Request, res: Response) => {
    try {
      const settings = await dbStorage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  app.patch("/api/site-settings", async (req: Request, res: Response) => {
    try {
      const updatedSettings = await dbStorage.updateSiteSettings(req.body);
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update site settings" });
    }
  });

  // Logo upload endpoint
  app.post("/api/upload/logo", finalUpload.single('logo'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log(`Logo file uploaded: ${req.file.filename} (${req.file.mimetype})`);
      
      // Create the file URL relative to the server
      const fileUrl = `/uploads/logos/${req.file.filename}`;
      
      // Update site settings with the new logo URL
      const updatedSettings = await dbStorage.updateSiteSettings({
        companyLogo: fileUrl
      });
      
      res.json({ 
        message: "Logo uploaded successfully", 
        logoUrl: fileUrl,
        settings: updatedSettings
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });
  
  // Property image upload endpoint - for multiple files
  app.post("/api/upload/property-images", finalUpload.array('images', 10), async (req: Request, res: Response) => {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      const files = Array.isArray(req.files) ? req.files : [req.files];
      console.log(`Uploaded ${files.length} property images`);
      
      // Create file URLs for all uploaded images
      const fileUrls = files.map(file => `/uploads/properties/${file.filename}`);
      
      res.json({ 
        message: "Property images uploaded successfully", 
        imageUrls: fileUrls,
        count: fileUrls.length
      });
    } catch (error) {
      console.error('Error uploading property images:', error);
      res.status(500).json({ message: "Failed to upload property images" });
    }
  });

  // Serve static files from uploads directory
  app.use('/uploads', (req, res, next) => {
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    next();
  }, express.static(finalUploadsDir));

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
