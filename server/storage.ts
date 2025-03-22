import { 
  users, properties, testimonials, 
  type User, type Property, type Testimonial,
  type InsertUser, type InsertProperty, type InsertTestimonial,
  type SiteSettings
} from "@shared/schema";
import { faker } from '@faker-js/faker';
import { formatISO } from 'date-fns';
import * as fs from 'fs';

// Storage interface for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Property operations
  getAllProperties(): Promise<Property[]>;
  getFeaturedProperties(limit?: number): Promise<Property[]>;
  getNewListings(limit?: number): Promise<Property[]>;
  getPropertyById(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<Property>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  searchProperties(filters: Partial<PropertySearchFilters>): Promise<Property[]>;
  
  // Testimonial operations
  getAllTestimonials(): Promise<Testimonial[]>;
  getTestimonialById(id: number): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Site settings operations
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings>;
}

export interface PropertySearchFilters {
  location?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private testimonials: Map<number, Testimonial>;
  private siteSettings: SiteSettings;
  userCurrentId: number;
  propertyCurrentId: number;
  testimonialCurrentId: number;
  private persistencePath = './data-store.json';

  constructor() {
    // Initialize with empty collections
    this.users = new Map();
    this.properties = new Map();
    this.testimonials = new Map();
    this.userCurrentId = 1;
    this.propertyCurrentId = 1;
    this.testimonialCurrentId = 1;
    
    // Try to load data from disk
    this.loadFromDisk();
    
    // Initialize with default settings if no data loaded
    if (this.properties.size === 0 && this.users.size === 0) {
      // Default site settings if nothing was loaded
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
      
      // Seed default data (admin user)
      this.seedData();
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
      const data = {
        users: Array.from(this.users.entries()),
        properties: Array.from(this.properties.entries()),
        testimonials: Array.from(this.testimonials.entries()),
        siteSettings: this.siteSettings,
        userCurrentId: this.userCurrentId,
        propertyCurrentId: this.propertyCurrentId,
        testimonialCurrentId: this.testimonialCurrentId
      };
      
      fs.writeFileSync(this.persistencePath, JSON.stringify(data, null, 2));
      console.log('Data saved to disk');
    } catch (error) {
      console.error('Failed to save data to disk:', error);
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
        
        // Restore settings and counters
        this.siteSettings = data.siteSettings;
        this.userCurrentId = data.userCurrentId;
        this.propertyCurrentId = data.propertyCurrentId;
        this.testimonialCurrentId = data.testimonialCurrentId;
        
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
      bedrooms: insertProperty.bedrooms,
      bathrooms: insertProperty.bathrooms,
      builtUpArea: insertProperty.builtUpArea,
      plotSize: insertProperty.plotSize,
      propertyType: insertProperty.propertyType,
      isFeatured: insertProperty.isFeatured ?? false,
      isNewListing: insertProperty.isNewListing ?? false,
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

  // Seed initial data
  private seedData() {
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
    
    // Note: This will call createUser which automatically saves to disk
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
    
    // Save the initial data
    this.saveToDisk();
    
    // No pre-seeded listings or testimonials per request
  }
}

export const storage = new MemStorage();
