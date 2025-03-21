import { pgTable, text, serial, integer, boolean, doublePrecision, jsonb } from "drizzle-orm/pg-core";
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
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: doublePrecision("bathrooms").notNull(),
  squareFeet: integer("square_feet").notNull(),
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
