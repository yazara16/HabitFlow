import type { Request, Response, NextFunction } from "express";
import db from "../db";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      authUserId?: string;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader;

  // For development, allow all requests
  // Extract user ID from URL params
  const userId = req.params.userId;
  if (userId) {
    req.authUserId = userId;
    return next();
  }

  // If no userId in params, try to extract from token (future implementation)
  if (token === 'temp-token') {
    return next(); // Allow temp-token for development
  }

  // For now, allow all requests in development
  // TODO: Implement proper JWT verification in production
  return next();
};
