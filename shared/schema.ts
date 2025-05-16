import { pgTable, text, serial, integer, boolean, doublePrecision, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define user roles enum
export const userRoles = {
  OWNER: "owner",
  ADMIN: "admin",
  USER: "user"
} as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default(userRoles.USER), // Add role for permissions (owner, admin, user)
  isAgent: boolean("is_agent").default(false).notNull(),
  createdBy: integer("created_by"), // ID of the admin/owner who created this user
  createdAt: text("created_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(), // Whether the user is active
});

// Define publication status enum
export const publicationStatus = {
  DRAFT: "draft",
  PENDING_APPROVAL: "pending_approval",
  PUBLISHED: "published",
  REJECTED: "rejected",
  ARCHIVED: "archived"
} as const;

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  references: text("reference_number").default('').notNull(), // Changed column name from "references" to "reference_number"
  address: text("address"),
  city: text("city").notNull(),
  state: text("state"),
  zipCode: text("zip_code").notNull(),
  country: text("country").default("Egypt").notNull(),
  price: doublePrecision("price").notNull(),
  downPayment: doublePrecision("down_payment"),
  installmentAmount: doublePrecision("installment_amount"),
  installmentPeriod: integer("installment_period"), // In months
  isFullCash: boolean("is_full_cash").default(false),
  listingType: text("listing_type").notNull(), // "Primary" or "Resale"
  projectName: text("project_name"),
  developerName: text("developer_name"),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: doublePrecision("bathrooms").notNull(),
  builtUpArea: integer("built_up_area").notNull(),
  plotSize: integer("plot_size"),
  gardenSize: integer("garden_size"),
  floor: integer("floor"),
  isGroundUnit: boolean("is_ground_unit").default(false),
  propertyType: text("property_type").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isNewListing: boolean("is_new_listing").default(false).notNull(),
  isHighlighted: boolean("is_highlighted").default(false).notNull(), // Added highlight flag for main carousel
  yearBuilt: integer("year_built"),
  views: text("views"),
  amenities: jsonb("amenities").notNull(),
  images: jsonb("images").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  status: text("status").notNull().default(publicationStatus.DRAFT), // Publication status
  createdBy: integer("created_by").default(1), // User who created this property (default to the system owner)
  approvedBy: integer("approved_by"), // Admin/owner who approved this property
  createdAt: text("created_at").notNull(),
  updatedAt: timestamp("updated_at"),
  agentId: integer("agent_id").notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientLocation: text("client_location").notNull(),
  rating: integer("rating").notNull(),
  testimonial: text("testimonial").notNull(),
  initials: text("initials").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isActive: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  updatedAt: true,
  approvedBy: true, // This will be set during approval
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

export type User = typeof users.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;

// Announcements table
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(), // Changed from description to content
  imageUrl: text("image_url"), // Changed from image to imageUrl
  startDate: timestamp("start_date").defaultNow().notNull(), // Changed from date to startDate
  endDate: timestamp("end_date"), // Added endDate
  isActive: boolean("is_active").default(true).notNull(), // Added isActive
  isFeatured: boolean("is_featured").default(false).notNull(), // Add isFeatured flag for featured section
  isHighlighted: boolean("is_highlighted").default(false).notNull(), // Added highlight flag for main carousel
  status: text("status").notNull().default(publicationStatus.DRAFT), // Publication status
  createdBy: integer("created_by").default(1), // User who created this announcement (default to the system owner)
  approvedBy: integer("approved_by"), // Admin/owner who approved this announcement
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedBy: true, // This will be set during approval
});

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

// Projects table for development project entries
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  projectName: text("project_name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  unitTypes: jsonb("unit_types").notNull(), // JSON array containing unit types and areas
  aboutDeveloper: text("about_developer").notNull(),
  images: jsonb("images").notNull(), // Gallery photos
  status: text("status").notNull().default(publicationStatus.DRAFT),
  createdBy: integer("created_by").default(1),
  approvedBy: integer("approved_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedBy: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Define SiteSettings interface
export interface SiteSettings {
  companyLogo?: string;
  companyName: string;
  primaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  // Extended contact details (owner-only fields)
  businessAddress?: string;
  businessHours?: string;
  emergencyContact?: string;
  whatsappNumber?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}
