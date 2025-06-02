import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import multer from "multer";
import path from "path";
import fs from "fs";
import simpleUploadRouter from "./simple-upload"; // Import our simple upload router
import unifiedUploader from "./unified-uploader"; // Import our new unified uploader
import { imageMatcher } from './image-matcher'; // Import our enhanced image matcher
import { errorLogger } from './error-logger'; // Import our error logging system
import seoScheduler from "./seo-scheduler";
import { HealthMonitor } from "./health-monitor";

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
    path.join(publicUploadsDir, "announcements"),
    path.join(publicUploadsDir, "projects")
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

// Enhanced request timeout and mobile compatibility middleware
app.use((req, res, next) => {
  // Set appropriate timeout based on request type
  const timeout = req.path.includes('/upload') ? 60000 : 30000; // 60s for uploads, 30s for others
  
  req.setTimeout(timeout, () => {
    console.warn(`Request timeout (${timeout}ms) for ${req.method} ${req.path}`);
    if (!res.headersSent) {
      res.status(408).json({ 
        message: "Request timeout",
        code: "TIMEOUT",
        path: req.path
      });
    }
  });

  // Set response timeout
  res.setTimeout(timeout, () => {
    console.warn(`Response timeout for ${req.method} ${req.path}`);
    if (!res.headersSent) {
      res.status(408).json({ 
        message: "Response timeout",
        code: "RESPONSE_TIMEOUT"
      });
    }
  });

  // Add mobile-friendly headers
  if (req.headers['user-agent']?.includes('Mobile') || req.headers['user-agent']?.includes('iPhone')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
});

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

// Simple, secure handler for uploaded images - NO FUZZY MATCHING
app.use('/uploads', (req, res, next) => {
  // Only serve files that exist exactly - no substitutions or fallbacks
  const publicPath = path.join('public', 'uploads', req.path);
  if (fs.existsSync(publicPath)) {
    return res.sendFile(path.resolve(publicPath));
  }

  // If file doesn't exist, return 404 - do not serve other files
  console.log(`Image not found: ${req.path}`);
  return res.status(404).json({ error: 'Image not found' });
});

// Debug endpoint to check image paths
app.get('/api/debug/images', (req, res) => {
  const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
  const propertiesDir = path.join(publicUploadsDir, 'properties');

  const images = fs.existsSync(propertiesDir) 
    ? fs.readdirSync(propertiesDir)
      .filter(file => file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.webp'))
    : [];

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

// Custom domain redirect and security middleware
app.use((req, res, next) => {
  const customDomain = process.env.CUSTOM_DOMAIN || 'www.theviewsconsultancy.com';
  const host = req.get('Host');
  const isCustomDomain = host?.includes('theviewsconsultancy.com');
  const isReplitDomain = host?.includes('replit.app') || host?.includes('replit.dev') || host?.includes('janeway.replit.dev');

  // Only redirect from Replit domains to custom domain
  if (host && isReplitDomain && !isCustomDomain) {
    const protocol = 'https';
    // Preserve the original URL path and query parameters
    const redirectUrl = `${protocol}://${customDomain}${req.originalUrl}`;
    console.log(`Redirecting from ${host} to ${customDomain}`);
    return res.redirect(301, redirectUrl);
  }

  // Add security headers for custom domain
  if (isCustomDomain) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Add CORS headers for better compatibility
    res.setHeader('Access-Control-Allow-Origin', `https://${customDomain}`);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  next();
});

(async () => {
  const server = await registerRoutes(app, upload, uploadsDir);

  // Add error logging endpoint (admin/owner only)
  app.get("/api/error-logs", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = req.user as any;
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const count = req.query.count ? parseInt(String(req.query.count)) : 50;
    const recentErrors = errorLogger.getRecentErrors(count);
    res.json({ 
      logs: recentErrors,
      count: recentErrors.length,
      logPath: path.join(process.cwd(), 'logs', 'error.log')
    });
  });

  // Add endpoint to clear error logs (owner only)
  app.post("/api/error-logs/clear", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = req.user as any;
    if (!user || user.role !== 'owner') {
      return res.status(403).json({ message: "Owner access required" });
    }

    const success = errorLogger.clearLogs();
    res.json({ success, message: success ? "Error logs cleared" : "Failed to clear error logs" });
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Handle specific database errors
    if (err.message?.includes('Control plane request failed')) {
      message = "Database temporarily unavailable. Please try again.";
    } else if (err.message?.includes('terminating connection')) {
      message = "Database connection reset. Please refresh and try again.";
    } else if (err.code === 'EADDRINUSE') {
      message = "Server port conflict. Restarting...";
    }

    // Log the error with our error logger
    const userId = _req.user ? (_req.user as any).id : null;
    const context = _req.path || 'unknown';
    errorLogger.logError(err, context, userId);

    res.status(status).json({ message });
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

  // Initialize health monitor
  const healthMonitor = HealthMonitor.getInstance();
  healthMonitor.startMonitoring();

  // Add health check endpoint before starting server
  app.get('/health', (req, res) => {
    const healthStatus = healthMonitor.getHealthStatus();
    const isHealthy = healthMonitor.isHealthy();
    
    res.status(isHealthy ? 200 : 503).json({ 
      status: isHealthy ? 'ok' : 'unhealthy',
      ...healthStatus,
      port: port,
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Add mobile-specific health endpoint
  app.get('/mobile-health', (req, res) => {
    res.status(200).json({ 
      status: 'mobile-ready',
      timestamp: new Date().toISOString(),
      message: 'Backend is responding for mobile clients'
    });
  });

  // Handle graceful shutdown with timeout
  const gracefulShutdown = (signal: string) => {
    console.log(`Received ${signal}, initiating graceful shutdown...`);
    
    const forceExit = setTimeout(() => {
      console.log('Force exit after 10 seconds');
      process.exit(1);
    }, 10000);

    server.close((err) => {
      clearTimeout(forceExit);
      if (err) {
        console.error('Error during server shutdown:', err);
        process.exit(1);
      }
      console.log('Server closed successfully');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon restarts

  // Enhanced error handling
  server.on('error', (err: any) => {
    console.error('Server error occurred:', err);
    
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Server will retry in 3 seconds...`);
      setTimeout(() => {
        server.close();
        server.listen(port, "0.0.0.0");
      }, 3000);
    } else if (err.code === 'ENOTFOUND') {
      console.error('Network error - check connection');
    } else {
      console.error('Unexpected server error:', err.message);
    }
  });

  // Add connection handling
  server.on('connection', (socket) => {
    socket.setTimeout(30000); // 30 second timeout
    socket.on('timeout', () => {
      console.log('Socket timeout, destroying connection');
      socket.destroy();
    });
  });

  // Start server with retry logic
  const startServer = (retries = 3) => {
    server.listen(port, "0.0.0.0", () => {
      log(`🚀 Server successfully started on port ${port}`);
      log(`📱 Mobile access: Use the Replit mobile app preview`);
      log(`🌐 Web access: Click the webview button in Replit`);
      
      // Initialize SEO optimization scheduler
      try {
        seoScheduler.startScheduledTasks();
        log(`✅ SEO scheduler initialized`);
      } catch (seoError) {
        console.error('SEO scheduler initialization failed:', seoError);
      }
    }).on('error', (err: any) => {
      if (retries > 0 && err.code === 'EADDRINUSE') {
        console.log(`Retrying server start in 2 seconds... (${retries} retries left)`);
        setTimeout(() => startServer(retries - 1), 2000);
      } else {
        console.error('Failed to start server after retries:', err);
        process.exit(1);
      }
    });
  };

  startServer();
})();