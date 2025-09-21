import type { Request, Response, NextFunction } from 'express';
import { AuthStrategy, AuthConfig, AuthMethod, AUTH_METHODS } from './auth-types.js';
import { createJwtStrategy } from './jwt-auth.js';
import { createApiKeyStrategy } from './api-key-auth.js';
import { logger } from '../../../utils/logger.js';

/**
 * No-op authentication strategy for when auth is disabled
 */
class NoAuthStrategy implements AuthStrategy {
  async validate(req: Request) {
    return { authorized: true };
  }
}

/**
 * Create authentication strategy based on configuration
 */
function createAuthStrategy(config: AuthConfig): AuthStrategy {
  const method = config.method.toLowerCase() as AuthMethod;

  if (!AUTH_METHODS.includes(method)) {
    logger.error(`Invalid auth method: ${config.method}. Valid methods: ${AUTH_METHODS.join(', ')}`);
    throw new Error(`Invalid authentication method: ${config.method}`);
  }

  switch (method) {
    case 'none':
      return new NoAuthStrategy();

    case 'jwt':
      if (!config.jwtSecret) {
        throw new Error('JWT authentication requires MCP_JWT_SECRET to be configured');
      }
      return createJwtStrategy({
        secret: config.jwtSecret,
        issuer: config.issuer,
        audience: config.audience
      });

    case 'apikey':
      if (!config.apiKey) {
        throw new Error('API key authentication requires MCP_API_KEY to be configured');
      }
      return createApiKeyStrategy({
        apiKey: config.apiKey
      });

    default:
      throw new Error(`Unsupported authentication method: ${method}`);
  }
}

/**
 * Load authentication configuration from environment variables
 */
function loadAuthConfig(): AuthConfig {
  const enabled = (process.env.MCP_AUTH_ENABLED || 'false').toLowerCase() === 'true';
  const method = process.env.MCP_AUTH_METHOD || 'none';

  return {
    enabled,
    method,
    jwtSecret: process.env.MCP_JWT_SECRET,
    apiKey: process.env.MCP_API_KEY,
    issuer: process.env.MCP_AUTH_ISSUER || 'content-automation-platform',
    audience: process.env.MCP_AUTH_AUDIENCE || 'mcp-ingestion'
  };
}

/**
 * Create Express middleware for authentication
 */
export function createAuthMiddleware(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  const config = loadAuthConfig();
  
  // Log configuration (without secrets)
  logger.info({
    enabled: config.enabled,
    method: config.method,
    issuer: config.issuer,
    audience: config.audience,
    hasJwtSecret: !!config.jwtSecret,
    hasApiKey: !!config.apiKey
  }, 'Auth middleware configuration loaded');

  if (!config.enabled) {
    logger.info('Authentication disabled, using pass-through middleware');
    return async (req: Request, res: Response, next: NextFunction) => {
      logger.debug({ path: req.path, method: req.method }, 'Auth middleware: disabled, skipping validation');
      next();
    };
  }

  // Create strategy
  let strategy: AuthStrategy;
  try {
    strategy = createAuthStrategy(config);
    logger.info(`Authentication enabled with method: ${config.method}`);
  } catch (error) {
    logger.error({ error }, 'Failed to create authentication strategy');
    // Return middleware that always returns 500
    return async (req: Request, res: Response, next: NextFunction) => {
      logger.error({ path: req.path, method: req.method }, 'Auth middleware: misconfigured');
      res.status(500).json({
        error: 'server_error',
        message: 'Authentication not properly configured'
      });
    };
  }

  // Return configured middleware
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.debug({ path: req.path, method: req.method }, `Auth middleware: validating with ${config.method}`);
      
      const result = await strategy.validate(req);
      
      if (result.authorized) {
        logger.debug({ path: req.path, method: req.method }, 'Auth middleware: validation successful');
        
        // Add auth context to request
        (req as any).mcpAuth = {
          authorized: true,
          principal: result.principal
        };
        
        next();
      } else {
        const error = result.error;
        logger.warn({ 
          path: req.path, 
          method: req.method, 
          errorCode: error?.code 
        }, 'Auth middleware: validation failed');
        
        // Determine HTTP status based on error type
        const status = error?.code === 'server_error' || error?.code === 'misconfigured' ? 500 : 401;
        
        res.status(status).json({
          error: error?.code || 'unauthorized',
          message: error?.message || 'Authentication failed'
        });
      }
    } catch (error) {
      logger.error({ error, path: req.path, method: req.method }, 'Auth middleware: unexpected error');
      res.status(500).json({
        error: 'server_error',
        message: 'Authentication service error'
      });
    }
  };
}

/**
 * Get current authentication configuration (for metadata endpoints)
 */
export function getAuthConfig(): { enabled: boolean; method: string } {
  const config = loadAuthConfig();
  return {
    enabled: config.enabled,
    method: config.method
  };
}
