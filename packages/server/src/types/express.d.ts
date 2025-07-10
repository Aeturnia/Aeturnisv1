import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      email: string;
      roles: string[];
    };
    sessionId?: string;
    id?: string; // For request ID tracking
    validatedStats?: Record<string, unknown>; // For stat validation middleware
  }
}

// Ensure Express types are globally available
export {}