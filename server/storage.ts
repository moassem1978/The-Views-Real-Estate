import { db, pool } from "./db";
import { users, properties, projects, announcements, testimonials, contacts } from "../shared/schema";
import { eq, sql, desc, and, or, like, gte, lte, isNotNull } from "drizzle-orm";
import { readFileSync, writeFileSync, existsSync } from "fs";
import NodeCache from 'node-cache';
import type {
  User,
  InsertUser,
  Property,
  InsertProperty,
  Project,
  InsertProject,
  Announcement,
  InsertAnnouncement,
  Testimonial,
  InsertTestimonial,
  PropertySearchFilters,
  PaginatedResult,
  SiteSettings
} from "../shared/schema";

interface IStorage {
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
  getUniqueProjectNames(): Promise<string[]>;
  getUniqueCities(): Promise<string[]>;

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
  private cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

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
      return parseInt(result.rows[0].total, 10);
    } catch (error) {
      console.error('Error getting property count:', error);
      return 0;
    }
  }

  async getAllProperties(page = 1, pageSize = 24): Promise<PaginatedResult<Property>> {
    try {
      const offset = (page - 1) * pageSize;
      const countResult = await pool.query('SELECT COUNT(*) as total FROM properties');
      const totalCount = parseInt(countResult.rows[0].total, 10);
      const pageCount = Math.ceil(totalCount / pageSize);

      const query = `
        SELECT * FROM properties 
        ORDER BY is_featured DESC, is_highlighted DESC, created_at DESC 
        LIMIT $1 OFFSET $2
      `;

      const result = await pool.query(query, [pageSize, offset]);
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

  private mapPropertyFromDb(row: any): Property {
    // Parse images safely
    let images: string[] = [];
    try {
      if (row.images) {
        if (typeof row.images === 'string') {
          images = JSON.parse(row.images);
        } else if (Array.isArray(row.images)) {
          images = row.images;
        }
      }
    } catch (e) {
      console.warn(`Failed to parse images for property ${row.id}:`, e);
      images = [];
    }

    return {
      id: row.id,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      status: row.status || 'active',
      title: row.title || '',
      description: row.description || '',
      references: row.reference_number || row.references || '',
      address: row.address || '',
      city: row.city || 'Unknown',
      state: row.state || '',
      zipCode: row.zip_code || '00000',
      country: row.country || 'Egypt',
      propertyType: row.property_type || 'apartment',
      listingType: row.listing_type || 'Primary',
      price: parseInt(row.price) || 0,
      downPayment: parseInt(row.down_payment) || 0,
      installmentAmount: parseInt(row.installment_amount) || 0,
      installmentPeriod: row.installment_period || '',
      isFullCash: row.is_full_cash || false,
      bedrooms: parseInt(row.bedrooms) || 0,
      bathrooms: parseInt(row.bathrooms) || 0,
      builtUpArea: parseInt(row.built_up_area) || 0,
      plotSize: parseInt(row.plot_size) || 0,
      gardenSize: parseInt(row.garden_size) || 0,
      floor: row.floor || '',
      isGroundUnit: row.is_ground_unit || false,
      views: row.views || '',
      yearBuilt: parseInt(row.year_built) || null,
      isFeatured: row.is_featured || false,
      isHighlighted: row.is_highlighted || false,
      isNewListing: row.is_new_listing || false,
      projectName: row.project_name || '',
      developerName: row.developer_name || '',
      latitude: parseFloat(row.latitude) || null,
      longitude: parseFloat(row.longitude) || null,
      images: images,
      photos: images, // Map images to photos for compatibility
      amenities: Array.isArray(row.amenities) ? row.amenities : [],
      agentId: parseInt(row.agent_id) || 1
    };
  }

  async getFeaturedProperties(limit = 3, page = 1, pageSize = 24): Promise<PaginatedResult<Property>> {
    try {
      const offset = (page - 1) * pageSize;
      const countQuery = 'SELECT COUNT(*) as total FROM properties WHERE is_featured = true';
      const countResult = await pool.query(countQuery);
      const totalCount = parseInt(countResult.rows[0].total, 10);
      const pageCount = Math.ceil(totalCount / pageSize);

      const query = `
        SELECT * FROM properties 
        WHERE is_featured = true 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `;

      const result = await pool.query(query, [limit || pageSize, offset]);
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
      const query = `
        SELECT * FROM properties 
        WHERE is_highlighted = true 
        ORDER BY created_at DESC 
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);
      return result.rows.map(this.mapPropertyFromDb);
    } catch (error) {
      console.error('Error getting highlighted properties:', error);
      return [];
    }
  }

  async getNewListings(limit = 3, page = 1, pageSize = 24): Promise<PaginatedResult<Property>> {
    try {
      const offset = (page - 1) * pageSize;
      const countQuery = 'SELECT COUNT(*) as total FROM properties WHERE is_new_listing = true';
      const countResult = await pool.query(countQuery);
      const totalCount = parseInt(countResult.rows[0].total, 10);
      const pageCount = Math.ceil(totalCount / pageSize);

      const query = `
        SELECT * FROM properties 
        WHERE is_new_listing = true 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `;

      const result = await pool.query(query, [limit || pageSize, offset]);
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
      return { data: [], totalCount: 0, pageSize: limit || pageSize, page, pageCount: 0 };
    }
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    try {
      const query = 'SELECT * FROM properties WHERE id = $1';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return undefined;
      }

      return this.mapPropertyFromDb(result.rows[0]);
    } catch (error) {
      console.error(`Error getting property ${id}:`, error);
      return undefined;
    }
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    try {
      console.log(`Creating property: ${insertProperty.title}`);

      // Ensure images are properly formatted as JSON
      const images = Array.isArray(insertProperty.images) ? insertProperty.images : [];
      const propertyData = {
        ...insertProperty,
        images: JSON.stringify(images)
      };

      const [property] = await db.insert(properties).values(propertyData).returning();

      console.log(`✅ Property created with ID: ${property.id}`);
      return this.mapPropertyFromDb(property);
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  async updateProperty(id: number, updates: any): Promise<Property | undefined> {
    try {
      console.log(`Updating property ${id}`);

      // Clean the updates object
      const cleanUpdates: any = {};

      const validFields = [
        'title', 'description', 'references', 'address', 'city', 'state', 'zipCode', 'country',
        'price', 'downPayment', 'installmentAmount', 'installmentPeriod', 'isFullCash',
        'listingType', 'projectName', 'developerName', 'bedrooms', 'bathrooms', 'builtUpArea',
        'plotSize', 'gardenSize', 'floor', 'isGroundUnit', 'propertyType', 'isFeatured',
        'isNewListing', 'isHighlighted', 'yearBuilt', 'views', 'amenities',
        'latitude', 'longitude', 'status', 'approvedBy', 'updatedAt', 'agentId'
      ];

      for (const [key, value] of Object.entries(updates)) {
        if (validFields.includes(key) && value !== undefined) {
          cleanUpdates[key] = value;
        }
      }

      // Handle images specifically
      if ('images' in updates) {
        const imageArray = Array.isArray(updates.images) ? updates.images : [];
        cleanUpdates.images = JSON.stringify(imageArray);
        console.log(`Setting ${imageArray.length} images for property ${id}`);
      }

      cleanUpdates.updatedAt = new Date();

      const result = await db.update(properties).set(cleanUpdates).where(eq(properties.id, id)).returning();

      if (!result || result.length === 0) {
        console.error(`No property found with ID ${id} to update`);
        return undefined;
      }

      const property = this.mapPropertyFromDb(result[0]);
      console.log(`✅ Property ${id} updated successfully`);
      return property;
    } catch (error) {
      console.error(`Error updating property ${id}:`, error);
      return undefined;
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
      const offset = (page - 1) * pageSize;

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (filters.propertyType) {
        whereClause += ` AND property_type = $${paramIndex}`;
        params.push(filters.propertyType);
        paramIndex++;
      }

      if (filters.city) {
        whereClause += ` AND city ILIKE $${paramIndex}`;
        params.push(`%${filters.city}%`);
        paramIndex++;
      }

      if (filters.minPrice) {
        whereClause += ` AND price >= $${paramIndex}`;
        params.push(filters.minPrice);
        paramIndex++;
      }

      if (filters.maxPrice) {
        whereClause += ` AND price <= $${paramIndex}`;
        params.push(filters.maxPrice);
        paramIndex++;
      }

      const countQuery = `SELECT COUNT(*) as total FROM properties ${whereClause}`;
      const countResult = await pool.query(countQuery, params);
      const totalCount = parseInt(countResult.rows[0].total, 10);
      const pageCount = Math.ceil(totalCount / pageSize);

      const query = `
        SELECT * FROM properties 
        ${whereClause}
        ORDER BY is_featured DESC, is_highlighted DESC, created_at DESC 
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const result = await pool.query(query, [...params, pageSize, offset]);
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

  async getUniqueProjectNames(): Promise<string[]> {
    try {
      const query = 'SELECT DISTINCT project_name FROM properties WHERE project_name IS NOT NULL AND project_name != \'\' ORDER BY project_name';
      const result = await pool.query(query);
      return result.rows.map(row => row.project_name);
    } catch (error) {
      console.error('Error fetching unique project names:', error);
      return [];
    }
  }

  async getUniqueCities(): Promise<string[]> {
    try {
      const query = 'SELECT DISTINCT city FROM properties WHERE city IS NOT NULL AND city != \'\' ORDER BY city';
      const result = await pool.query(query);
      return result.rows.map(row => row.city);
    } catch (error) {
      console.error('Error fetching unique cities:', error);
      return [];
    }
  }

  // Minimal implementations for other required methods
  async getAllProjects(page = 1, pageSize = 24): Promise<PaginatedResult<Project>> {
    return { data: [], totalCount: 0, pageCount: 0, page, pageSize };
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    return undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    throw new Error('Not implemented');
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project | undefined> {
    return undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    return false;
  }

  async getAllTestimonials(page = 1, pageSize = 24): Promise<PaginatedResult<Testimonial>> {
    return { data: [], totalCount: 0, pageCount: 0, page, pageSize };
  }

  async getTestimonialById(id: number): Promise<Testimonial | undefined> {
    return undefined;
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    throw new Error('Not implemented');
  }

  async getAllAnnouncements(page = 1, pageSize = 24): Promise<PaginatedResult<Announcement>> {
    return { data: [], totalCount: 0, pageCount: 0, page, pageSize };
  }

  async getFeaturedAnnouncements(limit = 5): Promise<Announcement[]> {
    return [];
  }

  async getHighlightedAnnouncements(limit = 5): Promise<Announcement[]> {
    return [];
  }

  async getAnnouncementById(id: number): Promise<Announcement | undefined> {
    return undefined;
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    throw new Error('Not implemented');
  }

  async updateAnnouncement(id: number, announcement: Partial<Announcement>): Promise<Announcement | undefined> {
    return undefined;
  }

  async deleteAnnouncement(id: number): Promise<boolean> {
    return false;
  }

  async getAnnouncementCount(): Promise<number> {
    return 0;
  }

  private siteSettingsPath = './site-settings.json';
  private defaultSiteSettings: SiteSettings = {
    siteName: 'The Views Real Estate',
    contactEmail: 'info@theviewsrealestate.com',
    contactPhone: '+201000000000',
    contactAddress: 'Cairo, Egypt',
    heroTitle: 'Luxury Real Estate in Egypt',
    heroSubtitle: 'Find your dream property with our expert guidance',
    aboutText: 'We are a leading real estate consultancy specializing in luxury properties.',
    featuredPropertiesCount: 6,
    recentPropertiesCount: 8,
    enableNewsletter: true,
    enableTestimonials: true,
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      youtube: ''
    },
    seoTitle: 'The Views Real Estate - Luxury Properties in Egypt',
    seoDescription: 'Discover premium luxury properties in Egypt with expert guidance from The Views Real Estate.',
    seoKeywords: 'luxury real estate Egypt, premium properties Cairo, real estate investment',
    enableBlog: false,
    enableProjects: true,
    maintenanceMode: false
  };

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
    const updatedSettings = {
      ...currentSettings,
      ...updates,
    };

    this.saveSettingsToFile(updatedSettings);
    this.currentSettings = updatedSettings;
    return updatedSettings;
  }
}

export const storage = new DatabaseStorage();

// Image processor import removed - functionality integrated elsewhere

export async function createPropertyInDB(propertyData: any, imageFiles?: Express.Multer.File[]): Promise<{ success: boolean; property?: any; error?: string }> {
  try {
    console.log('Creating property in DB with data:', propertyData);
    console.log('Image files count:', imageFiles?.length || 0);

    // Validate required fields
    if (!propertyData.title || !propertyData.propertyType) {
      return {
        success: false,
        error: 'Title and property type are required'
      };
    }

    // No image processing here

    // Insert property into database
    const query = `
      INSERT INTO properties (
        title, description, location, city, state, country, 
        property_type, listing_type, price, bedrooms, bathrooms,
        area, developer_name, zip_code, reference, status, 
        created_by, images, is_highlighted, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `;

    const values = [
      propertyData.title,
      propertyData.description || '',
      propertyData.location || '',
      propertyData.city || '',
      propertyData.state || '',
      propertyData.country || 'Egypt',
      propertyData.propertyType,
      propertyData.listingType || 'Primary',
      parseFloat(propertyData.price) || 0,
      parseInt(propertyData.bedrooms) || 0,
      parseInt(propertyData.bathrooms) || 0,
      parseFloat(propertyData.area) || 0,
      propertyData.developerName || '',
      propertyData.zipCode || '',
      propertyData.reference || '',
      propertyData.status || 'draft',
      propertyData.createdBy,
      JSON.stringify([]), // images
      propertyData.isHighlighted === true || propertyData.isHighlighted === 'true',
      propertyData.isFeatured === true || propertyData.isFeatured === 'true'
    ];

    console.log('Executing query with values:', values);
    const result = await pool.query(query, values);
    const createdProperty = result.rows[0];

    console.log('Property created successfully:', createdProperty.id);
    return {
      success: true,
      property: createdProperty
    };

  } catch (error) {
    console.error('Error creating property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}