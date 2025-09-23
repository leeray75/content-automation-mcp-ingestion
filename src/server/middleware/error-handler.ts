import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../utils/validation.js';
import { logger } from '../../utils/logger.js';

/**
 * Express error handling middleware that provides standardized error responses
 * - Maps ValidationError to HTTP 400 with detailed error information
 * - Maps all other errors to HTTP 500 with safe error envelope
 * - Includes request correlation ID and timestamp in all responses
 * - Logs all errors for debugging
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = req.requestId || 'unknown';
  const timestamp = new Date().toISOString();
  
  // Log the error with request context
  logger.error({ error, requestId, url: req.url, method: req.method }, 'Request error');
  
  // Handle ValidationError (400 Bad Request)
  if (error instanceof ValidationError) {
    res.status(400).json({
      error: 'Validation failed',
      message: error.message,
      details: error.details,
      timestamp,
      requestId
    });
    return;
  }
  
  // Handle all other errors (500 Internal Server Error)
  // Don't expose internal error details in production
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    timestamp,
    requestId
  });
}
