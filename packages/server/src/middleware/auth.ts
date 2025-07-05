import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { sessionManager } from '../services/index';

const authService = new AuthService();

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
  sessionId?: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required',
      });
      return;
    }

    const payload = await authService.verifyToken(token);
    
    req.user = {
      userId: payload.userId,
      email: payload.email,
      roles: payload.roles,
    };

    // Optional: Check for session ID in custom header
    const sessionId = req.headers['x-session-id'] as string;
    if (sessionId) {
      const session = await sessionManager.getSession(sessionId);
      if (session && session.userId === payload.userId) {
        req.sessionId = sessionId;
        // Extend session on valid access
        await sessionManager.extendSession(sessionId);
      }
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Invalid token',
    });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const hasRole = roles.some(role => req.user!.roles.includes(role));
    
    if (!hasRole) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};