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
    
    // Check if we need to seed data
    const needsUserSeed = this.users.size === 0;
    const needsPropertySeed = this.properties.size === 0;
    const needsTestimonialSeed = this.testimonials.size === 0;
    
    // Only seed the specific data that's missing
    if (needsUserSeed || needsPropertySeed || needsTestimonialSeed) {
      console.log('Seeding missing data:', 
                 (needsUserSeed ? 'users ' : '') + 
                 (needsPropertySeed ? 'properties ' : '') +
                 (needsTestimonialSeed ? 'testimonials' : ''));
      
      // Seed the required data types
      if (needsUserSeed && needsPropertySeed && needsTestimonialSeed) {
        this.seedData(true, true, true);
      } else {
        // Only seed what's missing
        if (needsUserSeed) this.seedUser();
        if (needsPropertySeed) this.seedProperties();
        if (needsTestimonialSeed) this.seedTestimonials();
        
        // Save changes to disk
        this.saveToDisk();
      }
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
        bedrooms: 3,
        bathrooms: 3,
        builtUpArea: 320,
        plotSize: 450, // Added plotSize
        propertyType: "Apartment",
        isFeatured: true,
        isNewListing: false,
        yearBuilt: 2022,
        views: "City",
        amenities: ["Rooftop Terrace", "Concierge", "Fitness Center", "Smart Home", "Private Elevator"],
        images: ["/uploads/properties/penthouse1.jpg", "/uploads/properties/penthouse2.jpg"],
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
        bedrooms: 4,
        bathrooms: 5,
        builtUpArea: 380,
        plotSize: 950,
        propertyType: "Villa",
        isFeatured: true,
        isNewListing: true,
        views: "Sea",
        amenities: ["Private Beach Access", "Swimming Pool", "Garden", "Compound Amenities", "Security"],
        images: ["/uploads/properties/beach1.jpg", "/uploads/properties/beach2.jpg"],
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
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        builtUpArea: property.builtUpArea ?? null,
        plotSize: property.plotSize ?? null,
        propertyType: property.propertyType,
        isFeatured: property.isFeatured ?? false,
        isNewListing: property.isNewListing ?? false,
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
          images: ["/uploads/properties/villa1.jpg", "/uploads/properties/villa2.jpg"],
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
          bedrooms: 3,
          bathrooms: 3,
          builtUpArea: 320,
          plotSize: 450, // Added plotSize
          propertyType: "Apartment",
          isFeatured: true,
          isNewListing: false,
          yearBuilt: 2022,
          views: "City",
          amenities: ["Rooftop Terrace", "Concierge", "Fitness Center", "Smart Home", "Private Elevator"],
          images: ["/uploads/properties/penthouse1.jpg", "/uploads/properties/penthouse2.jpg"],
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
          bedrooms: 4,
          bathrooms: 5,
          builtUpArea: 380,
          plotSize: 950,
          propertyType: "Villa",
          isFeatured: true,
          isNewListing: true,
          views: "Sea",
          amenities: ["Private Beach Access", "Swimming Pool", "Garden", "Compound Amenities", "Security"],
          images: ["/uploads/properties/beach1.jpg", "/uploads/properties/beach2.jpg"],
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
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          builtUpArea: property.builtUpArea,
          plotSize: property.plotSize,
          propertyType: property.propertyType,
          isFeatured: property.isFeatured,
          isNewListing: property.isNewListing,
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

export const storage = new MemStorage();
