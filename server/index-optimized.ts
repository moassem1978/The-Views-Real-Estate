
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import path from "path";
import fs from "fs";

const app = express();

// Minimal middleware stack
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Optimized static file serving
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads'), {
  maxAge: '1d',
  etag: false,
  lastModified: false
}));

app.use(express.static('public', {
  maxAge: '1h',
  etag: false
}));

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Enable property updates
app.use('/api', (req, res, next) => {
  console.log(`🔄 API Request: ${req.method} ${req.path}`);
  next();
});

// Minimal error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err.message);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

async function startServer() {
  try {
    // Test database connection
    const { testConnection } = await import('./db');
    const dbOk = await testConnection();
    if (!dbOk) {
      console.warn('⚠️ Database connection issues - some features may be limited');
    }

    // Register routes
    const server = await registerRoutes(app);
    
    // Setup Vite only in development
    if (process.env.NODE_ENV !== 'production') {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const PORT = process.env.PORT || 5000;
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Optimized server running on port ${PORT}`);
      console.log(`🚀 Performance mode: ${process.env.NODE_ENV || 'development'}`);
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
