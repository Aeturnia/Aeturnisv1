import { Express } from 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      email: string;
      roles: string[];
    };
    sessionId?: string;
    id?: string; // For request ID tracking
  }
}