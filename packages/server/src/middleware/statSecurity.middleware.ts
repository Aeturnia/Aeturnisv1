import { Request, Response, NextFunction } from 'express';
import { StatsService } from '../services/StatsService';

/**
 * Security middleware for stat modification endpoints
 * Ensures all stat changes are server-authoritative and validated
 */

interface StatModificationRequest extends Request {
  statUpdates?: Record<string, number>;
  character?: { id: string; level: number; statPoints: number; [key: string]: unknown };
  validatedStats?: Record<string, number>;
}

/**
 * Validates stat modification requests for security
 */
export const validateStatModification = (
  req: StatModificationRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const statUpdates = req.body.statUpdates || req.body;
    
    if (!statUpdates || typeof statUpdates !== 'object') {
      res.status(400).json({
        error: 'Invalid stat update request',
        message: 'Stat updates must be provided as an object'
      });
      return;
    }

    // Get character from request (should be set by auth middleware)
    const character = req.character;
    if (!character) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Character context required for stat modifications'
      });
      return;
    }

    // Validate the stat modification request
    const validation = StatsService.validateStatModification(
      character as any, // Cast to any since we only have partial character data
      statUpdates,
      'client' // Assume client requests unless explicitly marked as server
    );

    if (!validation.valid) {
      res.status(400).json({
        error: 'Invalid stat modification',
        message: 'Stat modification failed validation',
        errors: validation.errors
      });
      return;
    }

    // Store validated stats for use in the route handler
    req.validatedStats = statUpdates;
    req.statUpdates = statUpdates;
    
    next();
  } catch (error) {
    console.error('Stat validation error:', error);
    res.status(500).json({
      error: 'Stat validation failed',
      message: 'Internal error during stat validation'
    });
  }
};

/**
 * Rate limiting specifically for stat modifications
 * Prevents rapid stat manipulation attempts
 */
export const statModificationRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Simple in-memory rate limiting for stat modifications
  // In production, this should use Redis
  
  const key = `stat_mod:${req.ip}:${(req as any).user?.id || 'anonymous'}`;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10; // Max 10 stat modifications per minute
  
  // Simple implementation - in production use Redis with proper expiration
  if (!(global as any).statModRateLimit) {
    (global as any).statModRateLimit = new Map();
  }
  
  const rateLimit = (global as any).statModRateLimit;
  const userRequests = rateLimit.get(key) || [];
  
  // Remove requests outside the window
  const validRequests = userRequests.filter((time: number) => now - time < windowMs);
  
  if (validRequests.length >= maxRequests) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many stat modification attempts. Please wait before trying again.',
      retryAfter: Math.ceil(windowMs / 1000)
    });
    return;
  }
  
  // Add current request
  validRequests.push(now);
  rateLimit.set(key, validRequests);
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    for (const [mapKey, requests] of rateLimit.entries()) {
      const validReqs = requests.filter((time: number) => now - time < windowMs);
      if (validReqs.length === 0) {
        rateLimit.delete(mapKey);
      } else {
        rateLimit.set(mapKey, validReqs);
      }
    }
  }
  
  next();
};

/**
 * Prevents recursive stat calculation loops
 * Tracks ongoing calculations to prevent infinite loops
 */
export const preventStatRecursion = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const characterId = req.params.id || req.params.characterId;
  
  if (!characterId) {
    next();
    return;
  }
  
  // Track ongoing stat calculations
  if (!(global as any).statCalculations) {
    (global as any).statCalculations = new Set();
  }
  
  const calculations = (global as any).statCalculations;
  
  if (calculations.has(characterId)) {
    res.status(409).json({
      error: 'Stat calculation in progress',
      message: 'Another stat calculation is already in progress for this character'
    });
    return;
  }
  
  // Mark calculation as in progress
  calculations.add(characterId);
  
  // Cleanup after request completes
  const cleanup = () => {
    calculations.delete(characterId);
  };
  
  res.on('finish', cleanup);
  res.on('close', cleanup);
  res.on('error', cleanup);
  
  // Safety timeout - remove after 30 seconds max
  setTimeout(cleanup, 30000);
  
  next();
};

/**
 * Audit logging for stat modifications
 * Logs all stat changes for security monitoring
 */
export const auditStatModification = (
  req: StatModificationRequest,
  res: Response,
  next: NextFunction
): void => {
  const originalSend = res.json;
  
  res.json = function(data) {
    // Log successful stat modifications
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const auditLog = {
        timestamp: new Date().toISOString(),
        userId: (req as any).user?.id,
        characterId: req.params.id || req.params.characterId,
        action: 'stat_modification',
        statUpdates: req.statUpdates,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true
      };
      
      // In production, this should be sent to a proper audit logging system
      console.log('[AUDIT] Stat Modification:', JSON.stringify(auditLog));
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};