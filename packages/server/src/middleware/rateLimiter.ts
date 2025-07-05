import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

// Create rate limiter with memory store (no Redis dependency)
export const rateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}) => {
  // Disable rate limiting in test environment
  if (process.env.NODE_ENV === 'test') {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }

  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: options.message || 'Too many requests from this IP',
      },
    },
    standardHeaders: options.standardHeaders || true,
    legacyHeaders: options.legacyHeaders || false,
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
      });
      
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: options.message || 'Too many requests from this IP',
        },
      });
    },
  });
};

// Common rate limiters
export const generalLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later',
});

export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later',
});

export const apiLimiter = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  message: 'API rate limit exceeded, please try again later',
});