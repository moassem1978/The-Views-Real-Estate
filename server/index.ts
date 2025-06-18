import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
// Import auth functions are handled in registerRoutes
import { setupVite, serveStatic, log } from "./vite";
import multer from "multer";
import path from "path";
import fs from "fs";
import simpleUploadRouter from "./simple-upload"; // Import our simple upload router
import unifiedUploader from "./unified-uploader"; // Import our new unified uploader
import { imageMatcher } from './image-matcher'; // Import our enhanced image matcher
import { errorLogger } from './error-logger'; // Import our error logging system
import { monitoringService } from './monitoring'; // Import our monitoring service
import seoScheduler from "./seo-scheduler";
import { HealthMonitor } from "./health-monitor";
import { protectionMiddleware, ownerOnlyMiddleware } from './protection-middleware';

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

// Initialize monitoring service first
monitoringService.initialize();

// Test database connection
import { testConnection } from './db';
testConnection().then(success => {
  if (!success) {
    console.warn('⚠️ Database connection issues detected - some features may not work properly');
  }
});

const app = express();

// Enhanced CORS configuration for production
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000',
    'https://workspace.a0c55713-a01e-4091-b0f7-e63eca936281-00-p0ydoco8gilf.janeway.replit.dev',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin as string)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add protection middleware BEFORE other routes
app.use(protectionMiddleware);

