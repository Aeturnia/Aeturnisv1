// Enhanced Error Classes with Type Guards and Context
export class ValidationError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
    this.context = context;
  }
}

export class UnauthorizedError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'UnauthorizedError';
    this.code = 'UNAUTHORIZED_ERROR';
    this.context = context;
  }
}

export class ConflictError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'ConflictError';
    this.code = 'CONFLICT_ERROR';
    this.context = context;
  }
}

export class NotFoundError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'NotFoundError';
    this.code = 'NOT_FOUND_ERROR';
    this.context = context;
  }
}

export class BadRequestError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'BadRequestError';
    this.code = 'BAD_REQUEST_ERROR';
    this.context = context;
  }
}

export class ForbiddenError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'ForbiddenError';
    this.code = 'FORBIDDEN_ERROR';
    this.context = context;
  }
}

// New Service-Specific Error Classes
export class ServiceError extends Error {
  public readonly code: string;
  public readonly service: string;
  public readonly context?: Record<string, unknown>;

  constructor(service: string, message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'ServiceError';
    this.code = 'SERVICE_ERROR';
    this.service = service;
    this.context = context;
  }
}

export class DatabaseError extends Error {
  public readonly code: string;
  public readonly operation: string;
  public readonly context?: Record<string, unknown>;

  constructor(operation: string, message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'DatabaseError';
    this.code = 'DATABASE_ERROR';
    this.operation = operation;
    this.context = context;
  }
}

// Type Guards for Error Handling
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof Error && error.name === 'ValidationError';
}

export function isUnauthorizedError(error: unknown): error is UnauthorizedError {
  return error instanceof Error && error.name === 'UnauthorizedError';
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof Error && error.name === 'NotFoundError';
}

export function isServiceError(error: unknown): error is ServiceError {
  return error instanceof Error && error.name === 'ServiceError';
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof Error && error.name === 'DatabaseError';
}

export function isKnownError(error: unknown): error is ValidationError | UnauthorizedError | ConflictError | NotFoundError | BadRequestError | ForbiddenError | ServiceError | DatabaseError {
  return isValidationError(error) || 
         isUnauthorizedError(error) || 
         isNotFoundError(error) || 
         isServiceError(error) || 
         isDatabaseError(error) ||
         (error instanceof ConflictError) ||
         (error instanceof BadRequestError) ||
         (error instanceof ForbiddenError);
}

// Error Response Formatter
export interface ErrorResponse {
  error: string;
  code: string;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

export function formatErrorResponse(error: unknown): ErrorResponse {
  const timestamp = new Date().toISOString();
  
  if (isKnownError(error)) {
    return {
      error: error.name,
      code: error.code,
      message: error.message,
      context: error.context,
      timestamp
    };
  }
  
  if (error instanceof Error) {
    return {
      error: 'UnknownError',
      code: 'UNKNOWN_ERROR',
      message: error.message,
      timestamp
    };
  }
  
  return {
    error: 'UnknownError',
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    timestamp
  };
}