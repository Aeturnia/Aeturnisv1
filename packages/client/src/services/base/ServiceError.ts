export class ServiceError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: any;
  public readonly retryable: boolean;

  constructor(
    message: string,
    code: string = 'SERVICE_ERROR',
    options: ServiceErrorOptions = {}
  ) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.statusCode = options.statusCode;
    this.details = options.details;
    this.retryable = options.retryable ?? false;
  }
}

export class NetworkError extends ServiceError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', {
      retryable: true,
      details
    });
    this.name = 'NetworkError';
  }
}

export class ValidationError extends ServiceError {
  constructor(message: string, errors: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', {
      retryable: false,
      details: errors
    });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ServiceError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', {
      statusCode: 401,
      retryable: false
    });
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ServiceError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHZ_ERROR', {
      statusCode: 403,
      retryable: false
    });
    this.name = 'AuthorizationError';
  }
}

export class TimeoutError extends ServiceError {
  constructor(message: string = 'Request timed out') {
    super(message, 'TIMEOUT_ERROR', {
      retryable: true
    });
    this.name = 'TimeoutError';
  }
}

export class RateLimitError extends ServiceError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR', {
      statusCode: 429,
      retryable: true,
      details: { retryAfter }
    });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

interface ServiceErrorOptions {
  statusCode?: number;
  details?: any;
  retryable?: boolean;
}

export class ErrorHandler {
  private static handlers: Map<string, ErrorHandlerFn> = new Map();

  public static register(code: string, handler: ErrorHandlerFn): void {
    this.handlers.set(code, handler);
  }

  public static handle(error: Error): void {
    if (error instanceof ServiceError) {
      const handler = this.handlers.get(error.code);
      if (handler) {
        handler(error);
        return;
      }
    }

    console.error('Unhandled service error:', error);
  }

  public static async handleAsync(
    operation: () => Promise<any>,
    options: ErrorHandlingOptions = {}
  ): Promise<any> {
    try {
      return await operation();
    } catch (error) {
      if (options.fallback && error instanceof ServiceError && error.retryable) {
        return options.fallback();
      }

      if (options.transform) {
        throw options.transform(error as Error);
      }

      throw error;
    }
  }
}

type ErrorHandlerFn = (error: ServiceError) => void;

interface ErrorHandlingOptions {
  fallback?: () => any;
  transform?: (error: Error) => Error;
}