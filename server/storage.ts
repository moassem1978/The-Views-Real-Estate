// This is a fixed version of storage.ts with proper image handling
import { eq, like, or, and, desc, asc, sql, gte, lte, lt } from 'drizzle-orm';
import { 
  users, properties, testimonials, announcements, projects,
  type User, type InsertUser, 
  type Property, type InsertProperty,
  type Testimonial, type InsertTestimonial,
  type Announcement, type InsertAnnouncement,
  type Project, type InsertProject,
  type SiteSettings
} from '@shared/schema';
import { db, pool } from './db';
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';
import NodeCache from 'node-cache';

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  pageCount: number;
  page: number;
  pageSize: number;
}

export interface PropertySearchFilters {
  location?: string;
  propertyType?: string;
  listingType?: string; // "Primary" or "Resale"
  projectName?: string;
  developerName?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  isFullCash?: boolean;
  hasInstallments?: boolean;
  international?: boolean; // For filtering properties outside Egypt
}

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  hasUserWithRole(role: string): Promise<boolean>;
  getAllUsers(page?: number, pageSize?: number): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  deactivateUser(id: number): Promise<boolean>;

  // Property operations
  getAllProperties(page?: number, pageSize?: number): Promise<PaginatedResult<Property>>;
  getFeaturedProperties(limit?: number, page?: number, pageSize?: number): Promise<PaginatedResult<Property>>;
  getHighlightedProperties(limit?: number): Promise<Property[]>;
  getNewListings(limit?: number, page?: number, pageSize?: number): Promise<PaginatedResult<Property>>;
  getPropertyById(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<Property>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  searchProperties(filters: Partial<PropertySearchFilters>, page?: number, pageSize?: number): Promise<PaginatedResult<Property>>;
  getPropertyCount(): Promise<number>;
  getUniqueProjectNames(): Promise<string[]>; // Added this method to get unique project names
  getUniqueCities(): Promise<string[]>; // Method to get unique cities for location dropdown

  // Project operations
  getAllProjects(page?: number, pageSize?: number): Promise<PaginatedResult<Project>>;
  getProjectById(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Testimonial operations
  getAllTestimonials(page?: number, pageSize?: number): Promise<PaginatedResult<Testimonial>>;
  getTestimonialById(id: number): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;

  // Announcement operations
  getAllAnnouncements(page?: number, pageSize?: number): Promise<PaginatedResult<Announcement>>;
  getFeaturedAnnouncements(limit?: number): Promise<Announcement[]>;
  getHighlightedAnnouncements(limit?: number): Promise<Announcement[]>;
  getAnnouncementById(id: number): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, announcement: Partial<Announcement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: number): Promise<boolean>;
  getAnnouncementCount(): Promise<number>;

  // Site settings operations
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings>;
}

export class DatabaseStorage implements IStorage {
  // Cache for frequently accessed data
  private cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

  /**
   * Get a list of unique project names from the properties table
   * Used for populating dropdown search
   */
  async getUniqueProjectNames(): Promise<string[]> {
    try {
      const cacheKey = 'unique_project_names';
      const cached = this.cache.get<string[]>(cacheKey);
      if (cached) return cached;

      const query = 'SELECT DISTINCT project_name FROM properties WHERE project_name IS NOT NULL AND project_name != \'\' ORDER BY project_name';
      const result = await pool.query(query);
      
      const projectNames = result.rows.map(row => row.project_name);
      this.cache.set(cacheKey, projectNames, 3600); // Cache for 1 hour
      return projectNames;
    } catch (error) {
      console.error('Error fetching unique project names:', error);
      return [];
    }
  }

  /**
   * Get a list of unique cities from the properties table
   * Used for populating location dropdown search
   */
  async getUniqueCities(): Promise<string[]> {
    try {
      const cacheKey = 'unique_cities';
      const cached = this.cache.get<string[]>(cacheKey);
      if (cached) return cached;

      const query = 'SELECT DISTINCT city FROM properties WHERE city IS NOT NULL AND city != \'\' ORDER BY city';
      const result = await pool.query(query);
      
      const cities = result.rows.map(row => row.city);
      this.cache.set(cacheKey, cities, 3600); // Cache for 1 hour
      return cities;
    } catch (error) {
      console.error('Error fetching unique cities:', error);
      return [];
    }
  }

  private async getCached<T>(key: string, getter: () => Promise<T>): Promise<T> {
    const cached = this.cache.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    const value = await getter();
    this.cache.set(key, value);
    return value;
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error(`Error getting user ${id}:`, error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error(`Error getting user by username ${username}:`, error);
      return undefined;
    }
  }

