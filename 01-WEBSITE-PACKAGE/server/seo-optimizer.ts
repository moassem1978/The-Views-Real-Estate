
import { pool } from "./db";
import fs from "fs";
import path from "path";

interface SEOKeywords {
  egypt: string[];
  dubai: string[];
  trending: string[];
  longTail: string[];
  arabic: string[];
}

interface SEOMetrics {
  title: string;
  description: string;
  keywords: string;
  structuredData: any;
}

export class SEOOptimizer {
  private keywords: SEOKeywords = {
    egypt: [
      "شقق للبيع في القاهرة الجديدة",
      "فيلات كمبوند للبيع",
      "عقارات بالتقسيط في مصر",
      "أسعار العقارات في التجمع الخامس",
      "Hassan Allam Properties Swan Lake",
      "Sodic Eastown properties",
      "Palm Hills October villas",
      "Mountain View Hyde Park",
      "New Administrative Capital properties",
      "North Coast luxury chalets",
      "Katameya Heights villas",
      "Sheikh Zayed compounds",
      "Maadi luxury apartments",
      "Zamalek penthouses"
    ],
    dubai: [
      "Dubai Marina luxury apartments",
      "Business Bay penthouses",
      "Downtown Dubai properties",
      "Dubai Hills Estate villas",
      "Palm Jumeirah mansions",
      "Dubai Creek Harbour",
      "Emaar properties Dubai",
      "Damac developments",
      "Binghatti Stars Business Bay",
      "Sobha Hartland villas",
      "off-plan properties Dubai",
      "freehold properties Dubai",
      "Dubai golden visa properties",
      "ready properties Dubai Marina"
    ],
    trending: [
      "sustainable luxury homes",
      "smart home technology",
      "AI-powered property search",
      "virtual property tours",
      "cryptocurrency payment properties",
      "green building certification",
      "remote work friendly homes",
      "wellness-focused communities",
      "climate-resilient properties",
      "blockchain real estate investment"
    ],
    longTail: [
      "best real estate consultant Egypt Dubai",
      "luxury property investment advisor Middle East",
      "Egyptian investors Dubai property specialist",
      "premium beachfront villas North Coast",
      "high-end apartments New Capital Egypt",
      "waterfront properties Dubai Marina consultant",
      "golf course communities Cairo expert",
      "international real estate broker Egypt",
      "offshore property investment Dubai advisor",
      "luxury penthouses city center specialist"
    ],
    arabic: [
      "أفضل وسيط عقاري في القاهرة",
      "وسيط عقاري موثوق في مصر",
      "مستشار استثمار عقاري مصر",
      "خبير عقارات القاهرة الجديدة",
      "وسيط عقارات الساحل الشمالي",
      "عقارات فاخرة للبيع مصر",
      "استثمار عقاري دبي للمصريين",
      "شقق فاخرة دبي مارينا",
      "فيلات للبيع جزيرة النخلة"
    ]
  };

  async optimizeHomePage(): Promise<void> {
    const homeTitle = `${this.keywords.arabic[0]} | ${this.keywords.dubai[0]} | Hassan Allam Properties | Mohamed Assem`;
    const homeDescription = `${this.keywords.arabic[0]}, ${this.keywords.arabic[1]}, ${this.keywords.dubai[0]}, ${this.keywords.egypt[0]}. Expert real estate consultant Egypt Dubai with 30+ years experience.`;
    
    const homeKeywords = [
      ...this.keywords.egypt.slice(0, 5),
      ...this.keywords.dubai.slice(0, 5),
      ...this.keywords.trending.slice(0, 3),
      ...this.keywords.arabic.slice(0, 3)
    ].join(', ');

    await this.updatePageSEO('home', {
      title: homeTitle,
      description: homeDescription,
      keywords: homeKeywords,
      structuredData: this.generateOrganizationSchema()
    });
  }

  async optimizePropertiesPage(): Promise<void> {
    const propTitle = `Premium Properties for Sale Egypt Dubai | ${this.keywords.egypt[0]} | ${this.keywords.dubai[0]}`;
    const propDescription = `Browse luxury properties in Egypt and Dubai. ${this.keywords.egypt[0]}, ${this.keywords.dubai[1]}, ${this.keywords.egypt[2]}. Expert property consultant Mohamed Assem.`;
    
    const propKeywords = [
      ...this.keywords.egypt,
      ...this.keywords.dubai.slice(0, 8),
      ...this.keywords.longTail.slice(0, 5)
    ].join(', ');

    await this.updatePageSEO('properties', {
      title: propTitle,
      description: propDescription,
      keywords: propKeywords,
      structuredData: this.generatePropertySearchSchema()
    });
  }

