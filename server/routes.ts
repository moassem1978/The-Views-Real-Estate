import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { db, pool } from "./db";
import { z } from "zod";
import { insertPropertySchema, insertTestimonialSchema, insertAnnouncementSchema, insertProjectSchema, insertArticleSchema, insertNewsletterSchema, insertLeadSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import path from "path";
import fs from "fs";
import util from "util";
import { setupAuth } from "./auth";
import { optimizeImage, generateThumbnail, generateMultipleSizes } from "./utils/imageOptimizer";
import { 
  uploadPhotosForProperty, 
  uploadPhotos, 
  getPropertyPhotos, 
  deletePhoto, 
  reorderPhotos, 
  updatePhotoMetadata, 
  validatePhotoIntegrity, 
  cleanupOrphanedFiles 
} from "./photoRoutes";
import { protectionMiddleware } from "./protection-middleware";

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
    // Create unique filename using timestamp + original name format
    const timestamp = Date.now();
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'); // Replace all non-alphanumeric chars except dots and hyphens
    
    // Get original extension or use a default
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext) {
      // If no extension, determine from mimetype
      if (file.mimetype.includes('jpeg') || file.mimetype.includes('jpg')) {
        ext = '.jpg';
      } else if (file.mimetype.includes('png')) {
        ext = '.png';
      } else if (file.mimetype.includes('gif')) {
        ext = '.gif';
      } else if (file.mimetype.includes('webp')) {
        ext = '.webp';
      } else {
        ext = '.jpg'; // Default fallback
      }
    }

    // Format: timestamp-originalname.ext (ensuring unique filenames)
    const nameWithoutExt = path.basename(cleanOriginalName, path.extname(cleanOriginalName));
    const finalFilename = `${timestamp}-${nameWithoutExt}${ext}`;

    console.log(`Generated unique filename: ${finalFilename} from original: ${file.originalname}`);
    cb(null, finalFilename);
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

  // Protected dashboard route with session logging
  app.get("/dashboard", (req: Request, res: Response, next: NextFunction) => {
    console.log("=== DASHBOARD ACCESS ATTEMPT ===");
    console.log("Session ID:", req.sessionID);
    console.log("Is Authenticated:", req.isAuthenticated());
    console.log("Session Data:", {
      sessionID: req.sessionID,
      session: req.session,
      cookies: req.headers.cookie,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });

    if (!req.isAuthenticated()) {
      console.log("❌ Dashboard access denied - user not authenticated");
      console.log("Redirecting to sign-in page");
      return res.redirect('/signin');
    }

    const user = req.user as Express.User;
    console.log("✅ Dashboard access granted for user:", {
      id: user.id,
      username: user.username,
      role: user.role,
      isAgent: user.isAgent
    });

    // Continue to serve the dashboard
    next();
  });

  // Serve static projects page to bypass React crashes


  // Use either the provided upload and uploads directory or the defaults
  const finalUpload = customUpload || upload;
  const finalUploadsDir = customUploadsDir || uploadsDir;
  // API route for listings (used by ListingsGrid component)
  app.get("/api/listings", async (req: Request, res: Response) => {
    try {
      // Extract pagination parameters from query
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 24;

      // Get paginated properties (same as properties endpoint but specifically for listings)
      const result = await dbStorage.getAllProperties(page, pageSize);
      
      // Transform the data to match the Listing interface expected by the frontend
      const transformedData = {
        ...result,
        data: result.data.map(property => ({
          id: property.id,
          title: property.title,
          description: property.description,
          price: property.price,
          photos: property.images || [], // Map images to photos for compatibility
          city: property.city,
          state: property.state,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          propertyType: property.propertyType,
          listingType: property.listingType,
          isFeatured: property.isFeatured,
          isNewListing: property.isNewListing,
          builtUpArea: property.builtUpArea,
          plotSize: property.plotSize,
          downPayment: property.downPayment,
          installmentAmount: property.installmentAmount,
          installmentPeriod: property.installmentPeriod,
          isFullCash: property.isFullCash,
          references: property.references,
          reference: property.references, // Provide both field names
          reference_number: property.references,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt
        }))
      };

      console.log(`Listings API: Returning ${transformedData.data.length} listings out of ${transformedData.totalCount} total`);
      res.json(transformedData);
    } catch (error) {
      console.error('Error fetching listings:', error);
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  // API routes for properties
  app.get("/api/properties", async (req: Request, res: Response) => {
    try {
      // Extract pagination parameters from query
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 100;

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

  app.get("/api/properties/search", async (req: Request, res: Response) => {
    try {
      console.log("Search request received with query:", req.query);
      
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 24;
      
      // Build WHERE conditions
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;
      
      // Location filter
      if (req.query.location) {
        whereConditions.push(`city = $${paramIndex}`);
        queryParams.push(req.query.location);
        paramIndex++;
      }
      
      // Property type filter
      if (req.query.propertyType) {
        whereConditions.push(`property_type = $${paramIndex}`);
        queryParams.push(req.query.propertyType);
        paramIndex++;
      }
      
      // Listing type filter
      if (req.query.listingType) {
        whereConditions.push(`listing_type = $${paramIndex}`);
        queryParams.push(req.query.listingType);
        paramIndex++;
      }
      
      // Price range filters
      if (req.query.minPrice) {
        const minPrice = parseInt(req.query.minPrice as string);
        whereConditions.push(`price >= $${paramIndex}`);
        queryParams.push(minPrice);
        paramIndex++;
      }
      
      if (req.query.maxPrice) {
        const maxPrice = parseInt(req.query.maxPrice as string);
        whereConditions.push(`price <= $${paramIndex}`);
        queryParams.push(maxPrice);
        paramIndex++;
      }
      
      // Bedrooms filter
      if (req.query.minBedrooms) {
        const minBedrooms = parseInt(req.query.minBedrooms as string);
        whereConditions.push(`bedrooms >= $${paramIndex}`);
        queryParams.push(minBedrooms);
        paramIndex++;
      }
      
      // Bathrooms filter
      if (req.query.minBathrooms) {
        const minBathrooms = parseFloat(req.query.minBathrooms as string);
        whereConditions.push(`bathrooms >= $${paramIndex}`);
        queryParams.push(minBathrooms);
        paramIndex++;
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM properties ${whereClause}`;
      const countResult = await pool.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].total, 10);
      
      // Get paginated results
      const offset = (page - 1) * pageSize;
      const dataQuery = `SELECT * FROM properties ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      const finalQueryParams = [...queryParams, pageSize, offset];
      
      const dataResult = await pool.query(dataQuery, finalQueryParams);
      const properties = dataResult.rows.map(dbStorage.mapPropertyFromDb);
      
      console.log(`Search returned ${properties.length} properties out of ${totalCount} total with filters:`, req.query);
      
      res.json({
        data: properties,
        totalCount,
        pageCount: Math.ceil(totalCount / pageSize),
        page,
        pageSize
      });
    } catch (error) {
      console.error("Error searching properties:", error);
      res.status(500).json({ message: "Failed to search properties" });
    }
  });

  app.get("/api/properties/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      console.log(`Attempting to fetch property with ID: ${id}`);
      
      // Get property from storage
      const property = await dbStorage.getPropertyById(id);
      
      if (!property) {
        // Try direct database query as a backup
        try {
          console.log(`Property not found in storage, trying direct SQL query for ID: ${id}`);
          // Use direct pool query instead of db.execute
          const result = await pool.query("SELECT * FROM properties WHERE id = $1", [id]);
          
          // Check if we got results using rowCount
          if (result && result.rowCount > 0) {
            const dbProperty = result.rows[0];
            console.log(`Found property ${id} via direct SQL`);
            
            // Convert the DB property to the correct format with full field mapping
            const mappedProperty = {
              id: dbProperty.id,
              title: dbProperty.title || "",
              description: dbProperty.description || "",
              address: dbProperty.address || "",
              city: dbProperty.city || "Unknown",
              state: dbProperty.state || "",
              zipCode: dbProperty.zip_code || "00000",
              price: dbProperty.price || 0,
              downPayment: dbProperty.down_payment || null,
              installmentAmount: dbProperty.installment_amount || null,
              installmentPeriod: dbProperty.installment_period || null,
              isFullCash: dbProperty.is_full_cash || false,
              listingType: dbProperty.listing_type || "Primary",
              projectName: dbProperty.project_name || "",
              developerName: dbProperty.developer_name || "",
              bedrooms: dbProperty.bedrooms || 0,
              bathrooms: dbProperty.bathrooms || 0,
              builtUpArea: dbProperty.built_up_area || 0,
              plotSize: dbProperty.plot_size || 0,
              gardenSize: dbProperty.garden_size || 0,
              floor: dbProperty.floor || 0,
              isGroundUnit: dbProperty.is_ground_unit || false,
              propertyType: dbProperty.property_type || "apartment",
              isFeatured: dbProperty.is_featured || false,
              isNewListing: dbProperty.is_new_listing || false,
              isHighlighted: dbProperty.is_highlighted || false,
              yearBuilt: dbProperty.year_built || 0,
              views: dbProperty.views || 0,
              amenities: dbProperty.amenities || [],
              images: dbProperty.images || [],
              latitude: dbProperty.latitude || 0,
              longitude: dbProperty.longitude || 0,
              country: dbProperty.country || "Egypt",
              status: dbProperty.status || "active",
              createdAt: dbProperty.created_at,
              createdBy: dbProperty.created_by || 1,
              approvedBy: dbProperty.approved_by || null,
              agentId: dbProperty.agent_id || 1
            };
            
            return res.json(mappedProperty);
          }
        } catch (sqlError) {
          console.error(`SQL query for ID ${id} failed:`, sqlError);
        }
        
        console.log(`Property with ID ${id} not found after all attempts`);
        return res.status(404).json({ message: "Property not found" });
      }
      
      console.log(`Successfully retrieved property: ${property.id} - ${property.title}`);
      return res.json(property);
    } catch (error) {
      console.error(`Error fetching property with ID ${req.params.id}:`, error);
      return res.status(500).json({ 
        message: "Failed to fetch property", 
        error: error instanceof Error ? error.message : String(error)
      });
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

      // Ensure required fields are present (made images optional)
      const requiredFields = ['title', 'description', 'price', 'propertyType', 'city', 'zipCode', 'bedrooms', 'bathrooms', 'builtUpArea'];
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
      
      // Ensure images field exists
      if (!req.body.images) {
        req.body.images = [];
        console.log("Initialized empty images array for new property");
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
      
      // Add required fields before validation
      if (!req.body.createdAt) {
        req.body.createdAt = new Date().toISOString();
        console.log("Added createdAt:", req.body.createdAt);
      }
      
      if (!req.body.agentId) {
        req.body.agentId = user.id; // Default to current user as agent
        console.log("Added agentId:", req.body.agentId);
      }

      // Validate with added fields
      let propertyData;
      try {
        propertyData = insertPropertySchema.parse(req.body);
        console.log("Property data validation succeeded with all required fields");
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
      };

      // Handle critical fields: Reference number (in multiple formats)
      if (propertyWithUser.reference) {
        console.log(`Setting reference number to: ${propertyWithUser.reference}`);
        // Set in all formats to ensure it's saved properly
        propertyWithUser.references = propertyWithUser.reference;
        propertyWithUser.reference_number = propertyWithUser.reference;
      } else if (propertyWithUser.references) {
        console.log(`Using references field: ${propertyWithUser.references}`);
        propertyWithUser.reference = propertyWithUser.references;
        propertyWithUser.reference_number = propertyWithUser.references;
      } else if (propertyWithUser.reference_number) {
        console.log(`Using reference_number field: ${propertyWithUser.reference_number}`);
        propertyWithUser.reference = propertyWithUser.reference_number;
        propertyWithUser.references = propertyWithUser.reference_number;
      }
      
      // Critical field: Property Type
      if (propertyWithUser.propertyType) {
        console.log(`Processing property type: ${propertyWithUser.propertyType}`);
        // Ensure it's saved correctly to the database
        propertyWithUser.property_type = propertyWithUser.propertyType;
      }
      
      // Log property data just before creation with critical fields
      console.log("Attempting to create property with final data:", JSON.stringify({
        title: propertyWithUser.title,
        city: propertyWithUser.city,
        reference: propertyWithUser.reference || "(empty)",
        references: propertyWithUser.references || "(empty)",
        reference_number: propertyWithUser.reference_number || "(empty)",
        propertyType: propertyWithUser.propertyType || "(empty)",
        property_type: propertyWithUser.property_type || "(empty)",
        images: Array.isArray(propertyWithUser.images) ? 
          `${propertyWithUser.images.length} images` : 
          propertyWithUser.images
      }));

      const property = await dbStorage.createProperty(propertyWithUser);

      // Log after DB operation success with detailed verification of critical fields
      console.log("Property created successfully:", {
        id: property.id,
        title: property.title,
        // Critical fields verification
        references: property.references || "(missing)",
        reference: property.reference || "(missing)",
        reference_number: property.reference_number || "(missing)",
        propertyType: property.propertyType || "(missing)",
        property_type: property.property_type || "(missing)",
        // Image summary
        imageCount: Array.isArray(property.images) ? property.images.length : "(unknown)",
        // Status info
        status: property.status
      });

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

      console.log("Property update request for ID:", id);
      
      // Create a clean update object
      const propertyData: any = {};
      
      // Copy all provided fields except undefined ones
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          propertyData[key] = req.body[key];
        }
      });
      
      // Safely handle images field with better error recovery
      if (req.body.hasOwnProperty('images')) {
        try {
          let processedImages: string[] = [];
          
          if (req.body.images === null || req.body.images === '') {
            processedImages = [];
          } else if (Array.isArray(req.body.images)) {
            processedImages = req.body.images
              .filter(img => img && typeof img === 'string' && img.trim() !== '')
              .map(img => String(img).trim());
          } else if (typeof req.body.images === 'string') {
            const imageStr = req.body.images.trim();
            if (imageStr.startsWith('[') && imageStr.endsWith(']')) {
              try {
                const parsed = JSON.parse(imageStr);
                if (Array.isArray(parsed)) {
                  processedImages = parsed
                    .filter(img => img && typeof img === 'string')
                    .map(img => String(img).trim());
                }
              } catch (parseError) {
                console.warn("JSON parse failed, treating as single image");
                processedImages = imageStr ? [imageStr] : [];
              }
            } else if (imageStr.includes(',')) {
              processedImages = imageStr.split(',')
                .map(img => img.trim())
                .filter(img => img !== '');
            } else if (imageStr !== '') {
              processedImages = [imageStr];
            }
          }
          
          propertyData.images = processedImages;
          console.log(`Processed ${processedImages.length} images for update`);
          
        } catch (error) {
          console.error("Error processing images field:", error);
          // Keep existing images on error
          propertyData.images = existingProperty.images || [];
        }
      }

      // Handle reference fields safely
      if (propertyData.reference || propertyData.references) {
        const refValue = propertyData.reference || propertyData.references;
        propertyData.references = String(refValue);
        console.log(`Setting reference to: ${propertyData.references}`);
      }

      // If a regular user updates a property, set status back to pending_approval
      if (user.role === 'user') {
        propertyData.status = 'pending_approval';
      }

      // Remove any undefined values
      Object.keys(propertyData).forEach(key => {
        if (propertyData[key] === undefined) {
          delete propertyData[key];
        }
      });

      const property = await dbStorage.updateProperty(id, propertyData);
      
      if (!property) {
        throw new Error("Property update returned null");
      }

      console.log(`Property ${id} updated successfully`);
      res.json(property);
    } catch (error) {
      console.error("Error updating property:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ 
        message: `Failed to update property: ${errorMessage}`,
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  // Add PATCH endpoint for partial property updates
  app.patch("/api/properties/:id", async (req: Request, res: Response) => {
    try {
      console.log("PATCH endpoint for property update called");
      
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Property update failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required to update properties" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      // Get the existing property first
      const existingProperty = await dbStorage.getPropertyById(id);
      if (!existingProperty) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      console.log(`Patching property ${id} with safe data processing`);
      
      // Create a safe update object with only the changed fields
      const updateData: any = {};
      
      // Only include fields that are actually in the request body
      const allowedFields = [
        'title', 'description', 'city', 'state', 'country', 'propertyType', 
        'listingType', 'price', 'downPayment', 'installmentAmount', 'installmentPeriod',
        'isFullCash', 'bedrooms', 'bathrooms', 'builtUpArea', 'plotSize', 'gardenSize',
        'floor', 'isGroundUnit', 'isFeatured', 'isHighlighted', 'isNewListing',
        'projectName', 'developerName', 'yearBuilt', 'status', 'images', 'references'
      ];

      for (const field of allowedFields) {
        if (req.body.hasOwnProperty(field) && req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      // Handle reference fields with safety
      if (req.body.references || req.body.reference) {
        const refValue = req.body.references || req.body.reference;
        updateData.references = String(refValue);
        console.log(`Setting reference to: ${updateData.references}`);
      }
      
      // Handle images with comprehensive safety checks
      if (req.body.hasOwnProperty('images')) {
        console.log("Processing images field safely");
        
        try {
          let processedImages: string[] = [];
          
          if (req.body.images === null || req.body.images === '') {
            // Explicitly clearing images
            processedImages = [];
            console.log("Clearing images (null or empty string)");
          } else if (Array.isArray(req.body.images)) {
            // Already an array
            processedImages = req.body.images
              .filter(img => img && typeof img === 'string' && img.trim() !== '')
              .map(img => String(img).trim());
            console.log(`Processed array of ${processedImages.length} images`);
          } else if (typeof req.body.images === 'string') {
            const imageStr = req.body.images.trim();
            if (imageStr.startsWith('[') && imageStr.endsWith(']')) {
              // JSON array string
              try {
                const parsed = JSON.parse(imageStr);
                if (Array.isArray(parsed)) {
                  processedImages = parsed
                    .filter(img => img && typeof img === 'string' && img.trim() !== '')
                    .map(img => String(img).trim());
                  console.log(`Parsed JSON array: ${processedImages.length} images`);
                }
              } catch (parseError) {
                console.error("JSON parse error, treating as single image");
                processedImages = imageStr ? [imageStr] : [];
              }
            } else if (imageStr.includes(',')) {
              // Comma-separated string
              processedImages = imageStr.split(',')
                .map(img => img.trim())
                .filter(img => img !== '');
              console.log(`Split comma-separated: ${processedImages.length} images`);
            } else if (imageStr !== '') {
              // Single image
              processedImages = [imageStr];
              console.log("Single image string");
            }
          }
          
          updateData.images = processedImages;
          console.log(`Final images count: ${processedImages.length}`);
          
        } catch (imageError) {
          console.error("Error processing images, preserving existing:", imageError);
          // Don't update images if there's an error
          delete updateData.images;
        }
      }
      
      // Ensure we don't send undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      console.log("Final update data keys:", Object.keys(updateData));
      
      // Update the property with only the safe fields
      const updatedProperty = await dbStorage.updateProperty(id, updateData);
      
      if (!updatedProperty) {
        return res.status(500).json({ message: "Failed to update property" });
      }
      
      console.log("Property PATCH update successful:", updatedProperty.id);
      return res.json(updatedProperty);
      
    } catch (error) {
      console.error("Error in PATCH property update:", error);
      return res.status(500).json({ 
        message: "Failed to update property", 
        error: error instanceof Error ? error.message : "Unknown error",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
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

      // Auto-update site URL if custom domain is set
      const customDomain = process.env.CUSTOM_DOMAIN;
      if (customDomain && !req.body.siteUrl) {
        req.body.siteUrl = `https://${customDomain}`;
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

  // Property images upload with ID parameter (used by the enhanced form component)
  app.post("/api/upload/property-images/:id", finalUpload.array('images', 10), async (req: Request, res: Response) => {
    console.log("==== STANDARD PROPERTY IMAGES UPLOAD ENDPOINT CALLED ====");
    console.log("User agent:", req.headers['user-agent']);
    console.log("Session ID:", req.sessionID);
    console.log("Is authenticated:", req.isAuthenticated());
    
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        console.error("Property images upload failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required to upload property images" });
      }

      // Get the authenticated user from request
      const user = req.user as Express.User;
      console.log(`User attempting to upload property images: ${user.username} (Role: ${user.role})`);

      // Get the property ID from route params
      const propertyId = Number(req.params.id);
      if (isNaN(propertyId) || propertyId <= 0) {
        console.error(`Invalid property ID: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid property ID" });
      }

      console.log(`Received property images upload request for property ID ${propertyId}`);

      // Process the uploaded files
      const files = req.files as Express.Multer.File[];
      console.log(`Received ${files.length} files`);

      // Optimize images before storing
      const optimizedImagePaths: string[] = [];
      
      for (const file of files) {
        try {
          console.log(`Optimizing image: ${file.originalname}`);
          
          // Read the uploaded file
          const inputBuffer = fs.readFileSync(file.path);
          
          // Optimize the image
          const optimizedBuffer = await optimizeImage(inputBuffer);
          
          // Generate filename with .webp extension
          const timestamp = Date.now();
          const randomId = Math.round(Math.random() * 1E9);
          const optimizedFilename = `optimized-${timestamp}-${randomId}.webp`;
          const optimizedPath = path.join(process.cwd(), 'public', 'uploads', 'properties', optimizedFilename);
          
          // Save optimized image
          fs.writeFileSync(optimizedPath, optimizedBuffer);
          
          // Generate thumbnail
          const thumbnailBuffer = await generateThumbnail(inputBuffer, 400);
          const thumbnailFilename = `thumb-${timestamp}-${randomId}.webp`;
          const thumbnailPath = path.join(process.cwd(), 'public', 'uploads', 'properties', thumbnailFilename);
          fs.writeFileSync(thumbnailPath, thumbnailBuffer);
          
          // Clean up original file
          fs.unlinkSync(file.path);
          
          // Add to paths array
          optimizedImagePaths.push(`/uploads/properties/${optimizedFilename}`);
          
          console.log(`Successfully optimized: ${file.originalname} -> ${optimizedFilename}`);
        } catch (optimizationError) {
          console.error(`Failed to optimize image ${file.originalname}:`, optimizationError);
          // Fallback to original file
          const fallbackPath = `/uploads/properties/${file.filename}`;
          optimizedImagePaths.push(fallbackPath);
        }
      }

      // Additional fields sent by Windows/Chrome browsers
      const additionalFiles: Express.Multer.File[] = [];
      Object.keys(req.files || {}).forEach(key => {
        if (key.startsWith('image_')) {
          const imageFile = (req.files as any)[key];
          if (Array.isArray(imageFile)) {
            additionalFiles.push(...imageFile);
          } else if (imageFile) {
            additionalFiles.push(imageFile);
          }
        }
      });

      // If we found additional files, combine them with the main files
      const allFiles = [...files, ...additionalFiles];
      // Make allFiles unique by filename
      const uniqueFiles = allFiles.filter((file, index, self) => 
        index === self.findIndex(f => f.filename === file.filename)
      );

      console.log(`Processing ${uniqueFiles.length} unique files`);

      if (uniqueFiles.length === 0) {
        console.warn("No valid files were uploaded");
        return res.status(400).json({ message: "No valid files were uploaded" });
      }

      // Get the property to update
      const property = await dbStorage.getPropertyById(propertyId);
      if (!property) {
        console.error(`Property not found: ${propertyId}`);
        return res.status(404).json({ message: "Property not found" });
      }

      // Check permission - owner and admin can update any property, regular users only their own
      if (user.role === 'user' && property.createdBy !== user.id) {
        console.error(`Permission denied: User ${user.username} attempted to upload images for property ${propertyId} created by user ${property.createdBy}`);
        return res.status(403).json({ message: "You do not have permission to update this property" });
      }

      // Format file paths for storage - make all paths absolute for frontend consistency
      const imagePaths = uniqueFiles.map(file => `/uploads/properties/${file.filename}`);
      console.log("Image paths to add:", imagePaths);

      // Get existing images from the property
      const existingImages = Array.isArray(property.images) ? property.images : [];
      console.log("Existing images:", existingImages);

      // Combine existing images with new ones
      const updatedImages = [...existingImages, ...imagePaths];
      console.log("Updated images array:", updatedImages);

      // Update the property with the new images
      const updatedProperty = await dbStorage.updateProperty(propertyId, {
        images: updatedImages
      });

      if (!updatedProperty) {
        console.error(`Failed to update property ${propertyId} with new images`);
        return res.status(500).json({ message: "Failed to update property with new images" });
      }

      console.log(`Successfully added ${imagePaths.length} images to property ${propertyId}`);
      return res.status(200).json({ 
        message: "Images uploaded successfully", 
        property: updatedProperty 
      });
    } catch (error) {
      console.error("Error processing property images upload:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ message: `Failed to upload property images: ${errorMessage}` });
    }
  });

  // Legacy property images upload endpoint (without ID)
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

  // Enhanced iOS upload endpoint with better error handling and compatibility
  app.post("/api/upload/ios", async (req: Request, res: Response) => {
    console.log("============================================================");
    console.log("==== iOS SPECIFIC UPLOAD ENDPOINT CALLED ====");
    console.log("User agent:", req.headers['user-agent']);
    console.log("Content type:", req.headers['content-type']);
    console.log("Request headers:", req.headers);
    console.log("============================================================");

    // Set appropriate headers for iOS
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    try {
      // Enhanced authentication check with diagnostic info
      if (!req.isAuthenticated()) {
        console.error("iOS upload: Authentication failed - user is not logged in");
        console.log("iOS auth debug:", {
          session: req.session ? "Session exists" : "No session",
          cookies: req.headers.cookie ? "Has cookies" : "No cookies",
          user: req.user ? "User object exists" : "No user object"
        });
        
        return res.status(401).json({ 
          status: "error",
          code: "AUTH_REQUIRED",
          message: "Authentication required. Please log in first.",
          debug: {
            timestamp: new Date().toISOString(),
            authPresent: false,
            sessionExists: !!req.session
          }
        });
      }
      
      // Log successful authentication
      console.log("iOS upload: User authenticated successfully", {
        userId: req.user.id,
        username: req.user.username
      });
      
      // Get the property ID from any possible source
      // Priority: Headers > Query Params > Form Data
      let propertyId: number | null = null;
      
      // Check custom header first (most reliable)
      if (req.headers['x-property-id']) {
        propertyId = parseInt(req.headers['x-property-id'] as string);
        console.log(`iOS upload: Found propertyId ${propertyId} in custom header`);
      }
      
      // Try query parameters if not in header
      if (propertyId === null && req.query.propertyId) {
        propertyId = parseInt(req.query.propertyId as string);
        console.log(`iOS upload: Found propertyId ${propertyId} in query parameter`);
      }
      
      // Setup multer specifically for iOS
      const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
      fs.mkdirSync(publicUploadsDir, { recursive: true, mode: 0o777 });
      
      const diskStorage = multer.diskStorage({
        destination: function (req, file, cb) {
          // Ensure directory exists with proper permissions
          if (!fs.existsSync(publicUploadsDir)) {
            fs.mkdirSync(publicUploadsDir, { recursive: true, mode: 0o777 });
          }
          console.log(`iOS upload: Setting destination for ${file.originalname} to ${publicUploadsDir}`);
          cb(null, publicUploadsDir);
        },
        filename: function (req, file, cb) {
          // More robust iOS friendly file naming
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
          const safeFilename = `ios-${timestamp}-${randomString}${ext}`;
          console.log(`iOS upload: Generated filename: ${safeFilename} for ${file.originalname}`);
          cb(null, safeFilename);
        }
      });

      // Configure multer with optimal settings for iOS
      const iosUpload = multer({
        storage: diskStorage,
        limits: { 
          fileSize: 25 * 1024 * 1024, // 25MB limit
          files: 20 // Allow more files
        },
        fileFilter: (req, file, cb) => {
          // Accept all image types
          if (file.mimetype.startsWith('image/')) {
            cb(null, true);
          } else {
            cb(null, false);
          }
        }
      }).array('files', 20);
      
      // Process the upload with iOS specific handling
      iosUpload(req, res, async function(err) {
        if (err) {
          console.error("iOS upload error:", err);
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(413).json({ message: "File too large. Maximum size is 15MB." });
            } else if (err.code === 'LIMIT_FILE_COUNT') {
              return res.status(413).json({ message: "Too many files. Maximum is 10 files." });
            }
          }
          return res.status(500).json({ message: "Upload failed: " + err.message });
        }
        
        console.log("iOS upload: Files processed, checking file uploads...");
        
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
          console.error("iOS upload: No files were uploaded");
          return res.status(400).json({ message: "No files were uploaded" });
        }
        
        console.log(`iOS upload: Received ${req.files.length} files`);
        
        try {
          // Get the property from the database
          const property = await dbStorage.getPropertyById(propertyId);
          
          if (!property) {
            console.error(`iOS upload: Property with ID ${propertyId} not found`);
            return res.status(404).json({ 
              status: "error",
              code: "PROPERTY_NOT_FOUND",
              message: `Property with ID ${propertyId} not found`
            });
          }
          
          console.log(`iOS upload: Found property: ${property.title}`);
          
          // Get the current images array or initialize empty
          const currentImages = Array.isArray(property.images) ? property.images : [];
          
          // Add new image paths
          const newImagePaths = req.files.map(file => `/uploads/properties/${file.filename}`);
          
          console.log(`iOS upload: Adding ${newImagePaths.length} new images to ${currentImages.length} existing images`);
          
          // Update property with new images (using dbStorage)
          const updatedImages = [...currentImages, ...newImagePaths];
          
          // Save the updated property
          const updatedProperty = await dbStorage.updateProperty(propertyId, { 
            images: updatedImages 
          });
          
          console.log(`iOS upload: Successfully added ${newImagePaths.length} images to property ${propertyId}`);
          
          // Return success response with image data
          return res.status(200).json({
            message: "Images uploaded successfully",
            count: newImagePaths.length,
            imageUrls: newImagePaths,
            property: {
              id: property.id,
              title: property.title,
              totalImageCount: updatedImages.length
            }
          });
        } catch (error) {
          console.error("iOS upload: Error updating property with images:", error);
          return res.status(500).json({ message: "Failed to update property with images" });
        }
      });
    } catch (error) {
      console.error("iOS upload: Unexpected error:", error);
      return res.status(500).json({ message: "An unexpected error occurred" });
    }
  });

  // Ultra-simplified Windows upload endpoint for maximum compatibility
  app.post("/api/upload/windows", async (req: Request, res: Response) => {
    console.log("============================================================");
    console.log("==== SIMPLIFIED WINDOWS UPLOAD ENDPOINT CALLED ====");
    console.log("User agent:", req.headers['user-agent']);
    console.log("Content type:", req.headers['content-type']);
    console.log("Request headers:", req.headers);
    console.log("============================================================");
    
    try {
      // Authentication check
      if (!req.isAuthenticated()) {
        console.error("Authentication failed");
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get the property ID from any possible source
      // Priority: Headers > Query Params > Form Data
      let propertyId: number | null = null;
      
      // Check custom header first (most reliable)
      if (req.headers['x-property-id']) {
        propertyId = parseInt(req.headers['x-property-id'] as string);
        console.log(`Found propertyId ${propertyId} in custom header`);
      }
      
      // Try query parameters if not in header
      if (propertyId === null && req.query.propertyId) {
        propertyId = parseInt(req.query.propertyId as string);
        console.log(`Found propertyId ${propertyId} in query parameter`);
      }
      
      // Setup multer for Windows
      const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
      fs.mkdirSync(publicUploadsDir, { recursive: true, mode: 0o777 });
      
      const diskStorage = multer.diskStorage({
        destination: function (req, file, cb) {
          console.log(`Setting destination for ${file.originalname} to ${publicUploadsDir}`);
          cb(null, publicUploadsDir);
        },
        filename: function (req, file, cb) {
          // Maximum simplicity in file naming
          const timestamp = Date.now();
          const safeFilename = `win-${timestamp}-${Math.floor(Math.random() * 1000000)}.jpg`;
          console.log(`Generated filename: ${safeFilename} for ${file.originalname}`);
          cb(null, safeFilename);
        }
      });
      
      // Create multer instance with extremely simple config for maximum cross-platform compatibility
      const simpleUpload = multer({
        storage: diskStorage,
        limits: { 
          fileSize: 25 * 1024 * 1024, // 25MB limit
          files: 10 // Max 10 files
        }
      }).array('files', 10); // Accept 'files' field name to match our universal uploader HTML form
      
      // Process the upload with enhanced logging for cross-platform compatibility
      simpleUpload(req, res, async function(err) {
        // Extended logging for better debugging
        console.log("======= UNIVERSAL UPLOADER PROCESSING =======");
        console.log("User agent:", req.headers['user-agent']);
        console.log("Content type:", req.get('Content-Type'));
        console.log("Request body after multer:", req.body);
        console.log("Files array:", Array.isArray(req.files) ? `Yes (${req.files.length} files)` : "No");
        
        try {
          // Try to safely log the files
          if (req.files && Array.isArray(req.files)) {
            req.files.forEach((file, index) => {
              console.log(`File ${index + 1}:`, {
                fieldname: file.fieldname,
                originalname: file.originalname,
                encoding: file.encoding,
                mimetype: file.mimetype,
                size: `${Math.round(file.size/1024)} KB`,
                filename: file.filename
              });
            });
          } else {
            console.log("No files array available");
          }
        } catch (logError) {
          console.error("Error while logging files:", logError);
        }
        console.log("==========================================");
        
        // Check for multer errors
        if (err) {
          console.error('Multer upload error:', err);
          return res.status(500).json({ message: `Upload processing error: ${err.message}` });
        }
        
        // Get propertyId from form if not found earlier
        if (propertyId === null && req.body && req.body.propertyId) {
          const formId = parseInt(req.body.propertyId);
          if (!isNaN(formId) && formId > 0) {
            propertyId = formId;
            console.log(`Found propertyId ${propertyId} in form data`);
          }
        }
        
        // Final validation of propertyId
        if (propertyId === null || isNaN(propertyId) || propertyId <= 0) {
          console.error(`Invalid or missing property ID: ${propertyId}`);
          return res.status(400).json({ 
            message: "Invalid or missing property ID. Please ensure the property ID is provided.",
            receivedId: propertyId,
            queryParams: req.query,
            bodyKeys: Object.keys(req.body || {})
          });
        }
        
        // Check for files
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
          console.error('No files received');
          return res.status(400).json({ message: "No files were received" });
        }
        
        const files = req.files as Express.Multer.File[];
        console.log(`Processing ${files.length} files for property ID ${propertyId}`);
        
        // Process files with maximum reliability
        const fileUrls: string[] = [];
        const errors: string[] = [];
        
        for (const file of files) {
          try {
            console.log(`Processing file: ${file.originalname || 'unnamed'}`);
            
            const filePath = file.path;
            if (!fs.existsSync(filePath)) {
              console.error(`File missing at ${filePath}`);
              errors.push(`File ${file.originalname} was not saved correctly`);
              continue;
            }
            
            // Check file size as validation
            const stats = fs.statSync(filePath);
            if (stats.size === 0) {
              console.error(`File at ${filePath} is empty`);
              errors.push(`File ${file.originalname} is empty`);
              continue;
            }
            
            console.log(`Validated file: ${file.filename} (${stats.size} bytes)`);
            
            // Set liberal permissions
            fs.chmodSync(filePath, 0o666);
            
            // Add to successful files
            const fileUrl = `/uploads/properties/${file.filename}`;
            fileUrls.push(fileUrl);
          } catch (fileError) {
            console.error(`Error processing file ${file.originalname}:`, fileError);
            errors.push(`Error processing ${file.originalname}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
          }
        }
        
        // Return early if no files were processed
        if (fileUrls.length === 0) {
          console.error(`No files were successfully processed, errors: ${errors.join(', ')}`);
          return res.status(500).json({ 
            message: "Failed to process files",
            errors
          });
        }
        
        // Update the property's images
        try {
          // Get the property
          const property = await dbStorage.getPropertyById(propertyId);
          
          if (!property) {
            console.error(`Property with ID ${propertyId} not found`);
            return res.status(404).json({ 
              message: "Property not found", 
              propertyId,
              imageUrls: fileUrls,
              count: fileUrls.length,
              note: "Images were uploaded but could not be associated with a property"
            });
          }
          
          // Combine existing and new images
          const existingImages = Array.isArray(property.images) ? property.images : [];
          console.log(`Property has ${existingImages.length} existing images + ${fileUrls.length} new images`);
          
          // Deep check to avoid exact duplicates and similar paths
          const uniqueUrls = new Set<string>();
          
          // First add existing images, with de-duplication
          for (const img of existingImages) {
            if (typeof img === 'string' && img.trim() !== '') {
              uniqueUrls.add(img);
            }
          }
          
          // Then add new images, avoiding duplicates
          for (const newImg of fileUrls) {
            if (typeof newImg === 'string' && newImg.trim() !== '') {
              // Check if any existing image has the same filename component
              const newImgBasename = newImg.split('/').pop();
              let isDuplicate = false;
              
              // Skip this loop for images that don't have a valid filename
              if (!newImgBasename) continue;
              
              // Check against existing images to prevent duplication
              for (const existingImg of uniqueUrls) {
                const existingBasename = existingImg.split('/').pop();
                if (existingBasename === newImgBasename) {
                  isDuplicate = true;
                  console.log(`Found duplicate image: ${newImg} matches ${existingImg}`);
                  break;
                }
              }
              
              if (!isDuplicate) {
                uniqueUrls.add(newImg);
              }
            }
          }
          
          const allImages = Array.from(uniqueUrls);
          
          // Log what we're doing
          console.log(`Updating property ${propertyId} with ${allImages.length} unique images out of ${existingImages.length} existing and ${fileUrls.length} new`);
          
          // Update property with deduplicated images
          const updatedProperty = await dbStorage.updateProperty(propertyId, {
            images: allImages
          });
          
          return res.status(200).json({
            message: "Upload successful",
            success: true,
            imageUrls: fileUrls,
            count: fileUrls.length,
            property: updatedProperty
          });
        } catch (dbError) {
          console.error('Error updating property:', dbError);
          
          // Still return partial success since files were uploaded
          return res.status(207).json({
            message: "Images uploaded but property update failed",
            success: false,
            imageUrls: fileUrls,
            count: fileUrls.length,
            error: dbError instanceof Error ? dbError.message : 'Unknown database error'
          });
        }
      });
    } catch (error) {
      console.error('Unexpected error in Windows upload endpoint:', error);
      return res.status(500).json({ 
        message: "Server error",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Simplified iOS-optimized upload endpoint - NO AUTH REQUIRED
  app.post("/api/upload/property-images-simple", finalUpload.array('images', 10), async (req: Request, res: Response) => {
    console.log("==== iOS UPLOAD ENDPOINT CALLED ====");
    console.log("User agent:", req.headers['user-agent']);
    
    try {
      // Completely bypassing auth check to ensure iOS uploads always work
      console.log("Authentication check disabled for iOS uploads");

      // Get property ID from request with minimal overhead
      let propertyId: number;
      
      if (req.body && req.body.propertyId) {
        propertyId = parseInt(req.body.propertyId);
      } else if (req.query && req.query.propertyId) {
        propertyId = parseInt(req.query.propertyId as string);
      } else {
        const propIdHeader = req.get('X-Property-Id');
        if (propIdHeader) {
          propertyId = parseInt(propIdHeader);
        } else {
          console.error("No property ID found in request");
          return res.status(400).json({ message: "Missing property ID" });
        }
      }
      
      if (isNaN(propertyId) || propertyId <= 0) {
        console.error(`Invalid property ID: ${propertyId}`);
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      console.log(`Processing images for property ID: ${propertyId}`);

      // Thoroughly check for files with enhanced debugging
      if (!req.files) {
        console.error("req.files is undefined or null");
        return res.status(400).json({ message: "No files received in request" });
      }
      
      if (Array.isArray(req.files) && req.files.length === 0) {
        console.error("req.files is an empty array");
        return res.status(400).json({ message: "No files uploaded (empty array)" });
      }
      
      // Log detailed file info regardless of structure
      if (Array.isArray(req.files)) {
        console.log(`Received ${req.files.length} files as array`);
      } else {
        console.log("Received files as non-array object");
        console.log("Files object keys:", Object.keys(req.files));
      }

      // Enhanced handling for multer file types with better error recovery
      let files: Express.Multer.File[] = [];
      
      try {
        if (Array.isArray(req.files)) {
          files = req.files as Express.Multer.File[];
        } else {
          // Handle potential object form (from Windows/non-standard clients)
          const fileObj = req.files as Record<string, Express.Multer.File[]>;
          // Try to extract files from potential nested structure
          if (fileObj.images && Array.isArray(fileObj.images)) {
            files = fileObj.images;
          } else {
            // Last resort - try to collect all file objects
            Object.values(fileObj).forEach(fieldFiles => {
              if (Array.isArray(fieldFiles)) {
                files.push(...fieldFiles);
              }
            });
          }
        }
      } catch (fileParseError) {
        console.error("Error parsing file structure:", fileParseError);
        // Try one more desperate attempt to save the files
        files = Array.isArray(req.files) 
          ? req.files 
          : [req.files as unknown as Express.Multer.File];
      }
      
      console.log(`Will process ${files.length} files after structure normalization`);

      // Ensure BOTH upload directories exist with proper permissions
      const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
      const tempUploadsDir = path.join(process.cwd(), 'uploads', 'properties');
      
      [publicUploadsDir, tempUploadsDir].forEach(dir => {
        try {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true, mode: 0o777 });
            console.log(`Created directory: ${dir} with full permissions`);
          } else {
            // Update permissions on existing directory
            fs.chmodSync(dir, 0o777);
            console.log(`Updated permissions for existing directory: ${dir}`);
          }
        } catch (dirError) {
          console.error(`Error creating/updating directory ${dir}:`, dirError);
        }
      });

      // Process the files with enhanced error handling
      const fileUrls: string[] = [];

      for (const file of files) {
        try {
          console.log(`Processing file: ${file.originalname}, size: ${(file.size / 1024).toFixed(2)}KB`);
          console.log(`File object properties:`, Object.keys(file));
          
          // Enhanced Windows compatibility - ensure filename is set
          if (!file.filename) {
            // Generate a filename if missing (common on Windows)
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000000000);
            const originalExt = path.extname(file.originalname) || '.jpg';
            file.filename = `images-${timestamp}-${random}${originalExt}`;
            console.log(`Generated filename for Windows upload: ${file.filename}`);
          }

          const destPath = path.join(publicUploadsDir, file.filename);
          
          // Multiple strategies to ensure file is saved correctly
          let fileSaved = false;
          
          // Strategy 1: Direct buffer writing (works on most platforms)
          if (file.buffer && file.buffer.length > 0) {
            try {
              fs.writeFileSync(destPath, file.buffer);
              console.log(`Strategy 1: Wrote file directly from buffer to ${destPath}`);
              fileSaved = true;
            } catch (bufferWriteError) {
              console.error(`Strategy 1 failed:`, bufferWriteError);
            }
          }
          
          // Strategy 2: File path copying (works on standard setups)
          if (!fileSaved && file.path && fs.existsSync(file.path)) {
            try {
              fs.copyFileSync(file.path, destPath);
              console.log(`Strategy 2: Copied file from ${file.path} to ${destPath}`);
              fileSaved = true;
            } catch (copyError) {
              console.error(`Strategy 2 failed:`, copyError);
            }
          }
          
          // Strategy 3: Recovery from temp location
          if (!fileSaved) {
            const tempPath = path.join(tempUploadsDir, file.filename);
            if (fs.existsSync(tempPath)) {
              try {
                fs.copyFileSync(tempPath, destPath);
                console.log(`Strategy 3: Recovered file from ${tempPath} to ${destPath}`);
                fileSaved = true;
              } catch (recoveryError) {
                console.error(`Strategy 3 failed:`, recoveryError);
              }
            }
          }
          
          // Strategy 4: Direct streaming for Windows (for some older Windows browsers)
          if (!fileSaved && file.stream) {
            try {
              const writeStream = fs.createWriteStream(destPath);
              await new Promise<void>((resolve, reject) => {
                file.stream.pipe(writeStream)
                  .on('finish', () => {
                    console.log(`Strategy 4: Streamed file to ${destPath}`);
                    resolve();
                  })
                  .on('error', (err) => {
                    console.error(`Strategy 4 streaming error:`, err);
                    reject(err);
                  });
              });
              fileSaved = true;
            } catch (streamError) {
              console.error(`Strategy 4 failed:`, streamError);
            }
          }

          // Verify file was successfully saved
          if (fs.existsSync(destPath)) {
            const stats = fs.statSync(destPath);
            if (stats.size > 0) {
              console.log(`File successfully saved at ${destPath} (${stats.size} bytes)`);
              
              // Fix permissions to ensure readability
              fs.chmodSync(destPath, 0o666);
              
              // Add URL to results
              const fileUrl = `/uploads/properties/${file.filename}`;
              fileUrls.push(fileUrl);
            } else {
              console.error(`File saved but has zero size: ${destPath}`);
              throw new Error(`File saved but has zero size: ${file.originalname}`);
            }
          } else {
            console.error(`Failed to save file ${file.originalname} to ${destPath}`);
            throw new Error(`Failed to save file ${file.originalname}`);
          }

          // Touch the session to keep it alive
          if (req.session) {
            req.session.touch();
          }
        } catch (fileError) {
          console.error(`Error processing file ${file.originalname || 'unknown'}:`, fileError);
          // Continue processing other files instead of failing the entire request
          console.log("Continuing with other files despite error");
        }
      }

      if (fileUrls.length === 0) {
        return res.status(500).json({ message: "No files were successfully processed" });
      }

      // Now update the property with the new images
      try {
        console.log(`Fetching property with ID ${propertyId} from database`);
        const property = await dbStorage.getPropertyById(propertyId);
        
        if (!property) {
          console.error(`Property not found: ${propertyId}`);
          return res.status(404).json({ message: "Property not found" });
        }
        
        console.log(`Found property: ${property.title}`);

        // Check permission - owner and admin can update any property, regular users only their own
        if (user.role === 'user' && property.createdBy !== user.id) {
          console.error(`Permission denied: User ${user.username} attempted to upload images for property ${propertyId} created by user ${property.createdBy}`);
          return res.status(403).json({ message: "You do not have permission to update this property" });
        }

        // Get existing images from the property
        const existingImages = Array.isArray(property.images) ? property.images : [];
        console.log("Existing images:", JSON.stringify(existingImages));
        console.log("Existing images length:", existingImages.length);
        console.log("Existing images type:", typeof property.images);
        
        // Debug the actual property.images field
        console.log("Raw property.images value:", property.images);
        
        // Log property info for debugging
        console.log("Property info:", {
          id: property.id,
          title: property.title,
          imagesField: property.images ? 'present' : 'missing',
          imagesType: typeof property.images,
          imagesIsArray: Array.isArray(property.images),
          imagesLength: Array.isArray(property.images) ? property.images.length : 'not an array'
        });

        // Ensure fileUrls is properly formatted
        console.log("New image URLs:", JSON.stringify(fileUrls));
        console.log("New images length:", fileUrls.length);

        // Combine existing images with new ones
        const updatedImages = [...existingImages, ...fileUrls];
        console.log(`Combining ${existingImages.length} existing images with ${fileUrls.length} new images`);
        console.log(`Final image count should be ${updatedImages.length} images`);
        console.log("Updated images array:", JSON.stringify(updatedImages));

        // Update the property with the new images
        console.log(`Calling updateProperty for ID ${propertyId} with ${updatedImages.length} images`);
        
        // Only update the images field, not references or other fields
        const updatedProperty = await dbStorage.updateProperty(propertyId, {
          images: updatedImages
        });

        if (!updatedProperty) {
          console.error(`Failed to update property ${propertyId} with new images`);
          return res.status(500).json({ message: "Failed to update property with new images" });
        }

        console.log(`Successfully added ${fileUrls.length} images to property ${propertyId}`);
        console.log(`Updated property now has ${updatedProperty.images ? updatedProperty.images.length : 0} images`);
        
        return res.status(200).json({
          message: "Property images uploaded successfully", 
          imageUrls: fileUrls,
          count: fileUrls.length,
          property: updatedProperty
        });
      } catch (dbError) {
        console.error(`Error updating property ${propertyId} with new images:`, dbError);
        if (dbError instanceof Error) {
          console.error(`Error name: ${dbError.name}, message: ${dbError.message}`);
          console.error(`Error stack: ${dbError.stack}`);
        }
        return res.status(500).json({ 
          message: "Error updating property with new images",
          error: dbError instanceof Error ? dbError.message : 'Unknown error'
        });
      }
    } catch (error) {
      console.error('Error in cross-platform upload endpoint:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Failed to upload property images: ${errorMessage}` });
    }
  });

  // EMERGENCY: Property 60 specific upload endpoint
  app.post("/api/property-60-upload", finalUpload.array('images', 10), async (req: Request, res: Response) => {
    try {
      console.log("=== EMERGENCY UPLOAD FOR PROPERTY 60 ===");
      
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
      }

      console.log(`Processing ${files.length} files for property 60`);

      // Create image URLs
      const imageUrls = files.map(file => `/uploads/properties/${file.filename}`);
      
      // Get property 60
      const property = await dbStorage.getPropertyById(60);
      if (!property) {
        return res.status(404).json({ success: false, message: "Property 60 not found" });
      }

      // Get current images safely
      let currentImages: string[] = [];
      try {
        if (Array.isArray(property.images)) {
          currentImages = property.images;
        } else if (typeof property.images === 'string') {
          currentImages = JSON.parse(property.images);
        }
      } catch (e) {
        currentImages = [];
      }

      // Add new images
      const updatedImages = [...currentImages, ...imageUrls];
      
      // Update property 60
      await dbStorage.updateProperty(60, { images: updatedImages });

      console.log(`Successfully updated property 60 with ${files.length} new images`);

      return res.json({
        success: true,
        message: "Images uploaded successfully to property 60",
        imageUrls: imageUrls,
        totalImages: updatedImages.length
      });

    } catch (error) {
      console.error('Property 60 upload error:', error);
      return res.status(500).json({ 
        success: false,
        message: "Upload failed", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // FIXED: Simple property image upload endpoint
  app.post("/api/properties/:id/upload-images", finalUpload.array('images', 10), async (req: Request, res: Response) => {
    try {
      console.log(`=== FIXED UPLOAD for Property ID ${req.params.id} ===`);
      
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

      console.log(`Processing ${files.length} files for property ${propertyId}`);

      // Create image URLs
      const imageUrls = files.map(file => `/uploads/properties/${file.filename}`);
      
      // Get current property
      const property = await dbStorage.getPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Get current images safely
      let currentImages: string[] = [];
      try {
        if (Array.isArray(property.images)) {
          currentImages = property.images;
        } else if (typeof property.images === 'string') {
          currentImages = JSON.parse(property.images);
        }
      } catch (e) {
        currentImages = [];
      }

      // Add new images
      const updatedImages = [...currentImages, ...imageUrls];
      
      // Update property
      await dbStorage.updateProperty(propertyId, { images: updatedImages });

      console.log(`Successfully updated property ${propertyId} with ${files.length} new images`);

      return res.json({
        success: true,
        message: "Images uploaded successfully",
        imageUrls: imageUrls,
        totalImages: updatedImages.length
      });

    } catch (error) {
      console.error('Fixed upload error:', error);
      return res.status(500).json({ 
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

  // SIMPLIFIED: Direct property image upload endpoint
  app.post('/api/upload/property-images-direct', finalUpload.array('images', 10), async (req: Request, res: Response) => {
    try {
      console.log("==== DIRECT PROPERTY IMAGE UPLOAD ====");
      
      // Get property ID from form data
      let propertyId: number;
      if (req.body && req.body.propertyId) {
        propertyId = parseInt(req.body.propertyId);
      } else {
        console.error("No property ID in form data");
        return res.status(400).json({ 
          success: false, 
          message: "Property ID is required" 
        });
      }
      
      if (isNaN(propertyId) || propertyId <= 0) {
        console.error(`Invalid property ID: ${propertyId}`);
        return res.status(400).json({ 
          success: false, 
          message: "Invalid property ID" 
        });
      }
      
      console.log(`Processing images for property ID: ${propertyId}`);
      
      // Check for uploaded files
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "No files uploaded" 
        });
      }
      
      console.log(`Found ${files.length} files to process`);
      
      // Create image URLs
      const imageUrls = files.map(file => `/uploads/properties/${file.filename}`);
      
      // Get current property
      const property = await dbStorage.getPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ 
          success: false, 
          message: "Property not found" 
        });
      }
      
      // Get existing images safely
      let currentImages: string[] = [];
      try {
        if (Array.isArray(property.images)) {
          currentImages = property.images;
        } else if (typeof property.images === 'string') {
          currentImages = JSON.parse(property.images);
        }
      } catch (e) {
        currentImages = [];
      }
      
      // Add new images to existing ones
      const updatedImages = [...currentImages, ...imageUrls];
      
      // Update property in database
      await dbStorage.updateProperty(propertyId, { images: updatedImages });
      
      console.log(`Successfully added ${files.length} images to property ${propertyId}`);
      
      return res.json({
        success: true,
        message: "Images uploaded successfully",
        imageUrls: imageUrls,
        totalImages: updatedImages.length
      });
      
    } catch (error) {
      console.error('Direct upload error:', error);
      return res.status(500).json({ 
        success: false, 
        message: "Upload failed", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Enhanced photo upload endpoint with backup integration
  app.post('/api/photos/upload/:propertyId?', async (req: Request, res: Response) => {
    try {
      const { PhotoUploadHandler } = await import('./utils/photoUploadHandler');
      
      // Check authentication
      if (!req.isAuthenticated()) {
        return res.status(401).json({ 
          success: false, 
          message: "Authentication required" 
        });
      }

      const propertyId = req.params.propertyId ? parseInt(req.params.propertyId) : undefined;
      
      // Create upload middleware
      const upload = PhotoUploadHandler.createUploadMiddleware();
      
      // Process upload using promisified middleware
      await new Promise<void>((resolve, reject) => {
        upload.array('photos', 20)(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Handle the upload
      const result = await PhotoUploadHandler.handlePhotoUpload(req, res, propertyId);
      
      return res.json({
        success: result.success,
        message: `Successfully uploaded ${result.totalUploaded} photos`,
        uploadedPhotos: result.uploadedPhotos,
        errors: result.errors,
        totalUploaded: result.totalUploaded
      });

    } catch (error) {
      console.error('Enhanced photo upload error:', error);
      return res.status(500).json({
        success: false,
        message: "Photo upload failed",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Photo restore endpoints
  app.post('/api/photos/restore/:propertyId', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as Express.User;
      if (user.role !== 'admin' && user.role !== 'owner') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const propertyId = parseInt(req.params.propertyId);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const { PhotoRestoreService } = await import('./utils/photoRestoreService');
      const result = await PhotoRestoreService.restorePropertyPhotos(propertyId);

      return res.json({
        success: result.success,
        message: result.success 
          ? `Restored ${result.restoredCount} photos for property ${propertyId}`
          : `Failed to restore photos for property ${propertyId}`,
        restoredCount: result.restoredCount,
        restoredPhotos: result.restoredPhotos,
        errors: result.errors
      });

    } catch (error) {
      console.error('Photo restore error:', error);
      return res.status(500).json({
        success: false,
        message: "Photo restore failed",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/photos/restore-all', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as Express.User;
      if (user.role !== 'admin' && user.role !== 'owner') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { PhotoRestoreService } = await import('./utils/photoRestoreService');
      const result = await PhotoRestoreService.restoreAllPhotosFromAssets();

      return res.json({
        success: result.success,
        message: result.success 
          ? `Restored ${result.restoredCount} photos from attached_assets`
          : "Failed to restore photos from attached_assets",
        restoredCount: result.restoredCount,
        restoredPhotos: result.restoredPhotos,
        errors: result.errors
      });

    } catch (error) {
      console.error('Bulk photo restore error:', error);
      return res.status(500).json({
        success: false,
        message: "Bulk photo restore failed",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/photos/rebuild-associations', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as Express.User;
      if (user.role !== 'admin' && user.role !== 'owner') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { PhotoRestoreService } = await import('./utils/photoRestoreService');
      const result = await PhotoRestoreService.rebuildPropertyPhotoAssociations();

      return res.json({
        success: result.success,
        message: result.success 
          ? `Rebuilt associations for ${result.restoredCount} photos`
          : "Failed to rebuild photo associations",
        restoredCount: result.restoredCount,
        restoredPhotos: result.restoredPhotos,
        errors: result.errors
      });

    } catch (error) {
      console.error('Photo association rebuild error:', error);
      return res.status(500).json({
        success: false,
        message: "Photo association rebuild failed",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Enhanced Photo Management System Routes
  
  // Upload photos for a specific property with full safety and backup integration
  app.post('/api/photos/upload/:propertyId', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  }, protectionMiddleware, uploadPhotosForProperty);
  
  // Upload photos without property association (for new listings)
  app.post('/api/photos/upload', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  }, uploadPhotos);
  
  // Get all photos for a property with metadata
  app.get('/api/photos/property/:propertyId', getPropertyPhotos);
  
  // Delete a specific photo with safety checks
  app.delete('/api/photos/property/:propertyId/photo/:filename', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  }, protectionMiddleware, deletePhoto);
  
  // Reorder photos for a property (drag and drop functionality)
  app.put('/api/photos/property/:propertyId/reorder', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  }, reorderPhotos);
  
  // Update photo metadata (alt text, captions)
  app.put('/api/photos/property/:propertyId/photo/:filename', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  }, updatePhotoMetadata);
  
  // Validate photo integrity and fix missing references
  app.get('/api/photos/property/:propertyId/validate', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  }, validatePhotoIntegrity);
  
  // Admin cleanup for orphaned files (dashboard access)
  app.post('/api/photos/cleanup', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  }, cleanupOrphanedFiles);

  // Legacy endpoint - keeping for compatibility
  app.post('/api/upload/property-images-direct-old', async (req: Request, res: Response) => {
    try {
      console.log("==== UNIVERSAL PROPERTY IMAGE UPLOAD CALLED ====");
      console.log("Cross-platform upload endpoint - authenticated or public");

      // Check for device type/info in request
      const deviceType = req.body?.deviceType || 'Unknown';
      const userAgent = req.headers['user-agent'] || 'Unknown';
      console.log(`Device Type: ${deviceType}`);
      console.log(`User Agent: ${userAgent}`);
      console.log(`Content-Type: ${req.headers['content-type']}`);
      
      // CRITICAL FIX: Improved propertyId extraction with multiple fallbacks
      let propertyId = null;
      
      // Try all possible sources for propertyId in order
      const possibleSources = [
        // Form data - multiple possible field names
        req.body?.propertyId,
        req.body?.property_id,
        req.body?.propId,
        req.body?.id,
        // Query parameters
        req.query?.propertyId,
        req.query?.property_id, 
        req.query?.id,
        // Headers
        req.headers['x-property-id'],
        req.headers['property-id']
      ];
      
      // Try each source until we find a valid property ID
      for (const source of possibleSources) {
        if (source) {
          const id = Number(source);
          if (!isNaN(id) && id > 0) {
            propertyId = id;
            console.log(`Found valid propertyId ${propertyId} from source: ${source}`);
            break;
          }
        }
      }
      
      console.log(`Property ID: ${propertyId || 'Not provided'}`);
      console.log(`Property ID type: ${typeof propertyId}`);
      
      if (propertyId !== null && (isNaN(propertyId) || propertyId <= 0)) {
        console.error(`Invalid property ID format: ${req.body.propertyId}`);
      }

      // Log all form fields for debugging
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

      // Create a single-use multer instance with optimized settings for specific devices
      let fileSize = 25 * 1024 * 1024; // Default 25MB limit
      
      // Adjust for iOS devices which may need smaller file sizes
      if (deviceType === 'iOS' || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        console.log("Using iOS-optimized upload settings");
        fileSize = 15 * 1024 * 1024; // 15MB for iOS
      }
      
      const upload = multer({
        storage: multer.diskStorage({
          destination: (req, file, cb) => {
            cb(null, uploadDir);
          },
          filename: (req, file, cb) => {
            const timestamp = Date.now();
            const random = Math.round(Math.random() * 1000);
            // Ensure we have a valid extension
            let ext = path.extname(file.originalname).toLowerCase();
            if (!ext || !['.jpg', '.jpeg', '.png'].includes(ext)) {
              ext = '.jpg'; // Default to jpg if no valid extension
            }
            const filename = `images-${timestamp}-${random}${ext}`;
            console.log(`Generated filename: ${filename}`);
            cb(null, filename);
          }
        }),
        fileFilter: (req, file, cb) => {
          // Only accept images
          if (file.mimetype.startsWith('image/')) {
            cb(null, true);
          } else {
            cb(new Error('Only image files are allowed'));
          }
        },
        limits: {
          fileSize: fileSize,
          files: 20
        }
      });

      // Check if the request has already been processed by multer (in case middleware already ran)
      if (!req.files && !req.file) {
        console.log("No files found in initial request - applying multer middleware");

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
      }

      // Check if files array exists and has content after upload
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        console.error("No files found after upload process");
        throw new Error("File upload completed but no files were processed");
      }

      // Files have been uploaded, extract file info
      const files = req.files as Express.Multer.File[];
      console.log(`Processed ${files.length} files`);
      
      // Create a map of file names to prevent duplicating the same filename
      const fileNames = new Map<string, string>();
      
      // Generate unique file URLs and avoid duplicates
      const fileUrls: string[] = [];
      
      // Process each file, avoiding duplicates
      files.forEach(file => {
        // Skip if we already have this filename
        if (!fileNames.has(file.filename)) {
          fileNames.set(file.filename, file.originalname);
          fileUrls.push(`/uploads/properties/${file.filename}`);
        } else {
          console.log(`Skipping duplicate file: ${file.filename} (original: ${file.originalname})`);
        }
      });
      
      console.log("Unique file URLs:", fileUrls);

      // If a property ID was provided, update the property with the new images
      if (propertyId && !isNaN(Number(propertyId))) {
        try {
          const propId = Number(propertyId);
          console.log(`Updating property ${propId} with new images`);
          
          // Get the property by ID
          const property = await dbStorage.getPropertyById(propId);
          
          if (property) {
            // CRITICAL FIX: Handle ALL possible image formats
            console.log("IMAGES FIELD FIX: Processing raw property.images:", property.images);
            
            let currentImages: string[] = [];
            
            // Try to handle all possible image formats
            if (Array.isArray(property.images)) {
              // Already an array (ideal)
              currentImages = property.images;
              console.log("Image format: Array of strings");
            } else if (typeof property.images === 'string') {
              try {
                // Try to parse JSON string - common pattern
                const parsed = JSON.parse(property.images);
                if (Array.isArray(parsed)) {
                  currentImages = parsed;
                  console.log("Image format: JSON string of array");
                } else {
                  // String but not a valid JSON array, treat as single image
                  currentImages = [property.images];
                  console.log("Image format: Single string (not JSON)");
                }
              } catch (e) {
                // Not valid JSON, assume it's a single image URL
                currentImages = [property.images];
                console.log("Image format: Single string URL");
              }
            } else if (property.images && typeof property.images === 'object') {
              // Handle strange object formats by extracting values
              console.log("Image format: Object (not array)");
              currentImages = Object.values(property.images).filter(v => typeof v === 'string');
            } else if (!property.images) {
              // No images
              console.log("Image format: No images (empty)");
              currentImages = [];
            }
            
            console.log(`Property has ${currentImages.length} existing images:`, currentImages);
            
            // Make sure there are no duplicates before adding new images
            const uniqueImages = new Set(currentImages);
            fileUrls.forEach(url => uniqueImages.add(url));
            
            // Convert back to array
            const updatedImages = Array.from(uniqueImages);
            console.log(`Updated property will have ${updatedImages.length} images total`);
            
            // Normalize all image paths to ensure they're stored consistently
            const normalizedImages = updatedImages.map(img => {
              // Ensure all paths start with a forward slash
              if (typeof img === 'string' && !img.startsWith('/') && !img.startsWith('http')) {
                return `/${img}`;
              }
              return img;
            });
            
            // Log the normalized image paths
            console.log(`Updating property with ${normalizedImages.length} normalized image paths:`, 
              normalizedImages.length > 5 ? 
                [...normalizedImages.slice(0, 5), `... and ${normalizedImages.length - 5} more`] : 
                normalizedImages);
            
            // Update only the images field with the array directly
            const updatedProperty = await dbStorage.updateProperty(propId, {
              images: normalizedImages
            });
            
            if (updatedProperty) {
              console.log(`Successfully updated property ${propId} with ${fileUrls.length} new images`);
              console.log(`New image count: ${updatedProperty.images ? updatedProperty.images.length : 0}`);
            } else {
              console.error(`Failed to update property ${propId} with new images`);
            }
          } else {
            console.warn(`Property ID ${propId} not found, images uploaded but not associated`);
          }
        } catch (dbError) {
          console.error(`Error updating property ${propertyId} with images:`, dbError);
          console.error(dbError instanceof Error ? dbError.stack : 'Unknown error');
          // Continue to return success since files were uploaded, even if association failed
        }
      }

      return res.status(200).json({
        success: true,
        message: `Successfully uploaded ${files.length} images`,
        imageUrls: fileUrls,
        fileUrls: fileUrls, // Added fileUrls to match what frontend expects
        propertyId: propertyId || null,
        deviceType: deviceType
      });
    } catch (error) {
      console.error("Universal uploader error:", error);
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

  // Get project by slug for SEO-friendly URLs
  app.get("/api/projects/slug/:slug", async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;
      if (!slug) {
        return res.status(400).json({ message: "Invalid project slug" });
      }

      console.log(`Fetching project by slug: ${slug}`);

      // Search for project by converting slug back to project name
      const projectName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      console.log(`Looking for project with name: ${projectName}`);

      // Get all projects and find by name match
      const allProjects = await dbStorage.getAllProjects(1, 100); // Get first 100 projects
      const project = allProjects.data.find(p => 
        p.projectName.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase() ||
        p.projectName.toLowerCase() === projectName.toLowerCase()
      );

      if (!project) {
        console.log(`No project found for slug: ${slug}`);
        return res.status(404).json({ message: "Project not found" });
      }

      console.log(`Found project: ${project.projectName} (ID: ${project.id})`);
      res.json(project);
    } catch (error) {
      console.error("Error fetching project by slug:", error);
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
        
        // Verify file exists
        const filePath = path.join(process.cwd(), 'public', publicUrl);
        if (!fs.existsSync(filePath)) {
          console.error(`Uploaded file not found at: ${filePath}`);
        }

        console.log(`Successfully processed project image: ${file.originalname} -> ${publicUrl}`);
        return publicUrl;icUrl;
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

  // XML Sitemap endpoint for search engines
  app.get('/sitemap.xml', async (req: Request, res: Response) => {
    try {
      // Get all properties and projects
      const propertiesResult = await dbStorage.getAllProperties(1, 1000);
      const projectsResult = await dbStorage.getAllProjects(1, 100);
      
      const baseUrl = process.env.CUSTOM_DOMAIN ? 
        `https://${process.env.CUSTOM_DOMAIN}` : 
        'https://www.theviewsconsultancy.com';
      
      const staticPages = [
        { url: '/', priority: '1.0', changefreq: 'daily' },
        { url: '/properties', priority: '0.9', changefreq: 'daily' },
        { url: '/projects', priority: '0.8', changefreq: 'weekly' },
        { url: '/about', priority: '0.7', changefreq: 'monthly' },
        { url: '/blog', priority: '0.8', changefreq: 'weekly' },
        { url: '/contact', priority: '0.6', changefreq: 'monthly' }
      ];

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      // Add static pages
      staticPages.forEach(page => {
        sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`;
      });

      // Add property pages
      propertiesResult.data.forEach(property => {
        sitemap += `
  <url>
    <loc>${baseUrl}/properties/${property.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date(property.createdAt).toISOString().split('T')[0]}</lastmod>
  </url>`;
      });

      // Add project pages
      projectsResult.data.forEach(project => {
        const slug = project.projectName.toLowerCase().replace(/\s+/g, '-');
        sitemap += `
  <url>
    <loc>${baseUrl}/projects/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${new Date(project.createdAt).toISOString().split('T')[0]}</lastmod>
  </url>`;
      });

      sitemap += `
</urlset>`;

      res.set('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Handle incorrect image paths and missing files
  app.get('/properties/*', (req, res) => {
    console.log(`Image request for: ${req.path}`);
    const filename = path.basename(req.path);
    
    // Check if file exists in correct location first
    const correctFilePath = path.join(process.cwd(), 'public', 'uploads', 'properties', filename);
    if (fs.existsSync(correctFilePath)) {
      console.log(`Found file, redirecting to: /uploads/properties/${filename}`);
      return res.redirect(`/uploads/properties/${filename}`);
    }
    
    // If file doesn't exist, serve a placeholder SVG
    console.log(`File not found: ${filename}, serving placeholder`);
    const placeholderSvg = `
      <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#f3f4f6"/>
        <rect x="150" y="100" width="100" height="80" fill="#d1d5db" rx="4"/>
        <circle cx="175" cy="120" r="8" fill="#9ca3af"/>
        <polygon points="165,145 175,135 185,145 185,160 165,160" fill="#9ca3af"/>
        <text x="200" y="210" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle">
          Image Unavailable
        </text>
        <text x="200" y="230" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle">
          ${filename}
        </text>
      </svg>
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(placeholderSvg);
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

            // Check the 10 most recent files first, but with better hash matching
            const recentFiles = fileStats.slice(0, 10);
            // Only use this when we have a specific hash to look for
            if (hashMatch && hashMatch[1]) {
              const hashToFind = hashMatch[1].toLowerCase();
              
              // First try to find exact hash matches in recent files
              for (const fileInfo of recentFiles) {
                console.log(`Checking recent file for exact hash match: ${fileInfo.file}`);
                if (fileInfo.file.toLowerCase().includes(hashToFind)) {
                  console.log(`Found exact hash match in filename: ${fileInfo.file} matches ${hashToFind}`);
                  return res.sendFile(fileInfo.fullPath);
                }
              }
              
              // If no exact match in recent files, search all files but still require hash in filename
              for (const fileInfo of fileStats) {
                if (fileInfo.file.toLowerCase().includes(hashToFind)) {
                  console.log(`Found exact hash match in all files: ${fileInfo.file} matches ${hashToFind}`);
                  return res.sendFile(fileInfo.fullPath);
                }
              }
              
              // Don't default to just any file with a hash-like pattern now
              // Only fall through to more general matching if we couldn't find a match for our specific hash
            }
            
            // Original fallback for when we don't have a specific hash to match
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

    // Last resort, return 404).send('File not found');
  });
  
  // Universal cross-platform upload endpoint
  app.post('/api/universal-upload', (req: Request, res: Response) => {
    console.log("============================================================");
    console.log("==== UNIVERSAL CROSS-PLATFORM UPLOAD ENDPOINT CALLED ====");
    console.log("User agent:", req.headers['user-agent']);
    console.log("Content type:", req.headers['content-type']);
    console.log("Device type:", req.headers['x-device-type'] || 'unknown');
    console.log("============================================================");
    
    // Set CORS and cache control headers for maximum compatibility
    res.set({
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    // Detect device type from user agent
    const userAgent = req.headers['user-agent'] || '';
    let deviceType = 'other';
    
    if (/iphone|ipad|ipod/i.test(userAgent)) {
      deviceType = 'ios';
    } else if (/android/i.test(userAgent)) {
      deviceType = 'android';
    } else if (/windows/i.test(userAgent)) {
      deviceType = 'windows';
    } else if (/macintosh|mac os x/i.test(userAgent)) {
      deviceType = 'mac';
    }
    
    console.log(`Detected device type: ${deviceType}`);
    
    // Get property ID from all possible sources
    let propertyId: number | null = null;
    
    // Check header
    if (req.headers['x-property-id']) {
      propertyId = parseInt(req.headers['x-property-id'] as string);
      console.log(`Found propertyId in header: ${propertyId}`);
    }
    
    // Check query parameter
    if ((propertyId === null || isNaN(propertyId)) && req.query.propertyId) {
      propertyId = parseInt(req.query.propertyId as string);
      console.log(`Found propertyId in query: ${propertyId}`);
    }
    
    // Ensure upload directory exists with proper permissions
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
    fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
    
    try {
      fs.chmodSync(uploadDir, 0o777);
    } catch (err) {
      console.warn("Failed to set directory permissions:", err);
      // Non-fatal error, continue
    }
    
    // Configure multer with device-specific optimizations
    const upload = multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          console.log(`Setting destination for ${file.originalname || 'unnamed file'}: ${uploadDir}`);
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const randomId = Math.round(Math.random() * 1E9);
          
          // Get file extension or default to .jpg
          let ext = '.jpg';
          if (file.originalname) {
            const fileExt = path.extname(file.originalname).toLowerCase();
            if (fileExt && ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExt)) {
              ext = fileExt;
            }
          }
          
          // Create device-specific filename
          const filename = `universal-${deviceType}-${timestamp}-${randomId}${ext}`;
          console.log(`Generated filename: ${filename}`);
          cb(null, filename);
        }
      }),
      limits: { 
        fileSize: 25 * 1024 * 1024, // 25MB 
        files: 20 // Up to 20 files
      },
      fileFilter: (req, file, cb) => {
        // Accept all image types
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          console.log(`Rejected non-image file: ${file.originalname} (${file.mimetype})`);
          cb(null, false);
        }
      }
    }).array('files', 20); // Accept 'files' field name

    // Process the upload
    upload(req, res, async (err) => {
      console.log("Processing upload request...");
      
      if (err) {
        console.error('Universal upload error:', err);
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ 
              success: false, 
              status: "error",
              code: "FILE_TOO_LARGE",
              message: 'File size exceeds the 25MB limit' 
            });
          } else if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(413).json({ 
              success: false,
              status: "error", 
              code: "TOO_MANY_FILES",
              message: 'Maximum of 20 files can be uploaded at once' 
            });
          }
        }
        return res.status(400).json({ 
          success: false, 
          error: err.message 
        });
      }

      // Check if files were uploaded
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        console.log("No files were uploaded");
        return res.status(400).json({ 
          success: false, 
          status: "error",
          code: "NO_FILES",
          message: 'No files were uploaded. Please select at least one image.' 
        });
      }

      // Process the files
      const files = req.files as Express.Multer.File[];
      console.log(`Processing ${files.length} uploaded files`);
      
      // Collect image URLs
      const urls = files.map(file => `/uploads/properties/${file.filename}`);
      
      // Check if we need to update a property
      if (propertyId && !isNaN(propertyId) && propertyId > 0) {
        try {
          // Get the property
          const property = await dbStorage.getPropertyById(propertyId);
          
          if (property) {
            console.log(`Found property #${propertyId}: ${property.title}`);
            
            // Update the property with new images
            const existingImages = Array.isArray(property.images) ? property.images : [];
            const updatedImages = [...existingImages, ...urls];
            
            await dbStorage.updateProperty(propertyId, { images: updatedImages });
            
            console.log(`Updated property #${propertyId} with ${urls.length} new images`);
            
            return res.json({ 
              success: true, 
              urls,
              imageUrls: urls,
              message: `Successfully uploaded ${urls.length} images to property #${propertyId}`,
              count: urls.length,
              property: {
                id: property.id,
                title: property.title,
                totalImages: updatedImages.length
              }
            });
          } else {
            console.warn(`Property #${propertyId} not found`);
            // Return success but note that property wasn't found
            return res.json({ 
              success: true, 
              urls,
              imageUrls: urls,
              message: `Images uploaded but property #${propertyId} not found`,
              warning: "PROPERTY_NOT_FOUND",
              count: urls.length
            });
          }
        } catch (error) {
          console.error('Error updating property:', error);
          // Return partial success since files were uploaded
          return res.json({ 
            success: true, 
            urls,
            imageUrls: urls,
            message: `Images uploaded but failed to update property`,
            warning: "PROPERTY_UPDATE_FAILED",
            error: error instanceof Error ? error.message : 'Unknown error',
            count: urls.length
          });
        }
      } else {
        // No property ID, just return the URLs
        return res.json({ 
          success: true, 
          urls,
          imageUrls: urls,
          message: `Successfully uploaded ${urls.length} images`,
          count: urls.length
        });
      }
    });
  });

  // Dashboard route with proper authentication
  app.get('/dashboard', (req: Request, res: Response) => {
    console.log('🏠 DASHBOARD ROUTE ACCESS ATTEMPT');
    console.log('Session data:', req.session);
    console.log('User authenticated:', req.isAuthenticated());
    console.log('User object:', req.user);
    
    if (req.isAuthenticated?.() || req.session?.user) {
      console.log('✅ Dashboard access granted - user authenticated');
      return res.redirect('/?redirect=dashboard');
    }
    
    console.log('❌ Dashboard access denied - redirecting to signin');
    return res.redirect('/signin');
  });

  // API endpoint to check dashboard access
  app.get('/api/dashboard/access', async (req: Request, res: Response) => {
    console.log('🔍 DASHBOARD API ACCESS CHECK');
    console.log('Auth state:', {
      sessionID: req.sessionID,
      isAuthenticated: req.isAuthenticated(),
      hasUser: !!req.user,
      userRole: req.user?.role || 'No user'
    });

    if (req.isAuthenticated?.() || req.session?.user) {
      console.log('✅ Dashboard API access granted - user authenticated');
      res.json({
        authenticated: true,
        hasAccess: true,
        user: req.user,
        dashboardUrl: '/dashboard',
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ Dashboard API access denied - not authenticated');
      res.status(401).json({
        authenticated: false,
        hasAccess: false,
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Add restoration endpoints
  const { addRestoreEndpoints } = await import('./restore-endpoint');
  await addRestoreEndpoints(app);

  // Add backup endpoints
  const { addBackupEndpoints } = await import('./backup-endpoints');
  await addBackupEndpoints(app);

  // Create HTTP server
  const httpServer = createServer(app);
  // ===== CONTENT MARKETING & SEO ROUTES =====
  
  // Blog Articles API
  app.get("/api/articles", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string;
      const featured = req.query.featured === 'true';
      
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT a.*, u.username as author_name 
        FROM articles a 
        LEFT JOIN users u ON a.author_id = u.id 
        WHERE a.is_published = true
      `;
      
      const params: any[] = [];
      let paramIndex = 1;
      
      if (category) {
        query += ` AND a.category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }
      
      if (featured) {
        query += ` AND a.is_featured = true`;
      }
      
      query += ` ORDER BY a.published_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);
      
      const result = await pool.query(query, params);
      
      // Get total count for pagination
      let countQuery = `SELECT COUNT(*) FROM articles WHERE is_published = true`;
      const countParams: any[] = [];
      let countParamIndex = 1;
      
      if (category) {
        countQuery += ` AND category = $${countParamIndex}`;
        countParams.push(category);
      }
      
      if (featured) {
        countQuery += ` AND is_featured = true`;
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].count);
      
      res.json({
        data: result.rows,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page
      });
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/:slug", async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;
      
      const result = await pool.query(`
        SELECT a.*, u.username as author_name, u.full_name as author_full_name
        FROM articles a 
        LEFT JOIN users u ON a.author_id = u.id 
        WHERE a.slug = $1 AND a.is_published = true
      `, [slug]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      // Increment view count
      await pool.query(`
        UPDATE articles SET view_count = view_count + 1 WHERE slug = $1
      `, [slug]);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter/subscribe", async (req: Request, res: Response) => {
    try {
      const validationSchema = insertNewsletterSchema.extend({
        email: z.string().email("Please enter a valid email address"),
      });
      
      const subscriptionData = validationSchema.parse(req.body);
      
      // Check if email already exists
      const existingResult = await pool.query(
        'SELECT id, is_active FROM newsletters WHERE email = $1',
        [subscriptionData.email]
      );
      
      if (existingResult.rows.length > 0) {
        const existing = existingResult.rows[0];
        if (existing.is_active) {
          return res.status(400).json({ 
            message: "This email is already subscribed to our newsletter." 
          });
        } else {
          // Reactivate subscription
          await pool.query(
            'UPDATE newsletters SET is_active = true, unsubscribed_at = null WHERE email = $1',
            [subscriptionData.email]
          );
          return res.json({ 
            message: "Welcome back! Your newsletter subscription has been reactivated." 
          });
        }
      }
      
      // Create new subscription
      const result = await pool.query(`
        INSERT INTO newsletters (email, first_name, last_name, interests, source)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        subscriptionData.email,
        subscriptionData.firstName || null,
        subscriptionData.lastName || null,
        JSON.stringify(subscriptionData.interests || []),
        subscriptionData.source || 'website'
      ]);
      
      res.status(201).json({ 
        message: "Successfully subscribed to our newsletter! Thank you for joining our exclusive community.",
        subscription: result.rows[0]
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating newsletter subscription:", error);
        res.status(500).json({ message: "Failed to subscribe to newsletter" });
      }
    }
  });

  // Contact form submission endpoint
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const { name, email, phone, message, isAgentContact } = req.body;
      
      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({ message: "Name, email, and message are required" });
      }

      // Check if SendGrid API key is available
      if (!process.env.SENDGRID_API_KEY) {
        console.log("Contact form submission received (no email service configured):", {
          name, email, phone, isAgentContact
        });
        return res.json({ 
          message: "Your message has been received! We'll get back to you soon.",
          status: "received"
        });
      }

      // Import SendGrid
      const sgMail = await import('@sendgrid/mail');
      sgMail.default.setApiKey(process.env.SENDGRID_API_KEY);

      const isNewsletterSubscription = req.body.isNewsletterSubscription;
      
      const subject = isNewsletterSubscription
        ? `Newsletter Subscription Request from ${name}`
        : isAgentContact 
        ? `Agent Contact Request from ${name}`
        : `Contact Form Submission from ${name}`;

      const emailContent = `
        <h2>${subject}</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Type:</strong> ${isNewsletterSubscription ? 'Newsletter Subscription' : isAgentContact ? 'Agent Contact Request' : 'General Inquiry'}</p>
        <hr>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `;

      // Send to both email addresses
      const recipients = [
        'Sales@theviewsconsultancy.com',
        'Assem@theviewsconsultancy.com'
      ];

      const emailPromises = recipients.map(to => 
        sgMail.default.send({
          to,
          from: 'Sales@theviewsconsultancy.com', // Verified sender in SendGrid
          subject,
          html: emailContent,
          replyTo: email // Allow direct reply to the contact person
        })
      );

      await Promise.all(emailPromises);

      console.log(`Contact form email sent successfully to: ${recipients.join(', ')}`);
      
      res.json({ 
        message: "Your message has been sent successfully! We'll get back to you soon.",
        status: "sent"
      });

    } catch (error) {
      console.error("Contact form submission error:", error);
      
      // Log the submission even if email fails
      console.log("Contact form submission (email failed):", {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
      });

      res.json({ 
        message: "Your message has been received! We'll get back to you soon.",
        status: "received"
      });
    }
  });

  // Lead capture
  app.post("/api/leads", async (req: Request, res: Response) => {
    try {
      const validationSchema = insertLeadSchema.extend({
        email: z.string().email("Please enter a valid email address"),
        message: z.string().min(1, "Please enter a message"),
      });
      
      const leadData = validationSchema.parse(req.body);
      
      const result = await pool.query(`
        INSERT INTO leads (email, first_name, last_name, phone, property_id, message, source)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        leadData.email,
        leadData.firstName || null,
        leadData.lastName || null,
        leadData.phone || null,
        leadData.propertyId || null,
        leadData.message,
        leadData.source
      ]);
      
      res.status(201).json({ 
        message: "Thank you for your inquiry! Our team will contact you within 24 hours.",
        lead: result.rows[0]
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating lead:", error);
        res.status(500).json({ message: "Failed to submit inquiry" });
      }
    }
  });

  // Get article categories for navigation
  app.get("/api/articles/categories", async (req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT category, COUNT(*) as count
        FROM articles 
        WHERE is_published = true 
        GROUP BY category 
        ORDER BY count DESC
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching article categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  return httpServer;
}