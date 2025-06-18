
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { pool } from "./db";
import { User as SelectUser } from "@shared/schema";
import { userRoles } from "@shared/schema";
import nodemailer from "nodemailer";
import { setupOTPAuth } from "./otp-auth";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    const parts = stored.split(".");
    if (parts.length !== 2) {
      console.error("Invalid password format in database");
      return false;
    }
    
    const [hashed, salt] = parts;
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

// Create or reset the owner account
async function ensureOwnerAccount() {
  try {
    console.log("Ensuring owner account exists with updated credentials...");
    
    // First check if the owner exists - use lowercase as in database
    let owner = await storage.getUserByUsername("owner");
    // Use environment variable with fallback for development only
    const ownerPassword = process.env.OWNER_PASSWORD || "owner123"; // Fallback only for development
    
    if (!owner) {
      // Create new owner account with lowercase username
      console.log("Creating new owner account");
      const hashedPassword = await hashPassword(ownerPassword);
      
      const ownerUser = {
        username: "owner", // Use lowercase as expected in existing database
        password: hashedPassword,
        email: "owner@theviews.com",
        fullName: "System Owner",
        role: userRoles.OWNER,
        isAgent: true,
        // isActive is defined with a default value in the schema
        createdAt: new Date().toISOString(),
      };
      
      owner = await storage.createUser(ownerUser);
      console.log("Owner account created successfully");
      return;
    }
    
    // Owner exists - ensure the password is correct
    console.log("Updating owner account password");
    const hashedPassword = await hashPassword(ownerPassword);
    
    await storage.updateUser(owner.id, {
      password: hashedPassword,
      isActive: true, // Ensure account is active
    });
    
    console.log("Owner account credentials updated successfully");
    
    // Also ensure there's at least one admin account
    const dina = await storage.getUserByUsername("Dina");
    if (dina) {
      console.log("Admin account 'Dina' exists, ensuring it's active");
      await storage.updateUser(dina.id, {
        isActive: true,
      });
    }
    
  } catch (error) {
    console.error("Error ensuring owner account:", error);
  }
}

// Authentication middleware
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // For development, only bypass for public endpoints
  const publicEndpoints = [
    '/api/properties',
    '/api/announcements', 
    '/api/testimonials',
    '/api/site-settings',
    '/health',
    '/mobile-health'
  ];
  
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.path.startsWith(endpoint));
  
  if (isPublicEndpoint && req.method === 'GET') {
    return next();
  }
  
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  next();
}

// Middleware for role-based access control
export function requireRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const user = req.user as SelectUser;
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    next();
  };
}