  async optimizeAboutPage(): Promise<void> {
    const aboutTitle = `About Mohamed Assem - Premium Real Estate Consultant Egypt Dubai | ${this.keywords.longTail[0]}`;
    const aboutDescription = `Meet Mohamed Assem, 30+ years luxury real estate expert. ${this.keywords.longTail[1]}, ${this.keywords.egypt[1]}, ${this.keywords.dubai[2]}. Coldwell Banker, RE/MAX standards excellence.`;
    
    const aboutKeywords = [
      ...this.keywords.longTail,
      'Mohamed Assem real estate consultant',
      'luxury property advisor Egypt Dubai',
      'premium real estate services',
      ...this.keywords.trending.slice(0, 3)
    ].join(', ');

    await this.updatePageSEO('about', {
      title: aboutTitle,
      description: aboutDescription,
      keywords: aboutKeywords,
      structuredData: this.generatePersonSchema()
    });
  }

  async optimizeBlogPage(): Promise<void> {
    const blogTitle = `Real Estate Market Insights Egypt Dubai | ${this.keywords.trending[0]} | Investment Analysis`;
    const blogDescription = `Latest real estate market trends, investment insights for Egypt and Dubai. ${this.keywords.trending[1]}, ${this.keywords.dubai[3]}, expert analysis by Mohamed Assem.`;
    
    const blogKeywords = [
      ...this.keywords.trending,
      'real estate market analysis',
      'property investment insights',
      'Egypt Dubai market trends',
      'luxury real estate blog',
      ...this.keywords.longTail.slice(0, 3)
    ].join(', ');

    await this.updatePageSEO('blog', {
      title: blogTitle,
      description: blogDescription,
      keywords: blogKeywords,
      structuredData: this.generateBlogSchema()
    });
  }

  private async updatePageSEO(page: string, seo: SEOMetrics): Promise<void> {
    try {
      await pool.query(`
        INSERT INTO page_seo (page_name, title, description, keywords, structured_data, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (page_name) 
        DO UPDATE SET 
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          keywords = EXCLUDED.keywords,
          structured_data = EXCLUDED.structured_data,
          updated_at = NOW()
      `, [page, seo.title, seo.description, seo.keywords, JSON.stringify(seo.structuredData)]);
      
      console.log(`✅ SEO updated for ${page} page`);
    } catch (error) {
      console.error(`❌ Failed to update SEO for ${page}:`, error);
    }
  }

