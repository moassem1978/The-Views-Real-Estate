import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { z } from "zod";
import { insertPropertySchema, insertTestimonialSchema, insertAnnouncementSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import path from "path";
import fs from "fs";
import { setupAuth } from "./auth";

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
  storage: multerStorage,
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
      const result = await dbStorage.getAllProperties(page, pageSize);
      res.json(result);
    } catch (error) {
      console.error('Error fetching properties:', error);
      res.status(500).json({ message: "Failed to fetch properties" });
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
      // Log the incoming data for debugging
      console.log("Creating property with data:", JSON.stringify(req.body, null, 2));
      
      // Ensure required fields are present
      const requiredFields = ['title', 'description', 'price', 'propertyType', 'city', 'images', 'bedrooms', 'bathrooms', 'builtUpArea'];
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

      let propertyData;
      try {
        propertyData = insertPropertySchema.parse(req.body);
      } catch (parseError) {
        console.error("Property data validation failed:", parseError);
        return res.status(400).json({
          message: "Invalid property data",
          details: parseError
        });
      }
      
      // Log after validation success
      console.log("Property data validated successfully");
      
      // Add createdBy field and status
      const propertyWithUser = {
        ...propertyData,
        createdBy: user.id,
        status: 'published', // Admin properties are published immediately
        createdAt: new Date().toISOString()
      };
      
      const property = await dbStorage.createProperty(propertyWithUser);
      
      // Log after DB operation success
      console.log("Property created successfully with ID:", property.id);
      
      res.status(201).json(property);
    } catch (error) {
      console.error("Error creating property:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error("Validation error details:", validationError);
        res.status(400).json({ message: validationError.message });
      } else {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Database or server error:", errorMessage);
        res.status(500).json({ message: `Failed to create property: ${errorMessage}` });
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
      } else {
        console.log("No session data available");
      }

      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        console.log("No property image files received");
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      console.log(`Received ${Array.isArray(req.files) ? req.files.length : 0} files for upload`);
      
      if (Array.isArray(req.files)) {
        req.files.forEach((file, index) => {
          console.log(`File ${index + 1}: ${file.originalname}, type: ${file.mimetype}, size: ${(file.size / 1024).toFixed(2)}KB`);
        });
      }

      // Use the Express.Multer.File type to correctly handle files
      const files = Array.isArray(req.files) 
        ? req.files as Express.Multer.File[]
        : [req.files as unknown as Express.Multer.File];

      console.log(`Uploaded ${files.length} property images`);

      // Ensure all essential directories exist with proper permissions
      const dirPaths = [
        path.join(process.cwd(), 'public'),
        path.join(process.cwd(), 'public', 'uploads'),
        path.join(process.cwd(), 'public', 'uploads', 'properties'),
        path.join(process.cwd(), 'uploads'),
        path.join(process.cwd(), 'uploads', 'properties')
      ];
      
      // Create directories if they don't exist
      for (const dirPath of dirPaths) {
        try {
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true, mode: 0o777 });
            console.log(`Created directory with full permissions: ${dirPath}`);
          } else {
            // Update permissions if directory exists
            fs.chmodSync(dirPath, 0o777);
            console.log(`Updated permissions for existing directory: ${dirPath}`);
          }
        } catch (dirError) {
          console.error(`Error creating or updating directory ${dirPath}:`, dirError);
        }
      }
      
      // Process files individually with improved error handling
      const fileUrls: string[] = [];
      
      for (const file of files) {
        try {
          console.log(`Processing file: ${file.originalname} (${file.mimetype}) -> ${file.filename}, size: ${file.size}`);
          
          // First check the main expected location (public/uploads/properties)
          const mainPath = path.join(process.cwd(), 'public', 'uploads', 'properties', file.filename);
          const fallbackPath = path.join(process.cwd(), 'uploads', file.filename);
          const legacyFallbackPath = path.join(process.cwd(), 'uploads', 'properties', file.filename);
          
          // Create list of all possible paths to check
          const possiblePaths = [
            { path: mainPath, url: `/uploads/properties/${file.filename}` },
            { path: fallbackPath, url: `/uploads/${file.filename}` },
            { path: legacyFallbackPath, url: `/uploads/properties/${file.filename}` },
            { path: path.join(process.cwd(), file.path), url: `/${file.path.replace(/\\/g, '/')}` }
          ];
          
          // Check each possible location
          let fileFound = false;
          let fileUrl = '';
          
          for (const pathInfo of possiblePaths) {
            if (fs.existsSync(pathInfo.path)) {
              console.log(`File found at: ${pathInfo.path}`);
              fileUrl = pathInfo.url;
              fileFound = true;
              
              // Always copy to the primary location (for consistency)
              if (pathInfo.path !== mainPath) {
                try {
                  // Ensure the directory exists
                  const dir = path.dirname(mainPath);
                  if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true, mode: 0o777 });
                  }
                  
                  // Copy the file
                  fs.copyFileSync(pathInfo.path, mainPath);
                  console.log(`Copied file from ${pathInfo.path} to ${mainPath}`);
                  
                  // Use the main URL
                  fileUrl = `/uploads/properties/${file.filename}`;
                } catch (copyError) {
                  console.error(`Failed to copy file to main location:`, copyError);
                  // Keep using the found URL if copy fails
                }
              }
              
              break;
            }
          }
          
          if (!fileFound) {
            // File not found at any expected location - attempt to save the file manually
            console.error(`WARNING: File not found at any expected location`);
            console.log(`Attempting to manually save file data to ${mainPath}`);
            
            try {
              // Ensure the directory exists
              const dir = path.dirname(mainPath);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true, mode: 0o777 });
              }
              
              // If file has buffer data, write it directly
              if (file.buffer) {
                fs.writeFileSync(mainPath, file.buffer);
                console.log(`Successfully saved file buffer to ${mainPath}`);
                fileUrl = `/uploads/properties/${file.filename}`;
                fileFound = true;
              } else {
                // No buffer data available, use expected URL anyway
                console.error(`No buffer data available to save file manually`);
                fileUrl = `/uploads/properties/${file.filename}`;
              }
            } catch (saveError) {
              console.error(`Failed to manually save file:`, saveError);
              fileUrl = `/uploads/properties/${file.filename}`;
            }
          }
          
          // Add the URL to our results
          fileUrls.push(fileUrl);
          
          // Touch the session to keep it alive
          if (req.session) {
            req.session.touch();
          }
        } catch (fileError) {
          console.error(`Error processing file ${file.originalname}:`, fileError);
          // Continue with other files even if one fails
          // Add a placeholder URL for the failed file to maintain proper count
          fileUrls.push(`/uploads/properties/${file.filename}`);
        }
        
        // Add a small delay between files to prevent system overload
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Touch the session one more time at the end
      if (req.session) {
        req.session.touch();
        console.log("Session touched at end of upload processing");
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
  
  // Direct file access route as a last resort
  app.get('/uploads/*', (req, res) => {
    // This is our last fallback if the static middleware doesn't find the file
    console.log(`Direct file access request for: ${req.path}`);
    
    // Try to look in all possible locations
    const relativePath = req.path.substring(8); // remove '/uploads/'
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'uploads', relativePath),
      path.join(process.cwd(), 'uploads', relativePath),
      path.join(process.cwd(), relativePath)
    ];
    
    // Check each path
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        console.log(`File found at: ${filePath}`);
        return res.sendFile(filePath);
      }
    }
    
    // If we get here, the file wasn't found
    console.error(`File not found in any location: ${relativePath}`);
    res.status(404).send('File not found');
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}