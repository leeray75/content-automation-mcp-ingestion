import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Middleware to handle X-Request-Id header for request correlation
 * - Uses existing X-Request-Id header if present
 * - Generates new UUID if not present
 * - Sets requestId on request object
 * - Echoes X-Request-Id in response headers
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Get request ID from header or generate new one
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  
  // Set on request for downstream use
  req.requestId = requestId;
  
  // Echo back in response headers
  res.setHeader('x-request-id', requestId);
  
  next();
}
