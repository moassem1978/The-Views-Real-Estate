import { pgTable, text, serial, integer, boolean, doublePrecision, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  isAgent: boolean("is_agent").default(false).notNull(),
  createdAt: text("created_at").notNull(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
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
  yearBuilt: integer("year_built"),
  views: text("views"),
  amenities: jsonb("amenities").notNull(),
  images: jsonb("images").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  createdAt: text("created_at").notNull(),
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
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
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
  isFeatured: boolean("is_featured").default(false).notNull(), // Add isFeatured flag to display in main carousel
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

export interface SiteSettings {
  companyLogo?: string;
  companyName: string;
  primaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}
