/**
 * Standardized API Response Types
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode?: number;
  details?: unknown;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

// Helper functions for creating standardized responses
export function createSuccessResponse<T>(data: T, message?: string): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    message
  };
}

export function createErrorResponse(error: string, message: string, details?: unknown): ApiErrorResponse {
  return {
    success: false,
    error,
    message,
    details
  };
}