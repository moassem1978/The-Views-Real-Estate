// This is a fixed version of storage.ts with proper image handling
import { eq, like, or, and, desc, asc, sql, gte, lte, lt } from 'drizzle-orm';
import { 
  users, properties, testimonials, announcements, projects,
  type User, type InsertUser, 
  type Property, type InsertProperty,
  type Testimonial, type InsertTestimonial,
  type Announcement, type InsertAnnouncement,
  type Project, type InsertProject,
  type SiteSettings
} from '@shared/schema';
import { db, pool } from './db';
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';
import NodeCache from 'node-cache';

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  pageCount: number;
  page: number;
  pageSize: number;
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
  international?: boolean; // For filtering properties outside Egypt
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
  getProperties(
    page?: number, 
    pageSize?: number, 
    filters?: PropertyFilters
  ): Promise<{ properties: Property[]; totalCount: number; pageCount: number }>;
  getProperty(id: number): Promise<Property | undefined>;
  getHighlightedProperties(limit?: number): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, updates: Partial<Property>): Promise<Property>;
  deleteProperty(id: number): Promise<boolean>;

  // Other operations
  getTestimonials(page?: number, pageSize?: number): Promise<{ testimonials: Testimonial[]; totalCount: number; pageCount: number }>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, updates: Partial<Testimonial>): Promise<Testimonial>;
  deleteTestimonial(id: number): Promise<boolean>;

  getLeads(page?: number, pageSize?: number): Promise<{ leads: Lead[]; totalCount: number; pageCount: number }>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, updates: Partial<Lead>): Promise<Lead>;
  deleteLead(id: number): Promise<boolean>;

  getProjects(page?: number, pageSize?: number): Promise<{ projects: Project[]; totalCount: number; pageCount: number }>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: number): Promise<boolean>;

  getAnnouncements(page?: number, pageSize?: number): Promise<{ announcements: Announcement[]; totalCount: number; pageCount: number }>;
  getHighlightedAnnouncements(limit?: number): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, updates: Partial<Announcement>): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<boolean>;

  getNewsletterSubscriptions(page?: number, pageSize?: number): Promise<{ subscriptions: Newsletter[]; totalCount: number; pageCount: number }>;
  createNewsletterSubscription(subscription: InsertNewsletter): Promise<Newsletter>;
  deleteNewsletterSubscription(id: number): Promise<boolean>;

  getArticles(page?: number, pageSize?: number): Promise<{ articles: Article[]; totalCount: number; pageCount: number }>;
  getArticle(id: number): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, updates: Partial<Article>): Promise<Article>;
  deleteArticle(id: number): Promise<boolean>;

  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings>;
}

