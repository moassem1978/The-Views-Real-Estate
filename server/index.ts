import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import multer from "multer";
import path from "path";
import fs from "fs";
import simpleUploadRouter from "./simple-upload"; // Import our simple upload router
import unifiedUploader from "./unified-uploader"; // Import our new unified uploader

// Create and prepare all upload directories with proper permissions
function prepareUploadDirectories() {
  // Main uploads directory for legacy code
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o777 });
    console.log(`Created directory: ${uploadsDir}`);
  } else {
    fs.chmodSync(uploadsDir, 0o777);
    console.log(`Updated permissions for existing directory: ${uploadsDir}`);
  }
  
  // Create properties subdirectory
  const propertiesDir = path.join(uploadsDir, "properties");
  if (!fs.existsSync(propertiesDir)) {
    fs.mkdirSync(propertiesDir, { recursive: true, mode: 0o777 });
    console.log(`Created directory: ${propertiesDir}`);
  } else {
    fs.chmodSync(propertiesDir, 0o777);
    console.log(`Updated permissions for existing directory: ${propertiesDir}`);
  }
  
  // Public uploads directory for newer code
  const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(publicUploadsDir)) {
    fs.mkdirSync(publicUploadsDir, { recursive: true, mode: 0o777 });
    console.log(`Created directory: ${publicUploadsDir}`);
  } else {
    fs.chmodSync(publicUploadsDir, 0o777);
    console.log(`Updated permissions for existing directory: ${publicUploadsDir}`);
  }
  
  // Public uploads subdirectories
  const publicDirs = [
    path.join(publicUploadsDir, "logos"),
    path.join(publicUploadsDir, "properties"),
    path.join(publicUploadsDir, "announcements")
  ];
  
  publicDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true, mode: 0o777 });
      console.log(`Created directory: ${dir}`);
    } else {
      fs.chmodSync(dir, 0o777);
      console.log(`Updated permissions for existing directory: ${dir}`);
    }
  });
  
  return uploadsDir;
}

// Prepare all directories and return the main uploads directory
const uploadsDir = prepareUploadDirectories();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create multer instance with file size limits
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
      // Create an error instance but pass false to reject the file
      const err = new Error('Only image files are allowed!');
      return cb(null, false);
    }
    cb(null, true);
  }
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register our simple upload router - this comes before other route registrations
app.use('/api', simpleUploadRouter);

// Register our new unified uploader - provides a more robust upload solution
app.use('/api/unified', unifiedUploader);

// Consolidated static file serving with caching
const staticOptions = {
  maxAge: '1d',
  etag: true,
  lastModified: true
};

// Serve all static files from public directory
app.use(express.static('public', staticOptions));

// Redirect old upload paths to new location
app.use('/uploads', (req, res) => {
  res.redirect(`/public/uploads${req.path}`);
});

// Debug endpoint to check image paths
app.get('/api/debug/images', (req, res) => {
  const images = fs.readdirSync(path.join(publicUploadsDir, 'properties'))
    .filter(file => file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.png'));
  
  res.json({
    uploadsDir,
    publicUploadsDir,
    images: images.map(img => `/uploads/properties/${img}`),
  });
});

// Serve the test upload HTML file directly
app.get('/test', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'test-upload.html'));
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app, upload, uploadsDir);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Ultra fast image handler - only checks for hash pattern URLs that might be broken
  // and returns a placeholder without multiple checks
  app.use((req, res, next) => {
    const url = req.url;
    
    // Only intercept hash-pattern image requests which are likely to be missing
    if (/\/properties\/[a-f0-9]{32}/i.test(url) && !url.includes('.svg')) {
      // Return placeholder immediately for all hash-pattern URLs
      // This avoids multiple filesystem checks and speeds up loading
      return res.sendFile(path.join(process.cwd(), 'public', 'placeholder-property.svg'));
    }
    
    // For all other requests, continue to regular handling
    next();
  });

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
