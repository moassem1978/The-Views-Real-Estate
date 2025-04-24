import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { z } from "zod";
import { insertPropertySchema, insertTestimonialSchema, insertAnnouncementSchema, insertProjectSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import path from "path";
import fs from "fs";
import util from "util";
import { setupAuth } from "./auth";

const searchFiltersSchema = z.object({
  location: z.string().optional(),
  propertyType: z.string().optional(),
  listingType: z.string().optional(),
  projectName: z.string().optional(),
  developerName: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minBedrooms: z.coerce.number().optional(),
  minBathrooms: z.coerce.number().optional(),
  isFullCash: z.coerce.boolean().optional(),
  hasInstallments: z.coerce.boolean().optional(),
  international: z.coerce.boolean().optional(),
});

// Configure multer for file uploads
// Use public directory for better accessibility from the client
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

// Ensure the uploads directory and subdirectories exist with proper permissions
const ensureDir = (dirPath: string) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true, mode: 0o777 });
      console.log(`Created directory with full permissions: ${dirPath}`);
    } else {
      // Update permissions on existing directory
      fs.chmodSync(dirPath, 0o777);
      console.log(`Updated permissions for existing directory: ${dirPath}`);
    }
  } catch (err) {
    console.error(`Error creating or updating directory ${dirPath}:`, err);
  }
};

// Also ensure the secondary uploads directory exists (for fallback compatibility)
const secondaryUploadsDir = path.join(process.cwd(), 'uploads');
ensureDir(secondaryUploadsDir);
ensureDir(path.join(secondaryUploadsDir, 'properties'));

// Create main uploads directory and subdirectories
ensureDir(uploadsDir);
ensureDir(path.join(uploadsDir, 'logos'));
ensureDir(path.join(uploadsDir, 'properties'));
ensureDir(path.join(uploadsDir, 'announcements'));
ensureDir(path.join(uploadsDir, 'projects'));

// Create a more permissive file filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept all file types for maximum compatibility
  console.log(`Processing file: ${file.originalname} (${file.mimetype})`);
  return cb(null, true);
};

const multerStorage = multer.memoryStorage();

// Define the disk storage configuration
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = uploadsDir;
    
    // Determine the correct subfolder based on upload type
    if (req.path.includes('/api/upload/logo')) {
      uploadPath = path.join(uploadsDir, 'logos');
    } else if (req.path.includes('/api/upload/property-images')) {
      uploadPath = path.join(uploadsDir, 'properties');
    } else if (req.path.includes('/api/upload/announcement-image')) {
      uploadPath = path.join(uploadsDir, 'announcements');
    } else if (req.path.includes('/api/upload/project-images')) {
      uploadPath = path.join(uploadsDir, 'projects');
    }
    
    // Make sure the directory exists with proper permissions
    try {
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true, mode: 0o777 });
        console.log(`Created upload directory with full permissions: ${uploadPath}`);
      } else {
        // Update permissions on existing directory
        fs.chmodSync(uploadPath, 0o777);
        console.log(`Updated permissions for existing upload directory: ${uploadPath}`);
      }
    } catch (err) {
      console.error(`Failed to create or update upload directory ${uploadPath}:`, err);
    }
    
    // Also create the same directory in the secondary location for compatibility
    try {
      const secondaryPath = uploadPath.replace(/^.*?public/, 'uploads');
      if (!fs.existsSync(secondaryPath)) {
        fs.mkdirSync(secondaryPath, { recursive: true, mode: 0o777 });
        console.log(`Created secondary upload directory: ${secondaryPath}`);
      }
    } catch (err) {
      console.error(`Failed to create secondary upload directory:`, err);
    }
    
    console.log(`Uploading to directory: ${uploadPath}`);
    cb(null, uploadPath);
  },
  
  filename: function (req, file, cb) {
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

    // Fixed naming convention for all images
    // For property-images endpoint, use 'images-{timestamp}-{random}.ext'
    // This matches the format that's currently being used in the database
    let filename;
    if (req.path.includes('property-images')) {
      filename = 'images-' + uniqueSuffix + ext;
    } else if (req.path.includes('announcement-image')) {
      filename = 'announcement-' + uniqueSuffix + ext;
    } else if (req.path.includes('project-images')) {
      filename = 'project-' + uniqueSuffix + ext;
    } else {
      filename = 'logo-' + uniqueSuffix + ext;
    }

    console.log(`Generated filename: ${filename}`);
    cb(null, filename);
  }
});

// Create multer configuration optimized for property uploads
const upload = multer({
  storage: diskStorage, // Use disk storage instead of memory for larger files
  fileFilter: fileFilter,
  limits: { 
    fileSize: 15 * 1024 * 1024, // 15MB max file size to accommodate high-quality images
    files: 10                   // Up to 10 files at once
  }
});

// Separate configuration for logo uploads (smaller size limit)
const logoUpload = multer({
  storage: diskStorage, // Changed to diskStorage for consistency
  fileFilter: fileFilter,
  limits: { 
    fileSize: 2 * 1024 * 1024,  // 2MB max for logos
    files: 1                     // Only one logo at a time
  }
});

