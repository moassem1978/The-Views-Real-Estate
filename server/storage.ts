import { 
  users, properties, testimonials, announcements,
  type User, type Property, type Testimonial, type Announcement,
  type InsertUser, type InsertProperty, type InsertTestimonial, type InsertAnnouncement,
  type SiteSettings
} from "@shared/schema";
import { faker } from '@faker-js/faker';
import { formatISO } from 'date-fns';
import * as fs from 'fs';
import * as path from 'path';
import { db } from "./db";
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
}

export class MemStorage implements IStorage {
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

  // Save data to disk
  private saveToDisk() {
    try {
      // Check and enforce size limits before saving
      this.enforceSizeLimits();
      
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
      console.log('Data saved to disk');
    } catch (error) {
      console.error('Failed to save data to disk:', error);
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
        property.state.toLowerCase().includes(location) || 
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
    return Number(result[0].count);
  }

  async getAllProperties(page = 1, pageSize = 24): Promise<PaginatedResult<Property>> {
    const offset = (page - 1) * pageSize;
    const totalCount = await this.getPropertyCount();
    const pageCount = Math.ceil(totalCount / pageSize);
    
    const data = await db
      .select()
      .from(properties)
      .orderBy(desc(properties.createdAt))
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

  async getFeaturedProperties(limit = 3, page = 1, pageSize = 24): Promise<PaginatedResult<Property>> {
    const offset = (page - 1) * pageSize;
    
    // Get total count for featured properties
    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(properties)
      .where(eq(properties.isFeatured, true));
    
    const totalCount = Number(countResult[0].count);
    const pageCount = Math.ceil(totalCount / pageSize);
    
    // If limit is provided, use it instead of pagination
    if (limit > 0) {
      const data = await db
        .select()
        .from(properties)
        .where(eq(properties.isFeatured, true))
        .orderBy(desc(properties.createdAt))
        .limit(limit);
      
      return {
        data,
        totalCount,
        pageCount: 1,
        page: 1,
        pageSize: limit
      };
    }
    
    // Otherwise use pagination
    const data = await db
      .select()
      .from(properties)
      .where(eq(properties.isFeatured, true))
      .orderBy(desc(properties.createdAt))
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

  async getHighlightedProperties(limit = 3): Promise<Property[]> {
    console.log(`DEBUG: Fetching highlighted properties with limit: ${limit}`);
    // Get all properties first to debug
    const allProps = await db.select().from(properties);
    console.log(`DEBUG: Total properties in database: ${allProps.length}`);
    console.log(`DEBUG: Properties with isHighlighted=true: ${allProps.filter(p => p.isHighlighted).length}`);
    
    // Perform the actual query
    const results = await db
      .select()
      .from(properties)
      .where(eq(properties.isHighlighted, true))
      .limit(limit);
    
    console.log(`DEBUG: Query returned ${results.length} highlighted properties`);
    
    // Log each property for debugging
    if (results.length > 0) {
      results.forEach(p => {
        console.log(`DEBUG: Highlighted property: ID ${p.id}, Title: ${p.title}, isHighlighted: ${p.isHighlighted}`);
      });
    }
    
    return results;
  }

  async getNewListings(limit = 3, page = 1, pageSize = 24): Promise<PaginatedResult<Property>> {
    const offset = (page - 1) * pageSize;
    
    // Get total count for new listings
    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(properties)
      .where(eq(properties.isNewListing, true));
    
    const totalCount = Number(countResult[0].count);
    const pageCount = Math.ceil(totalCount / pageSize);
    
    // If limit is provided, use it instead of pagination
    if (limit > 0) {
      const data = await db
        .select()
        .from(properties)
        .where(eq(properties.isNewListing, true))
        .orderBy(desc(properties.createdAt))
        .limit(limit);
      
      return {
        data,
        totalCount,
        pageCount: 1,
        page: 1,
        pageSize: limit
      };
    }
    
    // Otherwise use pagination
    const data = await db
      .select()
      .from(properties)
      .where(eq(properties.isNewListing, true))
      .orderBy(desc(properties.createdAt))
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

  async getPropertyById(id: number): Promise<Property | undefined> {
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id));
    return property || undefined;
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db
      .insert(properties)
      .values(insertProperty)
      .returning();
    return property;
  }

  async updateProperty(id: number, updates: Partial<Property>): Promise<Property | undefined> {
    const [updatedProperty] = await db
      .update(properties)
      .set(updates)
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty || undefined;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await db
      .delete(properties)
      .where(eq(properties.id, id))
      .returning();
    return result.length > 0;
  }

  async searchProperties(filters: Partial<PropertySearchFilters>, page = 1, pageSize = 24): Promise<PaginatedResult<Property>> {
    let countQuery = db.select({ count: sql`count(*)` }).from(properties);
    let dataQuery = db.select().from(properties);
    
    // Apply all filters to both queries
    
    // Filter by location (city, state, zip)
    if (filters.location) {
      const locationTerm = `%${filters.location}%`;
      const locationFilter = sql`(${properties.city} ILIKE ${locationTerm} OR 
                                 ${properties.state} ILIKE ${locationTerm} OR 
                                 ${properties.zipCode} ILIKE ${locationTerm})`;
      countQuery = countQuery.where(locationFilter);
      dataQuery = dataQuery.where(locationFilter);
    }
    
    // Filter by property type
    if (filters.propertyType && filters.propertyType !== "all") {
      countQuery = countQuery.where(eq(properties.propertyType, filters.propertyType));
      dataQuery = dataQuery.where(eq(properties.propertyType, filters.propertyType));
    }
    
    // Filter by listing type (Primary or Resale)
    if (filters.listingType && filters.listingType !== "all") {
      countQuery = countQuery.where(eq(properties.listingType, filters.listingType));
      dataQuery = dataQuery.where(eq(properties.listingType, filters.listingType));
    }
    
    // Filter by project name
    if (filters.projectName) {
      const projectTerm = `%${filters.projectName}%`;
      const projectFilter = sql`${properties.projectName} ILIKE ${projectTerm}`;
      countQuery = countQuery.where(projectFilter);
      dataQuery = dataQuery.where(projectFilter);
    }
    
    // Filter by developer name
    if (filters.developerName) {
      const developerTerm = `%${filters.developerName}%`;
      const developerFilter = sql`${properties.developerName} ILIKE ${developerTerm}`;
      countQuery = countQuery.where(developerFilter);
      dataQuery = dataQuery.where(developerFilter);
    }
    
    // Filter by price range
    if (filters.minPrice) {
      countQuery = countQuery.where(gte(properties.price, filters.minPrice));
      dataQuery = dataQuery.where(gte(properties.price, filters.minPrice));
    }
    
    if (filters.maxPrice) {
      countQuery = countQuery.where(lte(properties.price, filters.maxPrice));
      dataQuery = dataQuery.where(lte(properties.price, filters.maxPrice));
    }
    
    // Filter by bedrooms
    if (filters.minBedrooms) {
      countQuery = countQuery.where(gte(properties.bedrooms, filters.minBedrooms));
      dataQuery = dataQuery.where(gte(properties.bedrooms, filters.minBedrooms));
    }
    
    // Filter by bathrooms
    if (filters.minBathrooms) {
      countQuery = countQuery.where(gte(properties.bathrooms, filters.minBathrooms));
      dataQuery = dataQuery.where(gte(properties.bathrooms, filters.minBathrooms));
    }
    
    // Filter by payment options
    if (filters.isFullCash === true) {
      countQuery = countQuery.where(eq(properties.isFullCash, true));
      dataQuery = dataQuery.where(eq(properties.isFullCash, true));
    }
    
    if (filters.hasInstallments === true) {
      const installmentFilter = sql`${properties.installmentAmount} IS NOT NULL`;
      countQuery = countQuery.where(installmentFilter);
      dataQuery = dataQuery.where(installmentFilter);
    }
    
    // Calculate pagination parameters
    const offset = (page - 1) * pageSize;
    
    // Get total count
    const countResult = await countQuery;
    const totalCount = Number(countResult[0].count);
    const pageCount = Math.ceil(totalCount / pageSize);
    
    // Get paginated data
    const data = await dataQuery
      .orderBy(desc(properties.createdAt))
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

  async getHighlightedAnnouncements(limit = 3): Promise<Announcement[]> {
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
