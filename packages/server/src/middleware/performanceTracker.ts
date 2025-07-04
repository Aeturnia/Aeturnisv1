import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import { logger } from '../utils/logger';

export const performanceTracker = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();

  // Set response time header before sending response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = performance.now() - startTime;
    
    // Only set header if response hasn't been sent yet
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    }

    // Log slow requests (> 1000ms)
    if (duration > 1000) {
      logger.warn(`Slow request detected: ${req.method} ${req.url} took ${duration.toFixed(2)}ms`);
    }

    return originalSend.call(this, data);
  };

  next();
};