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
  photos: jsonb("photos").notNull(), // Changed from images to photos with structured data
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

// Photo type for structured photo data
export interface PropertyPhoto {
  filename: string;
  altText: string;
  uploadedAt?: string;
  fileSize?: number;
  mimeType?: string;
}

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
  slug: text("slug").notNull().unique(), // URL-friendly version for SEO
  description: text("description").notNull(),
  introduction: text("introduction").notNull(), // Project introduction section
  location: text("location").notNull(),
  masterPlan: text("master_plan"), // Master plan details
  locationDetails: text("location_details"), // Detailed location information
  specs: jsonb("specs").notNull(), // Project specifications
  unitTypes: jsonb("unit_types").notNull(), // JSON array containing unit types and areas
  developerName: text("developer_name").notNull(),
  aboutDeveloper: text("about_developer").notNull(),
  images: jsonb("images").notNull(), // Gallery photos (live or brochure)
  brochureImages: jsonb("brochure_images").default('[]'), // Separate brochure photos
  liveImages: jsonb("live_images").default('[]'), // Separate live photos
  metaTitle: text("meta_title"), // SEO title
  metaDescription: text("meta_description"), // SEO description
  metaKeywords: text("meta_keywords"), // SEO keywords for this project
  isFeatured: boolean("is_featured").default(false).notNull(),
  isHighlighted: boolean("is_highlighted").default(false).notNull(),
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

// Blog articles for content marketing and SEO
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(), // URL-friendly version of title
  excerpt: text("excerpt").notNull(), // Short description for SEO
  content: text("content").notNull(),
  authorId: integer("author_id").notNull(),
  featuredImage: text("featured_image"),
  category: text("category").notNull(), // e.g., "Market Insights", "Buying Guide", "Investment Tips"
  tags: jsonb("tags").default('[]'), // Array of tags for SEO
  metaTitle: text("meta_title"), // SEO title
  metaDescription: text("meta_description"), // SEO description
  metaKeywords: text("meta_keywords"), // SEO keywords
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  viewCount: integer("view_count").default(0),
  readingTime: integer("reading_time").default(0), // Estimated reading time in minutes
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

// Newsletter subscriptions for email marketing
export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  interests: jsonb("interests").default('[]'), // Array of property types/locations of interest
  isActive: boolean("is_active").default(true),
  source: text("source").default("website"), // Where they subscribed from
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  subscribedAt: true,
});

export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Newsletter = typeof newsletters.$inferSelect;

// Lead captures for marketing
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  propertyId: integer("property_id"), // If they inquired about a specific property
  message: text("message"),
  source: text("source").notNull(), // e.g., "contact_form", "property_inquiry", "newsletter"
  status: text("status").default("new"), // new, contacted, qualified, converted
  createdAt: timestamp("created_at").defaultNow(),
  followedUpAt: timestamp("followed_up_at"),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

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