  async hasUserWithRole(role: string): Promise<boolean> {
    try {
      const [result] = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.role, role));
      return parseInt(result.count.toString()) > 0;
    } catch (error) {
      console.error(`Error checking for users with role ${role}:`, error);
      return false;
    }
  }

  async getAllUsers(page = 1, pageSize = 20): Promise<User[]> {
    try {
      const offset = (page - 1) * pageSize;
      const result = await db.select().from(users).limit(pageSize).offset(offset);
      return result;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    try {
      const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
      return user;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  async deactivateUser(id: number): Promise<boolean> {
    try {
      await db.update(users).set({ isActive: false }).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error(`Error deactivating user ${id}:`, error);
      return false;
    }
  }

  async getPropertyCount(): Promise<number> {
    try {
      const result = await pool.query('SELECT COUNT(*) as total FROM properties');
      console.log("Count result:", result);
      return parseInt(result.rows[0].total, 10);
    } catch (error) {
      console.error('Error getting property count:', error);
      return 0;
    }
  }

  async getAllProperties(page = 1, pageSize = 24): Promise<PaginatedResult<Property>> {
    try {
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const countResult = await pool.query('SELECT COUNT(*) as total FROM properties');
      const totalCount = parseInt(countResult.rows[0].total, 10);
      const pageCount = Math.ceil(totalCount / pageSize);
      
      // Query for paginated data
      const query = `
        SELECT * FROM properties 
        ORDER BY is_featured DESC, is_highlighted DESC, created_at DESC 
        LIMIT $1 OFFSET $2
      `;
      
      const result = await pool.query(query, [pageSize, offset]);
      
      // Map the snake_case database columns to camelCase for the frontend
      const properties = result.rows.map(this.mapPropertyFromDb);
      
      return {
        data: properties,
        totalCount,
        pageCount,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error getting all properties:', error);
      return { data: [], totalCount: 0, pageCount: 0, page, pageSize };
    }
  }

  async getFeaturedProperties(limit = 3, page = 1, pageSize = 24): Promise<PaginatedResult<Property>> {
    try {
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const countQuery = 'SELECT COUNT(*) as total FROM properties WHERE is_featured = true';
      const countResult = await pool.query(countQuery);
      const totalCount = parseInt(countResult.rows[0].total, 10);
      const pageCount = Math.ceil(totalCount / pageSize);
      
      // Query for paginated data
      const query = `
        SELECT * FROM properties 
        WHERE is_featured = true 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `;
      
      const result = await pool.query(query, [limit || pageSize, offset]);
      
      // Map the snake_case database columns to camelCase for the frontend
      const properties = result.rows.map(this.mapPropertyFromDb);
      
      return {
        data: properties,
        totalCount,
        pageCount,
        page,
        pageSize: limit || pageSize
      };
    } catch (error) {
      console.error('Error getting featured properties:', error);
      return { data: [], totalCount: 0, pageCount: 0, page, pageSize: limit || pageSize };
    }
  }

  async getHighlightedProperties(limit = 10): Promise<Property[]> {
    try {
      // Log the query parameters
      console.log(`DEBUG: Fetching highlighted properties with limit: ${limit}`);
      
      const query = `
        SELECT * FROM properties 
        WHERE is_highlighted = true 
        ORDER BY created_at DESC 
        LIMIT $1
      `;
      
      const result = await pool.query(query, [limit]);
      console.log(`DEBUG: Query returned ${result.rows.length} highlighted properties`);
      
      // Log each highlighted property for debugging
      result.rows.forEach(property => {
        console.log(`DEBUG: Highlighted property: ID ${property.id}, Title: ${property.title}, isHighlighted: ${property.is_highlighted}`);
      });
      
      // Map the snake_case database columns to camelCase for the frontend
      const properties = result.rows.map(this.mapPropertyFromDb);
      
      console.log(`DEBUG: Found ${properties.length} highlighted properties`);
      
      // Log what we're returning to the frontend
      properties.forEach(property => {
        console.log(`DEBUG: Highlighted property: ID ${property.id}, Title: ${property.title}, isHighlighted: ${property.isHighlighted}`);
      });
      
      return properties;
    } catch (error) {
      console.error('Error getting highlighted properties:', error);
      return [];
    }
  }

  async getNewListings(limit = 3, page = 1, pageSize = 24): Promise<PaginatedResult<Property>> {
    try {
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const countQuery = 'SELECT COUNT(*) as total FROM properties WHERE is_new_listing = true';
      const countResult = await pool.query(countQuery);
      const totalCount = parseInt(countResult.rows[0].total, 10);
      const pageCount = Math.ceil(totalCount / pageSize);
      
      // Query for paginated data
      const query = `
        SELECT * FROM properties 
        WHERE is_new_listing = true 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `;
      
      const result = await pool.query(query, [limit || pageSize, offset]);
      
      // Map the snake_case database columns to camelCase for the frontend
      const properties = result.rows.map(this.mapPropertyFromDb);
      
      return {
        data: properties,
        totalCount,
        pageCount,
        page,
        pageSize: limit || pageSize
      };
    } catch (error) {
      console.error('Error getting new listings:', error);
      return { data: [], totalCount: 0, pageCount: 0, page, pageSize: limit || pageSize };
    }
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    try {
      const query = 'SELECT * FROM properties WHERE id = $1';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      // Map the snake_case database columns to camelCase for the frontend
      return this.mapPropertyFromDb(result.rows[0]);
    } catch (error) {
      console.error(`Error getting property ${id}:`, error);
      return undefined;
    }
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    try {
      console.log(`DB: Creating new property`);
      console.log(`Property data:`, insertProperty);

      // Handle camelCase to snake_case conversion for Postgres column names
      const dbProperty: any = {};
      
      // Direct field mappings
      dbProperty.title = insertProperty.title;
      dbProperty.description = insertProperty.description;
      dbProperty.property_type = insertProperty.propertyType;
      dbProperty.listing_type = insertProperty.listingType;
      dbProperty.price = insertProperty.price;
      dbProperty.down_payment = insertProperty.downPayment;
      dbProperty.installment_amount = insertProperty.installmentAmount;
      dbProperty.installment_period = insertProperty.installmentPeriod;
      dbProperty.is_full_cash = insertProperty.isFullCash;
      dbProperty.city = insertProperty.city;
      dbProperty.project_name = insertProperty.projectName;
      dbProperty.developer_name = insertProperty.developerName;
      dbProperty.address = insertProperty.address;
      dbProperty.bedrooms = insertProperty.bedrooms;
      dbProperty.bathrooms = insertProperty.bathrooms;
      dbProperty.built_up_area = insertProperty.builtUpArea;
      dbProperty.is_featured = insertProperty.isFeatured;
      dbProperty.is_highlighted = insertProperty.isHighlighted;
      dbProperty.is_new_listing = insertProperty.isNewListing;
      dbProperty.plot_size = insertProperty.plotSize;
      dbProperty.garden_size = insertProperty.gardenSize;
      dbProperty.floor = insertProperty.floor;
      dbProperty.is_ground_unit = insertProperty.isGroundUnit;
      dbProperty.views = insertProperty.views;
      dbProperty.country = insertProperty.country;
      dbProperty.year_built = insertProperty.yearBuilt;
      dbProperty.created_by = insertProperty.createdBy;
      dbProperty.agent_id = insertProperty.agentId;
      dbProperty.zip_code = insertProperty.zipCode;
      dbProperty.state = insertProperty.state;
      dbProperty.status = insertProperty.status || 'pending_approval';
      dbProperty.latitude = insertProperty.latitude;
      dbProperty.longitude = insertProperty.longitude;
      dbProperty.amenities = insertProperty.amenities;
      
      // Handle the reference field
      if (insertProperty.references) {
        dbProperty.reference_number = insertProperty.references;
      } else if (insertProperty.reference) {
        dbProperty.reference_number = insertProperty.reference;
      } else if (insertProperty.reference_number) {
        dbProperty.reference_number = insertProperty.reference_number;
      }
      
      // FIXED IMAGE HANDLING - Ensure images are always stored as an array
      let imagesArray: string[] = [];
      if (insertProperty.images) {
        if (Array.isArray(insertProperty.images)) {
          imagesArray = insertProperty.images
            .filter(img => img !== null && img !== undefined && img !== '')
            .map(img => typeof img === 'string' ? img : String(img));
        } else if (typeof insertProperty.images === 'string') {
          if (insertProperty.images.trim()) {
            imagesArray = [insertProperty.images.trim()];
          }
        }
      }
      dbProperty.images = imagesArray;
      
      // Add created_at field with current date
      const currentDate = new Date().toISOString();
      dbProperty.created_at = currentDate;
      
      // Insert the property into the database
      const insertQuery = `
        INSERT INTO properties (
          title, description, property_type, listing_type, price, down_payment, 
          installment_amount, installment_period, is_full_cash, city, 
          project_name, developer_name, address, bedrooms, bathrooms, 
          built_up_area, is_featured, is_highlighted, is_new_listing, 
          plot_size, garden_size, floor, is_ground_unit, views, 
          country, year_built, created_by, agent_id, zip_code, 
          state, status, reference_number, latitude, longitude, 
          amenities, images, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, 
          $30, $31, $32, $33, $34, $35, $36, $37
        ) RETURNING *
      `;
      
      const values = [
        dbProperty.title, dbProperty.description, dbProperty.property_type, dbProperty.listing_type, 
        dbProperty.price, dbProperty.down_payment, dbProperty.installment_amount, 
        dbProperty.installment_period, dbProperty.is_full_cash, dbProperty.city, dbProperty.project_name, 
        dbProperty.developer_name, dbProperty.address, dbProperty.bedrooms, dbProperty.bathrooms, 
        dbProperty.built_up_area, dbProperty.is_featured, dbProperty.is_highlighted, 
        dbProperty.is_new_listing, dbProperty.plot_size, dbProperty.garden_size, 
        dbProperty.floor, dbProperty.is_ground_unit, dbProperty.views, dbProperty.country, 
        dbProperty.year_built, dbProperty.created_by, dbProperty.agent_id, dbProperty.zip_code, 
        dbProperty.state, dbProperty.status, dbProperty.reference_number, 
        dbProperty.latitude, dbProperty.longitude, dbProperty.amenities, dbProperty.images, dbProperty.created_at
      ];
      
      const result = await pool.query(insertQuery, values);
      const property = result.rows[0];
      
      // Transform the property to camelCase for the frontend
      const updatedProperty = this.mapPropertyFromDb(property);
      
      // Make sure the references field is available in the return value
      // Note: reference_number in DB maps to references in the application
      const propertyWithReferences = {
        ...updatedProperty,
        references: updatedProperty.reference_number || '',
        reference: updatedProperty.reference_number || '',
        // Ensure images is always an array
        images: imagesArray
      };

      console.log(`DB: Successfully created property with ID ${property.id}`);
      if (imagesArray.length > 0) {
        console.log(`Property has ${imagesArray.length} images: ${imagesArray.slice(0, 3).join(', ')}${imagesArray.length > 3 ? '...' : ''}`);
      }

      return propertyWithReferences;
    } catch (error) {
      console.error(`DB Error creating property:`, error);
      throw error;
    }
  }

  async updateProperty(id: number, updates: Partial<Property> & { imagesToRemove?: string[] }): Promise<Property | undefined> {
    try {
      console.log(`DB: Updating property with ID ${id}`);
      console.log(`Received update data:`, updates);

      // Handle image removal before database update if imagesToRemove array is present
      if (updates.imagesToRemove && Array.isArray(updates.imagesToRemove) && updates.imagesToRemove.length > 0) {
        console.log(`Processing request to remove ${updates.imagesToRemove.length} images from property ${id}`);
        console.log(`Images to remove:`, updates.imagesToRemove);

        // First get the existing property to get its current images
        const existingProperty = await this.getPropertyById(id);
        if (!existingProperty) {
          console.log(`Property ${id} not found when trying to remove images`);
          return undefined;
        }

        // Filter out the images that should be removed
        if (existingProperty.images && Array.isArray(existingProperty.images)) {
          const updatedImages = existingProperty.images.filter(img => 
            !updates.imagesToRemove!.includes(img)
          );

          console.log(`Filtered images from ${existingProperty.images.length} to ${updatedImages.length}`);
          updates.images = updatedImages;
        }

        // Remove the imagesToRemove property as it's not a column in the database
        delete updates.imagesToRemove;
      }
      
      // CRITICAL FIX: Ensure images are always stored as an array in the database
      if ('images' in updates) {
        console.log(`Processing images for update. Type: ${typeof updates.images}, Value:`, updates.images);
        
        let imagesArray: string[] = [];
        
        if (Array.isArray(updates.images)) {
          // It's already an array, make sure all entries are strings
          imagesArray = updates.images
            .filter(img => img !== null && img !== undefined && img !== '')
            .map(img => typeof img === 'string' ? img : String(img));
            
          console.log(`Processed array of ${imagesArray.length} images`);
        } 
        else if (typeof updates.images === 'string') {
          // It's a string, check if it might be JSON
          if (updates.images.trim().startsWith('[')) {
            try {
              const parsed = JSON.parse(updates.images);
              if (Array.isArray(parsed)) {
                imagesArray = parsed
                  .filter(img => img !== null && img !== undefined && img !== '')
                  .map(img => typeof img === 'string' ? img : String(img));
                  
                console.log(`Parsed JSON string into array of ${imagesArray.length} images`);
              } else {
                // JSON but not an array
                imagesArray = [updates.images];
                console.log(`JSON was not an array, using as single image`);
              }
            } catch (e) {
              // Not valid JSON
              if (updates.images.trim()) {
                imagesArray = [updates.images.trim()];
                console.log(`Using string as single image: ${updates.images}`);
              }
            }
          } 
          else if (updates.images.trim()) {
            // Plain string path
            imagesArray = [updates.images.trim()];
            console.log(`Using string as single image path: ${updates.images}`);
          }
        }
        else if (updates.images && typeof updates.images === 'object') {
          // Handle empty objects or other objects
          if (Object.keys(updates.images).length === 0) {
            // Empty object - leave as empty array
            console.log(`Empty object for images, using empty array`);
          } else {
            // Try to extract values from the object
            try {
              const extractedImages = Object.values(updates.images)
                .filter(val => val !== null && val !== undefined && val !== '')
                .map(val => typeof val === 'string' ? val : String(val));
                
              if (extractedImages.length > 0) {
                imagesArray = extractedImages;
                console.log(`Extracted ${imagesArray.length} images from object`);
              }
            } catch (e) {
              console.error(`Failed to extract images from object:`, e);
            }
          }
        }
        
        // Assign the properly processed array back to updates.images
        updates.images = imagesArray;
        console.log(`Final images array for update: ${imagesArray.length} items`);
      }

      // Convert camelCase properties to snake_case for the database
      const dbUpdates: any = {};

      // Direct mappings
      if ('title' in updates) dbUpdates.title = updates.title;
      if ('description' in updates) dbUpdates.description = updates.description;
      if ('price' in updates) dbUpdates.price = updates.price;
      if ('downPayment' in updates) dbUpdates.down_payment = updates.downPayment;
      if ('installmentAmount' in updates) dbUpdates.installment_amount = updates.installmentAmount;
      if ('installmentPeriod' in updates) dbUpdates.installment_period = updates.installmentPeriod;
      if ('isFullCash' in updates) dbUpdates.is_full_cash = updates.isFullCash;
      if ('city' in updates) dbUpdates.city = updates.city;
      if ('projectName' in updates) dbUpdates.project_name = updates.projectName;
      if ('developerName' in updates) dbUpdates.developer_name = updates.developerName;
      if ('address' in updates) dbUpdates.address = updates.address;
      if ('bedrooms' in updates) dbUpdates.bedrooms = updates.bedrooms;
      if ('bathrooms' in updates) dbUpdates.bathrooms = updates.bathrooms;
      if ('builtUpArea' in updates) dbUpdates.built_up_area = updates.builtUpArea;
      if ('isFeatured' in updates) dbUpdates.is_featured = updates.isFeatured;
      if ('isHighlighted' in updates) dbUpdates.is_highlighted = updates.isHighlighted;
      if ('isNewListing' in updates) dbUpdates.is_new_listing = updates.isNewListing;
      if ('country' in updates) dbUpdates.country = updates.country;
      if ('yearBuilt' in updates) {
        // Handle yearBuilt field to ensure it's a number or null
        if (updates.yearBuilt === '' || updates.yearBuilt === null || updates.yearBuilt === undefined) {
          dbUpdates.year_built = null; // Use NULL for empty year values
        } else {
          dbUpdates.year_built = typeof updates.yearBuilt === 'number' ? 
            updates.yearBuilt : parseInt(String(updates.yearBuilt)) || null;
        }
      }

      if ('status' in updates) dbUpdates.status = updates.status;

      // The references field maps to reference_number column - CRITICAL FIELD
      // Process all possible reference field names to ensure it's saved
      let refNumber = null;

      // Try to get the reference number from any possible field
      if ('references' in updates && updates.references) {
        refNumber = updates.references;
        console.log(`Found reference in 'references' field: ${refNumber}`);
      }

      if ('reference' in updates && updates.reference) {
        refNumber = updates.reference;
        console.log(`Found reference in 'reference' field: ${refNumber}`);
      }

      if ('reference_number' in updates && updates.reference_number) {
        refNumber = updates.reference_number;
        console.log(`Found reference in 'reference_number' field: ${refNumber}`);
      }

      // If we found a reference number, apply it
      if (refNumber) {
        console.log(`Setting reference_number to: ${refNumber}`);
        dbUpdates.reference_number = refNumber;
      } else {
        // Check if we're editing an existing property
        console.log(`Looking for existing reference number in property ${id}`);
        // Don't set to null or empty string - leaving it as is
      }
      // Important: Explicitly ensure propertyType is handled correctly
      if ('propertyType' in updates) {
        console.log(`Explicitly setting property_type to: ${updates.propertyType}`);
        dbUpdates.property_type = updates.propertyType;
      }

      // Handle images field specially to prevent JSON syntax errors
      if ('images' in updates) {
        console.log('Processing images field for update:', updates.images);

        // First, retrieve the existing property to get current images
        const existingQuery = 'SELECT images FROM properties WHERE id = $1';
        const existingResult = await pool.query(existingQuery, [id]);
        let existingImages: string[] = [];

        if (existingResult && existingResult.rows && existingResult.rows.length > 0) {
          // Get existing images from the database
          const existingData = existingResult.rows[0].images;
          console.log('Existing images from database:', existingData);

          if (Array.isArray(existingData)) {
            // Already parsed as an array by pg
            existingImages = existingData
              .filter(img => img !== null && img !== undefined)
              .map(img => typeof img === 'string' ? img : String(img));
          } else if (existingData && typeof existingData === 'object') {
            // Sometimes it comes as an object that needs to be converted
            existingImages = Object.values(existingData)
              .filter(img => img !== null && img !== undefined)
              .map(img => typeof img === 'string' ? img : String(img));
          } else if (typeof existingData === 'string') {
            // Try to parse as JSON
            try {
              const parsed = JSON.parse(existingData);
              if (Array.isArray(parsed)) {
                existingImages = parsed.filter(Boolean).map(String);
              }
            } catch (e) {
              // Not valid JSON
              console.log('Could not parse existing images as JSON');
              existingImages = [];
            }
          }
        }

        console.log('Existing images array:', existingImages);

        // Process new images to add
        let newImagesArray: string[] = [];

        if (Array.isArray(updates.images)) {
          // Filter out any non-string elements and ensure they're all simple strings
          newImagesArray = updates.images
            .filter(img => img !== null && img !== undefined)
            .map(img => typeof img === 'string' ? img : String(img));
        } else if (typeof updates.images === 'string') {
          // If it's a string that looks like JSON, try to parse it
          if (updates.images.startsWith('[') && updates.images.endsWith(']')) {
            try {
              const parsed = JSON.parse(updates.images);
              if (Array.isArray(parsed)) {
                newImagesArray = parsed.filter(Boolean).map(String);
              } else {
                newImagesArray = [updates.images];
              }
            } catch (e) {
              // Not valid JSON, treat as a single image path
              newImagesArray = [updates.images];
            }
          } else {
            // Just a regular string, treat as a single image path
            newImagesArray = [updates.images];
          }
        }

        console.log('New images to add:', newImagesArray);

        // IMPORTANT: If updates.images already contains filtered images from the imagesToRemove process,
        // we must use that instead of the raw database values
        const filteredExistingImages = Array.isArray(updates.images) ? updates.images : existingImages;
        console.log('Using images array after removal processing:', filteredExistingImages);
        console.log('Existing images after removal:', filteredExistingImages);

        // Remove duplicate images before combining arrays
        const uniqueNewImages = newImagesArray.filter(newImg => {
          // Check if this image URL already exists in existing images
          return !filteredExistingImages.some(existingImg => existingImg === newImg);
        });
        console.log('Unique new images after deduplication:', uniqueNewImages);

        // Combine filtered existing and unique new images
        const combinedImages = [...filteredExistingImages, ...uniqueNewImages];
        console.log('Combined images array:', combinedImages);

        // Filter out any undefined, null, or empty string values
        const sanitizedImages = combinedImages.filter(img => img !== null && img !== undefined && img !== "");
        console.log(`After sanitization: ${sanitizedImages.length} valid images`);

        // Make sure the image paths have consistent formatting (start with /)
        const normalizedImages = sanitizedImages.map(img => {
          const imgStr = String(img);
          // If this is a URL or already has a leading slash, leave it as is
          if (imgStr.startsWith('http') || imgStr.startsWith('/')) {
            return imgStr;
          }
          // Otherwise add a leading slash to make it consistent
          return `/${imgStr}`;
        });

        // Verify we have properly formatted image paths
        console.log(`Final image paths (${normalizedImages.length}):`);
        normalizedImages.forEach((img, index) => {
          if (index < 10) { // Only show first 10 to avoid console spam
            console.log(`  [${index}]: ${img}`);
          } else if (index === 10) {
            console.log(`  ... and ${normalizedImages.length - 10} more`);
          }
        });

        // DO NOT use JSON.stringify - it causes issues with PostgreSQL's JSONB parsing
        // Instead, use a direct array which pg will properly convert to JSONB
        dbUpdates.images = normalizedImages;
        console.log(`Final images array (${normalizedImages.length} items):`, 
                    normalizedImages.length > 0 ? 
                    normalizedImages.slice(0, 3) : 
                    'empty array');
      }

      console.log(`Converted database updates:`, dbUpdates);

      // Build the SET clause parts of the SQL query and parameters array
      const setClauseParts = [];
      const queryParams = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(dbUpdates)) {
        // Handle images special case - let pg driver handle the conversion
        if (key === 'images' && value !== null && value !== undefined) {
          console.log(`Special handling for images array, value type: ${typeof value}`);
          // For arrays, don't use explicit casting - let the pg driver handle it
          setClauseParts.push(`${key} = $${paramIndex}`);
          queryParams.push(value);

          // Better logging that doesn't print the whole array
          console.log(`Storing images array with ${Array.isArray(value) ? value.length : 'unknown number of'} images`);
        } else {
          // Normal case for all other fields
          setClauseParts.push(`${key} = $${paramIndex}`);
          queryParams.push(value);
        }
        paramIndex++;
      }

      // Add the ID as the last parameter
      queryParams.push(id);

      // Construct the full query
      const query = `
        UPDATE properties 
        SET ${setClauseParts.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING *
      `;

      console.log(`Executing query: ${query}`);
      console.log(`With parameters:`, queryParams);

      // Execute the query using pool.query
      const result = await pool.query(query, queryParams);

      if (!result || result.rowCount === 0) {
        console.log(`DB: Failed to update property ${id}`);
        return undefined;
      }

      const updatedProperty = result.rows[0];
      console.log('Raw property from database:', updatedProperty);

      // Initialize images array - simplifying the image handling logic
      let imagesArray: string[] = [];

      if (updatedProperty.images) {
        console.log('Processing images from database');
        
        // Simplified image handling - focus on the most common case (array)
        if (Array.isArray(updatedProperty.images)) {
          console.log(`Images is already an array with ${updatedProperty.images.length} items`);
          imagesArray = updatedProperty.images.map(img => String(img)).filter(Boolean);
        } else {
          console.log('Images is not an array, attempting to convert');
          console.log('Image data type:', typeof updatedProperty.images);
          
          try {
            // Try to convert the images to an array using any reasonable method
            if (typeof updatedProperty.images === 'string') {
              // If it's a JSON string, parse it
              try {
                const parsed = JSON.parse(updatedProperty.images);
                if (Array.isArray(parsed)) {
                  imagesArray = parsed.map(img => String(img)).filter(Boolean);
                } else {
                  imagesArray = [updatedProperty.images];
                }
              } catch (e) {
                // Not valid JSON, use as a single image
                imagesArray = [updatedProperty.images];
              }
            } else if (typeof updatedProperty.images === 'object' && updatedProperty.images !== null) {
              // If it's an object, get its values
              imagesArray = Object.values(updatedProperty.images).map(img => String(img)).filter(Boolean);
            } else {
              // Last resort - stringified array
              imagesArray = JSON.parse(JSON.stringify(updatedProperty.images));
            }
          } catch (e) {
            console.error('Failed to process images:', e);
            // Empty array as fallback
            imagesArray = [];
          }
        }
      }

      // Add this for debugging
      console.log('Parsed images array for frontend:', imagesArray.length ? imagesArray.slice(0, 3) : 'empty array');

      // Ensure we have the most up-to-date images array
      if (imagesArray.length === 0 && dbUpdates.images) {
        // This is a last-resort safeguard to ensure we don't lose images during an update
        console.log("No images found in DB result, but we have images in the update data - restoring them");

        try {
          // Try to parse from our update object
          const backupImages = Array.isArray(dbUpdates.images) ? dbUpdates.images : [];
          if (backupImages.length > 0) {
            console.log(`Fallback: Using ${backupImages.length} images from update data`);
            imagesArray = backupImages.map(String);
          }
        } catch (e) {
          console.error("Error restoring images from update data:", e);
        }
      }

      console.log(`Final images array for frontend has ${imagesArray.length} images`);

      // Convert property back to camelCase for frontend
      const propertyResult = {
        id: updatedProperty.id,
        title: updatedProperty.title,
        description: updatedProperty.description,
        propertyType: updatedProperty.property_type,
        listingType: updatedProperty.listing_type,
        price: updatedProperty.price,
        downPayment: updatedProperty.down_payment,
        installmentAmount: updatedProperty.installment_amount,
        installmentPeriod: updatedProperty.installment_period,
        isFullCash: updatedProperty.is_full_cash,
        city: updatedProperty.city,
        projectName: updatedProperty.project_name,
        developerName: updatedProperty.developer_name,
        address: updatedProperty.address,
        bedrooms: updatedProperty.bedrooms,
        bathrooms: updatedProperty.bathrooms,
        builtUpArea: updatedProperty.built_up_area,
        isFeatured: updatedProperty.is_featured,
        isHighlighted: updatedProperty.is_highlighted,
        isNewListing: updatedProperty.is_new_listing,
        plotSize: updatedProperty.plot_size,
        gardenSize: updatedProperty.garden_size,
        floor: updatedProperty.floor,
        isGroundUnit: updatedProperty.is_ground_unit,
        views: updatedProperty.views,
        country: updatedProperty.country,
        yearBuilt: updatedProperty.year_built,
        status: updatedProperty.status,
        createdAt: updatedProperty.created_at,
        updatedAt: updatedProperty.updated_at,
        createdBy: updatedProperty.created_by,
        approvedBy: updatedProperty.approved_by,
        agentId: updatedProperty.agent_id,
        zipCode: updatedProperty.zip_code,
        state: updatedProperty.state,

        // Include reference number in all possible formats for compatibility
        references: updatedProperty.reference_number || '',
        reference: updatedProperty.reference_number || '',
        reference_number: updatedProperty.reference_number || '',

        // Ensure amenities is always an array
        amenities: Array.isArray(updatedProperty.amenities) ? 
                    updatedProperty.amenities : 
                    (typeof updatedProperty.amenities === 'string' && updatedProperty.amenities ? 
                      JSON.parse(updatedProperty.amenities) : 
                      []),

        // Make sure images is always a valid array
        images: imagesArray.length > 0 ? 
                imagesArray : 
                (Array.isArray(updatedProperty.images) ? 
                  updatedProperty.images : 
                  [])
      };

      // Final logging to confirm the image array is valid
      console.log(`Final property result has ${propertyResult.images.length} images`);
      if (propertyResult.images.length > 0) {
        console.log(`Sample images: ${propertyResult.images.slice(0, 3).join(', ')}${propertyResult.images.length > 3 ? '...' : ''}`);
      }

      console.log(`DB: Successfully updated property ${id} with ${propertyResult.images.length} images`);
      return propertyResult as Property;
    } catch (error) {
      console.error(`DB Error updating property ${id}:`, error);
      throw error;
    }
  }

  async deleteProperty(id: number): Promise<boolean> {
    try {
      await db.delete(properties).where(eq(properties.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting property ${id}:`, error);
      return false;
    }
  }

  async searchProperties(filters: Partial<PropertySearchFilters>, page = 1, pageSize = 24): Promise<PaginatedResult<Property>> {
    try {
      const conditions = [];
      const queryParams = [];
      let paramIndex = 1;
      
      if (filters.location) {
        conditions.push(`(city ILIKE $${paramIndex} OR address ILIKE $${paramIndex})`);
        queryParams.push(`%${filters.location}%`);
        paramIndex++;
      }
      
      if (filters.propertyType) {
        conditions.push(`property_type = $${paramIndex}`);
        queryParams.push(filters.propertyType);
        paramIndex++;
      }
      
      if (filters.listingType) {
        conditions.push(`listing_type = $${paramIndex}`);
        queryParams.push(filters.listingType);
        paramIndex++;
      }
      
      if (filters.projectName) {
        conditions.push(`project_name ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.projectName}%`);
        paramIndex++;
      }
      
      if (filters.developerName) {
        conditions.push(`developer_name ILIKE $${paramIndex}`);
        queryParams.push(`%${filters.developerName}%`);
        paramIndex++;
      }
      
      if (filters.minPrice !== undefined && filters.minPrice > 0) {
        conditions.push(`price >= $${paramIndex}`);
        queryParams.push(filters.minPrice);
        paramIndex++;
      }
      
      if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
        conditions.push(`price <= $${paramIndex}`);
        queryParams.push(filters.maxPrice);
        paramIndex++;
      }
      
      if (filters.minBedrooms !== undefined && filters.minBedrooms > 0) {
        conditions.push(`bedrooms >= $${paramIndex}`);
        queryParams.push(filters.minBedrooms);
        paramIndex++;
      }
      
      if (filters.minBathrooms !== undefined && filters.minBathrooms > 0) {
        conditions.push(`bathrooms >= $${paramIndex}`);
        queryParams.push(filters.minBathrooms);
        paramIndex++;
      }
      
      if (filters.isFullCash !== undefined) {
        conditions.push(`is_full_cash = $${paramIndex}`);
        queryParams.push(filters.isFullCash);
        paramIndex++;
      }
      
      if (filters.hasInstallments !== undefined && filters.hasInstallments) {
        conditions.push(`installment_period IS NOT NULL AND installment_period > 0`);
      }
      
      if (filters.international !== undefined) {
        if (filters.international) {
          conditions.push(`(country IS NOT NULL AND country != 'Egypt' AND country != '')`);
        } else {
          conditions.push(`(country IS NULL OR country = 'Egypt' OR country = '')`);
        }
      }
      
      // Only include approved properties in search results
      conditions.push(`status = 'approved'`);
      
      // Build the WHERE clause if there are conditions
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) as total FROM properties ${whereClause}`;
      const countResult = await pool.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].total, 10);
      const pageCount = Math.ceil(totalCount / pageSize);
      
      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;
      
      // Query for paginated data
      const query = `
        SELECT * FROM properties 
        ${whereClause} 
        ORDER BY is_featured DESC, created_at DESC 
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      queryParams.push(pageSize, offset);
      
      const result = await pool.query(query, queryParams);
      
      // Map the snake_case database columns to camelCase for the frontend
      const properties = result.rows.map(this.mapPropertyFromDb);
      
      return {
        data: properties,
        totalCount,
        pageCount,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error searching properties:', error);
      return { data: [], totalCount: 0, pageCount: 0, page, pageSize };
    }
  }

  async getAllTestimonials(page = 1, pageSize = 10): Promise<PaginatedResult<Testimonial>> {
    try {
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const countResult = await db.select({ count: sql`count(*)` }).from(testimonials);
      const totalCount = parseInt(countResult[0].count.toString());
      const pageCount = Math.ceil(totalCount / pageSize);
      
      // Query for paginated data
      const result = await db.select().from(testimonials).limit(pageSize).offset(offset);
      
      return {
        data: result,
        totalCount,
        pageCount,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error getting all testimonials:', error);
      return { data: [], totalCount: 0, pageCount: 0, page, pageSize };
    }
  }

  async getTestimonialById(id: number): Promise<Testimonial | undefined> {
    try {
      const [testimonial] = await db.select().from(testimonials).where(eq(testimonials.id, id));
      return testimonial;
    } catch (error) {
      console.error(`Error getting testimonial ${id}:`, error);
      return undefined;
    }
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    try {
      const [testimonial] = await db.insert(testimonials).values(insertTestimonial).returning();
      return testimonial;
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  }

  async getAnnouncementCount(): Promise<number> {
    try {
      const result = await pool.query('SELECT COUNT(*) as total FROM announcements');
      const count = parseInt(result.rows[0].total, 10);
      console.log("DEBUG: Total announcements in database:", count);
      return count;
    } catch (error) {
      console.error('Error getting announcement count:', error);
      return 0;
    }
  }

  async getAllAnnouncements(page = 1, pageSize = 10): Promise<PaginatedResult<Announcement>> {
    try {
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const countQuery = 'SELECT COUNT(*) as total FROM announcements';
      const countResult = await pool.query(countQuery);
      const totalCount = parseInt(countResult.rows[0].total, 10);
      const pageCount = Math.ceil(totalCount / pageSize);
      
      // Query for paginated data
      const query = `
        SELECT * FROM announcements 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `;
      
      const result = await pool.query(query, [pageSize, offset]);
      
      // Transform the date fields for each announcement
      const announcements = result.rows.map(this.mapAnnouncementFromDb);
      
      return {
        data: announcements,
        totalCount,
        pageCount,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error getting all announcements:', error);
      return { data: [], totalCount: 0, pageCount: 0, page, pageSize };
    }
  }

  async getFeaturedAnnouncements(limit = 3): Promise<Announcement[]> {
    try {
      const query = `
        SELECT * FROM announcements 
        WHERE is_featured = true 
        ORDER BY created_at DESC 
        LIMIT $1
      `;
      
      const result = await pool.query(query, [limit]);
      
      // Transform the date fields for each announcement
      const announcements = result.rows.map(this.mapAnnouncementFromDb);
      
      return announcements;
    } catch (error) {
      console.error('Error getting featured announcements:', error);
      return [];
    }
  }

  async getHighlightedAnnouncements(limit = 10): Promise<Announcement[]> {
    try {
      const highlightedCount = await pool.query(
        'SELECT COUNT(*) as total FROM announcements WHERE is_highlighted = true'
      );
      console.log("DEBUG: Announcements with isHighlighted=true:", parseInt(highlightedCount.rows[0].total, 10));
      
      // Query for the highlighted announcements
      const query = `
        SELECT * FROM announcements 
        WHERE is_highlighted = true 
        ORDER BY created_at DESC 
        LIMIT $1
      `;
      
      const result = await pool.query(query, [limit]);
      console.log(`DEBUG: Query returned ${result.rows.length} highlighted announcements`);
      
      // Transform the date fields for each announcement
      const announcements = result.rows.map(this.mapAnnouncementFromDb);
      
      console.log(`DEBUG: Found ${announcements.length} highlighted announcements`);
      
      // Log what we're returning to the frontend
      announcements.forEach(announcement => {
        console.log(`DEBUG: Highlighted announcement: ID ${announcement.id}, Title: ${announcement.title}, isHighlighted: ${announcement.isHighlighted}`);
      });
      
      return announcements;
    } catch (error) {
      console.error('Error getting highlighted announcements:', error);
      return [];
    }
  }

  async getAnnouncementById(id: number): Promise<Announcement | undefined> {
    try {
      const query = 'SELECT * FROM announcements WHERE id = $1';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      // Transform the date fields
      return this.mapAnnouncementFromDb(result.rows[0]);
    } catch (error) {
      console.error(`Error getting announcement ${id}:`, error);
      return undefined;
    }
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    try {
      // Convert camelCase to snake_case for database column names
      const dbAnnouncement: any = {
        title: insertAnnouncement.title,
        content: insertAnnouncement.content,
        image_url: insertAnnouncement.imageUrl,
        is_featured: insertAnnouncement.isFeatured,
        is_highlighted: insertAnnouncement.isHighlighted,
        status: insertAnnouncement.status || 'active',
        created_by: insertAnnouncement.createdBy,
        start_date: insertAnnouncement.startDate,
        end_date: insertAnnouncement.endDate,
      };
      
      const insertQuery = `
        INSERT INTO announcements (
          title, content, image_url, is_featured, is_highlighted,
          status, created_by, start_date, end_date
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        ) RETURNING *
      `;
      
      const values = [
        dbAnnouncement.title, 
        dbAnnouncement.content, 
        dbAnnouncement.image_url,
        dbAnnouncement.is_featured, 
        dbAnnouncement.is_highlighted,
        dbAnnouncement.status, 
        dbAnnouncement.created_by,
        dbAnnouncement.start_date,
        dbAnnouncement.end_date
      ];
      
      const result = await pool.query(insertQuery, values);
      
      // Transform the date fields
      return this.mapAnnouncementFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  async updateAnnouncement(id: number, updates: Partial<Announcement>): Promise<Announcement | undefined> {
    try {
      // Convert camelCase to snake_case for database column names
      const dbUpdates: any = {};
      
      if ('title' in updates) dbUpdates.title = updates.title;
      if ('content' in updates) dbUpdates.content = updates.content;
      if ('imageUrl' in updates) dbUpdates.image_url = updates.imageUrl;
      if ('isFeatured' in updates) dbUpdates.is_featured = updates.isFeatured;
      if ('isHighlighted' in updates) dbUpdates.is_highlighted = updates.isHighlighted;
      if ('status' in updates) dbUpdates.status = updates.status;
      if ('startDate' in updates) dbUpdates.start_date = updates.startDate;
      if ('endDate' in updates) dbUpdates.end_date = updates.endDate;
      if ('approvedBy' in updates) dbUpdates.approved_by = updates.approvedBy;
      
      // Update the updated_at timestamp
      dbUpdates.updated_at = new Date();
      
      // Build the SET clause
      const setClauseParts = Object.entries(dbUpdates).map(([key, _], index) => `${key} = $${index + 1}`);
      const queryParams = Object.values(dbUpdates);
      
      // Add the ID as the last parameter
      queryParams.push(id);
      
      const query = `
        UPDATE announcements 
        SET ${setClauseParts.join(', ')} 
        WHERE id = $${queryParams.length} 
        RETURNING *
      `;
      
      const result = await pool.query(query, queryParams);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      // Transform the date fields
      return this.mapAnnouncementFromDb(result.rows[0]);
    } catch (error) {
      console.error(`Error updating announcement ${id}:`, error);
      return undefined;
    }
  }

  async deleteAnnouncement(id: number): Promise<boolean> {
    try {
      const result = await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error deleting announcement ${id}:`, error);
      return false;
    }
  }

  async getAllProjects(page = 1, pageSize = 10): Promise<PaginatedResult<Project>> {
    try {
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const countQuery = 'SELECT COUNT(*) as total FROM projects';
      const countResult = await pool.query(countQuery);
      const totalCount = parseInt(countResult.rows[0].total, 10);
      const pageCount = Math.ceil(totalCount / pageSize);
      
      // Query for paginated data
      const query = `
        SELECT * FROM projects 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `;
      
      const result = await pool.query(query, [pageSize, offset]);
      
      // Map the snake_case database columns to camelCase for the frontend
      const projects = result.rows.map(this.mapProjectFromDb);
      
      return {
        data: projects,
        totalCount,
        pageCount,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error getting all projects:', error);
      return { data: [], totalCount: 0, pageCount: 0, page, pageSize };
    }
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    try {
      const query = 'SELECT * FROM projects WHERE id = $1';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      // Map the snake_case database columns to camelCase for the frontend
      return this.mapProjectFromDb(result.rows[0]);
    } catch (error) {
      console.error(`Error getting project ${id}:`, error);
      return undefined;
    }
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    try {
      // Convert camelCase to snake_case for database column names
      const dbProject: any = {
        project_name: insertProject.projectName,
        description: insertProject.description,
        location: insertProject.location,
        images: insertProject.images || [],
        unit_types: insertProject.unitTypes || [],
        about_developer: insertProject.aboutDeveloper,
        status: insertProject.status || 'active',
        created_by: insertProject.createdBy
      };
      
      const insertQuery = `
        INSERT INTO projects (
          project_name, description, location, images, unit_types,
          about_developer, status, created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        ) RETURNING *
      `;
      
      const values = [
        dbProject.project_name, 
        dbProject.description, 
        dbProject.location,
        dbProject.images, 
        dbProject.unit_types,
        dbProject.about_developer, 
        dbProject.status, 
        dbProject.created_by
      ];
      
      const result = await pool.query(insertQuery, values);
      
      // Map the snake_case database columns to camelCase for the frontend
      return this.mapProjectFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    try {
      // Convert camelCase to snake_case for database column names
      const dbUpdates: any = {};
      
      if ('projectName' in updates) dbUpdates.project_name = updates.projectName;
      if ('description' in updates) dbUpdates.description = updates.description;
      if ('location' in updates) dbUpdates.location = updates.location;
      if ('images' in updates) dbUpdates.images = updates.images;
      if ('unitTypes' in updates) dbUpdates.unit_types = updates.unitTypes;
      if ('aboutDeveloper' in updates) dbUpdates.about_developer = updates.aboutDeveloper;
      if ('status' in updates) dbUpdates.status = updates.status;
      if ('approvedBy' in updates) dbUpdates.approved_by = updates.approvedBy;
      
      // Update the updated_at timestamp
      dbUpdates.updated_at = new Date();
      
      // Build the SET clause
      const setClauseParts = Object.entries(dbUpdates).map(([key, _], index) => `${key} = $${index + 1}`);
      const queryParams = Object.values(dbUpdates);
      
      // Add the ID as the last parameter
      queryParams.push(id);
      
      const query = `
        UPDATE projects 
        SET ${setClauseParts.join(', ')} 
        WHERE id = $${queryParams.length} 
        RETURNING *
      `;
      
      const result = await pool.query(query, queryParams);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      // Map the snake_case database columns to camelCase for the frontend
      return this.mapProjectFromDb(result.rows[0]);
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      return undefined;
    }
  }

  async deleteProject(id: number): Promise<boolean> {
    try {
      const result = await pool.query('DELETE FROM projects WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      return false;
    }
  }

  // Map a database property row to the camelCase Property type
  private mapPropertyFromDb(dbProperty: any): Property {
    return {
      id: dbProperty.id,
      title: dbProperty.title,
      description: dbProperty.description,
      propertyType: dbProperty.property_type,
      listingType: dbProperty.listing_type,
      price: dbProperty.price,
      downPayment: dbProperty.down_payment,
      installmentAmount: dbProperty.installment_amount,
      installmentPeriod: dbProperty.installment_period,
      isFullCash: dbProperty.is_full_cash,
      city: dbProperty.city,
      projectName: dbProperty.project_name,
      developerName: dbProperty.developer_name,
      address: dbProperty.address,
      bedrooms: dbProperty.bedrooms,
      bathrooms: dbProperty.bathrooms,
      builtUpArea: dbProperty.built_up_area,
      isFeatured: dbProperty.is_featured,
      isHighlighted: dbProperty.is_highlighted,
      isNewListing: dbProperty.is_new_listing,
      plotSize: dbProperty.plot_size,
      gardenSize: dbProperty.garden_size,
      floor: dbProperty.floor,
      isGroundUnit: dbProperty.is_ground_unit,
      views: dbProperty.views,
      country: dbProperty.country,
      yearBuilt: dbProperty.year_built,
      status: dbProperty.status,
      createdAt: dbProperty.created_at,
      updatedAt: dbProperty.updated_at,
      createdBy: dbProperty.created_by,
      approvedBy: dbProperty.approved_by,
      agentId: dbProperty.agent_id,
      zipCode: dbProperty.zip_code,
      state: dbProperty.state,
      
      // Reference field that maps from reference_number
      references: dbProperty.reference_number || '',
      reference: dbProperty.reference_number || '',
      reference_number: dbProperty.reference_number || '',
      
      // Image and amenities handling 
      images: Array.isArray(dbProperty.images) ? dbProperty.images : [],
      amenities: Array.isArray(dbProperty.amenities) ? dbProperty.amenities : [],
      
      // Additional fields
      latitude: dbProperty.latitude,
      longitude: dbProperty.longitude,
    };
  }

  // Map a database announcement row to the camelCase Announcement type
  private mapAnnouncementFromDb(dbAnnouncement: any): Announcement {
    return {
      id: dbAnnouncement.id,
      title: dbAnnouncement.title,
      content: dbAnnouncement.content,
      imageUrl: dbAnnouncement.image_url,
      isFeatured: dbAnnouncement.is_featured,
      isHighlighted: dbAnnouncement.is_highlighted,
      isActive: dbAnnouncement.is_active,
      status: dbAnnouncement.status,
      createdAt: dbAnnouncement.created_at,
      updatedAt: dbAnnouncement.updated_at,
      createdBy: dbAnnouncement.created_by,
      approvedBy: dbAnnouncement.approved_by,
      startDate: dbAnnouncement.start_date,
      endDate: dbAnnouncement.end_date,
    };
  }

  // Map a database project row to the camelCase Project type
  private mapProjectFromDb(dbProject: any): Project {
    return {
      id: dbProject.id,
      projectName: dbProject.project_name,
      description: dbProject.description,
      location: dbProject.location,
      images: Array.isArray(dbProject.images) ? dbProject.images : [],
      unitTypes: Array.isArray(dbProject.unit_types) ? dbProject.unit_types : [],
      aboutDeveloper: dbProject.about_developer,
      status: dbProject.status,
      createdAt: dbProject.created_at,
      updatedAt: dbProject.updated_at,
      createdBy: dbProject.created_by,
      approvedBy: dbProject.approved_by,
    };
  }

  // Site settings implementation
  private defaultSiteSettings: SiteSettings = {
    companyName: 'The Views Real Estate',
    contactEmail: 'info@theviewsrealestate.com',
    contactPhone: '+20 101 770 0066',
    address: 'The Views Real Estate Office, Cairo, Egypt',
    logoUrl: '/uploads/company/logo.png',
    facebookUrl: 'https://facebook.com/theviewsrealestate',
    instagramUrl: 'https://instagram.com/theviewsrealestate',
    whatsappNumber: '+201017700066',
    heroTagline: 'Find Your Dream Property in Egypt',
    heroSubtitle: 'Premium properties across Cairo, North Coast, and Red Sea',
    aboutText: 'The Views is a leading real estate agency specializing in high-end properties across Egypt.'
  };

  private siteSettingsPath = './site-settings.json';
  private currentSettings: SiteSettings | null = null;

  private loadSettingsFromFile(): SiteSettings {
    try {
      if (existsSync(this.siteSettingsPath)) {
        const fileData = readFileSync(this.siteSettingsPath, 'utf8');
        return JSON.parse(fileData);
      }
      return this.defaultSiteSettings;
    } catch (error) {
      console.error('Error loading site settings:', error);
      return this.defaultSiteSettings;
    }
  }

  private saveSettingsToFile(settings: SiteSettings): void {
    try {
      writeFileSync(this.siteSettingsPath, JSON.stringify(settings, null, 2));
    } catch (error) {
      console.error('Error saving site settings:', error);
    }
  }

  async getSiteSettings(): Promise<SiteSettings> {
    if (!this.currentSettings) {
      this.currentSettings = this.loadSettingsFromFile();
    }
    return this.currentSettings;
  }

  async updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    const currentSettings = await this.getSiteSettings();
    
    // Update settings
    const updatedSettings = {
      ...currentSettings,
      ...updates,
    };
    
    // Save to file
    this.saveSettingsToFile(updatedSettings);
    
    // Update in-memory cache
    this.currentSettings = updatedSettings;
    
    return updatedSettings;
  }
}

export const storage = new DatabaseStorage();
