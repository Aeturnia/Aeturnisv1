import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
      });
    }

    const payload = await authService.verifyToken(token);
    
    req.user = {
      userId: payload.userId,
      email: payload.email,
      roles: payload.roles,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Invalid token',
    });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const hasRole = roles.some(role => req.user!.roles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
};