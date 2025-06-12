import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Enhanced CORS and security headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'SAMEORIGIN');
  res.header('X-XSS-Protection', '1; mode=block');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT,
    service: 'The Views Real Estate',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// Properties API with realistic Egyptian real estate data
app.get('/api/properties', (req, res) => {
  const properties = [
    {
      id: 1,
      title: "Luxury Villa in New Administrative Capital",
      price: "EGP 8,500,000",
      location: "R7 District, New Administrative Capital",
      bedrooms: 5,
      bathrooms: 4,
      area: "450 sqm",
      type: "Villa",
      listingType: "Primary",
      description: "Modern villa with private garden and garage in the government district",
      features: ["Private Garden", "Garage", "Central AC", "Smart Home"],
      images: ["/placeholder-property.svg"],
      agent: "Dina Mohamed",
      phone: "+20 100 123 4567"
    },
    {
      id: 2,
      title: "Beachfront Chalet in Marassi North Coast",
      price: "EGP 12,000,000",
      location: "Marassi, Sidi Abdel Rahman, North Coast",
      bedrooms: 3,
      bathrooms: 2,
      area: "180 sqm",
      type: "Chalet",
      listingType: "Primary",
      description: "Premium beachfront chalet in EMAAR Misr's flagship development with 6.5km pristine Mediterranean beaches",
      features: ["Sea View", "Pool Access", "Beach Access", "Resort Amenities"],
      images: ["/placeholder-property.svg"],
      agent: "Ahmed Hassan",
      phone: "+20 100 123 4567"
    },
    {
      id: 3,
      title: "Luxury Apartment in Dubai Marina",
      price: "AED 2,800,000",
      location: "Dubai Marina, Dubai, UAE",
      bedrooms: 2,
      bathrooms: 2,
      area: "120 sqm",
      type: "Apartment",
      listingType: "Primary",
      description: "High-end apartment with full marina view and world-class amenities",
      features: ["Marina View", "Gym", "Pool", "Concierge"],
      images: ["/placeholder-property.svg"],
      agent: "Sarah Al-Mansouri",
      phone: "+971 50 123 4567"
    },
    {
      id: 4,
      title: "Penthouse in New Capital Business District",
      price: "EGP 15,000,000",
      location: "Central Business District, New Administrative Capital",
      bedrooms: 4,
      bathrooms: 3,
      area: "300 sqm",
      type: "Penthouse",
      listingType: "Resale",
      description: "Stunning penthouse with panoramic city views in the business district",
      features: ["City View", "Private Terrace", "Premium Finishes", "VIP Parking"],
      images: ["/placeholder-property.svg"],
      agent: "Mohamed Ali",
      phone: "+20 100 123 4567"
    },
    {
      id: 5,
      title: "Townhouse in Marassi Bay",
      price: "EGP 18,000,000",
      location: "Marassi Bay, North Coast",
      bedrooms: 4,
      bathrooms: 4,
      area: "280 sqm",
      type: "Townhouse",
      listingType: "Primary",
      description: "Exclusive beachfront townhouse with private pool in Marassi Bay",
      features: ["Private Pool", "Beach Access", "Garden", "Maid's Room"],
      images: ["/placeholder-property.svg"],
      agent: "Layla Ibrahim",
      phone: "+20 100 123 4567"
    }
  ];
  
  res.json({ 
    data: properties, 
    totalCount: properties.length,
    pageCount: 1,
    currentPage: 1
  });
});

// Site settings
app.get('/api/site-settings', (req, res) => {
  res.json({
    companyName: "The Views Real Estate",
    tagline: "Premium Properties in Egypt & Dubai",
    phone: "+20 100 123 4567",
    email: "info@theviewsrealestate.com",
    whatsapp: "+20 100 123 4567",
    address: "New Cairo, 5th Settlement, Cairo, Egypt",
    socialMedia: {
      facebook: "https://facebook.com/theviewsrealestate",
      instagram: "https://instagram.com/theviewsrealestate",
      linkedin: "https://linkedin.com/company/theviewsrealestate"
    }
  });
});

// SEO data
app.get('/api/seo/page/:page', (req, res) => {
  const seoData = {
    home: {
      title: "The Views Real Estate - Premium Properties in Egypt & Dubai",
      description: "Discover luxury properties in Cairo, New Administrative Capital, North Coast, and Dubai. Expert real estate services for investment and residential needs.",
      keywords: "real estate egypt, dubai properties, new capital, north coast, marassi, luxury properties, egypt real estate, dubai marina"
    },
    properties: {
      title: "Properties for Sale & Rent - The Views Real Estate",
      description: "Browse our exclusive collection of properties in Egypt and Dubai. Villas, apartments, chalets in prime locations.",
      keywords: "properties for sale egypt, dubai properties, new capital properties, north coast properties"
    }
  };
  
  res.json(seoData[req.params.page] || seoData.home);
});

// Empty endpoints for frontend compatibility
app.get('/api/announcements', (req, res) => {
  res.json({ data: [], totalCount: 0, pageCount: 0, currentPage: 1 });
});

app.get('/api/announcements/highlighted', (req, res) => {
  res.json([]);
});

app.get('/api/testimonials', (req, res) => {
  res.json({ data: [], totalCount: 0, pageCount: 0, currentPage: 1 });
});

app.get('/api/properties/highlighted', (req, res) => {
  res.status(400).json({ message: "Invalid property ID" });
});

app.get('/api/user', (req, res) => {
  res.status(401).json({ message: "Not authenticated" });
});

// Contact form endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  
  // In production, this would send email/save to database
  console.log('Contact form submission:', { name, email, phone, message });
  
  res.json({ 
    success: true, 
    message: "Thank you for your inquiry. We'll contact you soon." 
  });
});

// Property inquiry endpoint
app.post('/api/properties/:id/inquire', (req, res) => {
  const propertyId = req.params.id;
  const { name, email, phone, message } = req.body;
  
  console.log('Property inquiry:', { propertyId, name, email, phone, message });
  
  res.json({ 
    success: true, 
    message: "Your inquiry has been sent to our agent." 
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.sendFile(path.join(__dirname, '../status.html'));
});

// Serve main application for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Production server running on port ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`🔗 External: https://${process.env.REPL_SLUG || 'workspace'}.${process.env.REPLIT_DEV_DOMAIN || 'replit.dev'}`);
  console.log(`📊 Status: http://localhost:${PORT}/status`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});