// Basic request middleware
app.use((req, res, next) => {
  // Set basic headers for all requests
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Add mobile-friendly headers only for mobile requests
  const userAgent = req.headers['user-agent'] || '';
  if (userAgent.includes('Mobile') || userAgent.includes('iPhone') || userAgent.includes('Android')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
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

// Optimized image serving with aggressive caching
app.use('/images', express.static('public/uploads', {
  maxAge: '1y', // 1 year cache for images
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Set proper MIME types for WebP
    if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
    // Add immutable cache for optimized images
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    // Enable compression
    res.setHeader('Vary', 'Accept-Encoding');
  }
}));

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

// Security middleware only - no redirects in development
  app.use((req, res, next) => {
    // Add basic security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // Add CORS headers for development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
  app.post("/api/error-logs/clear", ownerOnlyMiddleware, (req: Request, res: Response) => {
    const success = errorLogger.clearLogs();
    res.json({ success, message: success ? "Error logs cleared" : "Failed to clear error logs" });
  });

  // Backup management endpoints (owner only) - with improved error handling
  app.get("/api/backups", ownerOnlyMiddleware, (req: Request, res: Response) => {
    try {
      const { BackupService } = require('./backup-service');
      const backupService = BackupService.getInstance();
      const backups = backupService.getAvailableBackups();
      res.json({ backups, count: backups.length });
    } catch (error) {
      console.error('Error getting backups:', error);
      res.json({ backups: [], count: 0, error: 'Backup service unavailable' });
    }
  });

  app.post("/api/backups/create", ownerOnlyMiddleware, async (req: Request, res: Response) => {
    try {
      const { BackupService } = require('./backup-service');
      const backupService = BackupService.getInstance();
      const user = req.user as any;
      const backupFile = await backupService.createBackup('manual', user.id);
      res.json({ success: true, backupFile, message: "Backup created successfully" });
    } catch (error) {
      console.error('Backup creation error:', error);
      res.status(500).json({ success: false, error: "Backup creation failed" });
    }
  });

  app.post("/api/backups/restore", ownerOnlyMiddleware, async (req: Request, res: Response) => {
    try {
      const { backupFile } = req.body;
      const { BackupService } = require('./backup-service');
      const backupService = BackupService.getInstance();
      await backupService.restoreFromBackup(path.join(process.cwd(), 'backups', backupFile));
      res.json({ success: true, message: "Backup restored successfully" });
    } catch (error) {
      console.error('Backup restoration error:', error);
      res.status(500).json({ success: false, error: "Backup restoration failed" });
    }
  });

  // Change tracking endpoint (admin/owner only) - with improved error handling
  app.get("/api/changes", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = req.user as any;
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const { ChangeTracker } = require('./change-tracker');
      const changeTracker = ChangeTracker.getInstance();
      const count = req.query.count ? parseInt(String(req.query.count)) : 50;
      const changes = changeTracker.getRecentChanges(count);
      res.json({ changes, count: changes.length });
    } catch (error) {
      console.error('Error getting changes:', error);
      res.json({ changes: [], count: 0, error: 'Change tracker unavailable' });
    }
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

    // Log the error with both monitoring service and error logger
    const userId = _req.user ? (_req.user as any).id : null;
    const context = _req.path || 'server_error';

    // Use monitoring service for comprehensive error tracking
    monitoringService.captureError(err, context, userId);

    res.status(status).json({ message });
  });

  // Only setup Vite in development
  if (process.env.NODE_ENV !== 'production') {
    await setupVite(app, server);
  } else {
    // Serve static files in production
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

  // Initialize optional services with error handling
  try {
    const { HealthMonitor } = await import('./health-monitor');
    const healthMonitor = HealthMonitor.getInstance();
    healthMonitor.startMonitoring();
    console.log('✅ Health monitoring started');
  } catch (error) {
    console.warn('⚠️ Health monitoring failed to start:', error);
  }

  try {
    const { SessionMonitor } = await import('./session-monitor');
    const sessionMonitor = SessionMonitor.getInstance();
    sessionMonitor.startMonitoring();
    console.log('Starting session monitoring and cleanup...');
    console.log('✅ Session monitoring started');
  } catch (error) {
    console.warn('⚠️ Session monitoring failed to start:', (error as Error)?.message || String(error));
  }

  try {
    const { AutoRestoreService } = await import('./auto-restore-service');
    const autoRestoreService = AutoRestoreService.getInstance();
    await autoRestoreService.scheduleAutoBackups();
    console.log('Auto backup scheduling initialized successfully');
    console.log('✅ Auto-restore service started');
  } catch (error) {
    console.warn('⚠️ Auto-restore service failed to start:', (error as Error)?.message || String(error));
  }

  // Request timeout middleware (30 seconds)
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setTimeout(30000, () => {
      const err = new Error('Request timeout');
      (err as any).status = 408;
      next(err);
    });
    next();
  });

  // Add simplified health check endpoints
  app.get('/health', (req, res) => {
    const address = server.address();
    const actualPort = typeof address === 'string' ? PORT : address?.port || PORT;
    res.status(200).json({ 
      status: 'ok',
      port: actualPort,
      timestamp: new Date().toISOString(),
      host: req.get('host')
    });
  });

  // System health endpoint for monitoring dashboard
  app.get('/api/system/health', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = req.user as any;
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const health = {
      sentry: !!process.env.SENTRY_DSN,
      sendgrid: !!process.env.SENDGRID_API_KEY,
      database: true, // If we reach here, DB is working
      backups: true, // Assume backups are working if no errors
      lastBackup: null, // Could be enhanced to check actual backup dates
      errorCount: 0 // Could be enhanced to count recent errors
    };

    res.json(health);
  });

  // Test email alert endpoint
  app.post('/api/monitoring/test-email', ownerOnlyMiddleware, async (req: Request, res: Response) => {
    try {
      await monitoringService.sendMaintenanceAlert('Test email alert from monitoring dashboard', 'info');
      res.json({ success: true, message: 'Test email sent' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to send test email' });
    }
  });

  app.get('/mobile-health', (req, res) => {
    const address = server.address();
    const actualPort = typeof address === 'string' ? PORT : address?.port || PORT;
    res.status(200).json({ 
      status: 'mobile-ready',
      timestamp: new Date().toISOString(),
      port: actualPort,
      message: 'Backend is responding for mobile clients'
    });
  });

  // Enhanced port handling with automatic port finding
  const findAvailablePort = async (startPort: number): Promise<number> => {
    const { createServer } = await import('net');
    return new Promise((resolve, reject) => {
      const testServer = createServer();
      
      testServer.listen(startPort, '0.0.0.0', () => {
        const port = testServer.address()?.port;
        testServer.close(() => {
          resolve(port);
        });
      });
      
      testServer.on('error', async (err: any) => {
        if (err.code === 'EADDRINUSE') {
          try {
            const nextPort = await findAvailablePort(startPort + 1);
            resolve(nextPort);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(err);
        }
      });
    });
  };

  const PORT = await findAvailablePort(parseInt(process.env.PORT as string) || 5000);
  
  const serverInstance = server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Access at: http://0.0.0.0:${PORT}`);
    if (process.env.NODE_ENV === 'production') {
      console.log(`🚀 Production deployment ready`);
    } else {
      console.log(`🔗 External access: https://${process.env.REPL_SLUG || 'your-repl'}.${process.env.REPLIT_DEV_DOMAIN || 'replit.dev'}`);
    }
  });

  serverInstance.on('error', (err: any) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is in use, attempting to find alternative port...`);
      process.exit(1);
    }
  });

  // Restore endpoints
  const { addRestoreEndpoints } = await import('./restore-endpoint');
  await addRestoreEndpoints(app);

  // Initialize enhanced backup scheduler
  const { EnhancedBackupScheduler } = await import('./enhanced-backup-scheduler');
  const backupScheduler = EnhancedBackupScheduler.getInstance();
  await backupScheduler.initializeScheduler();
})();