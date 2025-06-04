import { Express, Request, Response } from "express";
import { storage } from "./storage";
import crypto from "crypto";

// In-memory OTP storage (for production, use Redis or database)
const otpStore = new Map<string, { code: string; expires: number; userId: number }>();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Clean expired OTPs
function cleanExpiredOTPs() {
  const now = Date.now();
  const entries = Array.from(otpStore.entries());
  for (const [key, value] of entries) {
    if (value.expires < now) {
      otpStore.delete(key);
    }
  }
}

export function setupOTPAuth(app: Express) {
  // Request OTP endpoint
  app.post("/api/auth/request-otp", async (req: Request, res: Response) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      // Find user by username (case-insensitive)
      let user = await storage.getUserByUsername(username.toLowerCase());
      if (!user && username.toLowerCase() === 'owner') {
        user = await storage.getUserByUsername('owner');
      }
      
      if (!user || !user.isActive) {
        return res.status(404).json({ message: "User not found or inactive" });
      }
      
      // Generate OTP
      const otp = generateOTP();
      const sessionId = crypto.randomBytes(32).toString('hex');
      const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
      
      // Store OTP
      otpStore.set(sessionId, {
        code: otp,
        expires,
        userId: user.id
      });
      
      // Clean expired OTPs
      cleanExpiredOTPs();
      
      console.log(`OTP generated for ${username}: ${otp} (Session: ${sessionId})`);
      
      // In development, return OTP in response
      res.json({
        message: "OTP sent successfully",
        sessionId,
        // For development only - remove in production
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
      
    } catch (error) {
      console.error("Error generating OTP:", error);
      res.status(500).json({ message: "Failed to generate OTP" });
    }
  });
  
  // Verify OTP endpoint
  app.post("/api/auth/verify-otp", async (req: Request, res: Response) => {
    try {
      const { sessionId, otp } = req.body;
      
      if (!sessionId || !otp) {
        return res.status(400).json({ message: "Session ID and OTP are required" });
      }
      
      const otpData = otpStore.get(sessionId);
      
      if (!otpData) {
        return res.status(404).json({ message: "Invalid session or OTP expired" });
      }
      
      if (otpData.expires < Date.now()) {
        otpStore.delete(sessionId);
        return res.status(400).json({ message: "OTP expired" });
      }
      
      if (otpData.code !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
      
      // OTP verified, get user and create session
      const user = await storage.getUser(otpData.userId);
      if (!user || !user.isActive) {
        otpStore.delete(sessionId);
        return res.status(404).json({ message: "User not found or inactive" });
      }
      
      // Login user
      req.login(user, (err) => {
        if (err) {
          console.error("Error creating session:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        
        // Clean up OTP
        otpStore.delete(sessionId);
        
        console.log(`User ${user.username} logged in via OTP`);
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.json({
          message: "Login successful",
          user: userWithoutPassword
        });
      });
      
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });
}