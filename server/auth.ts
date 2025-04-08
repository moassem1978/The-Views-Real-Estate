import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, userRoles } from "@shared/schema";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { sendWelcomeEmail } from "./services/email";

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
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Helper function to create an owner account if it doesn't exist
async function createOwnerIfNotExists() {
  try {
    // Check if any owner exists
    const ownerExists = await storage.hasUserWithRole(userRoles.OWNER);
    
    if (!ownerExists) {
      console.log("Creating initial owner account...");
      const defaultPassword = await hashPassword("owner123"); // Default password
      
      const ownerUser = {
        username: "owner",
        password: defaultPassword,
        email: "owner@theviews.com",
        fullName: "System Owner",
        role: userRoles.OWNER,
        isAgent: true,
        createdAt: new Date().toISOString(),
      };
      
      await storage.createUser(ownerUser);
      console.log("Initial owner account created successfully. Username: owner, Password: owner123");
    }
  } catch (error) {
    console.error("Error creating initial owner account:", error);
  }
}

// Middleware for role-based access control
export function requireRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = req.user as SelectUser;
    if (!user.role || !allowedRoles.includes(user.role)) {
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
      tableName: 'session', // Default table name
      createTableIfMissing: true,
      // Cleanup expired sessions every 15 minutes
      pruneSessionInterval: 15
    }),
    secret: process.env.SESSION_SECRET || "the-views-real-estate-secret-key",
    resave: false,
    // Don't create a session until something is stored
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      // Extended session timeout (24 hours) with rolling expiration for better user experience
      maxAge: 24 * 60 * 60 * 1000,
      // Make sure session cookies work across subdomains
      domain: process.env.NODE_ENV === "production" ? '.theviews.com' : undefined,
      // Prevent client-side JS from accessing cookies
      httpOnly: true,
      // Using lax instead of strict to improve user experience when coming from external sites
      sameSite: 'lax'
    },
    // Enable rolling sessions to extend the session timeout on activity
    rolling: true
  };
  
  // Create the owner account if it doesn't exist
  createOwnerIfNotExists();

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
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
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const newUser = {
        username,
        password: hashedPassword,
        email,
        fullName,
        phone,
        role: userRoles.USER, // Default role is regular user
        isAgent: false,
        createdAt: new Date().toISOString(),
      };

      const user = await storage.createUser(newUser);
      
      // Send welcome email to user and notification to business email
      try {
        await sendWelcomeEmail(user, password);
        console.log(`Registration notification email sent for user: ${user.fullName} (${user.email})`);
      } catch (emailError) {
        console.error("Failed to send registration notification email:", emailError);
        // Continue with the response anyway, don't fail the request if email fails
      }

      req.login(user, (err) => {
        if (err) return next(err);
        // Omit the password from the response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  });
  
  // Admin/Owner endpoint to create users with specific roles
  app.post("/api/users", requireRole([userRoles.OWNER, userRoles.ADMIN]), async (req, res, next) => {
    try {
      const { username, password, email, fullName, phone, role, isAgent } = req.body;
      const currentUser = req.user as SelectUser;
      
      if (!username || !password || !email || !fullName || !role) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }
      
      // Only owners can create admin accounts
      if (role === userRoles.ADMIN && currentUser.role !== userRoles.OWNER) {
        return res.status(403).json({ message: "Only owners can create admin accounts" });
      }
      
      // Nobody can create owner accounts through the API
      if (role === userRoles.OWNER) {
        return res.status(403).json({ message: "Owner accounts cannot be created through the API" });
      }
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const newUser = {
        username,
        password: hashedPassword,
        email,
        fullName,
        phone,
        role,
        isAgent: isAgent || false,
        createdBy: currentUser.id, // Track who created this user
        createdAt: new Date().toISOString(),
      };

      const user = await storage.createUser(newUser);
      
      // Send welcome email with credentials
      try {
        await sendWelcomeEmail(user, password);
        console.log(`Notification email sent to ${user.email}`);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Continue with the response anyway, don't fail the request if email fails
      }

      // Omit the password from the response
      const { password: pwd, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("User creation error:", error);
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid username or password" });
      
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        // Omit the password from the response
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    // Omit the password from the response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
  
  // Get all users (admin and owner only)
  app.get("/api/users", requireRole([userRoles.OWNER, userRoles.ADMIN]), async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      // Omit passwords from the response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      next(error);
    }
  });
  
  // Get user by ID (admin and owner only)
  app.get("/api/users/:id", requireRole([userRoles.OWNER, userRoles.ADMIN]), async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Omit password from the response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      next(error);
    }
  });
  
  // Update user (admin and owner only, with restrictions)
  app.put("/api/users/:id", requireRole([userRoles.OWNER, userRoles.ADMIN]), async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const currentUser = req.user as SelectUser;
      const userToUpdate = await storage.getUser(userId);
      
      if (!userToUpdate) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check permission hierarchy
      if (userToUpdate.role === userRoles.OWNER && currentUser.role !== userRoles.OWNER) {
        return res.status(403).json({ message: "Only owners can update owner accounts" });
      }
      
      if (userToUpdate.role === userRoles.ADMIN && currentUser.role !== userRoles.OWNER) {
        return res.status(403).json({ message: "Only owners can update admin accounts" });
      }
      
      // Don't allow changing role to OWNER
      if (req.body.role === userRoles.OWNER && userToUpdate.role !== userRoles.OWNER) {
        return res.status(403).json({ message: "Cannot promote user to owner role" });
      }
      
      // Don't allow admins to create other admins
      if (currentUser.role === userRoles.ADMIN && req.body.role === userRoles.ADMIN && userToUpdate.role !== userRoles.ADMIN) {
        return res.status(403).json({ message: "Admins cannot promote users to admin role" });
      }
      
      // Hash password if provided
      let updates = { ...req.body };
      if (updates.password) {
        updates.password = await hashPassword(updates.password);
      }
      
      const updatedUser = await storage.updateUser(userId, updates);
      
      // Omit password from the response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      next(error);
    }
  });
  
  // Deactivate user (admin and owner only, with restrictions)
  app.delete("/api/users/:id", requireRole([userRoles.OWNER, userRoles.ADMIN]), async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const currentUser = req.user as SelectUser;
      const userToDeactivate = await storage.getUser(userId);
      
      if (!userToDeactivate) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check permission hierarchy
      if (userToDeactivate.role === userRoles.OWNER) {
        return res.status(403).json({ message: "Owner accounts cannot be deactivated" });
      }
      
      if (userToDeactivate.role === userRoles.ADMIN && currentUser.role !== userRoles.OWNER) {
        return res.status(403).json({ message: "Only owners can deactivate admin accounts" });
      }
      
      // Don't allow self-deactivation
      if (userId === currentUser.id) {
        return res.status(403).json({ message: "Cannot deactivate your own account" });
      }
      
      // Soft delete by setting isActive to false
      await storage.updateUser(userId, { isActive: false });
      
      res.status(200).json({ message: "User deactivated successfully" });
    } catch (error) {
      console.error("Error deactivating user:", error);
      next(error);
    }
  });
}