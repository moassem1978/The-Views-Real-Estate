import express, { Request, Response } from 'express';
import multer from 'multer';
import { db } from './db';
import { storage as dbStorage } from './storage';
import { insertPropertySchema } from '@shared/schema';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const router = express.Router();

// Enhanced multer configuration for property submissions
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'properties');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `property-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 20 // Maximum 20 files
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
    }
  }
});

// Enhanced image processing function
async function processAndOptimizeImage(filePath: string): Promise<{ success: boolean; error?: string; optimizedPath?: string }> {
  try {
    const optimizedPath = filePath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '-optimized.webp');
    
    await sharp(filePath)
      .resize(1200, 800, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ 
        quality: 85,
        effort: 4 
      })
      .toFile(optimizedPath);

    // Replace original with optimized version
    fs.unlinkSync(filePath);
    fs.renameSync(optimizedPath, filePath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '.webp'));

    return { 
      success: true, 
      optimizedPath: filePath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '.webp')
    };
  } catch (error) {
    console.error('Image optimization failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown optimization error' 
    };
  }
}

// Validation middleware for authenticated users
const requireAuth = (req: Request, res: Response, next: express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required. Please log in to submit properties.' 
    });
  }
  next();
};

// Enhanced property submission endpoint
router.post('/api/properties/submit', requireAuth, upload.array('images', 20), async (req: Request, res: Response) => {
  try {
    console.log('=== ENHANCED PROPERTY SUBMISSION ===');
    
    const user = req.user as any;
    console.log(`Property submission by: ${user.username} (${user.role})`);

    // Extract and validate form data
    const {
      title, description, price, location, propertyType, bedrooms, bathrooms,
      area, listingType, isFeatured, isHighlighted, gardenSize,
      downPaymentPercent, quarterlyInstallments, city, state, country,
      projectName, developerName, yearBuilt, floor, isGroundUnit,
      amenities, address, zipCode, references
    } = req.body;

    // Validate required fields
    const requiredFields = {
      title: title,
      description: description,
      price: price,
      propertyType: propertyType,
      city: city || location,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      builtUpArea: area,
      listingType: listingType
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || value === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Process uploaded images
    const files = req.files as Express.Multer.File[];
    const imageUrls: string[] = [];
    const processingErrors: string[] = [];

    if (files && files.length > 0) {
      console.log(`Processing ${files.length} uploaded images`);

      for (const file of files) {
        try {
          const result = await processAndOptimizeImage(file.path);
          if (result.success && result.optimizedPath) {
            const filename = path.basename(result.optimizedPath);
            imageUrls.push(`/uploads/properties/${filename}`);
            console.log(`✅ Processed and optimized: ${filename}`);
          } else {
            processingErrors.push(`${file.originalname}: ${result.error}`);
            console.error(`❌ Failed to process: ${file.originalname}`);
          }
        } catch (error) {
          processingErrors.push(`${file.originalname}: Processing failed`);
          console.error(`❌ Error processing ${file.originalname}:`, error);
        }
      }
    }

    // Calculate financial details
    const priceValue = parseFloat(price);
    let downPayment = 0;
    
    if (downPaymentPercent && priceValue) {
      const downPaymentPercentValue = parseFloat(downPaymentPercent);
      if (!isNaN(downPaymentPercentValue) && !isNaN(priceValue)) {
        downPayment = (priceValue * downPaymentPercentValue) / 100;
        console.log(`Calculated down payment: ${downPayment} (${downPaymentPercentValue}% of ${priceValue})`);
      }
    }

    // Prepare property data with enhanced structure
    const propertyData = {
      title: title.trim(),
      description: description.trim(),
      city: city || location,
      state: state || 'Cairo', // Default to Cairo if not provided
      country: country || 'Egypt',
      address: address || '',
      zipCode: zipCode || '00000',
      price: priceValue,
      downPayment: downPayment,
      installmentAmount: quarterlyInstallments ? parseFloat(quarterlyInstallments) : null,
      installmentPeriod: quarterlyInstallments ? 3 : null, // Quarterly = 3 months
      isFullCash: !quarterlyInstallments && !downPaymentPercent,
      propertyType: propertyType,
      listingType: listingType,
      projectName: projectName || null,
      developerName: developerName || null,
      bedrooms: parseInt(bedrooms),
      bathrooms: parseFloat(bathrooms),
      builtUpArea: parseInt(area),
      plotSize: null, // Can be added later if needed
      gardenSize: gardenSize ? parseInt(gardenSize) : null,
      floor: floor ? parseInt(floor) : null,
      isGroundUnit: isGroundUnit === 'true' || isGroundUnit === true,
      yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isHighlighted: isHighlighted === 'true' || isHighlighted === true,
      isNewListing: true, // New submissions are always marked as new listings
      amenities: amenities ? (typeof amenities === 'string' ? JSON.parse(amenities) : amenities) : {},
      photos: imageUrls,
      references: references || '',
      status: user.role === 'owner' || user.role === 'admin' ? 'published' : 'pending_approval',
      createdBy: user.id,
      agentId: user.id,
      createdAt: new Date().toISOString(),
      views: '0' // Initialize view count
    };

    // Validate data against schema
    const validatedData = insertPropertySchema.parse(propertyData);

    // Create property in database
    const property = await dbStorage.createProperty(validatedData);

    console.log(`✅ Property submitted successfully: ID ${property.id} with ${imageUrls.length} images`);

    // Prepare response
    const response = {
      success: true,
      message: user.role === 'owner' || user.role === 'admin' 
        ? "Property created and published successfully" 
        : "Property submitted successfully and is pending approval",
      property: {
        id: property.id,
        title: property.title,
        status: property.status,
        imageCount: imageUrls.length
      },
      imageCount: imageUrls.length,
      processingErrors: processingErrors.length > 0 ? processingErrors : undefined
    };

    if (processingErrors.length > 0) {
      response.message += ` (${processingErrors.length} image processing warnings)`;
    }

    res.status(201).json(response);

  } catch (error) {
    console.error("Enhanced property submission error:", error);

    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ 
        success: false,
        message: "Property data validation failed", 
        details: validationError.message,
        validationErrors: error.errors
      });
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ 
      success: false,
      message: `Property submission failed: ${errorMessage}`,
      error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error'
    });
  }
});

// Enhanced property update endpoint
router.patch('/api/properties/:id/update', requireAuth, upload.array('images', 20), async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.id);
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid property ID" 
      });
    }

    const user = req.user as any;
    console.log(`Property update by: ${user.username} for property ${propertyId}`);

    // Get existing property
    const existingProperty = await dbStorage.getPropertyById(propertyId);
    if (!existingProperty) {
      return res.status(404).json({ 
        success: false, 
        message: "Property not found" 
      });
    }

    // Check permissions
    if (user.role !== 'owner' && user.role !== 'admin' && existingProperty.createdBy !== user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to update this property" 
      });
    }

    // Process new images if uploaded
    const files = req.files as Express.Multer.File[];
    const newImageUrls: string[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const result = await processAndOptimizeImage(file.path);
          if (result.success && result.optimizedPath) {
            const filename = path.basename(result.optimizedPath);
            newImageUrls.push(`/uploads/properties/${filename}`);
          }
        } catch (error) {
          console.error(`Failed to process image ${file.originalname}:`, error);
        }
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    // Update fields that are provided
    const allowedFields = [
      'title', 'description', 'price', 'city', 'state', 'country', 'address',
      'propertyType', 'listingType', 'bedrooms', 'bathrooms', 'builtUpArea',
      'gardenSize', 'floor', 'yearBuilt', 'projectName', 'developerName',
      'isFeatured', 'isHighlighted', 'references', 'amenities'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Handle financial calculations
    if (req.body.price && req.body.downPaymentPercent) {
      const price = parseFloat(req.body.price);
      const downPaymentPercent = parseFloat(req.body.downPaymentPercent);
      if (!isNaN(price) && !isNaN(downPaymentPercent)) {
        updateData.downPayment = (price * downPaymentPercent) / 100;
      }
    }

    if (req.body.quarterlyInstallments) {
      updateData.installmentAmount = parseFloat(req.body.quarterlyInstallments);
      updateData.installmentPeriod = 3;
    }

    // Handle image updates
    let finalImages = Array.isArray(existingProperty.photos) ? [...existingProperty.photos] : [];
    
    // Add new images
    if (newImageUrls.length > 0) {
      finalImages = [...finalImages, ...newImageUrls];
    }

    // Remove images if specified
    if (req.body.removeImages) {
      const imagesToRemove = Array.isArray(req.body.removeImages) 
        ? req.body.removeImages 
        : [req.body.removeImages];
      
      finalImages = finalImages.filter(url => !imagesToRemove.includes(url));
    }

    updateData.photos = finalImages;

    // Convert numeric fields
    ['price', 'bedrooms', 'bathrooms', 'builtUpArea', 'gardenSize', 'floor', 'yearBuilt'].forEach(field => {
      if (updateData[field] !== undefined && updateData[field] !== '') {
        const num = parseFloat(updateData[field]);
        if (!isNaN(num)) {
          updateData[field] = num;
        }
      }
    });

    // Convert boolean fields
    ['isFeatured', 'isHighlighted', 'isGroundUnit'].forEach(field => {
      if (updateData[field] !== undefined) {
        updateData[field] = updateData[field] === true || updateData[field] === 'true';
      }
    });

    // Update property
    const updatedProperty = await dbStorage.updateProperty(propertyId, updateData);

    if (!updatedProperty) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to update property in database" 
      });
    }

    console.log(`✅ Property ${propertyId} updated successfully`);

    res.json({
      success: true,
      message: "Property updated successfully",
      property: {
        id: updatedProperty.id,
        title: updatedProperty.title,
        imageCount: finalImages.length,
        newImagesAdded: newImageUrls.length
      }
    });

  } catch (error) {
    console.error(`Error updating property ${req.params.id}:`, error);
    
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ 
        success: false,
        message: "Update data validation failed", 
        details: validationError.message 
      });
    }

    res.status(500).json({ 
      success: false,
      message: error instanceof Error ? error.message : "Failed to update property"
    });
  }
});

export default router;