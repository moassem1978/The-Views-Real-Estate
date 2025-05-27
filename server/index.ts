import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { eq } from "drizzle-orm";
import { db } from "./db.js";
import { users, leads, newsletters } from "../shared/schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static file serving
app.use("/uploads", express.static(join(__dirname, "../public/uploads")));
app.use(express.static(join(__dirname, "../public")));

// Ensure admin account exists
async function ensureAdminAccount() {
  try {
    const existingUser = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
    
    if (existingUser.length === 0) {
      // Simple admin account without bcrypt for now
      await db.insert(users).values({
        username: "admin",
        email: "admin@theviewsconsultancy.com",
        passwordHash: "admin123", // Will be hashed properly later
        role: "admin",
        firstName: "Admin",
        lastName: "User",
        isActive: true,
      });
      console.log("Admin account created successfully");
    } else {
      console.log("Admin account already exists");
    }
  } catch (error) {
    console.error("Error ensuring admin account:", error);
  }
}

// Properties API routes
app.get("/api/properties", async (req, res) => {
  try {
    const properties = await db.query.properties.findMany({
      orderBy: (properties, { desc }) => [desc(properties.createdAt)],
    });
    res.json({ data: properties, totalCount: properties.length });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

app.get("/api/properties/highlighted", async (req, res) => {
  try {
    const highlightedProperties = await db.query.properties.findMany({
      where: (properties, { eq }) => eq(properties.isHighlighted, true),
      limit: 3,
      orderBy: (properties, { desc }) => [desc(properties.createdAt)],
    });
    res.json(highlightedProperties);
  } catch (error) {
    console.error("Error fetching highlighted properties:", error);
    res.status(500).json({ error: "Failed to fetch highlighted properties" });
  }
});

app.get("/api/properties/featured", async (req, res) => {
  try {
    const featuredProperties = await db.query.properties.findMany({
      where: (properties, { eq }) => eq(properties.isFeatured, true),
      limit: 6,
      orderBy: (properties, { desc }) => [desc(properties.createdAt)],
    });
    res.json(featuredProperties);
  } catch (error) {
    console.error("Error fetching featured properties:", error);
    res.status(500).json({ error: "Failed to fetch featured properties" });
  }
});

app.get("/api/properties/:id", async (req, res) => {
  try {
    const property = await db.query.properties.findFirst({
      where: (properties, { eq }) => eq(properties.id, parseInt(req.params.id)),
    });
    
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    
    res.json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ error: "Failed to fetch property" });
  }
});

// Announcements API routes
app.get("/api/announcements", async (req, res) => {
  try {
    const announcements = await db.query.announcements.findMany({
      orderBy: (announcements, { desc }) => [desc(announcements.createdAt)],
    });
    res.json({ data: announcements, totalCount: announcements.length });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

app.get("/api/announcements/highlighted", async (req, res) => {
  try {
    const highlightedAnnouncements = await db.query.announcements.findMany({
      where: (announcements, { eq }) => eq(announcements.isHighlighted, true),
      limit: 3,
      orderBy: (announcements, { desc }) => [desc(announcements.createdAt)],
    });
    res.json(highlightedAnnouncements);
  } catch (error) {
    console.error("Error fetching highlighted announcements:", error);
    res.status(500).json({ error: "Failed to fetch highlighted announcements" });
  }
});

// Testimonials API routes
app.get("/api/testimonials", async (req, res) => {
  try {
    const testimonials = await db.query.testimonials.findMany({
      orderBy: (testimonials, { desc }) => [desc(testimonials.createdAt)],
    });
    res.json({ data: testimonials, totalCount: testimonials.length });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
});

// Projects API routes
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await db.query.projects.findMany({
      orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    });
    res.json({ data: projects, totalCount: projects.length });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Site settings
app.get("/api/site-settings", async (req, res) => {
  try {
    const settings = {
      companyName: "The Views Real Estate",
      contactEmail: "Sales@theviewsconsultancy.com",
      secondaryEmail: "Assem@theviewsconsultancy.com",
      phone: "+20 100 123 4567",
      address: "Cairo, Egypt",
      description: "Luxury Real Estate Consultancy specializing in premium Egyptian properties",
    };
    res.json(settings);
  } catch (error) {
    console.error("Error fetching site settings:", error);
    res.status(500).json({ error: "Failed to fetch site settings" });
  }
});

// Contact form
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Store as lead
    await db.insert(leads).values({
      name,
      email,
      phone,
      message,
    });
    
    res.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error handling contact form:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Newsletter subscription
app.post("/api/newsletter/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    
    await db.insert(newsletters).values({ email });
    
    res.json({ success: true, message: "Successfully subscribed to newsletter" });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// Serve client
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "../client/dist/index.html"));
});

const port = 5000;

// Start server
app.listen(port, "0.0.0.0", async () => {
  console.log(`Server running on port ${port}`);
  await ensureAdminAccount();
});

export default app;