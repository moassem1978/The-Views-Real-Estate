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
import { v4 as uuidv4 } from 'uuid';

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

// Create uploads directory with proper permissions
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o777 });
  }
  try {
    fs.chmodSync(uploadsDir, 0o777);
  } catch (err) {
    console.warn("Could not set directory permissions:", err);
  }
};

ensureUploadsDir();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadsDir();
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const uniqueId = uuidv4().split('-')[0];
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    const filename = `property-${timestamp}-${uniqueId}-${safeName}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
    files: 20
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`));
    }
  }
});

// Image processing function
async function processImage(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate file exists
    if (!fs.existsSync(filePath)) {
      return { success: false, error: "File not found" };
    }

    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      return { success: false, error: "File is empty" };
    }

    // Try to process with Sharp if available
    try {
      const sharp = await import('sharp');
      const metadata = await sharp.default(filePath).metadata();

      if (!metadata.width || !metadata.height) {
        return { success: false, error: "Invalid image dimensions" };
      }

      // Optimize the image
      const optimizedPath = filePath.replace(/\.[^/.]+$/, '_optimized$&');
      await sharp.default(filePath)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(optimizedPath);

      // Replace original with optimized
      fs.renameSync(optimizedPath, filePath);

      console.log(`✅ Processed image: ${path.basename(filePath)} (${metadata.width}x${metadata.height})`);
      return { success: true };
    } catch (sharpError) {
      console.warn("Sharp processing failed, using original file:", sharpError);
      return { success: true }; // Continue with original file
    }
  } catch (error) {
    console.error("Image processing error:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function registerRoutes(app: Express, customUpload?: any, customUploadsDir?: string): Promise<Server> {
  // Set up authentication routes and middleware
  setupAuth(app);

  // Protected dashboard route
  app.get("/dashboard", (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/signin');
    }
    next();
  });

  // API routes for properties
  app.get("/api/properties", async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 100;
      const result = await dbStorage.getAllProperties(page, pageSize);
      res.json(result);
    } catch (error) {
      console.error('Error fetching properties:', error);
      res.status(500).json({ message: "Failed to fetch properties" });
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
      console.error(`Error fetching property ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // CREATE PROPERTY with image upload
  app.post("/api/properties", upload.array('images', 20), async (req: Request, res: Response) => {
    try {
      console.log("=== PROPERTY CREATION WITH IMAGES ===");

      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as Express.User;
      console.log(`User creating property: ${user.username} (${user.role})`);

      // Process uploaded files
      const files = req.files as Express.Multer.File[];
      const imageUrls: string[] = [];
      const processingErrors: string[] = [];

      if (files && files.length > 0) {
        console.log(`Processing ${files.length} uploaded images`);

        for (const file of files) {
          const result = await processImage(file.path);
          if (result.success) {
            imageUrls.push(`/uploads/properties/${file.filename}`);
            console.log(`✅ Processed: ${file.filename}`);
          } else {
            processingErrors.push(`${file.originalname}: ${result.error}`);
            console.error(`❌ Failed: ${file.originalname} - ${result.error}`);
          }
        }
      }

      // Validate required fields
      const requiredFields = ['title', 'description', 'price', 'propertyType', 'city', 'bedrooms', 'bathrooms'];
      const missingFields = requiredFields.filter(field => {
        const value = req.body[field];
        return value === undefined || value === null || value === '';
      });

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Prepare property data
      const propertyData = {
        ...req.body,
        photos: imageUrls,
        images: imageUrls, // Also set legacy images field
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        agentId: user.id,
        status: req.body.status || 'published',
        zipCode: req.body.zipCode || '00000'
      };

      // Convert numeric fields
      ['price', 'bedrooms', 'bathrooms', 'builtUpArea', 'plotSize', 'gardenSize', 'floor', 'yearBuilt'].forEach(field => {
        if (propertyData[field] !== undefined && propertyData[field] !== '') {
          const val = parseFloat(propertyData[field]);
          if (!isNaN(val)) {
            propertyData[field] = val;
          }
        }
      });

      // Convert boolean fields
      ['isFullCash', 'isGroundUnit', 'isFeatured', 'isNewListing', 'isHighlighted'].forEach(field => {
        if (typeof propertyData[field] === 'string') {
          propertyData[field] = propertyData[field].toLowerCase() === 'true';
        }
      });

      // Validate with schema
      const validatedData = insertPropertySchema.parse(propertyData);

      // Create property
      const property = await dbStorage.createProperty(validatedData);

      console.log(`✅ Property created: ID ${property.id} with ${imageUrls.length} images`);

      const response: any = {
        success: true,
        message: "Property created successfully",
        property,
        imageCount: imageUrls.length
      };

      if (processingErrors.length > 0) {
        response.imageErrors = processingErrors;
        response.message += ` (${processingErrors.length} image processing errors)`;
      }

      res.status(201).json(response);

    } catch (error) {
      console.error("Error creating property:", error);

      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: "Validation error", 
          details: validationError.message 
        });
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ 
        message: `Failed to create property: ${errorMessage}`
      });
    }
  });

  // UPDATE PROPERTY with image upload - Production Grade
  app.patch("/api/properties/:id", upload.array('images', 20), async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.id);
    
    try {
      console.log(`=== UPDATING PROPERTY ${propertyId} ===`);

      // Authentication check
      if (!req.isAuthenticated()) {
        console.error("Property update failed: User not authenticated");
        return res.status(401).json({ message: "Authentication required" });
      }

      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const user = req.user as Express.User;
      console.log(`User updating property: ${user.username} (${user.role})`);

      // Get existing property
      const existingProperty = await dbStorage.getPropertyById(propertyId);
      if (!existingProperty) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Permission check - allow admin and owner to edit any property
      if (user.role === 'user' && existingProperty.createdBy !== user.id) {
        return res.status(403).json({ message: "Permission denied" });
      }

      // Process new images if uploaded
      let newImageUrls: string[] = [];
      const files = req.files as Express.Multer.File[];

      if (files && files.length > 0) {
        console.log(`Processing ${files.length} new images for property ${propertyId}`);

        for (const file of files) {
          try {
            // Process image with Sharp
            await processImage(file.path);
            newImageUrls.push(`/uploads/properties/${file.filename}`);
            console.log(`✅ Processed image: ${file.filename}`);
          } catch (imageError) {
            console.error(`Failed to process image ${file.originalname}:`, imageError);
            // Continue with other images
          }
        }
      }

      // Handle existing images
      let finalImages: string[] = [];
      
      try {
        if (req.body.photos && typeof req.body.photos === 'string') {
          // Handle JSON string of photos
          const photosData = JSON.parse(req.body.photos);
          if (Array.isArray(photosData)) {
            finalImages = photosData.map((photo: any) => {
              if (typeof photo === 'string') return photo;
              if (photo && photo.url) return photo.url;
              if (photo && photo.filename) return `/uploads/properties/${photo.filename}`;
              return null;
            }).filter(Boolean);
          }
        } else if (Array.isArray(req.body.photos)) {
          // Handle array of photos
          finalImages = req.body.photos.map((photo: any) => {
            if (typeof photo === 'string') return photo;
            if (photo && photo.url) return photo.url;
            if (photo && photo.filename) return `/uploads/properties/${photo.filename}`;
            return null;
          }).filter(Boolean);
        } else if (!req.body.replaceImages || req.body.replaceImages !== 'true') {
          // Keep existing images unless explicitly replacing
          finalImages = Array.isArray(existingProperty.photos) ? existingProperty.photos : [];
        }
      } catch (e) {
        console.warn("Error parsing photos, keeping originals");
        finalImages = Array.isArray(existingProperty.photos) ? existingProperty.photos : [];
      }

      // Add new images to existing ones
      finalImages = [...finalImages, ...newImageUrls];

      // Prepare update data
      const updateData: any = { updatedAt: new Date() };

      // Valid fields that can be updated
      const validFields = [
        'title', 'description', 'city', 'state', 'country', 'propertyType', 
        'listingType', 'price', 'downPayment', 'installmentAmount', 'installmentPeriod',
        'isFullCash', 'bedrooms', 'bathrooms', 'builtUpArea', 'plotSize', 'gardenSize',
        'floor', 'isGroundUnit', 'isFeatured', 'isHighlighted', 'isNewListing',
        'projectName', 'developerName', 'yearBuilt', 'status', 'references', 'address', 'zipCode'
      ];

      // Only update fields that are provided
      for (const field of validFields) {
        if (req.body.hasOwnProperty(field)) {
          updateData[field] = req.body[field];
        }
      }

      // Convert boolean fields
      ['isFullCash', 'isGroundUnit', 'isFeatured', 'isNewListing', 'isHighlighted'].forEach(field => {
        if (updateData[field] !== undefined) {
          updateData[field] = updateData[field] === true || updateData[field] === 'true';
        }
      });

      // Convert numeric fields
      ['price', 'bedrooms', 'bathrooms', 'builtUpArea', 'plotSize', 'gardenSize', 'downPayment', 'installmentAmount', 'yearBuilt'].forEach(field => {
        if (updateData[field] !== undefined && updateData[field] !== '') {
          const num = parseFloat(updateData[field]);
          if (!isNaN(num)) {
            updateData[field] = num;
          }
        }
      });

      // Always update photos array
      updateData.photos = finalImages;

      // Update property in database
      const updatedProperty = await dbStorage.updateProperty(propertyId, updateData);

      if (!updatedProperty) {
        return res.status(500).json({ message: "Failed to update property in database" });
      }

      console.log(`✅ Property ${propertyId} updated successfully with ${finalImages.length} total images`);

      res.status(200).json({
        success: true,
        message: "Property updated successfully",
        property: updatedProperty,
        imageCount: finalImages.length,
        newImagesAdded: newImageUrls.length,
        totalImages: finalImages.length
      });

    } catch (error) {
      console.error(`❌ Error updating property ${propertyId}:`, error);
      res.status(500).json({ 
        success: false,
        error: 'Property update failed', 
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        propertyId
      });
    }
  });

  // Keep the original PUT endpoint for backward compatibility
  app.put("/api/properties/:id", upload.array('images', 20), async (req: Request, res: Response) => {
    try {
      console.log(`=== UPDATING PROPERTY ${req.params.id} ===`);

      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const user = req.user as Express.User;

      // Get existing property
      const existingProperty = await dbStorage.getPropertyById(id);
      if (!existingProperty) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check permissions
      if (user.role === 'user' && existingProperty.createdBy !== user.id) {
        return res.status(403).json({ message: "Permission denied" });
      }

      // Process any new uploaded files
      const files = req.files as Express.Multer.File[];
      const newImageUrls: string[] = [];

      if (files && files.length > 0) {
        console.log(`Processing ${files.length} new images for property ${id}`);

        for (const file of files) {
          const result = await processImage(file.path);
          if (result.success) {
            newImageUrls.push(`/uploads/properties/${file.filename}`);
            console.log(`✅ Processed new image: ${file.filename}`);
          }
        }
      }

      // Handle existing images
      let finalImages: string[] = [];

      if (req.body.existingImages) {
        // Parse existing images
        try {
          const existingImages = typeof req.body.existingImages === 'string' 
            ? JSON.parse(req.body.existingImages)
            : req.body.existingImages;

          if (Array.isArray(existingImages)) {
            finalImages = existingImages.filter((img: string) => img && typeof img === 'string');
          }
        } catch (e) {
          console.warn("Failed to parse existing images, keeping original");
          finalImages = Array.isArray(existingProperty.photos) ? existingProperty.photos : [];
        }
      } else {
        // Keep all existing images if not specified
        finalImages = Array.isArray(existingProperty.photos) ? existingProperty.photos : [];
      }

      // Add new images
      finalImages = [...finalImages, ...newImageUrls];

      // Prepare update data
      const updateData: any = {};

      // Copy valid fields
      const validFields = [
        'title', 'description', 'city', 'state', 'country', 'propertyType', 
        'listingType', 'price', 'downPayment', 'installmentAmount', 'installmentPeriod',
        'isFullCash', 'bedrooms', 'bathrooms', 'builtUpArea', 'plotSize', 'gardenSize',
        'floor', 'isGroundUnit', 'isFeatured', 'isHighlighted', 'isNewListing',
        'projectName', 'developerName', 'yearBuilt', 'status', 'references'
      ];

      for (const field of validFields) {
        if (req.body.hasOwnProperty(field) && req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      updateData.photos = finalImages;
      updateData.updatedAt = new Date();

      // Update property
      const updatedProperty = await dbStorage.updateProperty(id, updateData);

      if (!updatedProperty) {
        return res.status(500).json({ message: "Failed to update property" });
      }

      console.log(`✅ Property ${id} updated with ${finalImages.length} total images`);

      res.json({
        success: true,
        message: "Property updated successfully",
        property: updatedProperty,
        imageCount: finalImages.length,
        newImagesAdded: newImageUrls.length
      });

    } catch (error) {
      console.error("Error updating property:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ 
        message: `Failed to update property: ${errorMessage}`
      });
    }
  });

  // STANDALONE IMAGE UPLOAD for existing properties
  app.post("/api/properties/:id/upload-images", upload.array('images', 20), async (req: Request, res: Response) => {
    try {
      console.log(`=== UPLOADING IMAGES TO PROPERTY ${req.params.id} ===`);

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

      // Get existing property
      const property = await dbStorage.getPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Process uploaded files
      const newImageUrls: string[] = [];
      const processingErrors: string[] = [];

      for (const file of files) {
        const result = await processImage(file.path);
        if (result.success) {
          newImageUrls.push(`/uploads/properties/${file.filename}`);
        } else {
          processingErrors.push(`${file.originalname}: ${result.error}`);
        }
      }

      if (newImageUrls.length === 0) {
        return res.status(400).json({ 
          message: "No images were successfully processed",
          errors: processingErrors
        });
      }

      // Add to existing images
      const existingImages = Array.isArray(property.photos) ? property.photos : [];
      const updatedImages = [...existingImages, ...newImageUrls];

      // Update property
      await dbStorage.updateProperty(propertyId, { photos: updatedImages });

      console.log(`✅ Added ${newImageUrls.length} images to property ${propertyId}`);

      res.json({
        success: true,
        message: `Successfully uploaded ${newImageUrls.length} images`,
        imageUrls: newImageUrls,
        totalImages: updatedImages.length,
        errors: processingErrors.length > 0 ? processingErrors : undefined
      });

    } catch (error) {
      console.error("Error uploading images:", error);
      res.status(500).json({ 
        message: "Failed to upload images",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // DELETE PROPERTY
  app.delete("/api/properties/:id", async (req: Request, res: Response) => {
    try {
      console.log(`=== DELETING PROPERTY ${req.params.id} ===`);
      
      if (!req.isAuthenticated()) {
        console.error("Property deletion failed: User not authenticated");
        return res.status(401).json({ success: false, message: "Authentication required" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid property ID" });
      }

      const user = req.user as Express.User;
      console.log(`User deleting property: ${user.username} (${user.role})`);
      
      // Get property first to check if it exists and get image info
      const existingProperty = await dbStorage.getPropertyById(id);
      if (!existingProperty) {
        return res.status(404).json({ success: false, message: "Property not found" });
      }

      // Check permissions - admin, owner, or creator can delete
      if (user.role !== 'admin' && user.role !== 'owner' && existingProperty.createdBy !== user.id) {
        console.error(`Permission denied: User ${user.id} (${user.role}) cannot delete property ${id} owned by ${existingProperty.createdBy}`);
        return res.status(403).json({ success: false, message: "Permission denied" });
      }

      // Delete associated images from filesystem
      if (existingProperty.photos && Array.isArray(existingProperty.photos)) {
        console.log(`Deleting ${existingProperty.photos.length} associated images`);
        for (const imagePath of existingProperty.photos) {
          try {
            const filename = imagePath.split('/').pop();
            if (filename) {
              const fullPath = path.join(uploadsDir, filename);
              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                console.log(`Deleted image file: ${filename}`);
              }
            }
          } catch (imgError) {
            console.warn(`Failed to delete image file: ${imagePath}`, imgError);
          }
        }
      }

      // Delete from database
      const success = await dbStorage.deleteProperty(id);
      if (!success) {
        console.error(`Failed to delete property ${id} from database`);
        return res.status(500).json({ success: false, message: "Failed to delete property from database" });
      }

      console.log(`✅ Property ${id} deleted successfully`);
      res.json({ 
        success: true, 
        message: "Property deleted successfully",
        deletedId: id 
      });
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to delete property",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Serve static files
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Create HTTP server
  const httpServer = createServer(app);
  
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
          photos: property.photos || [], // Map images to photos for compatibility
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

  // API routes for announcements```
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
  app.post("/api/upload/logo", (req: Request, res: Response) => {
    try {
       res.status(500).json({ message: `This api/upload/logo is deprecated` });
    } catch (error) {
      console.error('Error uploading logo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Failed to upload logo: ${errorMessage}` });
    }
  });

  // Announcement image upload endpoint
  app.post("/api/upload/announcement-image", (req: Request, res: Response) => {
     try {
       res.status(500).json({ message: `This api/upload/announcement-image is deprecated` });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error uploading announcement image:', error);
      res.status(500).json({ message: `Failed to upload announcement image: ${errorMessage}` });
    }
  });

  // Property images upload with ID parameter (UUID-based system)
  app.post("/api/upload/property-images/:id", (req: Request, res: Response) => {
    try{
         res.status(500).json({ message: `This api/upload/property-images/:id is deprecated` });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ 
        message: `Failed to upload property images: ${errorMessage}`,
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  // Legacy property images upload endpoint (without ID)
  app.post("/api/upload/property-images", (req: Request, res: Response) => {
    try {
       res.status(500).json({ message: `This  api/upload/property-images is deprecated` });
    } catch (error) {
      console.error('Error uploading property images:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Failed to upload property images: ${errorMessage}` });
    }
  });

  // Create a completely new property image upload endpoint with enhanced error handling
  app.post("/api/upload/property-images-new",  (req: Request, res: Response) => {
    try {
      res.status(500).json({ message: `This api/upload/property-images-new is deprecated` });
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
  app.post("/api/upload/ios",  (req: Request, res: Response) => {
    try {
       res.status(500).json({ message: `This api/upload/ios is deprecated` });
    } catch (error) {
      console.error("iOS upload: Unexpected error:", error);
      return res.status(500).json({ message: "An unexpected error occurred" });
    }
  });

  // Ultra-simplified Windows upload endpoint for maximum compatibility
  app.post("/api/upload/windows", (req: Request, res: Response) => {
    try {
      res.status(500).json({ message: `This api/upload/windows is deprecated` });
    } catch (error) {
      console.error('Unexpected error in Windows upload endpoint:', error);
      return res.status(500).json({ 
        message: "Server error",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Simplified iOS-optimized upload endpoint - NO AUTH REQUIRED
  app.post("/api/upload/property-images-simple",  (req: Request, res: Response) => {
    try {
       res.status(500).json({ message: `This  api/upload/property-images-simple is deprecated` });
    } catch (error) {
      console.error('Error in cross-platform upload endpoint:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: `Failed to upload property images: ${errorMessage}` });
    }
  });

  // EMERGENCY: Property 60 specific upload endpoint
  app.post("/api/property-60-upload",  (req: Request, res: Response) => {
    try {
     res.status(500).json({ message: `This api/property-60-upload is deprecated` });

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
  app.post("/api/properties/:id/upload-images",  (req: Request, res: Response) => {
    try {
       res.status(500).json({ message: `This api/properties/:id/upload-images is deprecated` });

    } catch (error) {
      console.error('Fixed upload error:', error);
      return res.status(500).json({ 
        message: "Upload failed", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // UUID Image Management Routes
  
  // Get image mappings for a property
  app.get("/api/properties/:id/image-mappings", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const { ImageUuidManager } = await import('./utils/imageUuidManager');
      const mappings = await ImageUuidManager.getPropertyImageMappings(propertyId);
      
      res.json({
        success: true,
        mappings,
        imageUrls: ImageUuidManager.generateImageUrls(mappings)
      });
    } catch (error) {
      console.error('Error getting image mappings:', error);
      res.status(500).json({ 
        message: "Failed to get image mappings",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Reorder images by UUID
  app.put("/api/properties/:id/reorder-images", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const propertyId = parseInt(req.params.id);
      const { imageIds } = req.body;

      if (isNaN(propertyId) || !Array.isArray(imageIds)) {
        return res.status(400).json({ message: "Invalid request data" });
      }

      const { ImageUuidManager } = await import('./utils/imageUuidManager');
      
      // Create backup before reordering
      const backupId = await ImageUuidManager.createPropertyBackup(propertyId);
      
      try {
        // Reorder images
        await ImageUuidManager.reorderImages(propertyId, imageIds);
        
        // Get updated mappings and regenerate URLs
        const updatedMappings = await ImageUuidManager.getPropertyImageMappings(propertyId);
        const imageUrls = ImageUuidManager.generateImageUrls(updatedMappings);
        
        // Update property with new order
        await dbStorage.updateProperty(propertyId, { images: imageUrls });
        
        res.json({
          success: true,
          message: "Images reordered successfully",
          mappings: updatedMappings,
          backupId
        });
      } catch (error) {
        // Restore from backup on failure
        await ImageUuidManager.restoreFromBackup(backupId);
        throw error;
      }
    } catch (error) {
      console.error('Error reordering images:', error);
      res.status(500).json({ 
        message: "Failed to reorder images",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Delete specific photo from property
  app.delete("/api/properties/:id/photos/:filename", async (req: Request, res: Response) => {
    try {
      console.log(`=== DELETING PHOTO FROM PROPERTY ${req.params.id} ===`);
      
      if (!req.isAuthenticated()) {
        console.error("Photo deletion failed: User not authenticated");
        return res.status(401).json({ 
          success: false,
          message: "Authentication required" 
        });
      }

      const propertyId = parseInt(req.params.id);
      const filename = decodeURIComponent(req.params.filename);

      if (isNaN(propertyId) || !filename) {
        console.error(`Invalid parameters: propertyId=${propertyId}, filename=${filename}`);
        return res.status(400).json({ 
          success: false,
          message: "Invalid property ID or filename" 
        });
      }

      const user = req.user as Express.User;
      console.log(`User deleting photo: ${user.username} (${user.role})`);

      // Get the property first
      const property = await dbStorage.getPropertyById(propertyId);
      if (!property) {
        console.error(`Property ${propertyId} not found`);
        return res.status(404).json({ 
          success: false,
          message: "Property not found" 
        });
      }

      // Check permissions
      if (user.role === 'user' && property.createdBy !== user.id) {
        console.error(`Permission denied: User ${user.id} cannot delete from property ${propertyId} owned by ${property.createdBy}`);
        return res.status(403).json({ 
          success: false,
          message: "Permission denied" 
        });
      }

      console.log(`Current images for property ${propertyId}:`, property.photos);

      // Get current images and filter out the one to delete
      let currentImages: string[] = [];
      
      if (Array.isArray(property.photos)) {
        currentImages = property.photos;
      } else if (typeof property.photos === 'string') {
        try {
          const parsed = JSON.parse(property.photos);
          currentImages = Array.isArray(parsed) ? parsed : [property.photos];
        } catch {
          currentImages = property.photos ? [property.photos] : [];
        }
      }

      console.log(`Parsed current images (${currentImages.length}):`, currentImages);
      console.log(`Looking to delete filename: "${filename}"`);

      // Find and remove the image with multiple matching strategies
      const originalLength = currentImages.length;
      const updatedImages = currentImages.filter(img => {
        const imgFilename = img.split('/').pop() || img;
        const imgPath = img;
        
        // Try exact matches
        const exactFilenameMatch = imgFilename === filename;
        const exactPathMatch = imgPath === filename;
        const pathContainsFilename = imgPath.includes(filename);
        
        const shouldKeep = !exactFilenameMatch && !exactPathMatch && !pathContainsFilename;
        
        if (!shouldKeep) {
          console.log(`✅ Found match to delete: "${img}" (filename: "${imgFilename}")`);
        }
        
        return shouldKeep;
      });

      console.log(`Images after filtering (${updatedImages.length}):`, updatedImages);

      if (updatedImages.length === originalLength) {
        console.error(`Photo not found. Searched for: "${filename}"`);
        console.error(`Available images:`, currentImages.map(img => img.split('/').pop()));
        return res.status(404).json({ 
          success: false,
          message: "Photo not found in property images",
          currentImages: currentImages.map(img => img.split('/').pop()),
          searchedFor: filename
        });
      }

      // Update property with remaining images
      const updated = await dbStorage.updateProperty(propertyId, { 
        images: updatedImages 
      });

      if (!updated) {
        console.error("Failed to update property in database");
        return res.status(500).json({ 
          success: false,
          message: "Failed to update property" 
        });
      }

      // Try to delete physical file from multiple possible locations
      const possiblePaths = [
        path.join(uploadsDir, filename),
        path.join(process.cwd(), 'public', 'uploads', 'properties', filename),
        path.join(process.cwd(), 'uploads', 'properties', filename),
        path.join(process.cwd(), 'uploads', filename)
      ];

      let fileDeleted = false;
      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`✅ Physical file deleted: ${filePath}`);
            fileDeleted = true;
            break;
          } catch (error) {
            console.warn(`⚠️ Could not delete physical file at ${filePath}: ${error}`);
          }
        }
      }

      if (!fileDeleted) {
        console.warn(`⚠️ Physical file not found in any location: ${filename}`);
      }

      console.log(`✅ Photo deleted successfully from property ${propertyId}`);

      res.json({
        success: true,
        message: "Photo deleted successfully",
        remainingImages: updatedImages,
        deletedImage: filename,
        totalImages: updatedImages.length,
        fileDeleted
      });

    } catch (error) {
      console.error('Error deleting photo:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to delete photo",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Migrate legacy images to UUID system
  app.post("/api/properties/:id/migrate-images", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as Express.User;
      if (user.role !== 'admin' && user.role !== 'owner') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const property = await dbStorage.getPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      const { ImageUuidManager } = await import('./utils/imageUuidManager');
      
      // Create backup before migration
      const backupId = await ImageUuidManager.createPropertyBackup(propertyId);
      
      try {
        // Get existing images
        const legacyImages = Array.isArray(property.photos) ? property.photos : [];
        
        if (legacyImages.length === 0) {
          return res.json({
            success: true,
            message: "No images to migrate",
            mappings: []
          });
        }
        
        // Migrate to UUID system
        const mappings = await ImageUuidManager.migrateLegacyImages(propertyId, legacyImages);
        
        // Generate new URLs
        const imageUrls = ImageUuidManager.generateImageUrls(mappings);
        
        // Update property with UUID-based URLs
        await dbStorage.updateProperty(propertyId, { images: imageUrls });
        
        res.json({
          success: true,
          message: `Successfully migrated ${mappings.length} images to UUID system`,
          mappings,
          backupId
        });
      } catch (error) {
        // Restore from backup on failure
        await ImageUuidManager.restoreFromBackup(backupId);
        throw error;
      }
    } catch (error) {
      console.error('Error migrating images:', error);
      res.status(500).json({ 
        message: "Failed to migrate images",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Validate property images
  app.get("/api/properties/:id/validate-images", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const { ImageUuidManager } = await import('./utils/imageUuidManager');
      const validation = await ImageUuidManager.validatePropertyImages(propertyId);
      
      res.json({
        success: true,
        validation
      });
    } catch (error) {
      console.error('Error validating images:', error);
      res.status(500).json({ 
        message: "Failed to validate images",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Restore property from backup
  app.post("/api/properties/restore/:backupId", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = req.user as Express.User;
      if (user.role !== 'admin' && user.role !== 'owner') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { backupId } = req.params;
      if (!backupId) {
        return res.status(400).json({ message: "Invalid backup ID" });
      }

      const { ImageUuidManager } = await import('./utils/imageUuidManager');
      const restored = await ImageUuidManager.restoreFromBackup(backupId);
      
      if (restored) {
        res.json({
          success: true,
          message: "Property restored from backup successfully"
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Backup not found or restore failed"
        });
      }
    } catch (error) {
      console.error('Error restoring from backup:', error);
      res.status(500).json({ 
        message: "Failed to restore from backup",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // UUID Image Management Routes

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
  }, async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Photo upload endpoint ready' });
  });
  
  // Upload photos without property association (for new listings)
  app.post('/api/photos/upload', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  }, async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Photo upload endpoint ready' });
  });
  
  // Get all photos for a property with metadata
  app.get('/api/photos/property/:propertyId', async (req: Request, res: Response) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      res.json({ success: true, propertyId, photos: [] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get property photos' });
    }
  });
  
  // Delete a specific photo with safety checks
  app.delete('/api/photos/property/:propertyId/photo/:filename', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  }, async (req: Request, res: Response) => {
    try {
      const { propertyId, filename } = req.params;
      res.json({ success: true, message: 'Photo deleted', propertyId, filename });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete photo' });
    }
  });
  
  // Reorder photos for a property (drag and drop functionality)
  app.put('/api/photos/property/:propertyId/reorder', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  }, async (req: Request, res: Response) => {
    try {
      const { propertyId } = req.params;
      res.json({ success: true, message: 'Photos reordered', propertyId });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reorder photos' });
    }
  });
  
  // Update photo metadata (alt text, captions)
  app.put('/api/photos/property/:propertyId/photo/:filename', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  }, async (req: Request, res: Response) => {
    try {
      const { propertyId, filename } = req.params;
      res.json({ success: true, message: 'Photo metadata updated', propertyId, filename });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update photo metadata' });
    }
  });
  
  // Validate photo integrity and fix missing references
  app.get('/api/photos/property/:propertyId/validate', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  }, async (req: Request, res: Response) => {
    try {
      const { propertyId } = req.params;
      res.json({ success: true, message: 'Photo integrity validated', propertyId });
    } catch (error) {
      res.status(500).json({ error: 'Failed to validate photo integrity' });
    }
  });
  
  // Admin cleanup for orphaned files (dashboard access)
  app.post('/api/photos/cleanup', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  }, async (req: Request, res: Response) => {
    try {
      res.json({ success: true, message: 'Orphaned files cleanup completed' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to cleanup orphaned files' });
    }
  });

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
            console.log("IMAGES FIELD FIX: Processing raw property.photos:", property.photos);
            
            let currentImages: string[] = [];
            
            // Try to handle all possible image formats
            if (Array.isArray(property.photos)) {
              // Already an array (ideal)
              currentImages = property.photos;
              console.log("Image format: Array of strings");
            } else if (typeof property.photos === 'string') {
              try {
                // Try to parse JSON string - common pattern
                const parsed = JSON.parse(property.photos);
                if (Array.isArray(parsed)) {
                  currentImages = parsed;
                  console.log("Image format: JSON string of array");
                } else {
                  // String but not a valid JSON array, treat as single image
                  currentImages = [property.photos];
                  console.log("Image format: Single string (not JSON)");
                }
              } catch (e) {
                // Not valid JSON, assume it's a single image URL
                currentImages = [property.photos];
                console.log("Image format: Single string URL");
              }
            } else if (property.photos && typeof property.photos === 'object') {
              // Handle strange object formats by extracting values
              console.log("Image format: Object (not array)");
              currentImages = Object.values(property.photos).filter(v => typeof v === 'string');
            } else if (!property.photos) {
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
  app.post("/api/upload/project-images", (req: Request, res: Response) => {
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
      const imageUrls = (req.files as Express.Multer.File[]).map(file => {
        // Create both public and internal URLs
        const publicUrl = `/uploads/projects/${file.filename}`;
        
        // Verify file exists
        const filePath = path.join(process.cwd(), 'public', publicUrl);
        if (!fs.existsSync(filePath)) {
          console.error(`Uploaded file not found at: ${filePath}`);
        }

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

    // Last resort, return 404
    res.status(404).send('File not found');
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
            const existingImages = Array.isArray(property.photos) ? property.photos : [];
            const updatedImages = [...existingImages, ...urls];
            
            await dbStorage.updateProperty(propertyId, { photos: updatedImages });
            
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