  private generateOrganizationSchema(): any {
    return {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "The Views Real Estate Consultancy",
      "description": "Premium luxury real estate consultancy specializing in Egypt and Dubai properties",
      "url": "https://www.theviewsconsultancy.com",
      "telephone": "+20 106 311 1136",
      "email": "Sales@theviewsconsultancy.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Cairo",
        "addressCountry": "Egypt"
      },
      "areaServed": [
        { "@type": "City", "name": "Cairo" },
        { "@type": "City", "name": "Dubai" },
        { "@type": "City", "name": "North Coast" },
        { "@type": "City", "name": "New Administrative Capital" }
      ],
      "founder": {
        "@type": "Person",
        "name": "Mohamed Assem",
        "jobTitle": "Senior Real Estate Consultant"
      },
      "serviceType": [
        "Luxury Property Sales",
        "Real Estate Investment Consulting",
        "Property Portfolio Management",
        "International Property Services"
      ],
      "keywords": this.keywords.egypt.concat(this.keywords.dubai).join(', ')
    };
  }

  private generatePropertySearchSchema(): any {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Premium Properties for Sale Egypt Dubai",
      "description": "Browse luxury properties in Egypt and Dubai with expert consultation",
      "keywords": this.keywords.egypt.concat(this.keywords.dubai).join(', '),
      "mainEntity": {
        "@type": "RealEstateSearch",
        "name": "Property Search",
        "description": "Search luxury properties in Egypt and Dubai"
      }
    };
  }

  private generatePersonSchema(): any {
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Mohamed Assem",
      "jobTitle": "Senior Real Estate Consultant",
      "description": "30+ years experience in luxury real estate consulting for Egypt and Dubai markets",
      "worksFor": {
        "@type": "Organization",
        "name": "The Views Real Estate Consultancy"
      },
      "expertise": [
        "Luxury Property Sales",
        "Real Estate Investment",
        "Property Portfolio Management",
        "International Property Consulting"
      ],
      "areaServed": ["Egypt", "Dubai", "UAE"]
    };
  }

  private generateBlogSchema(): any {
    return {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Real Estate Market Insights",
      "description": "Expert analysis and insights on Egypt and Dubai real estate markets",
      "keywords": this.keywords.trending.join(', '),
      "author": {
        "@type": "Person",
        "name": "Mohamed Assem"
      }
    };
  }

  async updateTrendingKeywords(): Promise<void> {
    // Simulate fetching trending keywords from market APIs
    const newTrendingKeywords = [
      "sustainable luxury developments 2025",
      "AI-powered property matching",
      "climate-smart real estate",
      "wellness-centered communities",
      "hybrid work friendly homes",
      "smart city developments",
      "green energy properties",
      "luxury co-living spaces",
      "virtual reality property tours",
      "blockchain property transactions"
    ];

    this.keywords.trending = newTrendingKeywords;
    console.log("✅ Trending keywords updated");
  }

  async generateSitemap(): Promise<void> {
    try {
      // Get all properties and projects
      const propertiesResult = await pool.query("SELECT id, created_at FROM properties WHERE status = 'published' ORDER BY created_at DESC LIMIT 1000");
      const projectsResult = await pool.query("SELECT id, project_name, created_at FROM projects ORDER BY created_at DESC LIMIT 100");
      
      const baseUrl = process.env.CUSTOM_DOMAIN ? 
        `https://${process.env.CUSTOM_DOMAIN}` : 
        'https://www.theviewsconsultancy.com';
      
      const staticPages = [
        { url: '/', priority: '1.0', changefreq: 'daily' },
        { url: '/properties', priority: '0.9', changefreq: 'daily' },
        { url: '/projects', priority: '0.8', changefreq: 'weekly' },
        { url: '/about', priority: '0.7', changefreq: 'monthly' },
        { url: '/blog', priority: '0.8', changefreq: 'weekly' },
        { url: '/contact', priority: '0.6', changefreq: 'monthly' }
      ];

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      // Add static pages
      staticPages.forEach(page => {
        sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`;
      });

      // Add property pages
      propertiesResult.rows.forEach(property => {
        sitemap += `
  <url>
    <loc>${baseUrl}/properties/${property.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date(property.created_at).toISOString().split('T')[0]}</lastmod>
  </url>`;
      });

      // Add project pages
      projectsResult.rows.forEach(project => {
        const slug = project.project_name.toLowerCase().replace(/\s+/g, '-');
        sitemap += `
  <url>
    <loc>${baseUrl}/projects/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${new Date(project.created_at).toISOString().split('T')[0]}</lastmod>
  </url>`;
      });

      sitemap += `
</urlset>`;

      // Write sitemap to public directory
      const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
      fs.writeFileSync(sitemapPath, sitemap);
      
      console.log("✅ Sitemap generated successfully");
    } catch (error) {
      console.error("❌ Failed to generate sitemap:", error);
    }
  }

  async updateRobotsTxt(): Promise<void> {
    const baseUrl = process.env.CUSTOM_DOMAIN ? 
      `https://${process.env.CUSTOM_DOMAIN}` : 
      'https://www.theviewsconsultancy.com';
    
    const robotsContent = `User-agent: *
Allow: /
Allow: /properties
Allow: /projects
Allow: /about
Allow: /blog
Allow: /contact
Disallow: /admin
Disallow: /dashboard
Disallow: /api
Disallow: /uploads/temp

Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for better server performance
Crawl-delay: 1

# Allow common search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 1`;

    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    fs.writeFileSync(robotsPath, robotsContent);
    
    console.log("✅ Robots.txt updated successfully");
  }

  async runFullSEOOptimization(): Promise<void> {
    console.log("🚀 Starting bi-daily SEO optimization...");
    
    try {
      await this.updateTrendingKeywords();
      await this.optimizeHomePage();
      await this.optimizePropertiesPage();
      await this.optimizeAboutPage();
      await this.optimizeBlogPage();
      await this.generateSitemap();
      await this.updateRobotsTxt();
      
      console.log("✅ Bi-daily SEO optimization completed successfully!");
      
      // Log optimization summary
      await pool.query(`
        INSERT INTO seo_optimization_log (optimization_date, status, keywords_updated, pages_optimized)
        VALUES (NOW(), 'success', $1, $2)
      `, [JSON.stringify(this.keywords), 4]);
      
    } catch (error) {
      console.error("❌ SEO optimization failed:", error);
      
      await pool.query(`
        INSERT INTO seo_optimization_log (optimization_date, status, error_message)
        VALUES (NOW(), 'failed', $1)
      `, [error instanceof Error ? error.message : 'Unknown error']);
    }
  }
}
