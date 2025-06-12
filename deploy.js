import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;

// Static files
app.use(express.static('public'));
app.use(express.json());

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'The Views Real Estate'
  });
});

// Properties endpoint with Egyptian real estate data
app.get('/api/properties', (req, res) => {
  res.json({
    data: [
      {
        id: 1,
        title: "Luxury Villa in New Administrative Capital",
        price: "EGP 8,500,000",
        location: "R7 District, New Administrative Capital",
        bedrooms: 5,
        bathrooms: 4,
        area: "450 sqm",
        type: "Villa",
        listingType: "Primary"
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
        listingType: "Primary"
      },
      {
        id: 3,
        title: "Dubai Marina Apartment",
        price: "AED 2,800,000",
        location: "Dubai Marina, UAE",
        bedrooms: 2,
        bathrooms: 2,
        area: "120 sqm",
        type: "Apartment",
        listingType: "Primary"
      }
    ],
    totalCount: 3
  });
});

// Company settings
app.get('/api/site-settings', (req, res) => {
  res.json({
    companyName: "The Views Real Estate",
    phone: "+20 100 123 4567",
    email: "info@theviewsrealestate.com",
    address: "New Cairo, 5th Settlement, Cairo, Egypt"
  });
});

// Empty endpoints for compatibility
app.get('/api/announcements', (req, res) => res.json({ data: [], totalCount: 0 }));
app.get('/api/announcements/highlighted', (req, res) => res.json([]));
app.get('/api/testimonials', (req, res) => res.json({ data: [], totalCount: 0 }));
app.get('/api/properties/highlighted', (req, res) => res.status(400).json({ message: "Invalid property ID" }));
app.get('/api/user', (req, res) => res.status(401).json({ message: "Not authenticated" }));
app.get('/api/seo/page/home', (req, res) => res.json({
  title: "The Views Real Estate - Premium Properties in Egypt & Dubai",
  description: "Discover luxury properties in Cairo, New Capital, North Coast, and Dubai"
}));

// Serve main application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});