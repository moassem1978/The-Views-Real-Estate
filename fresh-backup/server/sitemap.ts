import { Request, Response } from "express";
import { db } from "./db";
import { properties, announcements } from "../shared/schema";

export async function generateSitemap(req: Request, res: Response) {
  try {
    // Get all published properties and announcements
    const [allProperties, allAnnouncements] = await Promise.all([
      db.select().from(properties),
      db.select().from(announcements)
    ]);

    const baseUrl = `https://${req.get('host')}`;
    const currentDate = new Date().toISOString().split('T')[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main Pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${currentDate}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/properties</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>${currentDate}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>${currentDate}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>${currentDate}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/services</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>${currentDate}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/international</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${currentDate}</lastmod>
  </url>
  <!-- Cairo Properties Page -->
  <url>
    <loc>${baseUrl}/cairo-properties</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>${currentDate}</lastmod>
  </url>
  <!-- North Coast Properties Page -->
  <url>
    <loc>${baseUrl}/north-coast-properties</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>${currentDate}</lastmod>
  </url>`;

    // Add individual property pages
    allProperties.forEach(property => {
      const lastMod = property.updatedAt ? new Date(property.updatedAt).toISOString().split('T')[0] : currentDate;
      sitemap += `
  <url>
    <loc>${baseUrl}/properties/${property.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${lastMod}</lastmod>
  </url>`;
    });

    // Add announcements
    allAnnouncements.forEach(announcement => {
      const lastMod = announcement.updatedAt ? new Date(announcement.updatedAt).toISOString().split('T')[0] : currentDate;
      sitemap += `
  <url>
    <loc>${baseUrl}/announcements/${announcement.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
    <lastmod>${lastMod}</lastmod>
  </url>`;
    });

    // Add property type and location specific pages
    const propertyTypes = ['Villa', 'Apartment', 'Penthouse', 'Chalet'];
    const locations = ['Cairo', 'North Coast', 'Giza', 'Alexandria'];
    
    propertyTypes.forEach(type => {
      sitemap += `
  <url>
    <loc>${baseUrl}/properties?propertyType=${encodeURIComponent(type)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    <lastmod>${currentDate}</lastmod>
  </url>`;
    });

    locations.forEach(location => {
      sitemap += `
  <url>
    <loc>${baseUrl}/properties?location=${encodeURIComponent(location)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    <lastmod>${currentDate}</lastmod>
  </url>`;
    });

    sitemap += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
}