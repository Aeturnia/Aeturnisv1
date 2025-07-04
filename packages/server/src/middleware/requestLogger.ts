import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface RequestWithId extends Request {
  id?: string;
  startTime?: number;
}

export const requestLogger = (req: RequestWithId, res: Response, next: NextFunction) => {
  // Assign unique request ID
  req.id = req.headers['x-request-id'] as string || uuidv4();
  req.startTime = Date.now();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.id);

  // Log request
  logger.info('Incoming request', {
    requestId: req.id,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Log response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    
    logger.info('Request completed', {
      requestId: req.id,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });

    return originalSend.call(this, data);
  };

  next();
};