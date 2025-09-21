# @types/supertest Dependency Documentation

## Package Information
- **Package Name**: @types/supertest
- **Latest Version**: 6.0.3
- **NPM URL**: https://www.npmjs.com/package/@types/supertest
- **Repository**: https://github.com/DefinitelyTyped/DefinitelyTyped
- **Homepage**: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/supertest
- **License**: MIT
- **Weekly Downloads**: 6,097,652
- **Unpacked Size**: 8.08 kB
- **Total Files**: 9

## Description
This package contains type definitions for supertest (https://github.com/visionmedia/supertest).

## About
TypeScript type definitions for the supertest HTTP testing library. These types provide full TypeScript support when using supertest in TypeScript projects, including intellisense, type checking, and autocompletion.

## Installation
```bash
npm install --save-dev @types/supertest
```

## Purpose
- Provides TypeScript type definitions for supertest
- Enables type safety when using supertest in TypeScript projects
- Offers full intellisense support in TypeScript-aware editors
- Ensures compile-time type checking for supertest API usage

## Key Features
- Complete type coverage for supertest API
- Compatible with latest supertest versions
- Maintained by the DefinitelyTyped community
- Regular updates to match supertest API changes
- Built-in TypeScript declarations

## Dependencies
- [@types/methods](https://npmjs.com/package/@types/methods) - Type definitions for HTTP methods
- [@types/superagent](https://npmjs.com/package/@types/superagent) - Type definitions for superagent (supertest's underlying library)

## Usage Examples

### Basic TypeScript Usage
```typescript
import request from 'supertest';
import { Express } from 'express';
import { Response } from 'supertest';

// Type-safe supertest usage
const testApp = (app: Express) => {
  return request(app)
    .get('/api/users')
    .expect(200)
    .then((response: Response) => {
      // TypeScript knows the shape of response
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });
};
```

### With Async/Await
```typescript
import request, { Response } from 'supertest';
import app from '../src/app';

describe('API Tests', () => {
  it('should return user data', async () => {
    const response: Response = await request(app)
      .get('/api/user/123')
      .expect(200);
    
    // TypeScript provides type safety
    expect(response.body.id).toBe(123);
    expect(typeof response.body.name).toBe('string');
  });
});
```

### Type-Safe Custom Assertions
```typescript
import request, { Test, Response } from 'supertest';

const expectJsonResponse = (test: Test): Test => {
  return test
    .expect('Content-Type', /json/)
    .expect((res: Response) => {
      if (!res.body) {
        throw new Error('Expected JSON response body');
      }
    });
};

// Usage
await expectJsonResponse(request(app).get('/api/data'))
  .expect(200);
```

### Agent with Types
```typescript
import request, { SuperAgentTest } from 'supertest';
import app from '../src/app';

describe('Session Tests', () => {
  let agent: SuperAgentTest;

  beforeEach(() => {
    agent = request.agent(app);
  });

  it('should maintain session', async () => {
    // Login
    await agent
      .post('/login')
      .send({ username: 'test', password: 'test' })
      .expect(200);

    // Access protected route
    const response: Response = await agent
      .get('/protected')
      .expect(200);

    expect(response.body.authenticated).toBe(true);
  });
});
```

## Type Definitions Overview

### Main Types
- `Test` - The main supertest test interface
- `Response` - HTTP response object with typed properties
- `SuperAgentTest` - Agent interface for session persistence
- `CallbackHandler` - Type for callback functions

### Method Signatures
```typescript
// GET request
request(app).get(url: string): Test

// POST request with body
request(app).post(url: string): Test

// Expectations
.expect(status: number): Test
.expect(status: number, body: any): Test
.expect(body: string | RegExp | object): Test
.expect(field: string, value: string | RegExp): Test
.expect(checker: (res: Response) => any): Test

// Ending the test
.end(callback: (err: any, res: Response) => void): void
```

## Integration with Testing Frameworks

### With Vitest
```typescript
import { describe, it, expect } from 'vitest';
import request, { Response } from 'supertest';
import app from '../src/app';

describe('API Endpoints', () => {
  it('should handle POST requests', async () => {
    const payload = { name: 'Test User', email: 'test@example.com' };
    
    const response: Response = await request(app)
      .post('/api/users')
      .send(payload)
      .expect(201);
    
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      name: payload.name,
      email: payload.email
    });
  });
});
```

### With Jest
```typescript
import request, { Response } from 'supertest';
import app from '../src/app';

describe('Authentication', () => {
  it('should reject invalid credentials', async () => {
    const response: Response = await request(app)
      .post('/auth/login')
      .send({ username: 'invalid', password: 'wrong' })
      .expect(401);
    
    expect(response.body.error).toBe('Invalid credentials');
  });
});
```

## Best Practices

### Type Safety
1. **Always import types explicitly**
   ```typescript
   import request, { Response, Test } from 'supertest';
   ```

2. **Use typed response objects**
   ```typescript
   const response: Response = await request(app).get('/api/data');
   ```

3. **Define custom interfaces for API responses**
   ```typescript
   interface UserResponse {
     id: number;
     name: string;
     email: string;
   }
   
   const response: Response = await request(app).get('/api/user/1');
   const user: UserResponse = response.body;
   ```

### Error Handling
```typescript
import request, { Response } from 'supertest';

try {
  const response: Response = await request(app)
    .get('/api/nonexistent')
    .expect(404);
  
  expect(response.body.error).toBeDefined();
} catch (error) {
  // Handle test failures
  console.error('Test failed:', error);
}
```

## Compatibility
- **TypeScript**: 4.0+
- **Node.js**: 14+
- **Supertest**: 6.0+
- **Testing Frameworks**: Jest, Mocha, Vitest, Jasmine

## Version History
- **6.0.3** (Current) - Latest stable release
- Compatible with supertest 7.x
- Regular updates to match supertest API changes

## Contributors
These definitions were written by:
- [Alex Varju](https://github.com/varju)
- [Petteri Parkkila](https://github.com/pietu)
- [David Tanner](https://github.com/DavidTanner)

## Related Packages
- [supertest](https://www.npmjs.com/package/supertest) - The main supertest library
- [@types/superagent](https://www.npmjs.com/package/@types/superagent) - Types for underlying HTTP client
- [@types/methods](https://www.npmjs.com/package/@types/methods) - Types for HTTP methods
- [@types/express](https://www.npmjs.com/package/@types/express) - Types for Express.js

## Troubleshooting

### Common Issues

#### Import Errors
```typescript
// ❌ Incorrect
import * as request from 'supertest';

// ✅ Correct
import request from 'supertest';
import { Response } from 'supertest';
```

#### Type Mismatches
```typescript
// ❌ Untyped response
const response = await request(app).get('/api/data');

// ✅ Typed response
const response: Response = await request(app).get('/api/data');
```

#### Missing Type Definitions
Ensure both supertest and @types/supertest are installed:
```bash
npm install --save-dev supertest @types/supertest
```

## Configuration

### TypeScript Config
Ensure your `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "types": ["node", "supertest"],
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

## Last Updated
September 21, 2025 (Package version 6.0.3 published 6 months ago)

---

*This documentation is based on the official npm package page and DefinitelyTyped repository.*
