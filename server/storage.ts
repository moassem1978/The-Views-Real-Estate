import { 
  users, properties, testimonials, 
  type User, type Property, type Testimonial,
  type InsertUser, type InsertProperty, type InsertTestimonial 
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

  // Seed initial data
  private seedData() {
    // Seed an admin user
    const adminUser: InsertUser = {
      username: "admin",
      password: "password", // In a real app, this would be hashed
      email: "admin@luxuryrealty.com",
      fullName: "Admin User",
      phone: "310-555-1234",
      isAgent: true,
      createdAt: formatISO(new Date()),
    };
    this.createUser(adminUser);

    // Seed properties
    const propertyTypes = ['House', 'Condominium', 'Villa', 'Estate', 'Penthouse'];
    const cities = ['Beverly Hills', 'Miami Beach', 'New York', 'Aspen', 'The Hamptons'];
    const states = ['CA', 'FL', 'NY', 'CO', 'NY'];
    
    const propertyImages = [
      [
        "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80"
      ],
      [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", 
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      ],
      [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80", 
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80"
      ],
      [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", 
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80"
      ],
      [
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      ],
      [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80"
      ]
    ];

    const propertyTitles = [
      "Oceanfront Villa Paradise",
      "Modern Architectural Masterpiece",
      "Classic Colonial Estate",
      "The Bellevue Estate",
      "Hillside Mansion Retreat",
      "Downtown Luxury Penthouse"
    ];

    for (let i = 0; i < 12; i++) {
      const isFeatured = i < 3; // First 3 are featured
      const isNewListing = i >= 3 && i < 6; // Next 3 are new listings
      const randomPrice = Math.round(faker.number.float({ min: 1.5, max: 12.5 }) * 1000000);
      const randomIndex = i % propertyTitles.length;
      const randomCityIndex = i % cities.length;
      const randomType = propertyTypes[i % propertyTypes.length];
      
      const property: InsertProperty = {
        title: propertyTitles[randomIndex],
        description: faker.lorem.paragraphs(3),
        address: faker.location.streetAddress(),
        city: cities[randomCityIndex],
        state: states[randomCityIndex],
        zipCode: faker.location.zipCode(),
        price: randomPrice,
        bedrooms: faker.number.int({ min: 3, max: 8 }),
        bathrooms: faker.number.int({ min: 2, max: 10 }) + (Math.random() > 0.5 ? 0.5 : 0),
        squareFeet: faker.number.int({ min: 3000, max: 15000 }),
        propertyType: randomType,
        isFeatured,
        isNewListing,
        yearBuilt: faker.number.int({ min: 1990, max: 2023 }),
        views: faker.helpers.arrayElement(['Ocean', 'Mountain', 'City', 'Garden', 'Lake']),
        amenities: JSON.stringify([
          faker.helpers.arrayElements([
            "Infinity Pool", "Wine Cellar", "Home Theater", "Smart Home", 
            "Spa", "Gym", "Tennis Court", "Gourmet Kitchen", 
            "Fireplace", "Elevator", "Private Dock", "Rooftop Terrace"
          ], { min: 3, max: 6 })
        ]),
        images: JSON.stringify(propertyImages[i % propertyImages.length]),
        latitude: parseFloat(faker.location.latitude()),
        longitude: parseFloat(faker.location.longitude()),
        createdAt: formatISO(faker.date.recent()),
        agentId: 1
      };
      
      this.createProperty(property);
    }

    // Seed testimonials
    const testimonialData = [
      {
        clientName: "James & Margaret R.",
        clientLocation: "Beverly Hills, CA",
        rating: 5,
        testimonial: "The team's expertise in luxury real estate is unmatched. They understood exactly what we were looking for and found us our dream home without wasting any time on properties that didn't meet our standards.",
        initials: "JM"
      },
      {
        clientName: "Sophia C.",
        clientLocation: "Miami, FL",
        rating: 5,
        testimonial: "Their marketing strategy for our waterfront property was exceptional. Professional photography, targeted advertising, and their global network of buyers resulted in multiple offers above asking price.",
        initials: "SC"
      },
      {
        clientName: "Alexander & Maria K.",
        clientLocation: "London, UK",
        rating: 5,
        testimonial: "As international buyers, we appreciated their comprehensive knowledge of local markets and regulations. Their concierge service made our relocation seamless, handling everything from legal matters to interior design recommendations.",
        initials: "AM"
      }
    ];

    testimonialData.forEach(data => {
      const testimonial: InsertTestimonial = {
        ...data,
        createdAt: formatISO(faker.date.recent())
      };
      
      this.createTestimonial(testimonial);
    });
  }
}

export const storage = new MemStorage();
