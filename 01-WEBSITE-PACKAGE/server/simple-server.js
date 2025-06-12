import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT,
    message: 'The Views Real Estate Server'
  });
});

// API endpoints with sample data
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
      description: "Modern villa with garden and garage in the heart of New Capital",
      images: ["/placeholder-property.svg"]
    },
    {
      id: 2,
      title: "Beachfront Chalet in Marassi",
      price: "EGP 12,000,000",
      location: "Marassi, North Coast",
      bedrooms: 3,
      bathrooms: 2,
      area: "180 sqm",
      type: "Chalet",
      description: "Stunning beachfront chalet with sea view and pool access",
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
      description: "High-end apartment with marina view and world-class amenities",
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
    address: "New Cairo, 5th Settlement, Cairo, Egypt"
  });
});

app.get('/api/announcements', (req, res) => {
  res.json({ data: [], totalCount: 0 });
});

app.get('/api/testimonials', (req, res) => {
  res.json({ data: [], totalCount: 0 });
});

// Serve main application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access at: http://0.0.0.0:${PORT}`);
  console.log(`External: https://${process.env.REPL_SLUG || 'workspace'}.${process.env.REPLIT_DEV_DOMAIN || 'replit.dev'}`);
});