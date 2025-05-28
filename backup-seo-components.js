// SEO Components Backup - Created May 28, 2025
// To restore after rollback: Copy these components to their respective files

// ============================================
// HOME PAGE SEO (client/src/pages/Home.tsx)
// Add this function and useEffect to Home component
// ============================================

function HomeSEO() {
  useEffect(() => {
    // Set optimized page title and meta description for luxury real estate in Egypt
    const title = "The Views Real Estate - Luxury Properties in Egypt | Cairo, North Coast, New Capital";
    const description = "Discover premium luxury properties in Egypt with The Views Real Estate. Expert real estate consultancy for villas, penthouses, chalets in Cairo, North Coast, New Capital. 30+ years experience.";
    
    document.title = title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Add keywords meta tag for SEO
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'عقارات للبيع, عقارات القاهرة, عقارات مصر, شقق للبيع, فيلل للبيع, شاليهات للبيع, properties for sale Egypt, real estate Egypt, apartments for sale Cairo, villas for sale Egypt, chalets for sale North Coast, Nawy Egypt, Coldwell Banker Egypt, Bold Routes, The Address Investment, EMAAR Mivida for sale, Sodic Eastown, Palm Hills Hacienda, Mountain View iCity, Orascom El Gouna, Tatweer Misr Fouka Bay, La Vista Telal North Coast, Marakez Mall of Arabia, Hassan Allam Swan Lake, Hyde Park New Cairo, Ora Zed West, Misr Italia Il Bosco, Capital Group Sentra, Madinet Masr Sarai, La Vista Bay La Sun, Tatweer Misr IL Monte Galala, Hassan Allam Rabwa Heights, Marakez District One, La Vista Ras El Hekma Bay, Tatweer Misr Katameya Coast, عقارات نوي, كولدويل بانكر مصر, عقارات إعمار ميفيدا, سوديك إيستاون, بالم هيلز هاسيندا, ماونتن فيو آي سيتي, أوراسكوم الجونة, تطوير مصر فوكة باي, لافيستا تلال الساحل الشمالي, مراكز مول العرب, حسن علام سوان ليك, هايد بارك القاهرة الجديدة, أورا زيد ويست, مصر إيطاليا إل بوسكو, كابيتال جروب سنترا, مدينة مصر سراي, لافيستا باي لا صن, تطوير مصر إل مونتي جلالة, حسن علام ربوة هايتس, مراكز ديستريكت ون, لافيستا رأس الحكمة باي, تطوير مصر قطامية كوست');

    // Add Open Graph tags for social media
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:image', content: '/views-logo-new.png' },
      { property: 'og:site_name', content: 'The Views Real Estate' }
    ];

    ogTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', tag.property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', tag.content);
    });

    // Add structured data for real estate business
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "The Views Real Estate",
      "description": description,
      "url": "https://www.theviewsconsultancy.com",
      "logo": "https://www.theviewsconsultancy.com/views-logo-new.png",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "Egypt"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "sales",
        "areaServed": ["Cairo", "North Coast", "New Capital", "Red Sea"]
      },
      "sameAs": [
        "https://www.theviewsconsultancy.com"
      ]
    };

    let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.type = 'application/ld+json';
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(structuredData);
  }, []);

  return null;
}

// ============================================
// PROPERTY DETAILS SEO (client/src/pages/PropertyDetails.tsx)
// Add this function to PropertyDetails component
// ============================================

function PropertySEO({ property }: { property: Property }) {
  useEffect(() => {
    if (!property) return;

    // Set page title and meta description
    const title = `${property.title} - ${property.city} | The Views Real Estate`;
    const description = `${property.propertyType} for sale in ${property.city}. ${property.bedrooms} bed, ${property.bathrooms} bath. ${formatPrice(property.price)}. Contact The Views Real Estate for luxury properties in Egypt.`;
    
    document.title = title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Add Open Graph tags
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:image', content: property.images && property.images.length > 0 ? getImageUrl(property.images[0]) : '' }
    ];

    ogTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', tag.property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', tag.content);
    });

    // Add property structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": property.title,
      "description": property.description,
      "url": window.location.href,
      "image": property.images && property.images.length > 0 ? getImageUrl(property.images[0]) : '',
      "address": {
        "@type": "PostalAddress",
        "streetAddress": property.address,
        "addressLocality": property.city,
        "addressRegion": property.state,
        "postalCode": property.zipCode,
        "addressCountry": property.country || "Egypt"
      },
      "geo": property.latitude && property.longitude ? {
        "@type": "GeoCoordinates",
        "latitude": property.latitude,
        "longitude": property.longitude
      } : undefined,
      "floorSize": {
        "@type": "QuantitativeValue",
        "value": property.builtUpArea,
        "unitCode": "SQM"
      },
      "numberOfRooms": property.bedrooms,
      "numberOfBathroomsTotal": property.bathrooms,
      "price": {
        "@type": "PriceSpecification",
        "price": property.price,
        "priceCurrency": "EGP"
      },
      "datePosted": property.createdAt,
      "provider": {
        "@type": "RealEstateAgent",
        "name": "The Views Real Estate",
        "url": "https://www.theviewsconsultancy.com"
      }
    };

    let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.type = 'application/ld+json';
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(structuredData);

    return () => {
      // Cleanup on unmount
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [property]);

  return null;
}

