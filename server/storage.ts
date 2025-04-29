import { 
  users, properties, testimonials, announcements, projects,
  type User, type Property, type Testimonial, type Announcement, type Project,
  type InsertUser, type InsertProperty, type InsertTestimonial, type InsertAnnouncement, type InsertProject,
  type SiteSettings
} from "@shared/schema";
import { faker } from '@faker-js/faker';
import { formatISO } from 'date-fns';
import * as fs from 'fs';
import * as path from 'path';
import { db, pool } from "./db";
import { eq, and, like, gte, lte, desc, sql, asc } from "drizzle-orm";

// Storage interface for CRUD operations
export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  pageCount: number;
  page: number;
  pageSize: number;
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

export class MemStorage implements IStorage {
  /**
   * Returns a list of unique project names from the properties collection
   */
  async getUniqueProjectNames(): Promise<string[]> {
    // Filter out null/undefined project names, then get unique values
    const allProperties = Array.from(this.properties.values());
    const uniqueProjects = new Set<string>();

    allProperties.forEach(property => {
      if (property.projectName) {
        uniqueProjects.add(property.projectName);
      }
    });

    return Array.from(uniqueProjects).sort();
  }

  /**
   * Returns a list of unique cities from the properties collection
   */
  async getUniqueCities(): Promise<string[]> {
    const allProperties = Array.from(this.properties.values());
    const uniqueCities = new Set<string>();

    allProperties.forEach(property => {
      if (property.city) {
        uniqueCities.add(property.city);
      }
    });

    return Array.from(uniqueCities).sort();
  }
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private testimonials: Map<number, Testimonial>;
  private announcements: Map<number, Announcement>;
  private siteSettings: SiteSettings;
  userCurrentId: number;
  propertyCurrentId: number;
  testimonialCurrentId: number;
  announcementCurrentId: number;
  private persistencePath = './data-store.json';

