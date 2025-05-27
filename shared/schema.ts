import { pgTable, serial, text, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country").default("Egypt"),
  zipCode: text("zip_code"),
  price: decimal("price", { precision: 15, scale: 2 }),
  downPayment: decimal("down_payment", { precision: 15, scale: 2 }),
  installmentAmount: decimal("installment_amount", { precision: 15, scale: 2 }),
  installmentPeriod: integer("installment_period"),
  isFullCash: boolean("is_full_cash").default(false),
  listingType: text("listing_type").$type<"Primary" | "Resale">(),
  projectName: text("project_name"),
  developerName: text("developer_name"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  builtUpArea: decimal("built_up_area", { precision: 10, scale: 2 }),
  plotSize: decimal("plot_size", { precision: 10, scale: 2 }),
  gardenSize: decimal("garden_size", { precision: 10, scale: 2 }),
  floor: integer("floor"),
  isGroundUnit: boolean("is_ground_unit").default(false),
  propertyType: text("property_type").$type<"apartment" | "villa" | "townhouse" | "penthouse" | "duplex" | "studio">(),
  isFeatured: boolean("is_featured").default(false),
  isNewListing: boolean("is_new_listing").default(false),
  isHighlighted: boolean("is_highlighted").default(false),
  yearBuilt: integer("year_built"),
  views: text("views"),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  images: jsonb("images").$type<string[]>().default([]),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("created_at").defaultNow(),
  agentId: integer("agent_id"),
  status: text("status").default("published"),
  createdBy: integer("created_by"),
  approvedBy: integer("approved_by"),
  updatedAt: timestamp("updated_at"),
  referenceNumber: text("reference_number"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("user"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isHighlighted: boolean("is_highlighted").default(false),
  isFeatured: boolean("is_featured").default(false),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by"),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  propertyId: integer("property_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  developer: text("developer"),
  location: text("location"),
  images: jsonb("images").$type<string[]>().default([]),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  propertyId: integer("property_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});

// Insert schemas
export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  subscribedAt: true,
});

// Types
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type SelectProperty = typeof properties.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = typeof users.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type SelectAnnouncement = typeof announcements.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type SelectTestimonial = typeof testimonials.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type SelectProject = typeof projects.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type SelectLead = typeof leads.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type SelectNewsletter = typeof newsletters.$inferSelect;