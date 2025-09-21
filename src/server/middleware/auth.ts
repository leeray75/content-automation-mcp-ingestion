import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger.js';

const AUTH_ENABLED = (process.env.MCP_AUTH_ENABLED || 'false').toLowerCase() === 'true';
const AUTH_BEARER = process.env.MCP_AUTH_BEARER || '';

export function bearerAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!AUTH_ENABLED) {
    logger.debug('Auth middleware: disabled, skipping validation');
    return next();
  }

  logger.debug({ path: req.path, method: req.method }, 'Auth middleware: validating request');

  const auth = req.header('authorization') || req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    logger.warn({ path: req.path, method: req.method }, 'Auth middleware: missing or invalid Authorization header');
    return res.status(401).json({ 
      error: 'unauthorized', 
      message: 'Invalid or missing bearer token' 
    });
  }

  const token = auth.slice('Bearer '.length).trim();
  if (!AUTH_BEARER) {
    logger.error('Auth middleware: MCP_AUTH_BEARER not configured but auth is enabled');
    return res.status(500).json({ 
      error: 'server_error', 
      message: 'Authentication not properly configured' 
    });
  }

  if (token !== AUTH_BEARER) {
    logger.warn({ path: req.path, method: req.method }, 'Auth middleware: invalid bearer token provided');
    return res.status(401).json({ 
      error: 'unauthorized', 
      message: 'Invalid or missing bearer token' 
    });
  }

  logger.debug({ path: req.path, method: req.method }, 'Auth middleware: token validated successfully');
  
  // Add auth context to request
  (req as any).mcpAuth = { authorized: true };
  
  return next();
}

export default bearerAuthMiddleware;