export async function registerRoutes(app: Express, customUpload?: any, customUploadsDir?: string): Promise<Server> {
  // Set up authentication routes and middleware
  setupAuth(app);
  
  // Use either the provided upload and uploads directory or the defaults
  const finalUpload = customUpload || upload;
  const finalUploadsDir = customUploadsDir || uploadsDir;
  // API routes for properties
  app.get("/api/properties", async (req: Request, res: Response) => {
    try {
      // Extract pagination parameters from query
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 24;
      
      // Get paginated properties
      // Don't filter by user for admin and owner roles
      if (req.isAuthenticated()) {
        const user = req.user as Express.User;
        console.log(`Authenticated user ${user.username} with role ${user.role} accessing property list`);
        
        // Admin and owner can see all properties
        // Regular users only see their own or published properties
        if (user.role === 'admin' || user.role === 'owner') {
          console.log('Admin/owner access - showing all properties');
          const result = await dbStorage.getAllProperties(page, pageSize);
          return res.json(result);
        }
      }
      
      // Default behavior (non-authenticated users or regular users)
      const result = await dbStorage.getAllProperties(page, pageSize);
      res.json(result);
    } catch (error) {
      console.error('Error fetching properties:', error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Get a list of unique project names for dropdown selection
  app.get("/api/properties/project-names", async (_req: Request, res: Response) => {
    try {
      const projectNames = await dbStorage.getUniqueProjectNames();
      console.log(`Returning ${projectNames.length} unique project names`);
      res.json(projectNames);
    } catch (error) {
      console.error("Error fetching project names:", error);
      res.status(500).json({ message: "Failed to fetch project names" });
    }
  });
  
  // New endpoint to get unique cities (locations)
  app.get("/api/properties/unique-cities", async (_req: Request, res: Response) => {
    try {
      const cities = await dbStorage.getUniqueCities();
      console.log(`Returning ${cities.length} unique cities`);
      res.json(cities);
    } catch (error) {
      console.error("Error fetching unique cities:", error);
      res.status(500).json({ message: "Failed to fetch unique cities" });
    }
  });

  app.get("/api/properties/featured", async (req: Request, res: Response) => {
    try {
      // Get pagination parameters if provided, otherwise use defaults
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 24;
      
      // Get paginated featured properties
      const result = await dbStorage.getFeaturedProperties(limit, page, pageSize);
      res.json(result);
    } catch (error) {
      console.error("Error fetching featured properties:", error);
      res.status(500).json({ message: "Failed to fetch featured properties" });
    }
  });

  app.get("/api/properties/highlighted", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const properties = await dbStorage.getHighlightedProperties(limit);
      console.log(`DEBUG: Found ${properties.length} highlighted properties`);
      // Log more details about highlighted properties
      properties.forEach(prop => {
        console.log(`DEBUG: Highlighted property: ID ${prop.id}, Title: ${prop.title}, isHighlighted: ${prop.isHighlighted}`);
      });
      res.json(properties);
    } catch (error) {
      console.error("Error fetching highlighted properties:", error);
      res.status(500).json({ message: "Failed to fetch highlighted properties" });
    }
  });

  app.get("/api/properties/new", async (req: Request, res: Response) => {
    try {
      // Get pagination parameters if provided, otherwise use defaults
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 24;
      
      // Get paginated new listings
      const result = await dbStorage.getNewListings(limit, page, pageSize);
      res.json(result);
    } catch (error) {
      console.error("Error fetching new listings:", error);
      res.status(500).json({ message: "Failed to fetch new listings" });
    }
  });
  
  // New endpoint for international properties
  app.get("/api/properties/international", async (req: Request, res: Response) => {
    try {
      // Get pagination parameters if provided, otherwise use defaults
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 24;
      
      // Search with international filter set to true
      const result = await dbStorage.searchProperties({ international: true }, page, pageSize);
      res.json(result);
    } catch (error) {
      console.error("Error fetching international properties:", error);
      res.status(500).json({ message: "Failed to fetch international properties" });
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
      // First check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Property creation failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required to create properties" });
      }
      
      // Get the authenticated user from request
      const user = req.user as Express.User;
      console.log(`User attempting to create property: ${user.username} (Role: ${user.role})`);
      
      // All authenticated users can create properties
      // Logging only a subset of data to prevent polluting logs
      console.log("Creating property with title:", req.body.title);
      console.log("Property type:", req.body.propertyType);
      console.log("City:", req.body.city);
      console.log("Image count:", Array.isArray(req.body.images) ? req.body.images.length : 'unknown');
      
      // Add zipCode from city if not provided
      if (!req.body.zipCode && req.body.city) {
        console.log("No zipCode provided, using default based on city");
        // Default zipCodes for common cities
        const defaultZipCodes: Record<string, string> = {
          'Cairo': '11511',
          'Dubai': '00000',
          'London': 'SW1A 1AA',
          'Sheikh Zayed': '12311',
          'North coast': '23511',
          'Gouna': '84513',
          'Red Sea': '84712'
        };
        
        const cityName = req.body.city as string;
        req.body.zipCode = (defaultZipCodes[cityName] || '00000');
        console.log(`Using zipCode: ${req.body.zipCode} for city: ${cityName}`);
      }
      
      // Ensure required fields are present (including zipCode now)
      const requiredFields = ['title', 'description', 'price', 'propertyType', 'city', 'zipCode', 'images', 'bedrooms', 'bathrooms', 'builtUpArea'];
      const missingFields = requiredFields.filter(field => {
        // Check if field is missing or empty
        const value = req.body[field];
        return value === undefined || value === null || (Array.isArray(value) && value.length === 0) || value === '';
      });
      
      if (missingFields.length > 0) {
        console.error(`Property creation failed: Missing required fields: ${missingFields.join(', ')}`);
        return res.status(400).json({
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Handle amenities if empty
      if (!req.body.amenities) {
        req.body.amenities = [];
      }

      // Format images field if it's a comma-separated string
      if (typeof req.body.images === 'string') {
        try {
          console.log("Converting images string to array");
          req.body.images = req.body.images.split(',').map((url: string) => url.trim()).filter((url: string) => url.length > 0);
          console.log(`Processed ${req.body.images.length} image URLs`);
        } catch (error) {
          console.error("Error parsing images string:", error);
        }
      }
      
      // Make sure numeric fields are actually numbers
      ['price', 'bedrooms', 'bathrooms', 'builtUpArea', 'plotSize', 'gardenSize', 'floor', 'yearBuilt', 'agentId'].forEach(field => {
        if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== '') {
          const val = parseFloat(req.body[field]);
          if (!isNaN(val)) {
            req.body[field] = val;
          }
        }
      });
      
      // Convert boolean fields if they're strings
      ['isFullCash', 'isGroundUnit', 'isFeatured', 'isNewListing', 'isHighlighted'].forEach(field => {
        if (typeof req.body[field] === 'string') {
          req.body[field] = req.body[field].toLowerCase() === 'true';
        }
      });

      let propertyData;
      try {
        propertyData = insertPropertySchema.parse(req.body);
        console.log("Property data validation succeeded");
      } catch (parseError) {
        console.error("Property data validation failed:", parseError);
        return res.status(400).json({
          message: "Invalid property data. Please check all required fields.",
          details: parseError instanceof Error ? parseError.message : String(parseError)
        });
      }
      
      // Add createdBy field and status
      const propertyWithUser = {
        ...propertyData,
        createdBy: user.id,
        status: 'published', // Admin properties are published immediately
        createdAt: new Date().toISOString()
      };
      
      // Log property data just before creation
      console.log("Attempting to create property with final data:", JSON.stringify({
        title: propertyWithUser.title,
        city: propertyWithUser.city,
        images: Array.isArray(propertyWithUser.images) ? 
          `${propertyWithUser.images.length} images` : 
          propertyWithUser.images
      }));
      
      const property = await dbStorage.createProperty(propertyWithUser);
      
      // Log after DB operation success
      console.log("Property created successfully with ID:", property.id);
      
      res.status(201).json(property);
    } catch (error) {
      console.error("Error creating property:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error("Validation error details:", validationError);
        return res.status(400).json({ 
          message: "Validation error: Please check your property data and try again.",
          details: validationError.message 
        });
      } else {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Database or server error:", errorMessage);
        
        // More specific error messages
        if (errorMessage.includes("duplicate key")) {
          return res.status(400).json({ 
            message: "A property with this information already exists. Please modify your data." 
          });
        } else if (errorMessage.includes("foreign key")) {
          return res.status(400).json({ 
            message: "Invalid reference to another record (like agent ID). Please check your data." 
          });
        }
        
        return res.status(500).json({ 
          message: "Failed to create property. Please try again with different data." 
        });
      }
    }
  });

  app.put("/api/properties/:id", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Property update failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required to update properties" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      // Get the authenticated user from request
      const user = req.user as Express.User;
      console.log(`User attempting to update property ${id}: ${user.username} (Role: ${user.role})`);

      // Get the property to check ownership
      const existingProperty = await dbStorage.getPropertyById(id);
      if (!existingProperty) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check if user has permission to update this property
      // Owner and Admin can update any property
      // Regular users can only update their own properties
      if (user.role === 'user' && existingProperty.createdBy !== user.id) {
        console.error(`Permission denied: User ${user.username} attempted to update property ${id} created by user ${existingProperty.createdBy}`);
        return res.status(403).json({ message: "You do not have permission to update this property" });
      }

      const propertyData = req.body;
      
      // If a regular user updates a property, set status back to pending_approval
      if (user.role === 'user') {
        propertyData.status = 'pending_approval';
      }
      
      const property = await dbStorage.updateProperty(id, propertyData);

      res.json(property);
    } catch (error) {
      console.error("Error updating property:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: `Failed to update property: ${errorMessage}` });
    }
  });

  app.delete("/api/properties/:id", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Property deletion failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required to delete properties" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      // Get the authenticated user from request
      const user = req.user as Express.User;
      console.log(`User attempting to delete property ${id}: ${user.username} (Role: ${user.role})`);

      // Get the property to check ownership
      const existingProperty = await dbStorage.getPropertyById(id);
      if (!existingProperty) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check if user has permission to delete this property
      // Owner and Admin can delete any property
      // Regular users can only delete their own properties
      if (user.role === 'user' && existingProperty.createdBy !== user.id) {
        console.error(`Permission denied: User ${user.username} attempted to delete property ${id} created by user ${existingProperty.createdBy}`);
        return res.status(403).json({ message: "You do not have permission to delete this property" });
      }

      const success = await dbStorage.deleteProperty(id);
      if (!success) {
        return res.status(404).json({ message: "Property not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: `Failed to delete property: ${errorMessage}` });
    }
  });

  app.get("/api/properties/search", async (req: Request, res: Response) => {
    try {
      const filters = searchFiltersSchema.parse(req.query);
      
      // Get pagination parameters if provided, otherwise use defaults
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 24;
      
      // Get paginated search results
      const result = await dbStorage.searchProperties(filters, page, pageSize);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error searching properties:", error);
        res.status(500).json({ message: "Failed to search properties" });
      }
    }
  });

  // API routes for testimonials
  app.get("/api/testimonials", async (req: Request, res: Response) => {
    try {
      // Extract pagination parameters from query
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
      
      // Get paginated testimonials
      const result = await dbStorage.getAllTestimonials(page, pageSize);
      res.json(result);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
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
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Testimonial creation failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required to create testimonials" });
      }
      
      // Get the authenticated user from request
      const user = req.user as Express.User;
      console.log(`User attempting to create testimonial: ${user.username} (Role: ${user.role})`);
      
      // Only admins or owners can create testimonials directly
      // Regular users testimonials need approval (not implemented yet)
      if (user.role !== 'admin' && user.role !== 'owner') {
        console.error(`Permission denied: User ${user.username} with role ${user.role} attempted to create a testimonial`);
        return res.status(403).json({ message: "Only administrators and owners can create testimonials directly" });
      }
      
      const testimonialData = insertTestimonialSchema.parse(req.body);
      const testimonial = await dbStorage.createTestimonial(testimonialData);
      res.status(201).json(testimonial);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error("Validation error details:", validationError);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating testimonial:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: `Failed to create testimonial: ${errorMessage}` });
      }
    }
  });

  // API routes for announcements
  app.get("/api/announcements", async (req: Request, res: Response) => {
    try {
      // Extract pagination parameters from query
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
      
      // Get paginated announcements
      const result = await dbStorage.getAllAnnouncements(page, pageSize);
      res.json(result);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });
  
  app.get("/api/announcements/featured", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const announcements = await dbStorage.getFeaturedAnnouncements(limit);
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching featured announcements:", error);
      res.status(500).json({ message: "Failed to fetch featured announcements" });
    }
  });

  app.get("/api/announcements/highlighted", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const announcements = await dbStorage.getHighlightedAnnouncements(limit);
      console.log(`DEBUG: Found ${announcements.length} highlighted announcements`);
      // Log details about highlighted announcements
      announcements.forEach(ann => {
        console.log(`DEBUG: Highlighted announcement: ID ${ann.id}, Title: ${ann.title}, isHighlighted: ${ann.isHighlighted}`);
      });
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching highlighted announcements:", error);
      res.status(500).json({ message: "Failed to fetch highlighted announcements" });
    }
  });

  app.get("/api/announcements/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid announcement ID" });
      }
      
      const announcement = await dbStorage.getAnnouncementById(id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      res.json(announcement);
    } catch (error) {
      console.error("Error fetching announcement:", error);
      res.status(500).json({ message: "Failed to fetch announcement" });
    }
  });
  
  app.post("/api/announcements", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Announcement creation failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required to create announcements" });
      }
      
      // Get the authenticated user from request
      const user = req.user as Express.User;
      console.log(`User attempting to create announcement: ${user.username} (Role: ${user.role})`);
      
      // Create a modified schema that accepts string dates
      const modifiedAnnouncementSchema = insertAnnouncementSchema
        .extend({
          startDate: z.string().transform(val => new Date(val)),
          endDate: z.string().optional().transform(val => val ? new Date(val) : null),
        });
        
      // Parse with our modified schema
      const announcementData = modifiedAnnouncementSchema.parse(req.body);
      
      // Add metadata about who created this announcement
      const announcementWithUser = {
        ...announcementData,
        createdBy: user.id,
        // Regular users' announcements start as pending approval
        status: user.role === 'user' ? 'pending_approval' : 'published'
      };
      
      const announcement = await dbStorage.createAnnouncement(announcementWithUser);
      res.status(201).json(announcement);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error("Validation error details:", validationError);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating announcement:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({ message: `Failed to create announcement: ${errorMessage}` });
      }
    }
  });
  
  app.put("/api/announcements/:id", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Announcement update failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required to update announcements" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid announcement ID" });
      }
      
      // Get the authenticated user from request
      const user = req.user as Express.User;
      console.log(`User attempting to update announcement ${id}: ${user.username} (Role: ${user.role})`);
      
      // Check if announcement exists
      const existingAnnouncement = await dbStorage.getAnnouncementById(id);
      if (!existingAnnouncement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      // Check if user has permission to update this announcement
      // Owner and Admin can update any announcement
      // Regular users can only update their own announcements
      if (user.role === 'user' && existingAnnouncement.createdBy !== user.id) {
        console.error(`Permission denied: User ${user.username} attempted to update announcement ${id} created by user ${existingAnnouncement.createdBy}`);
        return res.status(403).json({ message: "You do not have permission to update this announcement" });
      }
      
      // Handle date strings in the request body
      const updatedData = { ...req.body };
      if (typeof updatedData.startDate === 'string') {
        updatedData.startDate = new Date(updatedData.startDate);
      }
      if (typeof updatedData.endDate === 'string') {
        updatedData.endDate = updatedData.endDate ? new Date(updatedData.endDate) : null;
      }
      
      // Remove createdAt from update data to avoid conversion issues
      if (updatedData.createdAt) {
        delete updatedData.createdAt;
      }
      
      // If a regular user updates an announcement, set status back to pending_approval
      if (user.role === 'user') {
        updatedData.status = 'pending_approval';
      }
      
      // Update the announcement
      const updatedAnnouncement = await dbStorage.updateAnnouncement(id, updatedData);
      res.json(updatedAnnouncement);
    } catch (error) {
      console.error("Error updating announcement:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Failed to update announcement: ${errorMessage}` });
    }
  });
  
  app.delete("/api/announcements/:id", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Announcement deletion failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required to delete announcements" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid announcement ID" });
      }
      
      // Get the authenticated user from request
      const user = req.user as Express.User;
      console.log(`User attempting to delete announcement ${id}: ${user.username} (Role: ${user.role})`);
      
      // Check if announcement exists
      const existingAnnouncement = await dbStorage.getAnnouncementById(id);
      if (!existingAnnouncement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      // Check if user has permission to delete this announcement
      // Owner and Admin can delete any announcement
      // Regular users can only delete their own announcements
      if (user.role === 'user' && existingAnnouncement.createdBy !== user.id) {
        console.error(`Permission denied: User ${user.username} attempted to delete announcement ${id} created by user ${existingAnnouncement.createdBy}`);
        return res.status(403).json({ message: "You do not have permission to delete this announcement" });
      }
      
      // Delete the announcement
      const success = await dbStorage.deleteAnnouncement(id);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete announcement" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Failed to delete announcement: ${errorMessage}` });
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
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Site settings update failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required to update site settings" });
      }
      
      // Get the authenticated user from request
      const user = req.user as Express.User;
      console.log(`User attempting to update site settings: ${user.username} (Role: ${user.role})`);
      
      // Only admin and owner can update site settings
      if (user.role !== 'admin' && user.role !== 'owner') {
        console.error(`Permission denied: User ${user.username} with role ${user.role} attempted to update site settings`);
        return res.status(403).json({ message: "Only administrators and owners can update site settings" });
      }
      
      const updatedSettings = await dbStorage.updateSiteSettings(req.body);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating site settings:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Failed to update site settings: ${errorMessage}` });
    }
  });

  // Logo upload endpoint with improved error handling and logging
  app.post("/api/upload/logo", logoUpload.single('logo'), async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Logo upload failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required to upload logo" });
      }
      
      // Get the authenticated user from request
      const user = req.user as Express.User;
      console.log(`User attempting to upload logo: ${user.username} (Role: ${user.role})`);
      
      // Only admin and owner can upload a logo
      if (user.role !== 'admin' && user.role !== 'owner') {
        console.error(`Permission denied: User ${user.username} with role ${user.role} attempted to upload logo`);
        return res.status(403).json({ message: "Only administrators and owners can update the company logo" });
      }
      
      console.log("Received logo upload request");
      console.log("Request file:", req.file ? `File present: ${req.file.originalname}, mimetype: ${req.file.mimetype}, size: ${req.file.size}` : "No file present");

      if (!req.file) {
        console.error("File upload failed - No file received");
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log(`Logo file uploaded: ${req.file.filename} (${req.file.mimetype}), original: ${req.file.originalname}, size: ${req.file.size}`);

      // Ensure the logo file is also copied to the public/uploads directory for web access
      try {
        const sourcePath = req.file.path;
        const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'logos');

        // Create the destination directory if it doesn't exist
        fs.mkdirSync(publicUploadsDir, { recursive: true });

        const destPath = path.join(publicUploadsDir, req.file.filename);

        // Copy the file to public/uploads/logos
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied logo file to ${destPath} for web access`);
      } catch (err) {
        console.error(`Error copying logo file to public directory: ${err}`);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ message: `Error copying logo file: ${errorMessage}` });
      }

      // Create the file URL relative to the server
      const fileUrl = `/uploads/logos/${req.file.filename}`;
      
      // Also ensure the file is properly saved to disk from memory storage
      try {
        // Ensure the destination directory exists
        const publicDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true, mode: 0o777 });
          console.log(`Created directory: ${publicDir}`);
        }
        
        // Write the file to disk from buffer in memory storage
        if (req.file.buffer) {
          const destPath = path.join(publicDir, req.file.filename);
          fs.writeFileSync(destPath, req.file.buffer);
          console.log(`Wrote file from buffer to ${destPath}`);
        }
      } catch (writeErr) {
        console.error(`Error writing file from buffer:`, writeErr);
      }

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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Failed to upload logo: ${errorMessage}` });
    }
  });

  // Announcement image upload endpoint
  app.post("/api/upload/announcement-image", finalUpload.single('image'), async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Announcement image upload failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required to upload announcement images" });
      }
      
      // Get the authenticated user from request
      const user = req.user as Express.User;
      console.log(`User attempting to upload announcement image: ${user.username} (Role: ${user.role})`);
      
      console.log("Received announcement image upload request");
      console.log("Request file:", req.file ? `File present: ${req.file.originalname}, mimetype: ${req.file.mimetype}, size: ${req.file.size}` : "No file present");

      if (!req.file) {
        console.error("File upload failed - No file received");
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log(`Announcement image uploaded: ${req.file.filename} (${req.file.mimetype}), original: ${req.file.originalname}, size: ${req.file.size}`);

      // Ensure the file is copied to the public/uploads directory for web access
      try {
        const sourcePath = req.file.path;
        const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'announcements');

        // Create the destination directory if it doesn't exist
        fs.mkdirSync(publicUploadsDir, { recursive: true });

        const destPath = path.join(publicUploadsDir, req.file.filename);

        // Copy the file to public/uploads/announcements
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied file to ${destPath} for web access`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Error copying announcement image to public directory: ${err}`);
        return res.status(500).json({ message: `Error copying announcement image: ${errorMessage}` });
      }

      // Create the file URL relative to the server
      const fileUrl = `/uploads/announcements/${req.file.filename}`;
      
      // Also ensure the file is properly saved to disk from memory storage if needed
      try {
        // Check if we need to manually save from buffer (in case of memory storage)
        if (req.file.buffer) {
          const destPath = path.join(process.cwd(), 'public', 'uploads', 'announcements', req.file.filename);
          fs.writeFileSync(destPath, req.file.buffer);
          console.log(`Wrote file from buffer to ${destPath}`);
        }
      } catch (writeErr) {
        console.error(`Error writing file from buffer:`, writeErr);
      }

      res.json({ 
        message: "Announcement image uploaded successfully", 
        imageUrl: fileUrl
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error uploading announcement image:', error);
      res.status(500).json({ message: `Failed to upload announcement image: ${errorMessage}` });
    }
  });

  app.post("/api/upload/property-images", finalUpload.array('images', 10), async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Property images upload failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required to upload property images" });
      }
      
      // Get the authenticated user from request
      const user = req.user as Express.User;
      console.log(`User attempting to upload property images: ${user.username} (Role: ${user.role})`);
      
      console.log("Received property images upload request");
      
      // Log session information to help debug session timeouts
      if (req.session) {
        console.log(`Session ID: ${req.sessionID}`);
        console.log(`Session cookie maxAge: ${req.session.cookie.maxAge}`);
        console.log(`Session expires: ${req.session.cookie.expires ? new Date(req.session.cookie.expires).toISOString() : 'N/A'}`);
      }

      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        console.log("No property image files received");
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      console.log(`Received ${Array.isArray(req.files) ? req.files.length : 0} files for upload`);
      
      // Use the Express.Multer.File type to correctly handle files
      const files = Array.isArray(req.files) 
        ? req.files as Express.Multer.File[]
        : [req.files as unknown as Express.Multer.File];

      // Ensure the property uploads directory exists with proper permissions
      const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
      fs.mkdirSync(publicUploadsDir, { recursive: true, mode: 0o777 });
      console.log(`Ensured uploads directory exists: ${publicUploadsDir}`);
      
      // A much simpler and more direct approach for saving files
      const fileUrls: string[] = [];
      
      for (const file of files) {
        try {
          console.log(`Processing file: ${file.originalname}, size: ${(file.size / 1024).toFixed(2)}KB`);
          
          const destPath = path.join(publicUploadsDir, file.filename);
          
          // Direct approach: if we have a buffer, write it to the destination
          if (file.buffer) {
            fs.writeFileSync(destPath, file.buffer);
            console.log(`Wrote file directly from buffer to ${destPath}`);
          } 
          // If we have the file.path, copy it to the destination
          else if (file.path && fs.existsSync(file.path)) {
            fs.copyFileSync(file.path, destPath);
            console.log(`Copied file from ${file.path} to ${destPath}`);
          }
          // Double-check that the file exists at the expected location
          else if (!fs.existsSync(destPath)) {
            console.error(`File not found at ${destPath}, trying to recover`);
            
            // Check if the file exists in the temp upload location
            const tempPath = path.join(process.cwd(), 'uploads', 'properties', file.filename);
            if (fs.existsSync(tempPath)) {
              fs.copyFileSync(tempPath, destPath);
              console.log(`Recovered file from ${tempPath} to ${destPath}`);
            } else {
              console.error(`File not found in any location, cannot recover`);
            }
          }
          
          // Verify file was successfully saved
          if (fs.existsSync(destPath)) {
            console.log(`File successfully saved at ${destPath}`);
            
            // Get file stats to verify
            const stats = fs.statSync(destPath);
            console.log(`File size on disk: ${stats.size} bytes`);
            
            // Add URL to results
            const fileUrl = `/uploads/properties/${file.filename}`;
            fileUrls.push(fileUrl);
          } else {
            console.error(`Failed to save file ${file.originalname}`);
            throw new Error(`Failed to save file ${file.originalname}`);
          }
          
          // Touch the session to keep it alive
          if (req.session) {
            req.session.touch();
          }
        } catch (fileError) {
          console.error(`Error processing file ${file.originalname}:`, fileError);
          return res.status(500).json({ 
            message: `Error processing file ${file.originalname}`,
            error: fileError instanceof Error ? fileError.message : 'Unknown error'
          });
        }
      }

      if (fileUrls.length === 0) {
        return res.status(500).json({ message: "No files were successfully processed" });
      }

      console.log(`Successfully processed ${fileUrls.length} images. Returning URLs to client.`);
      
      res.json({ 
        message: "Property images uploaded successfully", 
        imageUrls: fileUrls,
        count: fileUrls.length
      });
    } catch (error) {
      console.error('Error uploading property images:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Failed to upload property images: ${errorMessage}` });
    }
  });
  
  // Create a completely new property image upload endpoint with enhanced error handling
  app.post("/api/upload/property-images-new", async (req: Request, res: Response) => {
    console.log("==== NEW PROPERTY IMAGE UPLOAD ENDPOINT CALLED ====");
    
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Property images upload failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = req.user as Express.User;
      console.log(`User ${user.username} (${user.role}) attempting property image upload with new endpoint`);
      
      // Create a new multer instance with more generous limits
      const singleUpload = multer({
        storage: multer.diskStorage({
          destination: function(req, file, cb) {
            // Ensure the directory exists
            const dir = path.join(process.cwd(), 'public', 'uploads', 'properties');
            console.log(`Ensuring directory exists: ${dir}`);
            fs.mkdirSync(dir, { recursive: true });
            // Set permissions to ensure writability
            try {
              fs.chmodSync(dir, 0o777);
              console.log(`Updated permissions for ${dir}`);
            } catch (err) {
              console.error(`Failed to update permissions for ${dir}:`, err);
            }
            cb(null, dir);
          },
          filename: function(req, file, cb) {
            // Create a safe filename with timestamp
            const timestamp = Date.now();
            const fileExt = path.extname(file.originalname) || '.jpg';
            const baseName = path.basename(file.originalname, fileExt)
              .replace(/[^a-zA-Z0-9]/g, '_')
              .substring(0, 40); // Limit filename length
            const finalName = `${baseName}_${timestamp}${fileExt}`;
            console.log(`Generated filename: ${finalName} for original: ${file.originalname}`);
            cb(null, finalName);
          }
        }),
        limits: { 
          fileSize: 25 * 1024 * 1024, // 25MB limit per file
          files: 20 // Allow up to 20 files
        },
        fileFilter: (req, file, cb) => {
          // Accept only common image formats
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
          if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            console.log(`Rejected file ${file.originalname} with mime type ${file.mimetype}`);
            cb(null, false);
            // Don't throw error here, just skip this file
          }
        }
      }).array('images', 20); // Process up to 20 files
      
      // Handle the upload using a promise
      const uploadPromise = new Promise<{fileUrls: string[], count: number}>((resolve, reject) => {
        singleUpload(req, res, function(err) {
          if (err) {
            console.error('Multer upload error:', err);
            return reject(err);
          }
          
          console.log("Multer upload processing complete");
          
          // Check if files exist
          if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            console.error('No files in request');
            return reject(new Error("No files uploaded"));
          }
          
          // Safely handle the files array - typescript doesn't fully recognize multer's type here
          const uploadedFiles = req.files as Express.Multer.File[];
          console.log(`Processing ${uploadedFiles.length} uploaded files`);
          
          try {
            const fileUrls = uploadedFiles.map(file => {
              console.log(`File processed: ${file.originalname} -> ${file.filename} (${Math.round(file.size/1024)}KB)`);
              return `/uploads/properties/${file.filename}`;
            });
            
            // Return success response
            console.log(`Upload complete. Returning ${fileUrls.length} URLs`);
            resolve({
              fileUrls: fileUrls,
              count: fileUrls.length
            });
          } catch (processError) {
            console.error('Error processing files after upload:', processError);
            reject(processError);
          }
        });
      });
      
      // Wait for upload to complete and send response
      const result = await uploadPromise;
      return res.status(200).json({
        success: true,
        message: "Images uploaded successfully",
        imageUrls: result.fileUrls,
        count: result.count
      });
      
    } catch (error) {
      console.error('Error in property images upload endpoint:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to upload images. Please try again with smaller files or different formats.",
        error: errorMessage
      });
    }
  });
  
  // Keep the existing endpoint for backward compatibility
  app.post("/api/upload/property-images-simple", finalUpload.array('images', 10), async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Simple property images upload failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = req.user as Express.User;
      console.log(`User ${user.username} (${user.role}) attempting simple property image upload`);
      
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      // Use proper type for multer files
      const uploadedFiles = req.files as Express.Multer.File[];
      console.log(`Simple upload: Processing ${uploadedFiles.length} files`);

      // Create output directory
      const outputDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
      fs.mkdirSync(outputDir, { recursive: true });
      
      const fileUrls: string[] = [];
      
      for (const file of uploadedFiles) {
        // Generate a unique filename with timestamp
        const timestamp = Date.now();
        const fileExt = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, fileExt).replace(/[^a-zA-Z0-9]/g, '_');
        const newFilename = `${baseName}_${timestamp}${fileExt}`;
        
        // Save to public/uploads/properties
        const outputPath = path.join(outputDir, newFilename);
        
        console.log(`Processing file ${file.originalname}:
          - Size: ${file.size}
          - MIME Type: ${file.mimetype}
          - Has buffer: ${!!file.buffer}
          - Has path: ${!!file.path}
          - Output path: ${outputPath}
        `);
        
        // Write file to disk - handle buffer properly
        if (file.buffer && Buffer.isBuffer(file.buffer)) {
          fs.writeFileSync(outputPath, file.buffer);
          console.log(`Simple upload: Saved ${newFilename} from buffer`);
        } else if (file.path && fs.existsSync(file.path)) {
          // If we have a path instead of buffer, copy the file
          fs.copyFileSync(file.path, outputPath);
          console.log(`Simple upload: Copied from ${file.path} to ${outputPath}`);
        } else {
          throw new Error(`Cannot save file ${file.originalname}: No valid buffer or path`);
        }
        
        // Add URL to result
        fileUrls.push(`/uploads/properties/${newFilename}`);
      }
      
      console.log(`Simple upload: Successfully processed ${fileUrls.length} files`);
      res.json({ 
        message: "Images uploaded successfully", 
        imageUrls: fileUrls
      });
    } catch (error) {
      console.error('Simple upload error:', error);
      res.status(500).json({ 
        message: "Upload failed", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Primary uploads serving - from public/uploads directory
  app.use('/uploads', (req, res, next) => {
    // Logging to track static file requests for debugging
    console.log(`Static file request: ${req.url}`);
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    next();
  }, express.static(path.join(process.cwd(), 'public', 'uploads')));
  
  // Secondary uploads serving - fallback for direct uploads directory
  app.use('/uploads', (req, res, next) => {
    // Only reach here if the file wasn't found in public/uploads
    console.log(`Fallback static file request: ${req.url}`);
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    next();
  }, express.static(path.join(process.cwd(), 'uploads')));
  
  // Special bypass endpoint - NO AUTHENTICATION, write directly to disk
  app.post('/api/upload/bypass', async (req: Request, res: Response) => {
    try {
      console.log("==== BYPASS UPLOAD ENDPOINT ACCESSED ====");
      console.log("Content-Type:", req.headers['content-type']);
      console.log("Accept:", req.headers['accept']);
      
      // Create upload directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
        console.log(`Created upload directory: ${uploadDir}`);
      }
      
      // Force directory permissions
      fs.chmodSync(uploadDir, 0o777);
      
      // Create a basic upload handler with minimal options
      const basicUpload = multer({
        dest: uploadDir,
        limits: { fileSize: 25 * 1024 * 1024 } // 25MB
      }).array('files', 10);
      
      // Process the upload
      basicUpload(req, res, function(err) {
        if (err) {
          console.error("Basic upload error:", err);
          
          // Check if this is a direct form submission
          const wantsHtml = req.headers['accept']?.includes('text/html');
          
          if (wantsHtml) {
            // Check referer to determine which uploader was used
            const referer = req.headers['referer'] || '';
            let backLink = '/basic-uploader.html';
            
            if (referer.includes('windows-uploader.html')) {
              backLink = '/windows-uploader.html';
            } else if (referer.includes('cross-platform-uploader.html')) {
              backLink = '/cross-platform-uploader.html';
            }
            
            return res.status(500).send(`
              <html><head><title>Upload Error</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 30px; line-height: 1.6; }
                .error { color: red; background: #ffebee; padding: 15px; border-radius: 4px; }
                a { color: #964B00; text-decoration: none; }
                a:hover { text-decoration: underline; }
                h1 { color: #964B00; }
              </style>
              </head><body>
                <h1>Upload Error</h1>
                <p class="error">${err.message}</p>
                <p><a href="${backLink}">← Back to uploader</a></p>
              </body></html>
            `);
          } else {
            return res.status(500).json({
              success: false,
              message: "Upload failed with error",
              error: err.message
            });
          }
        }
        
        // Check if we have files
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
          console.log("No files found in bypass upload request");
          
          // Check if this is a direct form submission
          const wantsHtml = req.headers['accept']?.includes('text/html');
          
          if (wantsHtml) {
            // Check referer to determine which uploader was used
            const referer = req.headers['referer'] || '';
            let backLink = '/basic-uploader.html';
            
            if (referer.includes('windows-uploader.html')) {
              backLink = '/windows-uploader.html';
            } else if (referer.includes('cross-platform-uploader.html')) {
              backLink = '/cross-platform-uploader.html';
            }
            
            return res.status(400).send(`
              <html><head><title>Upload Error</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 30px; line-height: 1.6; }
                .error { color: red; background: #ffebee; padding: 15px; border-radius: 4px; }
                a { color: #964B00; text-decoration: none; }
                a:hover { text-decoration: underline; }
                h1 { color: #964B00; }
              </style>
              </head><body>
                <h1>Upload Error</h1>
                <p class="error">No files were received. Please select at least one file.</p>
                <p><a href="${backLink}">← Back to uploader</a></p>
              </body></html>
            `);
          } else {
            return res.status(400).json({
              success: false,
              message: "No files were received"
            });
          }
        }
        
        const files = req.files as Express.Multer.File[];
        console.log(`Received ${files.length} files in bypass upload`);
        
        // Create URLs for client response
        const imageUrls = files.map(file => `/uploads/properties/${path.basename(file.path)}`);
        
        // Check if this is a direct form submission that expects HTML
        const wantsHtml = req.headers['accept']?.includes('text/html');
        
        if (wantsHtml) {
          // Check referer to determine which uploader was used
          const referer = req.headers['referer'] || '';
          
          // Special handling for cross-platform uploader - redirect back with params
          if (referer.includes('cross-platform-uploader.html')) {
            // Redirect back to the cross-platform uploader with the URLs as parameters
            return res.redirect(`/cross-platform-uploader.html?success=true&urls=${imageUrls.join(',')}`);
          }
          
          // Special handling for Windows uploader
          if (referer.includes('windows-uploader.html')) {
            return res.status(200).send(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Upload Success</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                  .success { color: #2e7d32; background: #e8f5e9; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
                  .url-box { background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 10px; word-break: break-all; }
                  .copy-btn { background: #964B00; color: white; border: none; padding: 5px 10px; cursor: pointer; margin-top: 5px; }
                  .image-preview { margin-top: 10px; border: 1px solid #ddd; padding: 5px; max-width: 150px; max-height: 150px; }
                  a { color: #964B00; text-decoration: none; }
                  a:hover { text-decoration: underline; }
                  .divider { margin: 20px 0; border-top: 1px solid #eee; }
                  h1, h2 { color: #964B00; }
                  .url-list { width: 100%; height: 100px; margin-top: 20px; font-family: monospace; }
                </style>
              </head>
              <body>
                <h1>Upload Successful!</h1>
                <div class="success">Successfully uploaded ${files.length} images.</div>
                
                <div class="instructions" style="background-color: #fffde7; border-left: 4px solid #ffeb3b; padding: 15px; margin: 20px 0;">
                  <h3>Next Steps:</h3>
                  <ol>
                    <li>Copy all image URLs from the text box below</li>
                    <li>Go back to the property form</li>
                    <li>Paste the URLs into the "Image URLs" field</li>
                  </ol>
                </div>
                
                <h2>Copy All URLs</h2>
                <textarea class="url-list" onclick="this.select()">${imageUrls.join(', ')}</textarea>
                <button class="copy-btn" onclick="navigator.clipboard.writeText(document.querySelector('.url-list').value)">
                  Copy All URLs
                </button>
                
                <h2>Individual Image URLs</h2>
                ${imageUrls.map((url, index) => `
                  <div>
                    <div class="url-box">${url}</div>
                    <button class="copy-btn" onclick="navigator.clipboard.writeText('${url}')">Copy URL</button>
                    <img src="${url}" alt="Uploaded image ${index+1}" class="image-preview">
                    <div class="divider"></div>
                  </div>
                `).join('')}
                
                <p style="margin-top: 20px;"><a href="/windows-uploader.html">← Upload More Images</a></p>
                <p><a href="/">← Back to Main Site</a></p>
              </body>
              </html>
            `);
          }
          
          // Standard HTML response for other uploaders
          const imagesHtml = imageUrls.map(url => `
            <div class="img-container">
              <img src="${url}" class="preview" alt="Uploaded image">
              <div class="url">${url}</div>
            </div>
          `).join('');
          
          return res.status(200).send(`
            <html><head><title>Upload Successful</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 30px; line-height: 1.6; }
              .success { color: green; }
              .images { display: flex; flex-wrap: wrap; gap: 15px; margin: 20px 0; }
              .img-container { border: 1px solid #ddd; padding: 10px; border-radius: 5px; max-width: 220px; }
              .preview { max-width: 200px; max-height: 200px; }
              .url { font-size: 12px; word-break: break-all; margin-top: 5px; padding: 5px; background: #f5f5f5; }
              .url-list { width: 100%; height: 100px; margin-top: 20px; font-family: monospace; }
              a { color: #B87333; text-decoration: none; }
              a:hover { text-decoration: underline; }
              .instructions { background-color: #fffde7; border-left: 4px solid #ffeb3b; padding: 15px; margin: 20px 0; }
            </style>
            </head><body>
              <h1>Upload Successful!</h1>
              <p class="success">Successfully uploaded ${files.length} file(s).</p>
              
              <div class="instructions">
                <h3>Next Steps:</h3>
                <ol>
                  <li>Copy all image URLs from the text box below</li>
                  <li>Go back to the property form</li>
                  <li>Paste the URLs into the "Image URLs" field</li>
                </ol>
              </div>
              
              <h2>Image URLs</h2>
              <textarea class="url-list" onclick="this.select()">${imageUrls.join(', ')}</textarea>
              
              <h2>Image Previews</h2>
              <div class="images">${imagesHtml}</div>
              
              <p>
                <a href="/basic-uploader.html">← Upload more images</a> | 
                <a href="/">Return to main website</a>
              </p>
            </body></html>
          `);
        } else {
          // Return JSON response for API clients
          return res.status(200).json({
            success: true,
            message: `Successfully uploaded ${files.length} files`,
            imageUrls: imageUrls,
            urls: imageUrls // Include both names for broader compatibility
          });
        }
      });
    } catch (error) {
      console.error("Fatal error in bypass upload:", error);
      
      // Check if this is a direct form submission
      const wantsHtml = req.headers['accept']?.includes('text/html');
      
      if (wantsHtml) {
        // Check referer to determine which uploader was used
        const referer = req.headers['referer'] || '';
        let backLink = '/basic-uploader.html';
        
        if (referer.includes('windows-uploader.html')) {
          backLink = '/windows-uploader.html';
        } else if (referer.includes('cross-platform-uploader.html')) {
          // Redirect back to the cross-platform uploader with error message
          return res.redirect(`/cross-platform-uploader.html?error=true&message=${encodeURIComponent(error instanceof Error ? error.message : "Unknown error")}`);
        }
        
        return res.status(500).send(`
          <html><head><title>Server Error</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 30px; line-height: 1.6; }
            .error { color: red; background: #ffebee; padding: 15px; border-radius: 4px; }
            a { color: #964B00; text-decoration: none; }
            a:hover { text-decoration: underline; }
            h1 { color: #964B00; }
          </style>
          </head><body>
            <h1>Server Error</h1>
            <p class="error">A server error occurred during upload: ${error instanceof Error ? error.message : "Unknown error"}</p>
            <p><a href="${backLink}">← Back to uploader</a></p>
          </body></html>
        `);
      } else {
        return res.status(500).json({
          success: false,
          message: "A server error occurred during upload",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  });

  // New simplified property image upload endpoint - NO AUTHENTICATION REQUIRED
  app.post('/api/upload/property-images-direct', async (req: Request, res: Response) => {
    try {
      console.log("==== DIRECT PROPERTY IMAGE UPLOAD CALLED ====");
      console.log("Public upload endpoint - no authentication required");
      
      // Log the incoming request details for debugging
      console.log("Content-Type:", req.headers['content-type']);
      console.log("Request method:", req.method);
      console.log("Query params:", req.query);
      
      // Try to log any form fields that might already be parsed
      if (req.body) {
        console.log("Request body keys:", Object.keys(req.body));
      }
      
      // Create upload directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
        console.log(`Created upload directory: ${uploadDir}`);
      }
      
      // Force directory permissions
      fs.chmodSync(uploadDir, 0o777);
      
      // Create a single-use multer instance
      const upload = multer({
        storage: multer.diskStorage({
          destination: (req, file, cb) => {
            cb(null, uploadDir);
          },
          filename: (req, file, cb) => {
            const timestamp = Date.now();
            const random = Math.round(Math.random() * 1000);
            const ext = path.extname(file.originalname) || '.jpg';
            const filename = `images-${timestamp}-${random}${ext}`;
            console.log(`Generated filename: ${filename}`);
            cb(null, filename);
          }
        }),
        limits: {
          fileSize: 25 * 1024 * 1024, // 25MB
          files: 20
        }
      });
      
      // First check if there are any files in the request
      if (!req.files && !req.file) {
        console.log("No files found in the request");
        
        // Try to log the request content
        try {
          console.log("Request headers:", req.headers);
          console.log("Request content type:", req.headers['content-type']);
          console.log("Request body keys:", Object.keys(req.body || {}));
        } catch (err) {
          console.error("Error logging request details:", err);
        }
        
        return res.status(400).json({
          success: false,
          message: "No files detected in the upload request. Ensure files are being sent correctly with field name 'images'."
        });
      }
      
      // Use the upload middleware as a promise
      const uploadPromise = util.promisify((req: Request, res: Response, callback: (error: any) => void) => {
        upload.array('images', 20)(req, res, callback);
      });
      
      try {
        console.log("Starting file upload process...");
        await uploadPromise(req, res);
        console.log("Upload process completed");
      } catch (uploadError) {
        console.error("Error during file upload:", uploadError);
        throw new Error(`File upload process failed: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`);
      }
      
      // Check if files array exists and has content after upload
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        console.error("No files found after upload process");
        throw new Error("File upload completed but no files were processed");
      }
      
      // Files have been uploaded, extract file info
      const files = req.files as Express.Multer.File[];
      console.log(`Processed ${files.length} files`);
      
      const fileUrls = files.map(file => `/uploads/properties/${file.filename}`);
      console.log("File URLs:", fileUrls);
      
      return res.status(200).json({
        success: true,
        message: `Successfully uploaded ${files.length} images`,
        imageUrls: fileUrls
      });
    } catch (error) {
      console.error("Direct upload error:", error);
      return res.status(500).json({
        success: false,
        message: "Upload failed",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Super simple image uploader - no authentication, no error handling
  app.post('/api/simple-upload', (req, res) => {
    const upload = multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          // Save to public/uploads/properties for direct access
          const dir = path.join(process.cwd(), 'public', 'uploads', 'properties');
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true, mode: 0o777 });
          }
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const uniqueName = 'image_' + Date.now() + path.extname(file.originalname);
          cb(null, uniqueName);
        }
      }),
      limits: { fileSize: 10 * 1024 * 1024 }
    }).array('images', 10);
    
    upload(req, res, (err) => {
      if (err) {
        console.error('Simple upload error:', err);
        return res.status(400).json({ success: false, error: err.message });
      }
      
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ success: false, error: 'No files uploaded' });
      }
      
      const urls = (req.files as Express.Multer.File[]).map(file => {
        return `/uploads/properties/${file.filename}`;
      });
      
      res.json({ success: true, urls });
    });
  });
  
  // ====== PROJECT ROUTES ======
  // Get all projects with pagination
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      // Extract pagination parameters from query
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
      
      // Get paginated projects
      const result = await dbStorage.getAllProjects(page, pageSize);
      res.json(result);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });
  
  // Get project by ID
  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const project = await dbStorage.getProjectById(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });
  
  // Get properties associated with a specific project
  app.get("/api/projects/:id/properties", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // First check if the project exists
      const project = await dbStorage.getProjectById(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      console.log(`Fetching properties for project: ${project.projectName}`);
      
      // Search for properties with matching project name
      const properties = await dbStorage.searchProperties({
        projectName: project.projectName
      });
      
      console.log(`Found ${properties.data.length} properties for project: ${project.projectName}`);
      
      res.json(properties);
    } catch (error) {
      console.error("Error fetching project properties:", error);
      res.status(500).json({ message: "Failed to fetch project properties" });
    }
  });
  
  // Create a new project
  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Project creation failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required to create projects" });
      }
      
      // Get the authenticated user from request
      const user = req.user as Express.User;
      console.log(`User attempting to create project: ${user.username} (Role: ${user.role})`);
      
      // Only admins and owners can create projects
      if (user.role !== 'admin' && user.role !== 'owner') {
        console.error("Project creation failed: Insufficient permissions");
        return res.status(403).json({ message: "You do not have permission to create projects" });
      }
      
      // Create a new request body with camelCase fields matching the schema
      const formattedBody = {
        projectName: req.body.projectName,
        description: req.body.description,
        location: req.body.location,
        images: req.body.images || [],
        unitTypes: req.body.unitTypes || [],
        aboutDeveloper: req.body.aboutDeveloper,
        status: req.body.status || 'draft',
        createdBy: user.id
      };
      
      // Ensure required fields are present
      const requiredFields = ['projectName', 'description', 'location', 'aboutDeveloper'];
      const missingFields = requiredFields.filter(field => {
        return !formattedBody[field];
      });
      
      if (missingFields.length > 0) {
        console.error(`Project creation failed: Missing required fields: ${missingFields.join(', ')}`);
        return res.status(400).json({
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }
      
      // Format images field if it's a comma-separated string
      if (typeof formattedBody.images === 'string') {
        try {
          console.log("Converting images string to array");
          formattedBody.images = formattedBody.images.split(',').map((url: string) => url.trim()).filter((url: string) => url.length > 0);
          console.log(`Processed ${formattedBody.images.length} image URLs`);
        } catch (error) {
          console.error("Error parsing images string:", error);
        }
      }
      
      // Format unitTypes field if it's a comma-separated string
      if (typeof formattedBody.unitTypes === 'string') {
        try {
          console.log("Converting unitTypes string to array");
          formattedBody.unitTypes = formattedBody.unitTypes.split(',').map((type: string) => type.trim()).filter((type: string) => type.length > 0);
          console.log(`Processed ${formattedBody.unitTypes.length} unit types`);
        } catch (error) {
          console.error("Error parsing unitTypes string:", error);
        }
      }
      
      // Create the project
      console.log("Creating project with data:", formattedBody);
      const project = await dbStorage.createProject(formattedBody);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error("Validation error details:", validationError);
        return res.status(400).json({ 
          message: "Validation error", 
          details: validationError.message 
        });
      }
      
      res.status(500).json({ message: "Failed to create project" });
    }
  });
  
  // Update an existing project
  app.put("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Project update failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required to update projects" });
      }
      
      // Get the authenticated user from request
      const user = req.user as Express.User;
      console.log(`User attempting to update project: ${user.username} (Role: ${user.role})`);
      
      // Only admins and owners can update projects
      if (user.role !== 'admin' && user.role !== 'owner') {
        console.error("Project update failed: Insufficient permissions");
        return res.status(403).json({ message: "You do not have permission to update projects" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Check if the project exists
      const existingProject = await dbStorage.getProjectById(id);
      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Create a new request body with camelCase fields matching the schema
      const formattedBody = {
        projectName: req.body.projectName,
        description: req.body.description,
        location: req.body.location,
        images: req.body.images || existingProject.images,
        unitTypes: req.body.unitTypes || existingProject.unitTypes,
        aboutDeveloper: req.body.aboutDeveloper,
        status: req.body.status || existingProject.status,
        updatedAt: new Date()
      };
      
      // Format images field if it's a comma-separated string
      if (typeof formattedBody.images === 'string') {
        try {
          console.log("Converting images string to array");
          formattedBody.images = formattedBody.images.split(',').map((url: string) => url.trim()).filter((url: string) => url.length > 0);
          console.log(`Processed ${formattedBody.images.length} image URLs`);
        } catch (error) {
          console.error("Error parsing images string:", error);
        }
      }
      
      // Format unitTypes field if it's a comma-separated string
      if (typeof formattedBody.unitTypes === 'string') {
        try {
          console.log("Converting unitTypes string to array");
          formattedBody.unitTypes = formattedBody.unitTypes.split(',').map((type: string) => type.trim()).filter((type: string) => type.length > 0);
          console.log(`Processed ${formattedBody.unitTypes.length} unit types`);
        } catch (error) {
          console.error("Error parsing unitTypes string:", error);
        }
      }
      
      // Update the project
      console.log("Updating project with data:", formattedBody);
      const updatedProject = await dbStorage.updateProject(id, formattedBody);
      
      if (updatedProject) {
        res.json(updatedProject);
      } else {
        res.status(500).json({ message: "Failed to update project" });
      }
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Delete a project
  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Project deletion failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required to delete projects" });
      }
      
      // Get the authenticated user from request
      const user = req.user as Express.User;
      console.log(`User attempting to delete project: ${user.username} (Role: ${user.role})`);
      
      // Only admins and owners can delete projects
      if (user.role !== 'admin' && user.role !== 'owner') {
        console.error("Project deletion failed: Insufficient permissions");
        return res.status(403).json({ message: "You do not have permission to delete projects" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Check if the project exists
      const project = await dbStorage.getProjectById(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Delete the project
      const success = await dbStorage.deleteProject(id);
      if (success) {
        res.json({ message: "Project deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete project" });
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Project image upload route
  app.post("/api/upload/project-images", finalUpload.array('images', 10), async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Project image upload failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required to upload project images" });
      }
      
      // Get the authenticated user from request
      const user = req.user as Express.User;
      console.log(`User attempting to upload project images: ${user.username} (Role: ${user.role})`);
      
      // Only admins and owners can upload project images
      if (user.role !== 'admin' && user.role !== 'owner') {
        console.error("Project image upload failed: Insufficient permissions");
        return res.status(403).json({ message: "You do not have permission to upload project images" });
      }
      
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No files were uploaded" });
      }
      
      console.log(`Received ${req.files.length} project image files`);
      
      // Process uploaded files
      const imageUrls = req.files.map(file => {
        // Create both public and internal URLs
        const publicUrl = `/uploads/projects/${file.filename}`;
        
        console.log(`Successfully processed project image: ${file.originalname} -> ${publicUrl}`);
        return publicUrl;
      });
      
      res.json({ 
        message: "Project images uploaded successfully",
        imageUrls: imageUrls 
      });
    } catch (error) {
      console.error('Error uploading project images:', error);
      res.status(500).json({ message: "Failed to upload project images" });
    }
  });

  // Enhanced file access route with advanced file matching
  app.get('/uploads/*', (req, res) => {
    console.log(`Enhanced file access request for: ${req.path}`);
    
    // Clean up the path and remove the '/uploads/' prefix
    const relativePath = req.path.substring(8); // remove '/uploads/'
    
    // Get the base directories where uploads might be stored
    const baseDirectories = [
      path.join(process.cwd(), 'public', 'uploads'),
      path.join(process.cwd(), 'uploads'),
      path.join(process.cwd())
    ];
    
    // First try the exact path (standard behavior)
    for (const baseDir of baseDirectories) {
      const exactPath = path.join(baseDir, relativePath);
      if (fs.existsSync(exactPath)) {
        console.log(`File found at exact path: ${exactPath}`);
        return res.sendFile(exactPath);
      }
    }
    
    // If we couldn't find the exact file, try to find it by filename only (without subdir)
    const filename = path.basename(relativePath);
    const subdirs = ['properties', 'announcements', 'projects', 'logos', ''];
    
    // Check each possible subdirectory
    for (const baseDir of baseDirectories) {
      for (const subdir of subdirs) {
        const alternativePath = path.join(baseDir, subdir, filename);
        if (fs.existsSync(alternativePath)) {
          console.log(`File found using filename match: ${alternativePath}`);
          return res.sendFile(alternativePath);
        }
      }
    }

    // Try fuzzy matching for property images with hash names (Windows-uploaded)
    // This is for cases where the URL has a cleaned filename but the actual file has a hash
    try {
      console.log(`Attempting enhanced fuzzy matching for: ${filename}`);
      
      // First try direct hash match for known Windows MD5 hash pattern (32 char hexadecimal)
      const hashMatch = filename.match(/([a-f0-9]{32})/i);
      if (hashMatch) {
        const hash = hashMatch[1];
        console.log(`Found hash pattern in filename: ${hash}`);
        
        // Look for any file containing this hash
        for (const baseDir of baseDirectories) {
          for (const subdir of subdirs) {
            const subdirPath = path.join(baseDir, subdir);
            if (fs.existsSync(subdirPath)) {
              const files = fs.readdirSync(subdirPath);
              console.log(`Scanning ${files.length} files in ${subdirPath} for hash ${hash}`);
              
              for (const file of files) {
                if (file.includes(hash)) {
                  console.log(`Exact hash match found: ${file}`);
                  const matchPath = path.join(subdirPath, file);
                  console.log(`Serving file from: ${matchPath}`);
                  return res.sendFile(matchPath);
                }
              }
            }
          }
        }
      }
      
      // If no hash match, try listing all files and look for partial matches
      console.log("No exact hash match found, trying partial matching");
      
      // Special case for common Windows image hashes - look for files with MD5 hash patterns
      for (const baseDir of baseDirectories) {
        for (const subdir of subdirs) {
          const subdirPath = path.join(baseDir, subdir);
          if (fs.existsSync(subdirPath)) {
            const files = fs.readdirSync(subdirPath);
            console.log(`Checking ${files.length} files in ${subdirPath}`);
            
            // First try finding recent files (last modified) as they're most likely to be what we want
            const fileStats = files.map(file => {
              const fullPath = path.join(subdirPath, file);
              try {
                const stats = fs.statSync(fullPath);
                return { file, stats, fullPath };
              } catch (err) {
                return null;
              }
            }).filter(item => item !== null);
            
            // Sort by last modified date, most recent first
            fileStats.sort((a, b) => b.stats.mtimeMs - a.stats.mtimeMs);
            
            // Check the 5 most recent files first
            const recentFiles = fileStats.slice(0, 5);
            for (const fileInfo of recentFiles) {
              console.log(`Checking recent file: ${fileInfo.file}`);
              if (fileInfo.file.match(/[a-f0-9]{8,32}/i)) {  // Has a hash-like pattern
                console.log(`Recent file appears to be a hash match: ${fileInfo.file}`);
                return res.sendFile(fileInfo.fullPath);
              }
            }
            
            // If that fails, try matching by name fragments
            for (const file of files) {
              // Split the filenames into parts and look for common segments
              const fileParts = file.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter(p => p.length > 3);
              const requestedParts = filename.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter(p => p.length > 3);
              
              // See if any meaningful part matches
              const hasCommonPart = fileParts.some(part => 
                requestedParts.some(reqPart => part.includes(reqPart) || reqPart.includes(part))
              );
              
              if (hasCommonPart) {
                console.log(`Found matching name parts in: ${file}`);
                const matchPath = path.join(subdirPath, file);
                console.log(`Serving file from: ${matchPath}`);
                return res.sendFile(matchPath);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error searching for fuzzy file matches:", err);
    }
    
    // If we get here, the file wasn't found with any method
    console.error(`File not found in any location: ${relativePath}`);
    
    // Serve a placeholder image instead of 404
    const placeholderPath = path.join(process.cwd(), 'public', 'placeholder-property.svg');
    if (fs.existsSync(placeholderPath)) {
      console.log(`Serving placeholder image at: ${placeholderPath}`);
      return res.sendFile(placeholderPath);
    }
    
    // Last resort, return 404
    res.status(404).send('File not found');
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}