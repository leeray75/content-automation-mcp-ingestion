/**
 * Authentication module for MCP ingestion server
 * 
 * Provides modular authentication middleware supporting:
 * - JWT token validation
 * - API key authentication
 * - Configurable auth strategies
 */

export { createAuthMiddleware, getAuthConfig } from './auth-factory.js';
export { createJwtStrategy } from './jwt-auth.js';
export { createApiKeyStrategy } from './api-key-auth.js';
export type {
  AuthStrategy,
  AuthResult,
  AuthPrincipal,
  AuthError,
  AuthConfig,
  AuthMethod
} from './auth-types.js';
export { AUTH_METHODS, AUTH_ERRORS } from './auth-types.js';

// Default export for backward compatibility
export { createAuthMiddleware as default } from './auth-factory.js';
