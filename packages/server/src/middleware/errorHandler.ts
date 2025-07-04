import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ValidationError, UnauthorizedError, ConflictError, NotFoundError, ForbiddenError } from '../utils/errors';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  requestId?: string;
}

export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request & { id?: string },
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  // Default error values
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = undefined;

  // Handle known error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err instanceof ValidationError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.message || 'Validation failed';
  } else if (err instanceof UnauthorizedError) {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = err.message || 'Unauthorized';
  } else if (err instanceof ConflictError) {
    statusCode = 409;
    code = 'CONFLICT';
    message = err.message || 'Resource conflict';
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    code = 'NOT_FOUND';
    message = err.message || 'Resource not found';
  } else if (err instanceof ForbiddenError) {
    statusCode = 403;
    code = 'FORBIDDEN';
    message = err.message || 'Access forbidden';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid ID format';
  }

  // Log error
  logger.error('Error occurred:', {
    requestId: req.id,
    error: {
      message: err.message,
      stack: err.stack,
      statusCode,
      code,
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
    },
  });

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
    },
    requestId: req.id,
  };

  // Include details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = details || err.stack;
  }

  res.status(statusCode).json(errorResponse);
};