// ============================================
// ABOUT PAGE SEO (client/src/pages/About.tsx)
// Add this function to About component
// ============================================

function AboutSEO() {
  useEffect(() => {
    // Set optimized page title and meta description for About page
    const title = "About Mohamed Assem - Senior Real Estate Consultant | The Views Real Estate";
    const description = "Meet Mohamed Assem, founder of The Views Real Estate with 30+ years of international experience across 7 countries. Expert in luxury properties in Egypt, Cairo, North Coast.";
    
    document.title = title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Add Open Graph tags
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'profile' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:image', content: '/views-logo-new.png' }
    ];

    ogTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', tag.property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', tag.content);
    });

    // Add Person structured data for Mohamed Assem
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Mohamed Assem",
      "jobTitle": "Founder & Senior Real Estate Consultant",
      "worksFor": {
        "@type": "RealEstateAgent",
        "name": "The Views Real Estate"
      },
      "description": "Senior real estate consultant with 30+ years of experience across 7 countries, specializing in luxury properties in Egypt",
      "url": "https://www.theviewsconsultancy.com/about",
      "sameAs": [
        "https://www.theviewsconsultancy.com"
      ]
    };

    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null;
}

// ============================================
// EMAAR MIVIDA PROJECT SEO (client/src/pages/EMAAARMividaProject.tsx)
// Add this function to EMAAARMividaProject component
// ============================================

function MividaSEO() {
  useEffect(() => {
    const title = "EMAAR Mivida Project - New Cairo | Luxury Properties for Sale";
    const description = "Explore EMAAR Mivida luxury properties in New Cairo. Premium villas, apartments and townhouses in one of Egypt's most prestigious developments by EMAAR Misr.";
    
    document.title = title;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Add Open Graph tags
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:image', content: '/views-logo-new.png' }
    ];

    ogTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', tag.property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', tag.content);
    });

    // Structured data for better SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "RealEstate",
      "name": "EMAAR Mivida Project",
      "description": description,
      "url": window.location.href,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "New Cairo",
        "addressRegion": "Cairo Governorate",
        "addressCountry": "Egypt"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "30.0444",
        "longitude": "31.2357"
      },
      "provider": {
        "@type": "RealEstateAgent",
        "name": "The Views Real Estate",
        "url": "https://www.theviewsconsultancy.com",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+20-xxx-xxx-xxxx",
          "contactType": "sales"
        }
      }
    };

    let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.type = 'application/ld+json';
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(structuredData);
  }, []);

  return null;
}

// ============================================
// SITEMAP AND ROBOTS.TXT (server/routes.ts)
// Add these routes to your server
// ============================================

// Sitemap route
app.get("/sitemap.xml", async (req: Request, res: Response) => {
  try {
    const properties = await db.select().from(propertiesTable);
    const baseUrl = `https://${req.get('host')}`;
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/properties</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

    properties.forEach(property => {
      sitemap += `
  <url>
    <loc>${baseUrl}/properties/${property.id}</loc>
    <lastmod>${new Date(property.updatedAt || property.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Robots.txt route
app.get("/robots.txt", (req: Request, res: Response) => {
  const baseUrl = `https://${req.get('host')}`;
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;

  res.set('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

// ============================================
// USAGE INSTRUCTIONS:
// ============================================
// 1. After rollback, copy the SEO functions to their respective page components
// 2. Add the <HomeSEO />, <PropertySEO property={property} />, <AboutSEO />, <MividaSEO /> components to render in each page
// 3. Import useEffect in each component that uses SEO
// 4. Add the sitemap and robots.txt routes to server/routes.ts
// 5. Make sure to import the necessary dependencies (formatPrice, getImageUrl) where needed