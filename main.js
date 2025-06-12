import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;

app.use(express.static('public'));
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT,
    message: 'The Views Real Estate - Live Server'
  });
});

// Sample properties API
app.get('/api/properties', (req, res) => {
  const properties = [
    {
      id: 1,
      title: "Luxury Villa in New Administrative Capital",
      price: "EGP 8,500,000",
      location: "New Administrative Capital, Cairo",
      bedrooms: 5,
      bathrooms: 4,
      area: "450 sqm",
      type: "Villa",
      listingType: "Primary",
      description: "Modern villa with garden and garage in the heart of New Capital",
      images: ["/placeholder-property.svg"]
    },
    {
      id: 2,
      title: "Beachfront Chalet in Marassi North Coast",
      price: "EGP 12,000,000",
      location: "Marassi, North Coast",
      bedrooms: 3,
      bathrooms: 2,
      area: "180 sqm",
      type: "Chalet",
      listingType: "Primary",
      description: "Stunning beachfront chalet in EMAAR Misr's premium development with 6.5km pristine beaches",
      images: ["/placeholder-property.svg"]
    },
    {
      id: 3,
      title: "Luxury Apartment in Dubai Marina",
      price: "AED 2,800,000",
      location: "Dubai Marina, Dubai",
      bedrooms: 2,
      bathrooms: 2,
      area: "120 sqm",
      type: "Apartment",
      listingType: "Primary",
      description: "High-end apartment with marina view and world-class amenities",
      images: ["/placeholder-property.svg"]
    },
    {
      id: 4,
      title: "Penthouse in New Capital R7",
      price: "EGP 15,000,000",
      location: "R7 District, New Administrative Capital",
      bedrooms: 4,
      bathrooms: 3,
      area: "300 sqm",
      type: "Penthouse",
      listingType: "Resale",
      description: "Stunning penthouse with panoramic city views in the government district",
      images: ["/placeholder-property.svg"]
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
      description: "Beachfront townhouse with private pool in exclusive Marassi Bay community",
      images: ["/placeholder-property.svg"]
    }
  ];
  res.json({ data: properties, totalCount: properties.length });
});

app.get('/api/site-settings', (req, res) => {
  res.json({
    companyName: "The Views Real Estate",
    phone: "+20 100 123 4567",
    email: "info@theviewsrealestate.com",
    address: "New Cairo, 5th Settlement, Cairo, Egypt",
    whatsapp: "+20 100 123 4567"
  });
});

app.get('/api/announcements', (req, res) => {
  res.json({ data: [], totalCount: 0 });
});

app.get('/api/announcements/highlighted', (req, res) => {
  res.json([]);
});

app.get('/api/testimonials', (req, res) => {
  res.json({ data: [], totalCount: 0 });
});

app.get('/api/properties/highlighted', (req, res) => {
  res.status(400).json({ message: "Invalid property ID" });
});

app.get('/api/seo/page/home', (req, res) => {
  res.json({
    title: "The Views Real Estate - Premium Properties in Egypt & Dubai",
    description: "Discover luxury properties in Cairo, New Capital, North Coast, and Dubai. Expert real estate services for investment and residential needs.",
    keywords: "real estate egypt, dubai properties, new capital, north coast, marassi, luxury properties"
  });
});

app.get('/api/user', (req, res) => {
  res.status(401).json({ message: "Not authenticated" });
});

// Serve main application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Live at: https://${process.env.REPL_SLUG || 'workspace'}.${process.env.REPLIT_DEV_DOMAIN || 'replit.dev'}`);
});