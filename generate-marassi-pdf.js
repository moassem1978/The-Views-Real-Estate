import puppeteer from 'puppeteer';
import fs from 'fs';

async function generateMarassiPDF() {
  console.log('Starting PDF generation for Marassi blog...');
  
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport for proper rendering
    await page.setViewport({ width: 1200, height: 800 });
    
    console.log('Navigating to Marassi blog page...');
    await page.goto('http://localhost:5000/blog/marassi-north-coast-emaar-complete-guide', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for content to load
    await page.waitForSelector('article', { timeout: 30000 });
    
    console.log('Generating PDF...');
    await page.pdf({
      path: 'Marassi_North_Coast_Blog.pdf',
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div style="font-size: 10px; width: 100%; text-align: center; color: #666;">Marassi North Coast by EMAAR Misr - The Views Real Estate</div>',
      footerTemplate: '<div style="font-size: 10px; width: 100%; text-align: center; color: #666;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
    });

    await browser.close();
    
    console.log('✅ PDF generated successfully: Marassi_North_Coast_Blog.pdf');
    
    // Also create a text version for backup
    const textContent = `
MARASSI NORTH COAST BY EMAAR MISR
Egypt's Premier Luxury Mediterranean Resort

February 1, 2025 • 15 min read • By Mohamed Assem

INTRODUCTION
Marassi North Coast represents the pinnacle of luxury coastal living in Egypt. This prestigious development by EMAAR Misr offers an unparalleled lifestyle experience with pristine beaches, world-class amenities, and architectural excellence.

PROJECT OVERVIEW

Key Facts:
• Location: North Coast, Egypt - 125km west of Alexandria
• Total Area: 1,544 acres  
• Beachfront: 6.5 kilometers of private beaches
• Golf Course: 18-hole championship course
• Developer: EMAAR Misr
• Payment Plans: Up to 8 years

Premium Amenities:
• 18-hole championship golf course
• Luxury marina with yacht facilities
• Premium retail and dining districts
• World-class spa and wellness centers
• Multiple swimming pools and beach clubs
• 24/7 security and concierge services

ABOUT EMAAR MISR
EMAAR Misr is the Egyptian subsidiary of EMAAR Properties, the world-renowned developer behind iconic projects such as Burj Khalifa and The Dubai Mall. With over 25 years of global experience, EMAAR brings world-class expertise to the Egyptian market.

EMAAR Misr is committed to developing landmark destinations that redefine luxury living standards in Egypt, combining international expertise with local market understanding to create exceptional communities that enhance Egypt's real estate landscape.

PROPERTY TYPES & SPECIFICATIONS

1. BEACHFRONT VILLAS
Specifications:
• Built-up Area: 300-800 sqm
• Bedrooms: 3-6 bedrooms  
• Bathrooms: 3-7 bathrooms

Premium Features:
• Direct beach access
• Private swimming pool
• Landscaped garden
• Unobstructed sea views
• Premium finishing packages
• Smart home systems

2. GOLF COURSE VILLAS
Specifications:
• Built-up Area: 250-600 sqm
• Bedrooms: 3-5 bedrooms
• Bathrooms: 3-6 bathrooms

Premium Features:
• Golf course frontage
• Private garden terraces
• Golf club membership included
• Landscaped surroundings
• Modern architectural design
• Premium amenities access

3. MARINA APARTMENTS
Specifications:
• Built-up Area: 120-300 sqm
• Bedrooms: 1-4 bedrooms
• Bathrooms: 1-4 bathrooms

Premium Features:
• Marina and yacht views
• Spacious balconies
• Contemporary design
• Resort-style amenities
• 24/7 concierge services
• Beach club access

4. HILLTOP ESTATES
Specifications:
• Built-up Area: 400-1000 sqm
• Bedrooms: 4-7 bedrooms
• Bathrooms: 4-8 bathrooms

Ultra-Luxury Features:
• Panoramic Mediterranean views
• Private elevator access
• Infinity swimming pools
• Expansive landscaped grounds
• Ultimate privacy and exclusivity
• Helicopter landing pad access

INVESTMENT OPPORTUNITIES

Why Invest in Marassi?

Market Advantages:
• EMAAR's international reputation
• Limited beachfront supply
• Growing luxury market demand
• Strong rental yield potential

Investment Highlights:
• Flexible payment plans
• Multiple phases available
• 10% down payment options
• Delivery: 2025-2027

EXPERT CONSULTATION

Professional Guidance:
As Egypt's premier luxury Mediterranean resort, Marassi North Coast by EMAAR Misr represents a unique opportunity to own in one of the region's most prestigious developments. With my 30+ years of experience in luxury real estate and direct relationships with EMAAR Misr, I provide exclusive access to the best available units with preferred pricing and payment terms.

Services Offered:
• Exclusive unit selection
• Preferred pricing structures
• Investment strategy guidance
• Legal and financial assistance

Ongoing Support:
• Property management services
• Rental income optimization
• Market performance tracking
• Resale assistance

CONTACT INFORMATION

Ready to Explore Marassi North Coast?
Contact Mohamed Assem for exclusive access to the best available units and personalized investment guidance.

Email: Sales@theviewsrealestate.com
Phone & WhatsApp: +20 106 311 1136
Business Hours: Saturday-Friday 11:00-19:00

ABOUT THE AUTHOR

Mohamed Assem - Senior Real Estate Consultant
With over 30 years of experience in luxury real estate across Egypt and Dubai, Mohamed Assem specializes in North Coast developments and premium investment properties. His expertise in EMAAR projects and deep market knowledge provide clients with unparalleled insights for successful property investments.

---
The Views Real Estate Consultancy
Expert Real Estate Solutions for Egypt & Dubai Markets
`;

    fs.writeFileSync('Marassi_North_Coast_Blog_Text.txt', textContent);
    console.log('✅ Text version also created: Marassi_North_Coast_Blog_Text.txt');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback: Create detailed text version
    console.log('Creating fallback text version...');
    const fallbackContent = `
MARASSI NORTH COAST BY EMAAR MISR - COMPLETE GUIDE
=================================================

Generated: ${new Date().toISOString()}
Source: The Views Real Estate Blog
Author: Mohamed Assem, Senior Real Estate Consultant

PROJECT SUMMARY
===============
Marassi North Coast by EMAAR Misr is Egypt's premier luxury Mediterranean resort destination spanning 1,544 acres along the pristine North Coast. This flagship development features 6.5 kilometers of private beaches, an 18-hole championship golf course, luxury marina, and diverse residential options from beachfront villas to marina apartments.

DEVELOPER: EMAAR Misr
LOCATION: North Coast, Egypt - 125km west of Alexandria  
TOTAL AREA: 1,544 acres
BEACHFRONT: 6.5 kilometers of private beaches
GOLF COURSE: 18-hole championship course
PAYMENT TERMS: Up to 8 years payment plans
DELIVERY: 2025-2027

PROPERTY TYPES
==============

1. BEACHFRONT VILLAS (300-800 sqm)
   - 3-6 bedrooms, 3-7 bathrooms
   - Direct beach access, private pools
   - Premium finishing, smart home systems

2. GOLF COURSE VILLAS (250-600 sqm)  
   - 3-5 bedrooms, 3-6 bathrooms
   - Golf course frontage, club membership
   - Private terraces, modern design

3. MARINA APARTMENTS (120-300 sqm)
   - 1-4 bedrooms, 1-4 bathrooms  
   - Marina views, 24/7 concierge
   - Contemporary design, beach club access

4. HILLTOP ESTATES (400-1000 sqm)
   - 4-7 bedrooms, 4-8 bathrooms
   - Panoramic views, private elevators
   - Infinity pools, helicopter access

INVESTMENT HIGHLIGHTS
====================
- EMAAR's international reputation (Burj Khalifa, Dubai Mall)
- Limited beachfront supply on North Coast
- Strong rental yield potential
- Flexible payment plans available
- Multiple delivery phases

CONTACT INFORMATION
==================
Mohamed Assem - Senior Real Estate Consultant
The Views Real Estate Consultancy
Email: Sales@theviewsrealestate.com  
Phone/WhatsApp: +20 106 311 1136
Business Hours: Saturday-Friday 11:00-19:00

30+ years experience in Egypt & Dubai luxury real estate
Direct EMAAR Misr relationships for exclusive access
Specialized in North Coast developments

END OF DOCUMENT
`;
    
    fs.writeFileSync('Marassi_Blog_Complete_Guide.txt', fallbackContent);
    console.log('✅ Fallback guide created: Marassi_Blog_Complete_Guide.txt');
  }
}

generateMarassiPDF();