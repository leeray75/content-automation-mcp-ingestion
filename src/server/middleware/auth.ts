/**
 * Authentication middleware wrapper
 * 
 * This file maintains backward compatibility while using the new modular auth system.
 * The actual authentication logic is now handled by the auth module.
 */

import { createAuthMiddleware } from './auth/index.js';

// Create the middleware instance using the new factory
const bearerAuthMiddleware = createAuthMiddleware();

export { bearerAuthMiddleware };
export default bearerAuthMiddleware;
