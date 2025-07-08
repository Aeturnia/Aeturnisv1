/**
 * Response utility functions for standardized API responses
 */

import { Response } from 'express';
import { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from '../types/api.types';

/**
 * Send a successful response
 */
export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode: number = 200): Response {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    message
  };
  return res.status(statusCode).json(response);
}

/**
 * Send an error response
 */
export function sendError(res: Response, error: string, message: string, statusCode: number = 500, details?: any): Response {
  const response: ApiErrorResponse = {
    success: false,
    error,
    message,
    details
  };
  return res.status(statusCode).json(response);
}

/**
 * Send a validation error response
 */
export function sendValidationError(res: Response, message: string, details?: any): Response {
  return sendError(res, 'Validation Error', message, 400, details);
}

/**
 * Send a not found error response
 */
export function sendNotFound(res: Response, resource: string, identifier?: string): Response {
  const message = identifier 
    ? `${resource} with ID '${identifier}' not found`
    : `${resource} not found`;
  return sendError(res, 'Not Found', message, 404);
}

/**
 * Send an unauthorized error response
 */
export function sendUnauthorized(res: Response, message: string = 'Authentication required'): Response {
  return sendError(res, 'Unauthorized', message, 401);
}

/**
 * Send a generic response based on success status
 */
export function sendResponse<T>(res: Response, success: boolean, data?: T, message?: string, error?: string, statusCode?: number): Response {
  const response: ApiResponse<T> = {
    success,
    data,
    message,
    error
  };
  return res.status(statusCode || (success ? 200 : 500)).json(response);
}