import type { Request } from 'express';
import { AuthStrategy, AuthResult, AUTH_ERRORS } from './auth-types.js';
import { logger } from '../../../utils/logger.js';

export interface ApiKeyAuthConfig {
  apiKey: string;
}

export class ApiKeyAuthStrategy implements AuthStrategy {
  private config: ApiKeyAuthConfig;

  constructor(config: ApiKeyAuthConfig) {
    this.config = config;
  }

  async validate(req: Request): Promise<AuthResult> {
    try {
      // Check for API key in multiple possible headers
      let apiKey: string | undefined;
      
      // Priority 1: x-api-key header
      apiKey = req.header('x-api-key') || req.header('X-API-Key');
      
      // Priority 2: Authorization header with ApiKey prefix
      if (!apiKey) {
        const auth = req.header('authorization') || req.header('Authorization');
        if (auth && auth.startsWith('ApiKey ')) {
          apiKey = auth.slice('ApiKey '.length).trim();
        }
      }

      if (!apiKey) {
        logger.debug({ path: req.path, method: req.method }, 'API key auth: missing API key header');
        return {
          authorized: false,
          error: {
            code: AUTH_ERRORS.MISSING_API_KEY,
            message: 'Missing API key. Provide via x-api-key header or Authorization: ApiKey <key>'
          }
        };
      }

      // Validate API key configuration
      if (!this.config.apiKey) {
        logger.error('API key auth: API key not configured');
        return {
          authorized: false,
          error: {
            code: AUTH_ERRORS.MISCONFIGURED,
            message: 'API key authentication not properly configured'
          }
        };
      }

      // Validate API key
      const isValid = await this.validateApiKey(apiKey);
      
      if (!isValid) {
        logger.warn({ path: req.path, method: req.method }, 'API key auth: invalid API key provided');
        return {
          authorized: false,
          error: {
            code: AUTH_ERRORS.INVALID_API_KEY,
            message: 'Invalid API key'
          }
        };
      }

      logger.debug({ path: req.path, method: req.method }, 'API key auth: key validated successfully');
      
      return {
        authorized: true,
        principal: {
          id: 'api-key-user',
          roles: ['api-user']
        }
      };

    } catch (error) {
      logger.error({ error, path: req.path, method: req.method }, 'API key auth: validation error');
      return {
        authorized: false,
        error: {
          code: AUTH_ERRORS.SERVER_ERROR,
          message: 'Authentication service error'
        }
      };
    }
  }

  /**
   * Validate API key against configured value
   * Uses constant-time comparison to prevent timing attacks
   */
  private async validateApiKey(providedKey: string): Promise<boolean> {
    try {
      const configuredKey = this.config.apiKey;
      
      // Basic length check first
      if (providedKey.length !== configuredKey.length) {
        return false;
      }

      // Constant-time comparison to prevent timing attacks
      let result = 0;
      for (let i = 0; i < configuredKey.length; i++) {
        result |= configuredKey.charCodeAt(i) ^ providedKey.charCodeAt(i);
      }

      return result === 0;

    } catch (error) {
      logger.debug({ error }, 'API key validation failed');
      return false;
    }
  }
}

export function createApiKeyStrategy(config: ApiKeyAuthConfig): ApiKeyAuthStrategy {
  return new ApiKeyAuthStrategy(config);
}
