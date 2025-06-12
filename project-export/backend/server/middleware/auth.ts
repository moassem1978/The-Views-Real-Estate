import { Request, Response, NextFunction } from 'express';

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  console.log("Session data:", req.session);
  console.log("User authenticated:", req.isAuthenticated());
  console.log("User object:", req.user);
  
  if (req.isAuthenticated?.() || req.session?.user) {
    return next();
  }
  
  return res.status(403).json({ message: "Not logged in" });
}

export function requireRole(role: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() && !req.session?.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userRole = req.user?.role || req.session?.user?.role;
    const requiredRoles = Array.isArray(role) ? role : [role];
    
    if (!requiredRoles.includes(userRole)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    return next();
  };
}

export function requireOwnerOrAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() && !req.session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  const userRole = req.user?.role || req.session?.user?.role;
  
  if (userRole !== 'owner' && userRole !== 'admin') {
    return res.status(403).json({ message: "Admin or owner access required" });
  }
  
  return next();
}