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
import { FileValidator } from './utils/fileValidator';

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
    return {
      id: row.id,
      createdBy: row.created_by,
      createdAt: row.created_at,
      status: row.status,
      title: row.title,
      description: row.description,
      references: row.reference_number || row.references || '',
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code || '',
      country: row.country || 'Egypt',
      propertyType: row.property_type,
      listingType: row.listing_type,
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
      // Support both legacy images and new structured photos
    images: Array.isArray(row.images) ? row.images : 
            (typeof row.images === 'string' && row.images ? JSON.parse(row.images) : []),
    photos: Array.isArray(row.photos) ? row.photos : 
            (typeof row.photos === 'string' && row.photos ? JSON.parse(row.photos) : []),
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
      const [property] = await db.insert(properties).values(insertProperty).returning();
      return property;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  async updateProperty(id: number, updates: any): Promise<any> {
    console.log(`Updating property ${id} with:`, updates);

    try {
      // Import the new backup manager
      const { ImageBackupManager } = await import('./utils/imageBackupManager');
      const { ImageValidator } = await import('./utils/imageValidator');

      // COMPREHENSIVE BACKUP: Create backup with full metadata before any modifications
      if ('images' in updates || 'photos' in updates) {
        const existingProperty = await this.getPropertyById(id);
        if (existingProperty) {
          console.log(`📦 Creating filename-mapped backup for property ${id}`);
          
          // Backup both legacy images and new photo metadata
          const legacyImages = existingProperty.images || [];
          const photoMetadata = existingProperty.photos || [];
          
          await ImageBackupManager.createImageBackup(id, legacyImages, photoMetadata);
        }
      }

      // Process legacy images - convert URLs to strict filename references
      if ('images' in updates && Array.isArray(updates.images)) {
        const processedImages = updates.images.map(img => {
          // If it's a URL, extract the filename and convert to standard format
          if (typeof img === 'string' && img.includes('/')) {
            const filename = img.split('/').pop() || '';
            return `/uploads/properties/${filename}`;
          }
          // If it's already a filename, ensure proper path format
          return img.startsWith('/uploads/properties/') ? img : `/uploads/properties/${img}`;
        });

        // Validate all processed images
        const validation = ImageValidator.validateImageList(processedImages);

        if (validation.invalidImages.length > 0) {
          console.warn(`⚠️  Property ${id}: ${validation.invalidImages.length} image files are missing or invalid`);
          validation.invalidImages.forEach(invalid => {
            console.warn(`   - ${invalid.filename}: ${invalid.error}`);
          });
        }

        updates.images = validation.validImages;
        console.log(`✅ Property ${id}: Using ${validation.validImages.length} filename-validated legacy images`);
      }

      // Process photo metadata - ensure filenames are properly referenced
      if ('photos' in updates && Array.isArray(updates.photos)) {
        const validatedPhotos = updates.photos
          .map((photo: any, index: number) => {
            // Ensure filename is properly formatted (no path, just filename)
            let filename = photo.filename;
            if (filename && filename.includes('/')) {
              filename = filename.split('/').pop() || '';
            }
            
            return {
              filename: filename,
              altText: photo.altText || `Property image ${index + 1}`
            };
          })
          .filter((photo: any) => {
            if (!photo.filename) {
              console.warn(`⚠️  Photo missing filename - skipping`);
              return false;
            }
            
            const validation = ImageValidator.validateImageExists(photo.filename);
            if (!validation.isValid) {
              console.warn(`⚠️  Invalid photo: ${photo.filename} - ${validation.error}`);
              return false;
            }
            return true;
          });

        updates.photos = validatedPhotos;
        console.log(`✅ Property ${id}: Using ${validatedPhotos.length} filename-validated photos with metadata`);
      }

      const result = await db.update(properties).set(updates).where(eq(properties.id, id)).returning();
      
      if (!result || result.length === 0) {
        console.error(`No property found with ID ${id} to update`);
        throw new Error(`Property with ID ${id} not found`);
      }

      const property = result[0];
      
      // Log the final state for debugging
      console.log(`📋 Property ${id} updated successfully. Final image state:`, {
        legacyImagesCount: property.images ? property.images.length : 0,
        photosCount: property.photos ? property.photos.length : 0
      });
      
      return property;
    } catch (error) {
      console.error(`Error updating property ${id}:`, error);
      throw error; // Throw the error instead of returning undefined
    }
  }

  // Remove the old createImageBackup method since we're using the new manager
  private async createImageBackup(propertyId: number, images: string[]): Promise<void> {
    try {
      const { ImageBackupManager } = await import('./utils/imageBackupManager');
      await ImageBackupManager.createImageBackup(propertyId, images);
    } catch (error) {
      console.error(`Error creating image backup for property ${propertyId}:`, error);
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

  // Basic implementations for other required methods
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