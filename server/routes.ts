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
// Use public directory for better accessibility from the client
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

// Ensure the uploads directory and subdirectories exist
const ensureDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Create main uploads directory and subdirectories
ensureDir(uploadsDir);
ensureDir(path.join(uploadsDir, 'logos'));
ensureDir(path.join(uploadsDir, 'properties'));

// Create a more permissive file filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept all file types for maximum compatibility
  console.log(`Processing file: ${file.originalname} (${file.mimetype})`);
  return cb(null, true);
};

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine which folder to use based on the file purpose
    const purpose = req.path.includes('property-images') ? 'properties' : 'logos';
    const targetDir = path.join(uploadsDir, purpose);
    
    console.log(`Storing file in: ${targetDir}`);
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    // Get original extension or use a default
    let ext = path.extname(file.originalname).toLowerCase();
    
    // If AI file or no extension, handle appropriately
    if (file.originalname.toLowerCase().endsWith('.ai') || 
        file.mimetype === 'application/postscript' || 
        file.mimetype === 'application/illustrator') {
      console.log(`Processing Adobe Illustrator file: ${file.originalname}`);
      ext = '.ai';
    } else if (!ext) {
      ext = '.jpg';
      console.log(`No extension detected, defaulting to ${ext}`);
    }
    
    // Create safe filename with appropriate prefix
    const prefix = req.path.includes('property-images') ? 'property-' : 'logo-';
    const filename = prefix + uniqueSuffix + ext;
    
    console.log(`Generated filename: ${filename}`);
    cb(null, filename);
  }
});

// Create multer configuration with size restrictions for better performance
const upload = multer({
  storage: multerStorage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB max file size for better performance
    files: 10                    // Up to 10 files at once
  }
});

// Separate configuration for logo uploads (smaller size limit)
const logoUpload = multer({
  storage: multerStorage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 2 * 1024 * 1024,  // 2MB max for logos
    files: 1                     // Only one logo at a time
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
  app.post("/api/upload/logo", async (req: Request, res: Response) => {
    try {
      console.log("Received logo upload request");
      
      // Use the logo-specific upload configuration with smaller file size limit
      logoUpload.single('logo')(req, res, async (err: any) => {
        if (err) {
          console.error("Multer error during logo upload:", err);
          return res.status(400).json({ message: "File upload error: " + err.message });
        }
        
        console.log("Request body:", Object.keys(req.body || {}));
        console.log("Request file:", req.file ? `File present: ${req.file.originalname}` : "No file present");
        
        if (!req.file) {
          console.log("File upload failed - No file received");
          return res.status(400).json({ message: "No file uploaded" });
        }

        console.log(`Logo file uploaded: ${req.file.filename} (${req.file.mimetype}), original: ${req.file.originalname}`);
        
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
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });
  
  // Property image upload endpoint - for multiple files
  app.post("/api/upload/property-images", async (req: Request, res: Response) => {
    try {
      console.log("Received property images upload request");
      
      // Use array upload but catch any errors
      finalUpload.array('images', 10)(req, res, async (err: any) => {
        if (err) {
          console.error("Multer error during property images upload:", err);
          return res.status(400).json({ message: "File upload error: " + err.message });
        }
        
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
          console.log("No property image files received");
          return res.status(400).json({ message: "No files uploaded" });
        }
        
        const files = Array.isArray(req.files) ? req.files : [req.files];
        console.log(`Uploaded ${files.length} property images`);
        
        // Log detailed file information
        files.forEach((file, index) => {
          console.log(`File ${index + 1}: ${file.originalname} (${file.mimetype}) -> ${file.filename}`);
        });
        
        // Create file URLs for all uploaded images
        const fileUrls = files.map(file => `/uploads/properties/${file.filename}`);
        
        res.json({ 
          message: "Property images uploaded successfully", 
          imageUrls: fileUrls,
          count: fileUrls.length
        });
      });
    } catch (error) {
      console.error('Error uploading property images:', error);
      res.status(500).json({ message: "Failed to upload property images" });
    }
  });

  // Serve static files from public/uploads directory
  app.use('/uploads', (req, res, next) => {
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    next();
  }, express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
