/**
 * Authentication types and interfaces for the MCP ingestion server
 */

export interface AuthPrincipal {
  id?: string;
  roles?: string[];
  [key: string]: any;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthResult {
  authorized: boolean;
  principal?: AuthPrincipal;
  error?: AuthError;
}

export interface AuthStrategy {
  validate(req: any): Promise<AuthResult>;
}

export interface AuthConfig {
  enabled: boolean;
  method: string;
  jwtSecret?: string;
  apiKey?: string;
  issuer?: string;
  audience?: string;
}

export type AuthMethod = 'none' | 'jwt' | 'apikey';

export const AUTH_METHODS: AuthMethod[] = ['none', 'jwt', 'apikey'];

export const AUTH_ERRORS = {
  MISSING_TOKEN: 'missing_token',
  INVALID_TOKEN: 'invalid_token',
  EXPIRED_TOKEN: 'expired_token',
  INVALID_SIGNATURE: 'invalid_signature',
  MISSING_API_KEY: 'missing_api_key',
  INVALID_API_KEY: 'invalid_api_key',
  SERVER_ERROR: 'server_error',
  MISCONFIGURED: 'misconfigured'
} as const;
