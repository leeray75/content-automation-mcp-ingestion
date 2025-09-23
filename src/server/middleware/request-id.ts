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
  // Get request ID from header (case-insensitive) or generate new one
  let requestId: string | string[] | undefined;
  
  // Check for various case combinations of the header
  for (const key of Object.keys(req.headers)) {
    if (key.toLowerCase() === 'x-request-id') {
      requestId = req.headers[key];
      break;
    }
  }
  
  // Handle array headers by taking the first value
  if (Array.isArray(requestId)) {
    requestId = requestId[0];
  }
  
  // Use existing ID or generate new one if empty/missing
  const finalRequestId = (requestId && requestId.trim()) || randomUUID();
  
  // Set on request for downstream use
  req.requestId = finalRequestId;
  
  // Echo back in response headers
  res.setHeader('x-request-id', finalRequestId);
  
  next();
}
