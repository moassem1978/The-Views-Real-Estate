
import { db, pool } from "./db";
import { eq, desc, and, gte, lte, like, sql } from "drizzle-orm";
import { properties, users, announcements, testimonials, siteSettings } from "@shared/schema";

class OptimizedStorage {
  // Property operations with retry logic
  async getAllProperties(page: number = 1, pageSize: number = 24) {
    try {
      const offset = (page - 1) * pageSize;
      
      const [propertiesResult, countResult] = await Promise.all([
        db.select()
          .from(properties)
          .orderBy(desc(properties.createdAt))
          .limit(pageSize)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(properties)
      ]);

      const totalCount = countResult[0]?.count || 0;
      
      return {
        data: propertiesResult.map(this.mapPropertyFromDb),
        totalCount,
        pageCount: Math.ceil(totalCount / pageSize),
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error in getAllProperties:', error);
      return { data: [], totalCount: 0, pageCount: 0, page: 1, pageSize };
    }
  }

  async getPropertyById(id: number) {
    try {
      const result = await db.select()
        .from(properties)
        .where(eq(properties.id, id))
        .limit(1);
      
      return result[0] ? this.mapPropertyFromDb(result[0]) : null;
    } catch (error) {
      console.error('Error in getPropertyById:', error);
      return null;
    }
  }

  async createProperty(propertyData: any) {
    try {
      // Validate required fields
      if (!propertyData.title || !propertyData.description) {
        throw new Error('Title and description are required');
      }

      const result = await db.insert(properties)
        .values({
          title: propertyData.title,
          description: propertyData.description,
          price: propertyData.price || 0,
          city: propertyData.city || '',
          state: propertyData.state || '',
          country: propertyData.country || 'Egypt',
          propertyType: propertyData.propertyType || 'apartment',
          listingType: propertyData.listingType || 'sale',
          bedrooms: propertyData.bedrooms || 0,
          bathrooms: propertyData.bathrooms || 0,
          builtUpArea: propertyData.builtUpArea || 0,
          photos: JSON.stringify(propertyData.photos || []),
          createdBy: propertyData.createdBy,
          agentId: propertyData.agentId,
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return this.mapPropertyFromDb(result[0]);
    } catch (error) {
      console.error('Error in createProperty:', error);
      throw error;
    }
  }

  async updateProperty(id: number, updateData: any) {
    try {
      const result = await db.update(properties)
        .set({
          ...updateData,
          photos: updateData.photos ? JSON.stringify(updateData.photos) : undefined,
          updatedAt: new Date()
        })
        .where(eq(properties.id, id))
        .returning();

      return result[0] ? this.mapPropertyFromDb(result[0]) : null;
    } catch (error) {
      console.error('Error in updateProperty:', error);
      throw error;
    }
  }

  async deleteProperty(id: number) {
    try {
      await db.delete(properties).where(eq(properties.id, id));
      return true;
    } catch (error) {
      console.error('Error in deleteProperty:', error);
      return false;
    }
  }

  private mapPropertyFromDb(property: any) {
    return {
      ...property,
      photos: this.parsePhotos(property.photos),
      price: parseFloat(property.price) || 0,
      bedrooms: parseInt(property.bedrooms) || 0,
      bathrooms: parseFloat(property.bathrooms) || 0,
      builtUpArea: parseFloat(property.builtUpArea) || 0
    };
  }

  private parsePhotos(photos: any) {
    if (!photos) return [];
    if (Array.isArray(photos)) return photos;
    if (typeof photos === 'string') {
      try {
        return JSON.parse(photos);
      } catch {
        return [photos];
      }
    }
    return [];
  }
}

export const storage = new OptimizedStorage();