  constructor() {
    // Initialize with empty collections
    this.users = new Map();
    this.properties = new Map();
    this.testimonials = new Map();
    this.announcements = new Map();
    this.userCurrentId = 1;
    this.propertyCurrentId = 1;
    this.testimonialCurrentId = 1;
    this.announcementCurrentId = 1;

    // Initialize default site settings
    this.siteSettings = {
      companyName: "The Views Real Estate",
      primaryColor: "#B87333",
      contactEmail: "info@theviewsrealestate.com",
      contactPhone: "1-800-555-VIEWS",
      socialLinks: {
        facebook: "https://facebook.com/theviewsrealestate",
        instagram: "https://instagram.com/theviewsrealestate",
        twitter: "https://twitter.com/theviewsrealestate",
        linkedin: "https://linkedin.com/company/theviewsrealestate"
      }
    };

    // Try to load data from disk
    this.loadFromDisk();

    // Only seed the admin user if needed
    const needsUserSeed = this.users.size === 0;

    // Only seed user data if missing
    if (needsUserSeed) {
      console.log('Seeding admin user data');
      this.seedUser();
      this.saveToDisk();
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  // Save data to disk with backup and validation
  private saveToDisk() {
    try {
      // Create backups directory if it doesn't exist
      if (!fs.existsSync('backups')) {
        fs.mkdirSync('backups');
      }

      // Create backup before saving
      if (fs.existsSync(this.persistencePath)) {
        fs.copyFileSync(this.persistencePath, `backups/data-store-${Date.now()}.json`);
      }

      // Validate data before saving
      const propertiesCount = this.properties.size;
      console.log(`Saving ${propertiesCount} properties`);

      const data = {
        users: Array.from(this.users.entries()),
        properties: Array.from(this.properties.entries()),
        testimonials: Array.from(this.testimonials.entries()),
        announcements: Array.from(this.announcements.entries()),
        siteSettings: this.siteSettings,
        userCurrentId: this.userCurrentId,
        propertyCurrentId: this.propertyCurrentId,
        testimonialCurrentId: this.testimonialCurrentId,
        announcementCurrentId: this.announcementCurrentId
      };

      fs.writeFileSync(this.persistencePath, JSON.stringify(data, null, 2));

      // Verify save was successful
      const savedData = fs.readFileSync(this.persistencePath, 'utf8');
      const parsed = JSON.parse(savedData);
      if (!parsed.properties || parsed.properties.length === 0) {
        throw new Error('Data validation failed after save');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      // Restore from latest backup if save fails
      const backups = fs.readdirSync('backups').sort().reverse();
      if (backups.length > 0) {
        fs.copyFileSync(`backups/${backups[0]}`, this.persistencePath);
        console.log('Restored from backup after failed save');
      }
      throw error;
    }
  }

  /**
   * Enforces size limits on the data store to keep app size under control.
   * This ensures we don't exceed maximum listings, and limits image data.
   * Part of our optimization strategy to keep total app size under 150MB.
   */
  private enforceSizeLimits() {
    const MAX_PROPERTIES = 100; // Maximum number of properties to store
    const MAX_TESTIMONIALS = 50; // Maximum number of testimonials
    const MAX_IMAGES_PER_PROPERTY = 8; // Limit number of images per property

    // If we have too many properties, remove the oldest non-featured ones first
    if (this.properties.size > MAX_PROPERTIES) {
      console.log(`Enforcing property limit: ${this.properties.size} -> ${MAX_PROPERTIES}`);

      // Sort properties by creation date (oldest first) and featured status
      const sortedProperties = Array.from(this.properties.values())
        .sort((a, b) => {
          // First sort by featured status (keep featured properties)
          if (a.isFeatured && !b.isFeatured) return 1;
          if (!a.isFeatured && b.isFeatured) return -1;

          // Then sort by creation date (oldest first)
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

      // Remove oldest properties until we're under the limit
      const propertiesToRemove = sortedProperties.slice(0, sortedProperties.length - MAX_PROPERTIES);

      for (const property of propertiesToRemove) {
        // Clean up any image files associated with this property
        this.removePropertyImages(property.images);
        // Remove the property
        this.properties.delete(property.id);
      }
    }

    // Limit the number of images per property
    for (const property of this.properties.values()) {
      if (property.images && property.images.length > MAX_IMAGES_PER_PROPERTY) {
        console.log(`Property ${property.id}: Reducing images from ${property.images.length} to ${MAX_IMAGES_PER_PROPERTY}`);

        // Remove excess images, keeping the first MAX_IMAGES_PER_PROPERTY
        const imagesToRemove = property.images.slice(MAX_IMAGES_PER_PROPERTY);
        property.images = property.images.slice(0, MAX_IMAGES_PER_PROPERTY);

        // Clean up removed image files
        this.removePropertyImages(imagesToRemove);
      }
    }

    // Similar limit for testimonials
    if (this.testimonials.size > MAX_TESTIMONIALS) {
      console.log(`Enforcing testimonial limit: ${this.testimonials.size} -> ${MAX_TESTIMONIALS}`);

      const sortedTestimonials = Array.from(this.testimonials.values())
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      const testimonialsToRemove = sortedTestimonials.slice(0, sortedTestimonials.length - MAX_TESTIMONIALS);

      for (const testimonial of testimonialsToRemove) {
        this.testimonials.delete(testimonial.id);
      }
    }
  }

  /**
   * Removes image files from the filesystem to free up space
   * @param imagePaths Array of image paths to remove
   */
  private removePropertyImages(imagePaths: string[]) {
    if (!imagePaths || !Array.isArray(imagePaths)) return;

    for (const imagePath of imagePaths) {
      try {
        // Get the base filename without size suffix or extension
        const parts = imagePath.split('/');
        const filename = parts[parts.length - 1];
        const basePath = path.join(process.cwd(), 'public', 'uploads', 'properties');

        // Try to remove all size variants
        const baseFilename = filename.split('-')[0];
        const possibleVariants = [
          `${baseFilename}-original.webp`,
          `${baseFilename}-thumbnail.webp`,
          `${baseFilename}-medium.webp`,
          `${baseFilename}-large.webp`
        ];

        possibleVariants.forEach(variant => {
          const fullPath = path.join(basePath, variant);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`Removed image: ${variant}`);
          }
        });
      } catch (error) {
        console.error(`Failed to remove image ${imagePath}:`, error);
      }
    }
  }

  // Load data from disk
  private loadFromDisk() {
    try {
      if (fs.existsSync(this.persistencePath)) {
        const data = JSON.parse(fs.readFileSync(this.persistencePath, 'utf8'));

        // Restore collections
        this.users = new Map(data.users);
        this.properties = new Map(data.properties);
        this.testimonials = new Map(data.testimonials);
        this.announcements = new Map(data.announcements || []);

        // Restore settings and counters
        this.siteSettings = data.siteSettings;
        this.userCurrentId = data.userCurrentId;
        this.propertyCurrentId = data.propertyCurrentId;
        this.testimonialCurrentId = data.testimonialCurrentId;
        this.announcementCurrentId = data.announcementCurrentId || 1;

        console.log('Data loaded from disk successfully');
      } else {
        console.log('No saved data found, initializing with defaults');
      }
    } catch (error) {
      console.error('Failed to load data from disk:', error);
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;

    // Create a complete user object with all required fields
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      fullName: insertUser.fullName,
      phone: insertUser.phone ?? null,
      isAgent: insertUser.isAgent ?? false,
      createdAt: insertUser.createdAt
    };

    this.users.set(id, user);
    this.saveToDisk(); // Save after changes
    return user;
  }

  async getAllProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getFeaturedProperties(limit = 3): Promise<Property[]> {
    return Array.from(this.properties.values())
      .filter(property => property.isFeatured)
      .slice(0, limit);
  }

  async getHighlightedProperties(limit = 3): Promise<Property[]> {
    return Array.from(this.properties.values())
      .filter(property => property.isHighlighted)
      .slice(0, limit);
  }

  async getNewListings(limit = 3): Promise<Property[]> {
    return Array.from(this.properties.values())
      .filter(property => property.isNewListing)
      .slice(0, limit);
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.propertyCurrentId++;

    // Create a complete property object with all required fields
    const property: Property = {
      id,
      title: insertProperty.title,
      description: insertProperty.description,
      address: insertProperty.address,
      city: insertProperty.city,
      state: insertProperty.state,
      zipCode: insertProperty.zipCode,
      price: insertProperty.price,
      downPayment: insertProperty.downPayment ?? null,
      installmentAmount: insertProperty.installmentAmount ?? null,
      installmentPeriod: insertProperty.installmentPeriod ?? null,
      isFullCash: insertProperty.isFullCash ?? false,
      listingType: insertProperty.listingType ?? "Resale", // Default to Resale if not specified
      projectName: insertProperty.projectName ?? null,
      developerName: insertProperty.developerName ?? null,
      bedrooms: insertProperty.bedrooms,
      bathrooms: insertProperty.bathrooms,
      builtUpArea: insertProperty.builtUpArea,
      plotSize: insertProperty.plotSize,
      gardenSize: insertProperty.gardenSize ?? null,
      floor: insertProperty.floor ?? null,
      isGroundUnit: insertProperty.isGroundUnit ?? false,
      propertyType: insertProperty.propertyType,
      isFeatured: insertProperty.isFeatured ?? false,
      isNewListing: insertProperty.isNewListing ?? false,
      isHighlighted: insertProperty.isHighlighted ?? false,
      yearBuilt: insertProperty.yearBuilt ?? null,
      views: insertProperty.views ?? null,
      amenities: Array.isArray(insertProperty.amenities) 
        ? insertProperty.amenities
        : typeof insertProperty.amenities === 'string'
          ? JSON.parse(insertProperty.amenities)
          : [],
      images: Array.isArray(insertProperty.images)
        ? insertProperty.images
        : typeof insertProperty.images === 'string'
          ? JSON.parse(insertProperty.images)
          : [],
      latitude: insertProperty.latitude ?? null,
      longitude: insertProperty.longitude ?? null,
      createdAt: insertProperty.createdAt,
      agentId: insertProperty.agentId
    };

    this.properties.set(id, property);
    this.saveToDisk(); // Save after changes
    return property;
  }

  async updateProperty(id: number, updates: Partial<Property>): Promise<Property | undefined> {
    const property = this.properties.get(id);

    if (!property) {
      return undefined;
    }

    const updatedProperty = { ...property, ...updates };
    this.properties.set(id, updatedProperty);
    this.saveToDisk(); // Save after changes

    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = this.properties.delete(id);
    if (result) {
      this.saveToDisk(); // Save after successful deletion
    }
    return result;
  }

  async searchProperties(filters: Partial<PropertySearchFilters>): Promise<Property[]> {
    let results = Array.from(this.properties.values());

    if (filters.location) {
      const location = filters.location.toLowerCase();
      results = results.filter(property => 
        property.city.toLowerCase().includes(location) || 
        property.state?.toLowerCase().includes(location) || 
        property.zipCode.toLowerCase().includes(location)
      );
    }

    if (filters.propertyType && filters.propertyType !== "all") {
      results = results.filter(property => 
        property.propertyType.toLowerCase() === filters.propertyType?.toLowerCase()
      );
    }

    // Filter by listing type (Primary or Resale)
    if (filters.listingType && filters.listingType !== "all") {
      results = results.filter(property => 
        property.listingType === filters.listingType
      );
    }

    // Filter by project name
    if (filters.projectName) {
      const projectName = filters.projectName.toLowerCase();
      results = results.filter(property => 
        property.projectName?.toLowerCase().includes(projectName)
      );
    }

    // Filter by developer name
    if (filters.developerName) {
      const developerName = filters.developerName.toLowerCase();
      results = results.filter(property => 
        property.developerName?.toLowerCase().includes(developerName)
      );
    }

    // Filter by country (international properties)
    if (filters.international !== undefined) {
      results = results.filter(property => 
        filters.international
          ? (property.country && property.country !== "Egypt") // International: Not in Egypt
          : (!property.country || property.country === "Egypt") // Domestic: In Egypt
      );
    }

    if (filters.minPrice !== undefined) {
      results = results.filter(property => property.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      results = results.filter(property => property.price <= filters.maxPrice!);
    }

    if (filters.minBedrooms !== undefined) {
      results = results.filter(property => property.bedrooms >= filters.minBedrooms!);
    }

    if (filters.minBathrooms !== undefined) {
      results = results.filter(property => property.bathrooms >= filters.minBathrooms!);
    }

    // Filter by full cash option
    if (filters.isFullCash !== undefined) {
      results = results.filter(property => property.isFullCash === filters.isFullCash);
    }

    // Filter by installments availability
    if (filters.hasInstallments !== undefined) {
      results = results.filter(property => 
        filters.hasInstallments 
          ? property.installmentAmount !== null && property.installmentPeriod !== null
          : property.installmentAmount === null || property.installmentPeriod === null
      );
    }

    return results;
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async getTestimonialById(id: number): Promise<Testimonial | undefined> {
    return this.testimonials.get(id);
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialCurrentId++;

    // Create a complete testimonial object with all required fields
    const testimonial: Testimonial = {
      id,
      clientName: insertTestimonial.clientName,
      clientLocation: insertTestimonial.clientLocation,
      rating: insertTestimonial.rating,
      testimonial: insertTestimonial.testimonial,
      initials: insertTestimonial.initials,
      createdAt: insertTestimonial.createdAt
    };

    this.testimonials.set(id, testimonial);
    this.saveToDisk(); // Save after changes
    return testimonial;
  }

  // Announcement operations
  async getAllAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values());
  }

  async getFeaturedAnnouncements(limit?: number): Promise<Announcement[]> {
    const announcements = Array.from(this.announcements.values())
      .filter(announcement => announcement.isActive && announcement.isFeatured)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return limit ? announcements.slice(0, limit) : announcements;
  }

  async getHighlightedAnnouncements(limit?: number): Promise<Announcement[]> {
    const announcements = Array.from(this.announcements.values())
      .filter(announcement => announcement.isActive && announcement.isHighlighted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return limit ? announcements.slice(0, limit) : announcements;
  }

  async getAnnouncementById(id: number): Promise<Announcement | undefined> {
    return this.announcements.get(id);
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const id = this.announcementCurrentId++;

    // Create a complete announcement object
    const announcement: Announcement = {
      id,
      title: insertAnnouncement.title,
      content: insertAnnouncement.content,
      imageUrl: insertAnnouncement.imageUrl ?? null,
      startDate: new Date(insertAnnouncement.startDate || new Date()).toISOString(),
      endDate: insertAnnouncement.endDate ? new Date(insertAnnouncement.endDate).toISOString() : null,
      isActive: insertAnnouncement.isActive ?? true,
      isFeatured: insertAnnouncement.isFeatured ?? false,
      isHighlighted: insertAnnouncement.isHighlighted ?? false,
      createdAt: new Date().toISOString()
    };

    this.announcements.set(id, announcement);
    this.saveToDisk(); // Save after changes
    return announcement;
  }

  async updateAnnouncement(id: number, updates: Partial<Announcement>): Promise<Announcement | undefined> {
    const announcement = this.announcements.get(id);

    if (!announcement) {
      return undefined;
    }

    const updatedAnnouncement = { ...announcement, ...updates };
    this.announcements.set(id, updatedAnnouncement);
    this.saveToDisk(); // Save after changes

    return updatedAnnouncement;
  }

  async deleteAnnouncement(id: number): Promise<boolean> {
    const result = this.announcements.delete(id);
    if (result) {
      this.saveToDisk(); // Save after successful deletion
    }
    return result;
  }

  // Site settings operations
  async getSiteSettings(): Promise<SiteSettings> {
    return { ...this.siteSettings };
  }

  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    // Update social links if they exist in the settings
    if (settings.socialLinks) {
      this.siteSettings.socialLinks = {
        ...this.siteSettings.socialLinks,
        ...settings.socialLinks
      };

      // Remove socialLinks from settings to avoid overwriting the merged object
      const { socialLinks, ...restSettings } = settings;
      this.siteSettings = { ...this.siteSettings, ...restSettings };
    } else {
      // Just update the rest of the settings
      this.siteSettings = { ...this.siteSettings, ...settings };
    }

    this.saveToDisk(); // Save after changes
    return { ...this.siteSettings };
  }

  // Seed only the admin user
  private seedUser() {
    // Create admin user if not exists
    const adminUser: InsertUser = {
      username: "admin",
      password: "password", // In a real app, this would be hashed
      email: "admin@theviewsrealestate.com",
      fullName: "Admin User",
      phone: "1-800-555-VIEWS",
      isAgent: true,
      createdAt: formatISO(new Date()),
    };

    // Add to storage
    this.users.set(1, {
      id: 1,
      username: adminUser.username,
      password: adminUser.password,
      email: adminUser.email,
      fullName: adminUser.fullName,
      phone: adminUser.phone ?? null,
      isAgent: adminUser.isAgent ?? false,
      createdAt: adminUser.createdAt
    });

    this.userCurrentId = 2; // Set for next user
    console.log('Admin user seeded');
  }

  // Seed only the properties
  private seedProperties() {
    // Sample luxury properties
    const featuredProperties: InsertProperty[] = [
      {
        title: "Luxury Villa with Sea View",
        description: "Spectacular 5-bedroom villa overlooking the Mediterranean Sea. Features include a private pool, spacious terrace, and modern design throughout.",
        address: "123 Coastal Road",
        city: "Alexandria",
        state: "Alexandria Governorate",
        zipCode: "21599",
        price: 2500000,
        downPayment: 500000,
        installmentAmount: 16667,
        installmentPeriod: 120, // 10 years in months
        isFullCash: false,
        listingType: "Primary",
        projectName: "Mediterranean Heights",
        developerName: "Azure Developments",
        bedrooms: 5,
        bathrooms: 4,
        builtUpArea: 450,
        plotSize: 1200,
        propertyType: "Villa",
        isFeatured: true,
        isNewListing: true,
        yearBuilt: 2023,
        views: "Sea",
        amenities: ["Swimming Pool", "Garden", "Terrace", "Smart Home", "Security System", "Private Parking"],
        images: ["uploads/properties/villa1.jpg", "uploads/properties/villa2.jpg"],
        createdAt: formatISO(new Date()),
        agentId: 1
      },
      {
        title: "Modern Penthouse in Downtown",
        description: "Luxurious penthouse in the heart of Cairo with panoramic city views. Features high-end finishes, open floor plan, and a private rooftop terrace.",
        address: "45 Downtown Boulevard",
        city: "Cairo",
        state: "Cairo Governorate",
        zipCode: "11511",
        price: 1800000,
        isFullCash: true,
        listingType: "Resale",
        projectName: "Cairo Towers",
        developerName: "Urban Living",
        bedrooms: 3,
        bathrooms: 3,
        builtUpArea: 320,
        plotSize: 450,
        propertyType: "Apartment",
        isFeatured: true,
        isNewListing: false,
        yearBuilt: 2022,
        views: "City",
        amenities: ["Rooftop Terrace", "Concierge", "Fitness Center", "Smart Home", "Private Elevator"],
        images: ["uploads/properties/penthouse1.jpg", "uploads/properties/penthouse2.jpg"],
        createdAt: formatISO(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
        agentId: 1
      },
      {
        title: "Beachfront Compound Villa",
        description: "Exclusive beachfront villa in a prestigious gated compound with direct beach access. Features elegant design, generous living spaces, and premium amenities.",
        address: "32 Coastal Compound",
        city: "El Alamein",
        state: "Matrouh Governorate",
        zipCode: "33716",
        price: 3200000,
        downPayment: 960000, // 30% down payment
        listingType: "Resale",
        projectName: "Coastal Elegance",
        developerName: "Beach Luxury Homes",
        bedrooms: 4,
        bathrooms: 5,
        builtUpArea: 380,
        plotSize: 950,
        propertyType: "Villa",
        isFeatured: true,
        isNewListing: true,
        views: "Sea",
        amenities: ["Private Beach Access", "Swimming Pool", "Garden", "Compound Amenities", "Security"],
        images: ["uploads/properties/beach1.jpg", "uploads/properties/beach2.jpg"],
        createdAt: formatISO(new Date()),
        agentId: 1
      }
    ];

    // Add properties to storage
    let nextId = 1;
    featuredProperties.forEach(property => {
      const fullProperty: Property = {
        id: nextId,
        title: property.title,
        description: property.description,
        address: property.address,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        price: property.price,
        downPayment: property.downPayment ?? null,
        installmentAmount: property.installmentAmount ?? null,
        installmentPeriod: property.installmentPeriod ?? null,
        isFullCash: property.isFullCash ?? false,
        listingType: property.listingType ?? "Resale", // Default to Resale
        projectName: property.projectName ?? null,
        developerName: property.developerName ?? null,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        builtUpArea: property.builtUpArea ?? null,
        plotSize: property.plotSize ?? null,
        gardenSize: property.gardenSize ?? null,
        floor: property.floor ?? null,
        isGroundUnit: property.isGroundUnit ?? false,
        propertyType: property.propertyType,
        isFeatured: property.isFeatured ?? false,
        isNewListing: property.isNewListing ?? false,
        isHighlighted: property.isHighlighted ?? false,
        yearBuilt: property.yearBuilt ?? null,
        views: property.views ?? null,
        amenities: Array.isArray(property.amenities) ? property.amenities : [],
        images: Array.isArray(property.images) ? property.images : [],
        latitude: property.latitude ?? null,
        longitude: property.longitude ?? null,
        createdAt: property.createdAt,
        agentId: property.agentId
      };

      this.properties.set(nextId, fullProperty);
      nextId++;
    });

    this.propertyCurrentId = nextId; // Set for next property
    console.log('Properties seeded');
  }

  // Seed only the testimonials
  private seedTestimonials() {
    // Sample testimonials
    const testimonials: InsertTestimonial[] = [
      {
        clientName: "Ahmed Ibrahim",
        clientLocation: "Cairo",
        rating: 5,
        testimonial: "The Views Real Estate helped me find my dream home in record time. Their attention to detail and understanding of my needs was exceptional.",
        initials: "AI",
        createdAt: formatISO(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)), // 45days ago
      },
      {
        clientName: "Layla Hassan",
        clientLocation: "Alexandria",
        rating: 5,
        testimonial: "I was impressed by the professionalism and expertise of The Views team. They made selling my property a smooth and profitable experience.",
        initials: "LH",
        createdAt: formatISO(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)), // 60 days ago
      },
      {
        clientName: "Omar Farid",
        clientLocation: "El Gouna",
        rating: 4,
        testimonial: "Great selection of premium properties. The Views Real Estate understood exactly what I was looking for in a vacation home.",
        initials: "OF",
        createdAt: formatISO(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
      }
    ];

    // Add testimonials to storage
    let nextId = 1;
    testimonials.forEach(testimonial => {
      this.testimonials.set(nextId, {
        ...testimonial,
        id: nextId
      });
      nextId++;
    });

    this.testimonialCurrentId = nextId; // Set for next testimonial
    console.log('Testimonials seeded');
  }

  // Seed all data types
  private seedData(seedUsers = true, seedProperties = true, seedTestimonials = true) {
    if (seedUsers) {
      // Seed an admin user
      const adminUser: InsertUser = {
        username: "admin",
        password: "password", // In a real app, this would be hashed
        email: "admin@theviewsrealestate.com",
        fullName: "Admin User",
        phone: "1-800-555-VIEWS",
        isAgent: true,
        createdAt: formatISO(new Date()),
      };

      // Create admin user
      this.users.set(1, {
        id: 1,
        username: adminUser.username,
        password: adminUser.password,
        email: adminUser.email,
        fullName: adminUser.fullName,
        phone: adminUser.phone ?? null,
        isAgent: adminUser.isAgent ?? false,
        createdAt: adminUser.createdAt
      });

      this.userCurrentId = 2;
    }

    if (seedProperties) {
      // Seed some featured properties
      const featuredProperties: InsertProperty[] = [
        {
          title: "Luxury Villa with Sea View",
          description: "Spectacular 5-bedroom villa overlooking the Mediterranean Sea. Features include a private pool, spacious terrace, and modern design throughout.",
          address: "123 Coastal Road",
          city: "Alexandria",
          state: "Alexandria Governorate",
          zipCode: "21599",
          price: 2500000,
          downPayment: 500000,
          installmentAmount: 16667,
          installmentPeriod: 120, // 10 years
          isFullCash: false,
          listingType: "Primary",
          projectName: "Mediterranean Heights",
          developerName: "Azure Developments",
          bedrooms: 5,
          bathrooms: 4,
          builtUpArea: 450,
          plotSize: 1200,
          propertyType: "Villa",
          isFeatured: true,
          isNewListing: true,
          yearBuilt: 2023,
          views: "Sea",
          amenities: ["Swimming Pool", "Garden", "Terrace", "Smart Home", "Security System", "Private Parking"],
          images: ["uploads/properties/villa1.jpg", "uploads/properties/villa2.jpg"],
          createdAt: formatISO(new Date()),
          agentId: 1
        },
        {
          title: "Modern Penthouse in Downtown",
          description: "Luxurious penthouse in the heart of Cairo with panoramic city views. Features high-end finishes, open floor plan, and a private rooftop terrace.",
          address: "45 Downtown Boulevard",
          city: "Cairo",
          state: "Cairo Governorate",
          zipCode: "11511",
          price: 1800000,
          isFullCash: true,
          listingType: "Resale",
          projectName: "Cairo Towers",
          developerName: "Urban Living",
          bedrooms: 3,
          bathrooms: 3,
          builtUpArea: 320,
          plotSize: 450,
          propertyType: "Apartment",
          isFeatured: true,
          isNewListing: false,
          yearBuilt: 2022,
          views: "City",
          amenities: ["Rooftop Terrace", "Concierge", "Fitness Center", "Smart Home", "Private Elevator"],
          images: ["uploads/properties/penthouse1.jpg", "uploads/properties/penthouse2.jpg"],
          createdAt: formatISO(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
          agentId: 1
        },
        {
          title: "Beachfront Compound Villa",
          description: "Exclusive beachfront villa in a prestigious gated compound with direct beach access. Features elegant design, generous living spaces, and premium amenities.",
          address: "32 Coastal Compound",
          city: "El Alamein",
          state: "Matrouh Governorate",
          zipCode: "33716",
          price: 3200000,
          downPayment: 960000, // 30% down payment
          listingType: "Resale",
          projectName: "Coastal Elegance",
          developerName: "Beach Luxury Homes",
          bedrooms: 4,
          bathrooms: 5,
          builtUpArea: 380,
          plotSize: 950,
          propertyType: "Villa",
          isFeatured: true,
          isNewListing: true,
          views: "Sea",
          amenities: ["Private Beach Access", "Swimming Pool", "Garden", "Compound Amenities", "Security"],
          images: ["uploads/properties/beach1.jpg", "uploads/properties/beach2.jpg"],
          createdAt: formatISO(new Date()),
          agentId: 1
        }
      ];

      // Add featured properties to storage
      let nextId = 1;
      featuredProperties.forEach(property => {
        this.properties.set(nextId, {
          id: nextId,
          title: property.title,
          description: property.description,
          address: property.address,
          city: property.city,
          state: property.state,
          zipCode: property.zipCode,
          price: property.price,
          downPayment: property.downPayment ?? null,
          installmentAmount: property.installmentAmount ?? null,
          installmentPeriod: property.installmentPeriod ?? null,
          isFullCash: property.isFullCash ?? false,
          listingType: property.listingType ?? "Resale", // Default to Resale
          projectName: property.projectName ?? null,
          developerName: property.developerName ?? null,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          builtUpArea: property.builtUpArea ?? null,
          plotSize: property.plotSize ?? null,
          gardenSize: property.gardenSize ?? null,
          floor: property.floor ?? null,
          isGroundUnit: property.isGroundUnit ?? false,
          propertyType: property.propertyType,
          isFeatured: property.isFeatured ?? false,
          isNewListing: property.isNewListing ?? false,
          isHighlighted: property.isHighlighted ?? false,
          yearBuilt: property.yearBuilt ?? null,
          views: property.views ?? null,
          amenities: Array.isArray(property.amenities) ? property.amenities : [],
          images: Array.isArray(property.images) ? property.images : [],
          latitude: property.latitude ?? null,
          longitude: property.longitude ?? null,
          createdAt: property.createdAt,
          agentId: property.agentId
        });
        nextId++;
      });

      this.propertyCurrentId = nextId;
    }

    if (seedTestimonials) {
      // Seed some testimonials
      const testimonials: InsertTestimonial[] = [
        {
          clientName: "Ahmed Ibrahim",
          clientLocation: "Cairo",
          rating: 5,
          testimonial: "The Views Real Estate helped me find my dream home in record time. Their attention to detail and understanding of my needs was exceptional.",
          initials: "AI",
          createdAt: formatISO(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)), // 45 days ago
        },
        {
          clientName: "Layla Hassan",
          clientLocation: "Alexandria",
          rating: 5,
          testimonial: "I was impressed by the professionalism and expertise of The Views team. They made selling my property a smooth and profitable experience.",
          initials: "LH",
          createdAt: formatISO(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)), // 60 days ago
        },
        {
          clientName: "Omar Farid",
          clientLocation: "El Gouna",
          rating: 4,
          testimonial: "Great selection of premium properties. The Views Real Estate understood exactly what I was looking for in a vacation home.",
          initials: "OF",
          createdAt: formatISO(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
        }
      ];

      // Add testimonials to storage
      let nextId = 1;
      testimonials.forEach(testimonial => {
        this.testimonials.set(nextId, {
          ...testimonial,
          id: nextId
        });
        nextId++;
      });

      this.testimonialCurrentId = nextId;
    }

    // Save all seeded data
    this.saveToDisk();
  }
}

import NodeCache from 'node-cache';

// Cache with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300 });

export class DatabaseStorage implements IStorage {
  /**
   * Get a list of unique project names from the properties table
   * Used for populating dropdown search
   */
  async getUniqueProjectNames(): Promise<string[]> {
    try {
      // Use distinct to get only unique project names
      const result = await db
        .selectDistinct({ projectName: properties.projectName })
        .from(properties)
        .where(sql`${properties.projectName} IS NOT NULL`);

      // Map the results to an array of strings and sort them
      const projectNames = result
        .map(row => row.projectName)
        .filter((name): name is string => name !== null) // Filter out null values and type assertion
        .sort();

      console.log(`Found ${projectNames.length} unique project names`);
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
      // Use distinct to get only unique cities
      const result = await db
        .selectDistinct({ city: properties.city })
        .from(properties)
        .where(sql`${properties.city} IS NOT NULL`);

      // Map the results to an array of strings and sort them
      const cities = result
        .map(row => row.city)
        .filter((city): city is string => city !== null) // Filter out null values and type assertion
        .sort();

      console.log(`Found ${cities.length} unique cities`);
      return cities;
    } catch (error) {
      console.error('Error fetching unique cities:', error);
      return [];
    }
  }
  private async getCached<T>(key: string, getter: () => Promise<T>): Promise<T> {
    const cached = cache.get<T>(key);
    if (cached) return cached;

    const data = await getter();
    cache.set(key, data);
    return data;
  }
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async hasUserWithRole(role: string): Promise<boolean> {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(eq(users.role, role));
    return Number(result[0].count) > 0;
  }

  async getAllUsers(page = 1, pageSize = 20): Promise<User[]> {
    const offset = (page - 1) * pageSize;

    const usersList = await db
      .select()
      .from(users)
      .orderBy(desc(users.id))
      .limit(pageSize)
      .offset(offset);

    return usersList;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    // Remove id from updates if present
    const { id: _, ...updatesWithoutId } = updates;

    const [updatedUser] = await db
      .update(users)
      .set(updatesWithoutId)
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async deactivateUser(id: number): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    return result.length > 0;
  }

  // Property operations
  async getPropertyCount(): Promise<number> {
    const result = await db.select({ count: sql`count(*)` }).from(properties);
    console.log('Current property count:', Number(result[0].count));
    return Number(result[0].count);
  }

  async getAllProperties(page = 1, pageSize = 24): Promise<PaginatedResult<Property>> {
    try {
      const offset = (page - 1) * pageSize;
      
      // Use raw SQL to avoid issues with reserved keywords
      const countQuery = `SELECT COUNT(*) AS total FROM properties`;
      const countResult = await db.execute(countQuery);
      console.log('Count result:', countResult);
      
      const totalCount = Number(countResult.rows?.[0]?.total || 0);
      const pageCount = Math.ceil(totalCount / pageSize);
      
      // Get paginated data with numeric parameters
      const query = `
        SELECT * FROM properties 
        ORDER BY created_at DESC 
        LIMIT ${pageSize} OFFSET ${offset}
      `;
      
      const data = await db.execute(query);
      
      return {
        data: data.rows || [],
        totalCount,
        pageCount,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error in getAllProperties:', error);
      // Return empty data instead of throwing to prevent app crash
      return {
        data: [],
        totalCount: 0,
        pageCount: 0,
        page,
        pageSize
      };
    }
  }

  async getFeaturedProperties(limit = 3, page = 1, pageSize = 24): Promise<PaginatedResult<Property>> {
    try {
      const offset = (page - 1) * pageSize;

      // Get total count for featured properties using raw SQL
      const countQuery = `SELECT COUNT(*) AS total FROM properties WHERE is_featured = true`;
      const countResult = await db.execute(countQuery);
      const totalCount = Number(countResult.rows?.[0]?.total || 0);
      const pageCount = Math.ceil(totalCount / pageSize);

      // If limit is provided, use it instead of pagination
      if (limit > 0) {
        const query = `
          SELECT * FROM properties 
          WHERE is_featured = true 
          ORDER BY created_at DESC 
          LIMIT ${limit}
        `;
        
        const data = await db.execute(query);

        return {
          data: data.rows || [],
          totalCount,
          pageCount: 1,
          page: 1,
          pageSize: limit
        };
      }

      // Otherwise use pagination
      const query = `
        SELECT * FROM properties 
        WHERE is_featured = true 
        ORDER BY created_at DESC 
        LIMIT ${pageSize} OFFSET ${offset}
      `;
      
      const data = await db.execute(query);

      return {
        data: data.rows || [],
        totalCount,
        pageCount,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error in getFeaturedProperties:', error);
      // Return empty result on error to prevent app crash
      return {
        data: [],
        totalCount: 0,
        pageCount: 0,
        page,
        pageSize
      };
    }
  }

  async getHighlightedProperties(limit = 10): Promise<Property[]> {
    console.log(`DEBUG: Fetching highlighted properties with limit: ${limit}`);
    
    try {
      // Use raw SQL to avoid keyword issues with direct parameter
      const query = `
        SELECT * FROM properties 
        WHERE is_highlighted = true 
        ORDER BY created_at DESC 
        LIMIT ${limit}
      `;
      
      // Use db.execute
      const results = await db.execute(query);
      
      console.log(`DEBUG: Query returned ${results.rows?.length || 0} highlighted properties`);
      
      // Log each property for debugging
      if (results.rows?.length > 0) {
        results.rows.forEach((p: any) => {
          console.log(`DEBUG: Highlighted property: ID ${p.id}, Title: ${p.title}, isHighlighted: ${p.is_highlighted}`);
        });
      }
      
      return results.rows || [];
    } catch (error) {
      console.error('Error in getHighlightedProperties:', error);
      // Return empty array if query fails to avoid breaking the app
      return [];
    }
  }

  async getNewListings(limit = 3, page = 1, pageSize = 24): Promise<PaginatedResult<Property>> {
    try {
      const offset = (page - 1) * pageSize;

      // Get total count for new listings using raw SQL
      const countQuery = `SELECT COUNT(*) AS total FROM properties WHERE is_new_listing = true`;
      const countResult = await db.execute(countQuery);
      const totalCount = Number(countResult.rows?.[0]?.total || 0);
      const pageCount = Math.ceil(totalCount / pageSize);

      // If limit is provided, use it instead of pagination
      if (limit > 0) {
        const query = `
          SELECT * FROM properties 
          WHERE is_new_listing = true 
          ORDER BY created_at DESC 
          LIMIT ${limit}
        `;
        
        const data = await db.execute(query);

        return {
          data: data.rows || [],
          totalCount,
          pageCount: 1,
          page: 1,
          pageSize: limit
        };
      }

      // Otherwise use pagination
      const query = `
        SELECT * FROM properties 
        WHERE is_new_listing = true 
        ORDER BY created_at DESC 
        LIMIT ${pageSize} OFFSET ${offset}
      `;
      
      const data = await db.execute(query);

      return {
        data: data.rows || [],
        totalCount,
        pageCount,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error in getNewListings:', error);
      // Return empty result on error to prevent app crash
      return {
        data: [],
        totalCount: 0,
        pageCount: 0,
        page,
        pageSize
      };
    }
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    try {
      console.log(`DB: Fetching property with ID ${id} using pool.query`);
      
      // Use pool.query with parameterized query for better security and reliability
      const result = await pool.query(
        "SELECT * FROM properties WHERE id = $1", 
        [id]
      );
      
      // Check if we found a property
      if (!result || result.rowCount === 0) {
        console.log(`DB: No property found with ID ${id}`);
        return undefined;
      }
      
      // Get the raw property data
      const dbProperty = result.rows[0];
      
      if (!dbProperty) {
        console.log(`DB: Empty result for property ${id}`);
        return undefined;
      }
      
      console.log(`DB: Found property ${id} with title: ${dbProperty.title || 'Unknown'}`);
      
      // Map database fields (snake_case) to property fields (camelCase)
      const property: Property = {
        id: dbProperty.id,
        title: dbProperty.title || "",
        description: dbProperty.description || "",
        price: dbProperty.price || 0,
        propertyType: dbProperty.property_type || "apartment",
        listingType: dbProperty.listing_type || "Resale",
        status: dbProperty.status || "active",
        bedrooms: dbProperty.bedrooms || 0,
        bathrooms: dbProperty.bathrooms || 0,
        builtUpArea: dbProperty.built_up_area || 0,
        city: dbProperty.city || "",
        country: dbProperty.country || "Egypt",
        address: dbProperty.address || null,
        projectName: dbProperty.project_name || null,
        developerName: dbProperty.developer_name || null,
        downPayment: dbProperty.down_payment || null,
        installmentAmount: dbProperty.installment_amount || null,
        installmentPeriod: dbProperty.installment_period || null,
        isFullCash: dbProperty.is_full_cash || false,
        hasInstallments: dbProperty.has_installments || false,
        images: dbProperty.images || [],
        isFeatured: dbProperty.is_featured || false,
        isHighlighted: dbProperty.is_highlighted || false,
        isNewListing: dbProperty.is_new_listing || false,
        createdAt: dbProperty.created_at || new Date().toISOString(),
        updatedAt: dbProperty.updated_at || new Date().toISOString(),
        createdBy: dbProperty.created_by || null,
        yearBuilt: dbProperty.year_built || null,
        references: dbProperty.references || ""
      };
      
      console.log(`DB: Successfully returned property data for ID ${id}`);
      return property;
      
    } catch (error) {
      console.error(`DB Error fetching property ${id}:`, error);
      
      // Try with a more basic query as a last resort
      try {
        console.log(`DB: Trying minimalist query for property ${id}`);
        
        const basicResult = await pool.query(
          "SELECT id, title, description, price, status FROM properties WHERE id = $1",
          [id]
        );
        
        if (!basicResult || basicResult.rowCount === 0) {
          console.log(`DB: Property ${id} not found with basic query`);
          return undefined;
        }
        
        const basicProperty = basicResult.rows[0];
        
        if (basicProperty && basicProperty.id) {
          console.log(`DB: Found basic property data for ID ${id}`);
          
          // Create minimal property to avoid errors
          return {
            id: basicProperty.id,
            title: basicProperty.title || `Property #${id}`,
            description: basicProperty.description || '',
            price: basicProperty.price || 0,
            status: basicProperty.status || 'draft',
            propertyType: 'apartment', // Default
            listingType: 'Primary', // Default
            city: 'Unknown',
            images: [],
            bedrooms: 0,
            bathrooms: 0,
            builtUpArea: 0,
            zipCode: '00000',
            createdAt: new Date().toISOString(),
            references: '',
            createdBy: null,
            address: null,
            street: null,
            unit: null,
            state: null,
            zipCodeCoverage: null,
            latitude: null,
            longitude: null,
            plotSize: null,
            gardenSize: null,
            floor: null,
            numberOfFloors: null,
            amenities: [],
            isGroundUnit: false,
            availableFrom: null,
            yearBuilt: null,
            condition: null,
            nearbyAmenities: null,
            view: null,
            landmarks: null,
            notes: null,
            lastUpdated: null,
            updatedBy: null,
            approvedBy: null,
            approvedAt: null,
            isFeatured: false,
            isHighlighted: false,
            projectName: null,
            developerName: null,
            downPayment: null,
            installmentAmount: null,
            installmentYears: null,
            isFullCash: false,
            country: 'Egypt',
            postalCode: null,
            isNewListing: false,
            agentId: null,
          } as Property;
        }
      } catch (fallbackError) {
        console.error(`DB: Ultimate fallback also failed for property ${id}:`, fallbackError);
      }
      
      // If all methods fail, return undefined
      return undefined;
    }
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    try {
      console.log(`DB: Creating new property: ${insertProperty.title}`);
      
      // Remove references field from the insert data
      const { references, ...safePropertyData } = insertProperty as any;
      
      console.log('Safe property data to be inserted:', safePropertyData);
      
      // We need to handle the 'references' field in a special way since it's a SQL reserved keyword
      // First, create the property without the references field
      const [property] = await db
        .insert(properties)
        .values(safePropertyData)
        .returning();
      
      console.log(`Successfully created property with ID ${property.id}`);
      
      // If there's a references value, update it separately as reference_number
      if (references) {
        try {
          console.log(`Updating reference_number field for property ${property.id} with value: ${references}`);
          // Using raw SQL query to handle the reference number column
          const result = await pool.query(
            `UPDATE properties SET reference_number = $1 WHERE id = $2 RETURNING *`,
            [references, property.id]
          );
          
          console.log(`References update affected ${result.rowCount} rows`);
          
          if (result.rowCount === 0) {
            console.error(`Failed to update references field for property ${property.id}`);
          }
        } catch (refError) {
          console.error(`Error updating references field:`, refError);
          console.error(refError instanceof Error ? refError.stack : 'Unknown error');
        }
      } else {
        console.log('No references value provided, skipping references update');
      }
      
      // Get the updated property with all fields
      const [updatedProperty] = await db
        .select()
        .from(properties)
        .where(eq(properties.id, property.id));
      
      // Add the references field back to the return value if needed
      const propertyWithReferences = {
        ...updatedProperty,
        references: updatedProperty.references || references || '',
      };
      
      console.log(`DB: Successfully created property with ID ${property.id}`);
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
        
        // First, get the current property to access its images
        const currentProperty = await this.getPropertyById(id);
        if (!currentProperty) {
          console.error(`Cannot remove images - property ${id} not found`);
          throw new Error(`Property ${id} not found`);
        }
        
        // Make sure we have the images array
        if (currentProperty.images && Array.isArray(currentProperty.images)) {
          console.log(`Current property has ${currentProperty.images.length} images:`, currentProperty.images);
          
          // Filter out the images that are marked for removal - with enhanced matching
          const updatedImages = currentProperty.images.filter(img => {
            // Check if any of the imagesToRemove matches this image path
            // in any of the possible formats
            let shouldRemove = false;
            
            if (updates.imagesToRemove && Array.isArray(updates.imagesToRemove)) {
              for (const removeUrl of updates.imagesToRemove) {
                // Normalize both the current image and the one to remove
                const imgBasename = typeof img === 'string' ? img.split('/').pop() : '';
                const removeBasename = typeof removeUrl === 'string' ? removeUrl.split('/').pop() : '';
                
                // Check for exact match
                if (img === removeUrl) {
                  shouldRemove = true;
                  break;
                }
                
                // Check for basename match 
                if (imgBasename && removeBasename && imgBasename === removeBasename) {
                  shouldRemove = true;
                  break;
                }
                
                // Check if the full URL contains the path to remove or vice versa
                if (typeof img === 'string' && typeof removeUrl === 'string') {
                  if (img.includes(removeUrl) || removeUrl.includes(img)) {
                    shouldRemove = true;
                    break;
                  }
                }
              }
            }
            
            if (shouldRemove) {
              console.log(`REMOVING IMAGE: ${img}`);
              return false;
            }
            
            return true;
          });
          
          console.log(`After filtering, property will have ${updatedImages.length} images`);
          console.log(`Remaining images:`, updatedImages);
          
          // Update the images array in the updates object
          updates.images = updatedImages;
        } else {
          console.log(`Property has no images or images is not an array`);
        }
        
        // Remove the imagesToRemove field so it doesn't confuse the database
        delete updates.imagesToRemove;
      }
      
      // Convert camelCase keys to snake_case for database
      const dbUpdates: any = {};
      
      // Map camelCase to snake_case for all possible property fields
      if ('title' in updates) dbUpdates.title = updates.title;
      if ('description' in updates) dbUpdates.description = updates.description;
      if ('propertyType' in updates) dbUpdates.property_type = updates.propertyType;
      if ('listingType' in updates) dbUpdates.listing_type = updates.listingType;
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
      // The references field maps to reference_number column
      if ('references' in updates) dbUpdates.reference_number = updates.references;
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
        
        // Use JSON.stringify to convert array to proper JSON string format
        // This ensures PostgreSQL will accept it as a valid JSON array
        dbUpdates.images = JSON.stringify(combinedImages);
        console.log('Final JSON images format:', dbUpdates.images);
      }
      
      console.log(`Converted database updates:`, dbUpdates);
      
      // Build the SET clause parts of the SQL query and parameters array
      const setClauseParts = [];
      const queryParams = [];
      let paramIndex = 1;
      
      for (const [key, value] of Object.entries(dbUpdates)) {
        // Just use standard column names for all fields now
        setClauseParts.push(`${key} = $${paramIndex}`);
        queryParams.push(value);
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
      
      // Parse images field from database if it's a JSON string
      let imagesArray: string[] = [];
      
      if (updatedProperty.images) {
        // If images is already an array, use it directly
        if (Array.isArray(updatedProperty.images)) {
          imagesArray = updatedProperty.images;
        } 
        // If images is a string that starts with [ and ends with ], it's likely a JSON string
        else if (typeof updatedProperty.images === 'string' && 
                updatedProperty.images.trim().startsWith('[') && 
                updatedProperty.images.trim().endsWith(']')) {
          try {
            imagesArray = JSON.parse(updatedProperty.images);
          } catch (e) {
            console.error('Error parsing images JSON:', e);
            // Fallback to empty array on error
            imagesArray = [];
          }
        }
        // If it's a string but not JSON-formatted, treat as a single image
        else if (typeof updatedProperty.images === 'string') {
          imagesArray = [updatedProperty.images];
        }
      }
      
      console.log('Parsed images array for frontend:', imagesArray);
      
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
        country: updatedProperty.country,
        yearBuilt: updatedProperty.year_built,
        status: updatedProperty.status,
        createdAt: updatedProperty.created_at,
        updatedAt: updatedProperty.updated_at,
        references: updatedProperty.reference_number || '',
        images: imagesArray
      };
      
      console.log(`DB: Successfully updated property ${id}`);
      return propertyResult as Property;
    } catch (error) {
      console.error(`DB Error updating property ${id}:`, error);
      throw error;
    }
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await db
      .delete(properties)
      .where(eq(properties.id, id))
      .returning();
    return result.length > 0;
  }

  async searchProperties(filters: Partial<PropertySearchFilters>, page = 1, pageSize = 24): Promise<PaginatedResult<Property>> {
    try {
      // Calculate pagination parameters
      const offset = (page - 1) * pageSize;
      
      // Build SQL query conditions
      let conditions = [];
      let params: any[] = [];
      let paramCounter = 1;
      
      // Filter by location (city, state, zip)
      if (filters.location) {
        const locationTerm = `%${filters.location}%`;
        conditions.push(`(city ILIKE $${paramCounter} OR state ILIKE $${paramCounter} OR zip_code ILIKE $${paramCounter})`);
        params.push(locationTerm);
        paramCounter++;
      }
      
      // Filter by property type
      if (filters.propertyType && filters.propertyType !== "all") {
        conditions.push(`property_type = $${paramCounter}`);
        params.push(filters.propertyType);
        paramCounter++;
      }
      
      // Filter by listing type (Primary or Resale)
      if (filters.listingType && filters.listingType !== "all") {
        conditions.push(`listing_type = $${paramCounter}`);
        params.push(filters.listingType);
        paramCounter++;
      }
      
      // Filter by project name
      if (filters.projectName) {
        const projectTerm = `%${filters.projectName}%`;
        conditions.push(`project_name ILIKE $${paramCounter}`);
        params.push(projectTerm);
        paramCounter++;
      }
      
      // Filter by developer name
      if (filters.developerName) {
        const developerTerm = `%${filters.developerName}%`;
        conditions.push(`developer_name ILIKE $${paramCounter}`);
        params.push(developerTerm);
        paramCounter++;
      }
      
      // Filter by price range
      if (filters.minPrice) {
        conditions.push(`price >= $${paramCounter}`);
        params.push(filters.minPrice);
        paramCounter++;
      }
      
      if (filters.maxPrice) {
        conditions.push(`price <= $${paramCounter}`);
        params.push(filters.maxPrice);
        paramCounter++;
      }
      
      // Filter by bedrooms
      if (filters.minBedrooms) {
        conditions.push(`bedrooms >= $${paramCounter}`);
        params.push(filters.minBedrooms);
        paramCounter++;
      }
      
      // Filter by bathrooms
      if (filters.minBathrooms) {
        conditions.push(`bathrooms >= $${paramCounter}`);
        params.push(filters.minBathrooms);
        paramCounter++;
      }
      
      // Filter by payment options
      if (filters.isFullCash === true) {
        conditions.push(`is_full_cash = true`);
      }
      
      if (filters.hasInstallments === true) {
        conditions.push(`installment_amount IS NOT NULL`);
      }
      
      // Filter by country (international properties)
      if (filters.international !== undefined) {
        if (filters.international) {
          // International: properties outside Egypt
          conditions.push(`(country IS NOT NULL AND country != 'Egypt')`);
        } else {
          // Domestic: properties in Egypt
          conditions.push(`(country IS NULL OR country = 'Egypt')`);
        }
      }
      
      // Build the WHERE clause
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      // Count query
      const countQuery = `SELECT COUNT(*) AS total FROM properties ${whereClause}`;
      const countResult = await db.execute(countQuery, params);
      const totalCount = Number(countResult[0]?.total || 0);
      const pageCount = Math.ceil(totalCount / pageSize);
      
      // Data query with pagination
      const dataQuery = `
        SELECT * FROM properties 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;
      
      // Add pagination parameters
      params.push(pageSize, offset);
      
      // Execute query
      const data = await db.execute(dataQuery, params);
      
      return {
        data,
        totalCount,
        pageCount,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error in searchProperties:', error);
      // Return empty result on error to prevent app crash
      return {
        data: [],
        totalCount: 0,
        pageCount: 0,
        page,
        pageSize
      };
    }
  }

  // Testimonial operations
  async getAllTestimonials(page = 1, pageSize = 10): Promise<PaginatedResult<Testimonial>> {
    const offset = (page - 1) * pageSize;

    // Get total count
    const countResult = await db.select({ count: sql`count(*)` }).from(testimonials);
    const totalCount = Number(countResult[0].count);
    const pageCount = Math.ceil(totalCount / pageSize);

    // Get paginated data
    const data = await db
      .select()
      .from(testimonials)
      .orderBy(desc(testimonials.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      data,
      totalCount,
      pageCount,
      page,
      pageSize
    };
  }

  async getTestimonialById(id: number): Promise<Testimonial | undefined> {
    const [testimonial] = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.id, id));
    return testimonial || undefined;
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db
      .insert(testimonials)
      .values(insertTestimonial)
      .returning();
    return testimonial;
  }

  // Announcement operations
  async getAnnouncementCount(): Promise<number> {
    const result = await db.select({ count: sql`count(*)` }).from(announcements);
    return Number(result[0].count);
  }

  async getAllAnnouncements(page = 1, pageSize = 10): Promise<PaginatedResult<Announcement>> {
    const offset = (page - 1) * pageSize;
    const totalCount = await this.getAnnouncementCount();
    const pageCount = Math.ceil(totalCount / pageSize);

    const data = await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      data,
      totalCount,
      pageCount,
      page,
      pageSize
    };
  }

  async getFeaturedAnnouncements(limit = 3): Promise<Announcement[]> {
    return await db
      .select()
      .from(announcements)
      .where(eq(announcements.isFeatured, true))
      .limit(limit);
  }

  async getHighlightedAnnouncements(limit = 10): Promise<Announcement[]> {
    console.log(`DEBUG: Fetching highlighted announcements with limit: ${limit}`);
    // Get all announcements first to debug
    const allAnnouncements = await db.select().from(announcements);
    console.log(`DEBUG: Total announcements in database: ${allAnnouncements.length}`);
    console.log(`DEBUG: Announcements with isHighlighted=true: ${allAnnouncements.filter(a => a.isHighlighted).length}`);

    // Perform the actual query
    const results = await db
      .select()
      .from(announcements)
      .where(eq(announcements.isHighlighted, true))
      .orderBy(desc(announcements.createdAt))
      .limit(limit);

    console.log(`DEBUG: Query returned ${results.length} highlighted announcements`);
    return results;
  }

  async getAnnouncementById(id: number): Promise<Announcement | undefined> {
    const [announcement] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id));
    return announcement || undefined;
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const [announcement] = await db
      .insert(announcements)
      .values(insertAnnouncement)
      .returning();
    return announcement;
  }

  async updateAnnouncement(id: number, updates: Partial<Announcement>): Promise<Announcement | undefined> {
    const [updatedAnnouncement] = await db
      .update(announcements)
      .set(updates)
      .where(eq(announcements.id, id))
      .returning();
    return updatedAnnouncement || undefined;
  }

  async deleteAnnouncement(id: number): Promise<boolean> {
    const result = await db
      .delete(announcements)
      .where(eq(announcements.id, id))
      .returning();
    return result.length > 0;
  }

  // Project operations
  async getAllProjects(page = 1, pageSize = 10): Promise<PaginatedResult<Project>> {
    const offset = (page - 1) * pageSize;

    const [countResult] = await db
      .select({ count: sql`count(*)` })
      .from(projects);

    const totalCount = Number(countResult?.count || 0);
    const pageCount = Math.ceil(totalCount / pageSize);

    const data = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      data,
      totalCount,
      pageCount,
      page,
      pageSize
    };
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));

    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();

    return project;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    // Remove non-updatable fields
    const { id: _id, createdAt, updatedAt, ...updatableFields } = updates as any;

    const [updatedProject] = await db
      .update(projects)
      .set({
        ...updatableFields,
        updatedAt: new Date()
      })
      .where(eq(projects.id, id))
      .returning();

    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(projects)
        .where(eq(projects.id, id))
        .returning();

      return result.length > 0;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  // Site settings operations using file persistence
  private defaultSiteSettings: SiteSettings = {
    companyName: "The Views Real Estate",
    companyLogo: "/uploads/logos/logo-1743513611120-669479078.png", // Use the most recent logo
    primaryColor: "#B87333",
    contactEmail: "info@theviewsrealestate.com",
    contactPhone: "1-800-555-VIEWS",
    socialLinks: {
      facebook: "https://facebook.com/theviewsrealestate",
      instagram: "https://instagram.com/theviewsrealestate",
      twitter: "https://twitter.com/theviewsrealestate",
      linkedin: "https://linkedin.com/company/theviewsrealestate"
    }
  };

  private siteSettingsPath = './site-settings.json';
  private currentSettings: SiteSettings | null = null;

  private loadSettingsFromFile(): SiteSettings {
    try {
      if (fs.existsSync(this.siteSettingsPath)) {
        const data = JSON.parse(fs.readFileSync(this.siteSettingsPath, 'utf8'));
        console.log('Site settings loaded from file');
        return data;
      }
    } catch (error) {
      console.error('Failed to load site settings from file:', error);
    }

    // If we couldn't load from the file, return default settings
    return { ...this.defaultSiteSettings };
  }

  private saveSettingsToFile(settings: SiteSettings): void {
    try {
      fs.writeFileSync(this.siteSettingsPath, JSON.stringify(settings, null, 2));
      console.log('Site settings saved to file');
    } catch (error) {
      console.error('Failed to save site settings to file:', error);
    }
  }

  async getSiteSettings(): Promise<SiteSettings> {
    // Return cached settings if available
    if (this.currentSettings) {
      return { ...this.currentSettings };
    }

    // Otherwise, load from file and cache
    this.currentSettings = this.loadSettingsFromFile();
    return { ...this.currentSettings };
  }

  async updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    // Get current settings
    const currentSettings = await this.getSiteSettings();

    // Prepare the updates, handling socialLinks specially
    let updatedSettings: SiteSettings;

    if (updates.socialLinks && currentSettings.socialLinks) {
      // Create a new object with properly merged socialLinks
      const mergedSocialLinks = {
        ...currentSettings.socialLinks,
        ...updates.socialLinks
      };

      // Remove socialLinks from updates to avoid duplicate merging
      const { socialLinks, ...restUpdates } = updates;

      // Merge with current settings
      updatedSettings = {
        ...currentSettings,
        ...restUpdates,
        socialLinks: mergedSocialLinks
      };
    } else {
      // Just merge all updates
      updatedSettings = {
        ...currentSettings,
        ...updates
      };
    }

    // Save to file and update the cache
    this.saveSettingsToFile(updatedSettings);
    this.currentSettings = updatedSettings;

    // Return the updated settings
    return { ...this.currentSettings };
  }
}

// Use either MemStorage or DatabaseStorage based on database availability
export const storage = new DatabaseStorage();