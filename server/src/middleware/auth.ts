import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

interface JwtPayload {
  userId: number;
  email: string;
  name: string;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    // Verify user still exists
    const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(payload.userId) as any;
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(payload.userId) as any;
    
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name
      };
    }
  } catch (error) {
    // Ignore token errors for optional auth
  }

  next();
};
