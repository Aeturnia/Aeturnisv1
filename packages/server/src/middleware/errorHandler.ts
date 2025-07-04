import { Request, Response, NextFunction } from 'express';
import { ValidationError, UnauthorizedError, ConflictError, NotFoundError, ForbiddenError } from '../utils/errors';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('🚨 Error:', error);

  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  if (error instanceof UnauthorizedError) {
    return res.status(401).json({
      success: false,
      error: error.message,
    });
  }

  if (error instanceof ForbiddenError) {
    return res.status(403).json({
      success: false,
      error: error.message,
    });
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      error: error.message,
    });
  }

  if (error instanceof ConflictError) {
    return res.status(409).json({
      success: false,
      error: error.message,
    });
  }

  // Default server error
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};