export function setupAuth(app: Express) {
  // Set up PostgreSQL session store
  const PostgresSessionStore = connectPgSimple(session);
  
  const sessionSettings: session.SessionOptions = {
    store: new PostgresSessionStore({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
      // Clean up expired sessions every hour for better performance
      pruneSessionInterval: 60, // 1 hour in minutes
      // Remove sessions older than 24 hours
      ttl: 24 * 60 * 60, // 24 hours in seconds
      schemaName: 'public'
    }),
    secret: process.env.SESSION_SECRET || "the-views-real-estate-secret-key-updated-2025-05-11",
    // Don't save unchanged sessions
    resave: false,
    // Don't create empty sessions
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax"
    },
    // Enable rolling sessions to extend the session timeout on any activity
    rolling: true,
    // Use a custom name with timestamp to force new sessions on update
    name: 'theviews.sid.secure'
  };
  
  // Ensure owner account exists with correct credentials
  ensureOwnerAccount();

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Set up OTP authentication endpoints after passport is initialized
  setupOTPAuth(app);

  // Debug authentication attempts
  passport.use(
    new LocalStrategy(async (username: string, password: string, done: any) => {
      try {
        console.log(`Authentication attempt for username: ${username}`);
        
        // Try exact match first
        let user = await storage.getUserByUsername(username);
        
        // If not found, try case-insensitive match (for better UX)
        if (!user) {
          console.log(`User not found with exact username match, trying case-insensitive match`);
          
          // Convert username to lowercase for case-insensitive matching
          const lowercaseUsername = username.toLowerCase();
          if (lowercaseUsername === 'owner') {
            user = await storage.getUserByUsername('owner');
            console.log(`Case-insensitive match for 'owner' ${user ? 'found' : 'not found'}`);
          } else if (lowercaseUsername === 'dina') {
            user = await storage.getUserByUsername('Dina');
            console.log(`Case-insensitive match for 'dina' ${user ? 'found' : 'not found'}`);
          }
        }
        
        if (!user) {
          console.log(`Authentication failed: user ${username} not found`);
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // Check if account is active
        if (!user.isActive) {
          console.log(`Authentication failed: account ${username} is inactive`);
          return done(null, false, { message: "Account is inactive" });
        }
        
        // Verify password
        const passwordValid = await comparePasswords(password, user.password);
        console.log(`Password validation for ${username}: ${passwordValid ? 'success' : 'failed'}`);
        
        if (!passwordValid) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        console.log(`Authentication successful for ${user.username} (${user.role})`);
        return done(null, user);
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log(`Serializing user: ${user.username} (ID: ${user.id})`);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        console.error(`Failed to deserialize user with ID ${id}: User not found`);
        return done(null, false);
      }
      
      if (!user.isActive) {
        console.log(`Deserialize failed: user ${id} is inactive`);
        return done(null, false);
      }
      
      done(null, user);
    } catch (error) {
      console.error(`Error deserializing user ${id}:`, error);
      done(error);
    }
  });

  // Public registration endpoint - only creates regular users
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, email, fullName, phone } = req.body;
      
      if (!username || !password || !email || !fullName) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }
      
      // Check if username is already taken
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Create the user with the user role
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        fullName,
        phone: phone || "",
        role: userRoles.USER,
        isAgent: false,
        // isActive has a default value of true in the schema
        createdAt: new Date().toISOString(),
      });
      
      // Send notification email to admin
      try {
        // Create test account - for development only
        const testAccount = await nodemailer.createTestAccount();
        
        // Create reusable transporter
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || "smtp.ethereal.email",
          port: parseInt(process.env.EMAIL_PORT || "587"),
          secure: process.env.EMAIL_SECURE === "true", 
          auth: {
            user: process.env.EMAIL_USER || testAccount.user,
            pass: process.env.EMAIL_PASSWORD || testAccount.pass,
          },
        });
        
        console.log("Email transporter initialized with test account");
        
        // Send mail with defined transport object
        const info = await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"The Views Real Estate" <notifications@theviews.com>',
          to: process.env.ADMIN_EMAIL || "admin@theviews.com",
          subject: "New User Registration",
          text: `A new user has registered:\n\nUsername: ${username}\nEmail: ${email}\nFull Name: ${fullName}\nPhone: ${phone || "Not provided"}`,
          html: `
            <h2>New User Registration</h2>
            <p>A new user has registered on The Views Real Estate website:</p>
            <ul>
              <li><strong>Username:</strong> ${username}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Full Name:</strong> ${fullName}</li>
              <li><strong>Phone:</strong> ${phone || "Not provided"}</li>
            </ul>
          `,
        });
        
        console.log("Registration notification email sent:", info.messageId);
        // For development only - show test URL
        if (!process.env.EMAIL_HOST) {
          console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
        }
      } catch (emailError) {
        // Don't fail registration if email fails
        console.error("Failed to send registration notification email:", emailError);
      }
      
      // Log in the user automatically
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return the user without the password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error registering user" });
    }
  });

  // Enhanced login endpoint with improved session handling
  app.post("/api/login", (req, res, next) => {
    console.log('=== SESSION DEBUG - Login Attempt ===');
    console.log(`Login attempt for username: ${req.body.username}`);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Session before login:', {
      sessionID: req.sessionID,
      session: req.session,
      isAuthenticated: req.isAuthenticated(),
      cookies: req.headers.cookie
    });
    
    // Validate request body format
    if (!req.body || typeof req.body.username !== 'string' || typeof req.body.password !== 'string') {
      console.error('Invalid login request format:', req.body);
      return res.status(400).json({ message: "Invalid request format. Username and password are required." });
    }
    
    // Clean the input data
    const cleanUsername = req.body.username.trim();
    const cleanPassword = req.body.password;
    
    if (!cleanUsername || !cleanPassword) {
      console.error('Empty username or password provided');
      return res.status(400).json({ message: "Username and password cannot be empty." });
    }
    
    console.log(`Cleaned username: "${cleanUsername}"`);
    
    // Update request body with cleaned data for passport
    req.body.username = cleanUsername;
    req.body.password = cleanPassword;
    
    passport.authenticate("local", (err: any, user: any, info: any) => {
      console.log('=== SESSION DEBUG - Passport Callback ===');
      console.log('Authentication result:', { err: !!err, user: !!user, info });
      console.log('Session during auth:', {
        sessionID: req.sessionID,
        sessionExists: !!req.session,
        isAuthenticated: req.isAuthenticated()
      });
      
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Authentication service error" });
      }
      
      if (!user) {
        console.log(`Login failed for ${cleanUsername}: ${info?.message || 'Unknown reason'}`);
        console.log('Session after failed auth:', req.session);
        return res.status(401).json({ message: info?.message || "Invalid username or password" });
      }
      
      // Check if the user is active
      if (!user.isActive) {
        console.log(`Login rejected for inactive account: ${cleanUsername}`);
        return res.status(403).json({ message: "Your account has been deactivated" });
      }
      
      // Process login with retry mechanism
      const processLogin = (attempt = 1) => {
        req.login(user, (loginErr) => {
          console.log('=== SESSION DEBUG - Login Process ===');
          console.log(`Attempt ${attempt} for user: ${req.body.username}`);
          console.log('Session before req.login:', {
            sessionID: req.sessionID,
            session: req.session,
            isAuthenticated: req.isAuthenticated()
          });
          
          if (loginErr) {
            console.error(`Session creation error for ${req.body.username} (attempt ${attempt}):`, loginErr);
            console.log('Session after login error:', req.session);
            
            // Retry login if session creation fails (up to 3 attempts)
            if (attempt < 3) {
              console.log(`Retrying login for ${req.body.username}, attempt ${attempt + 1}`);
              return setTimeout(() => processLogin(attempt + 1), 100);
            }
            
            return next(loginErr);
          }
          
          // Log successful login
          console.log('=== SESSION DEBUG - Login Success ===');
          console.log(`Login successful for ${user.username} (${user.role})`);
          console.log(`Session ID: ${req.sessionID}`);
          console.log('Session after successful login:', {
            sessionID: req.sessionID,
            session: req.session,
            isAuthenticated: req.isAuthenticated(),
            user: req.user
          });
          
          // Set session to expire in 1 hour (renewable)
          if (req.session) {
            req.session.cookie.maxAge = 60 * 60 * 1000;
            console.log('Session cookie settings:', {
              maxAge: req.session.cookie.maxAge,
              expires: req.session.cookie.expires,
              secure: req.session.cookie.secure,
              httpOnly: req.session.cookie.httpOnly,
              sameSite: req.session.cookie.sameSite
            });
            
            // Force session save to ensure it's properly persisted
            req.session.save((saveErr) => {
              console.log('=== SESSION DEBUG - Session Save ===');
              if (saveErr) {
                console.error(`Error saving session for ${user.username}:`, saveErr);
                console.log('Session state during save error:', req.session);
              } else {
                console.log(`Session created with 1-hour expiration for ${user.username}`);
                console.log('Final session state:', {
                  sessionID: req.sessionID,
                  expires: req.session.cookie.expires,
                  isAuthenticated: req.isAuthenticated()
                });
              }
              
              // Return the user without the password
              const { password, ...userWithoutPassword } = user;
              res.json(userWithoutPassword);
            });
          } else {
            // Return the user even if session save fails
            const { password, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
          }
        });
      };
      
      // Start the login process
      processLogin();
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    // Only attempt to log out if authenticated
    if (req.isAuthenticated()) {
      const username = (req.user as SelectUser).username;
      console.log(`Logout initiated for ${username}`);
      
      req.logout((err) => {
        if (err) {
          console.error(`Logout error for ${username}:`, err);
          return next(err);
        }
        
        // Destroy the session after logout
        req.session.destroy((err) => {
          if (err) {
            console.error(`Session destruction error for ${username}:`, err);
            return res.status(500).json({ message: "Error during logout" });
          }
          console.log(`Logout successful for ${username}`);
          // Clear the cookie with the updated name
          res.clearCookie("theviews.sid.secure", { path: '/' });
          return res.status(200).json({ message: "Logged out successfully" });
        });
      });
    } else {
      // No active session to log out from
      console.log("Logout attempted with no active session");
      res.status(200).json({ message: "No active session" });
    }
  });

  app.get("/api/user", (req, res) => {
    console.log('=== SESSION DEBUG - User Endpoint ===');
    console.log('Session info:', {
      sessionID: req.sessionID,
      session: req.session,
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      cookies: req.headers.cookie
    });
    
    try {
      // Check authentication status
      if (!req.isAuthenticated()) {
        console.log('User endpoint - authentication failed');
        console.log('Session details:', req.session);
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = req.user as SelectUser;
      
      // Enhanced session management
      if (req.session) {
        // Renew session to 1 hour with each authenticated request
        req.session.cookie.maxAge = 60 * 60 * 1000; // 1 hour
        
        // Explicitly touch the session to update activity time
        req.session.touch();
        
        // Force session save to ensure it's persisted
        req.session.save((err) => {
          if (err) {
            console.error(`Error saving session for ${user.username}:`, err);
          } else {
            console.log(`Session renewed for ${user.username}, expires: ${req.session.cookie.expires}`);
          }
        });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error in /api/user endpoint:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Enhanced session refresh endpoint
  app.post("/api/auth/refresh", (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get user and extend session
      const user = req.user as SelectUser;
      
      if (req.session) {
        // Renew session to 1 hour on explicit refresh
        req.session.cookie.maxAge = 60 * 60 * 1000; // 1 hour
        
        // Explicitly save to ensure persistence
        req.session.save((err) => {
          if (err) {
            console.error(`Error saving refreshed session for ${user.username}:`, err);
          } else {
            console.log(`Session explicitly refreshed for ${user.username}, expires: ${req.session.cookie.expires}`);
          }
        });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error in session refresh endpoint:', error);
      res.status(500).json({ message: "Failed to refresh session" });
    }
  });
  
  // Add an auth status check endpoint for debugging
  app.get("/api/auth/status", (req, res) => {
    console.log("Auth status check, authenticated:", req.isAuthenticated());
    console.log("Session:", req.session ? "exists" : "missing");
    console.log("Session ID:", req.sessionID);
    console.log("User:", req.user ? JSON.stringify(req.user, null, 2) : "not logged in");
    
    if (req.isAuthenticated()) {
      res.json({
        authenticated: true,
        user: req.user,
        sessionID: req.sessionID,
        sessionExpires: req.session?.cookie.expires
      });
    } else {
      res.json({
        authenticated: false,
        sessionID: req.sessionID,
        sessionExists: !!req.session
      });
    }
  });
}
