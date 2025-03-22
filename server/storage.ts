import { 
  users, properties, testimonials, 
  type User, type Property, type Testimonial,
  type InsertUser, type InsertProperty, type InsertTestimonial,
  type SiteSettings
} from "@shared/schema";
import { faker } from '@faker-js/faker';
import { formatISO } from 'date-fns';

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

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.testimonials = new Map();
    this.userCurrentId = 1;
    this.propertyCurrentId = 1;
    this.testimonialCurrentId = 1;
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
    
    this.seedData();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
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
    const property: Property = { ...insertProperty, id };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: number, updates: Partial<Property>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    
    if (!property) {
      return undefined;
    }
    
    const updatedProperty = { ...property, ...updates };
    this.properties.set(id, updatedProperty);
    
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
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
    const testimonial: Testimonial = { ...insertTestimonial, id };
    this.testimonials.set(id, testimonial);
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
    this.createUser(adminUser);
    
    // Initialize site settings with brand colors
    this.siteSettings = {
      companyName: "The Views Real Estate",
      primaryColor: "#B87333", // Copper/bronze tone
      contactEmail: "info@theviewsrealestate.com",
      contactPhone: "1-800-555-VIEWS",
      socialLinks: {
        facebook: "https://facebook.com/theviewsrealestate",
        instagram: "https://instagram.com/theviewsrealestate",
        twitter: "https://twitter.com/theviewsrealestate",
        linkedin: "https://linkedin.com/company/theviewsrealestate"
      }
    };
    
    // No pre-seeded listings or testimonials per request
  }
}

export const storage = new MemStorage();
