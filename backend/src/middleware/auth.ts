import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_campus_connect_jwt_key_2026';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
  studentId?: string;
  facultyId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || (req.query.token as string);

  if (!token) {
    res.status(401).json({ message: 'Authentication required: No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired session token' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        message: `Forbidden: Access requires one of [${roles.join(', ')}] role(s)` 
      });
      return;
    }

    next();
  };
};

export const signToken = (payload: AuthUser): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};
