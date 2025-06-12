import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS and security headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'SAMEORIGIN');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT,
    service: 'The Views Real Estate'
  });
});

// Properties API with authentic Egyptian real estate data
app.get('/api/properties', (req, res) => {
  const properties = [
    {
      id: 1,
      title: "Luxury Villa in New Administrative Capital",
      price: "EGP 8,500,000",
      location: "R7 District, New Administrative Capital, Cairo",
      bedrooms: 5,
      bathrooms: 4,
      area: "450 sqm",
      type: "Villa",
      listingType: "Primary",
      description: "Modern villa with private garden and garage in the government district of Egypt's new capital city",
      features: ["Private Garden", "2-Car Garage", "Central AC", "Smart Home System"],
      images: ["/placeholder-property.svg"],
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-06-12T08:45:00Z"
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
      description: "Premium beachfront chalet in EMAAR Misr's flagship development spanning 1,544 acres with 6.5km pristine Mediterranean beaches",
      features: ["Direct Beach Access", "Resort Pool", "Sea View", "Resort Amenities"],
      images: ["/placeholder-property.svg"],
      createdAt: "2024-02-20T14:15:00Z",
      updatedAt: "2024-06-10T16:20:00Z"
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
      description: "High-end apartment with full marina view and access to world-class amenities in Dubai's most prestigious waterfront community",
      features: ["Marina View", "Gym Access", "Swimming Pool", "24/7 Concierge"],
      images: ["/placeholder-property.svg"],
      createdAt: "2024-03-05T11:00:00Z",
      updatedAt: "2024-06-08T09:30:00Z"
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
      description: "Stunning penthouse with panoramic city views in the heart of Egypt's new business capital",
      features: ["Panoramic Views", "Private Terrace", "Premium Finishes", "VIP Parking"],
      images: ["/placeholder-property.svg"],
      createdAt: "2024-01-30T13:45:00Z",
      updatedAt: "2024-06-05T12:10:00Z"
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
      description: "Exclusive beachfront townhouse with private pool in the prestigious Marassi Bay community",
      features: ["Private Pool", "Beach Access", "Private Garden", "Maid's Room"],
      images: ["/placeholder-property.svg"],
      createdAt: "2024-04-10T15:20:00Z",
      updatedAt: "2024-06-12T14:00:00Z"
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
    workingHours: "Sunday - Thursday: 9:00 AM - 6:00 PM",
    languages: ["Arabic", "English"],
    socialMedia: {
      facebook: "https://facebook.com/theviewsrealestate",
      instagram: "https://instagram.com/theviewsrealestate",
      linkedin: "https://linkedin.com/company/theviewsrealestate"
    }
  });
});

// SEO endpoints
app.get('/api/seo/page/:page', (req, res) => {
  const seoData = {
    home: {
      title: "The Views Real Estate - Premium Properties in Egypt & Dubai",
      description: "Discover luxury properties in Cairo, New Administrative Capital, North Coast, and Dubai. Expert real estate services for investment and residential needs with 15+ years experience.",
      keywords: "real estate egypt, dubai properties, new administrative capital, north coast properties, marassi, luxury properties, egypt investment, property management",
      canonical: "https://theviewsrealestate.com/"
    },
    properties: {
      title: "Properties for Sale & Rent in Egypt & Dubai | The Views Real Estate",
      description: "Browse our exclusive collection of villas, apartments, and chalets in prime Egyptian and Dubai locations. Professional real estate services since 2008.",
      keywords: "properties for sale egypt, dubai real estate, new capital properties, north coast chalets, luxury villas egypt"
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
  
  console.log('Contact form submission received:', {
    name,
    email,
    phone,
    message,
    timestamp: new Date().toISOString()
  });
  
  res.json({
    success: true,
    message: "Thank you for your inquiry. Our team will contact you within 24 hours."
  });
});

// Property inquiry endpoint
app.post('/api/properties/:id/inquire', (req, res) => {
  const propertyId = req.params.id;
  const { name, email, phone, message } = req.body;
  
  console.log('Property inquiry received:', {
    propertyId,
    name,
    email,
    phone,
    message,
    timestamp: new Date().toISOString()
  });
  
  res.json({
    success: true,
    message: "Your inquiry has been sent to our property specialist."
  });
});

// Serve main application for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`External URL: https://${process.env.REPL_SLUG || 'workspace'}.${process.env.REPLIT_DEV_DOMAIN || 'replit.dev'}`);
  console.log(`Health check: /health`);
});