
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
      // Prepare the update object, filtering out undefined values
      const updateObject: any = {};
      
      if (updateData.title !== undefined) updateObject.title = updateData.title;
      if (updateData.description !== undefined) updateObject.description = updateData.description;
      if (updateData.price !== undefined) updateObject.price = updateData.price;
      if (updateData.city !== undefined) updateObject.city = updateData.city;
      if (updateData.state !== undefined) updateObject.state = updateData.state;
      if (updateData.country !== undefined) updateObject.country = updateData.country;
      if (updateData.propertyType !== undefined) updateObject.propertyType = updateData.propertyType;
      if (updateData.listingType !== undefined) updateObject.listingType = updateData.listingType;
      if (updateData.bedrooms !== undefined) updateObject.bedrooms = updateData.bedrooms;
      if (updateData.bathrooms !== undefined) updateObject.bathrooms = updateData.bathrooms;
      if (updateData.builtUpArea !== undefined) updateObject.builtUpArea = updateData.builtUpArea;
      if (updateData.isFeatured !== undefined) updateObject.isFeatured = updateData.isFeatured;
      if (updateData.status !== undefined) updateObject.status = updateData.status;
      if (updateData.photos !== undefined) updateObject.photos = JSON.stringify(updateData.photos);
      
      updateObject.updatedAt = new Date();

      console.log(`📝 Updating property ${id} with:`, updateObject);

      const result = await db.update(properties)
        .set(updateObject)
        .where(eq(properties.id, id))
        .returning();

      if (!result || result.length === 0) {
        console.error(`❌ No property found with id ${id} to update`);
        return null;
      }

      const updatedProperty = this.mapPropertyFromDb(result[0]);
      console.log(`✅ Property ${id} updated successfully:`, updatedProperty.title);
      
      return updatedProperty;
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
