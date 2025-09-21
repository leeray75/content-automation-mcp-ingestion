# node-mocks-http Dependency Documentation

## Package Information
- **Package Name**: node-mocks-http
- **Latest Version**: 1.17.2
- **NPM URL**: https://www.npmjs.com/package/node-mocks-http
- **Repository**: https://github.com/eugef/node-mocks-http
- **Homepage**: https://github.com/eugef/node-mocks-http
- **License**: MIT
- **Weekly Downloads**: 1,214,314
- **Unpacked Size**: 86.1 kB
- **Total Files**: 18
- **Built-in TypeScript Declarations**: ✅

## Description
Mock 'http' objects for testing [Express](https://expressjs.com), [Next.js](https://nextjs.org) and [Koa](https://koajs.com) routing functions, but could be used for testing any [Node.js](http://www.nodejs.org) web server applications that have code that requires mockups of the `request` and `response` objects.

## Installation
```bash
npm install node-mocks-http --save-dev
npm install @types/node @types/express --save-dev # when using TypeScript
```

or

```bash
yarn add node-mocks-http --dev
yarn add @types/node @types/express --dev # when using TypeScript
```

## Usage
After installing the package include the following in your test files:
```javascript
const httpMocks = require('node-mocks-http');
```

## Key Features
- Mock HTTP request and response objects
- Built-in TypeScript support
- Compatible with Express, Next.js, and Koa
- Event emitter support for testing async operations
- Comprehensive API for setting and inspecting values
- Lightweight framework without heavy dependencies

## Basic Usage Example

### Express Route Testing
Suppose you have the following Express route:
```javascript
app.get('/user/:id', routeHandler);
```

And you have created a function to handle that route's call:
```javascript
const routeHandler = function( request, response ) { ... };
```

You can easily test the `routeHandler` function:
```javascript
exports['routeHandler - Simple testing'] = function (test) {
    const request = httpMocks.createRequest({
        method: 'GET',
        url: '/user/42',
        params: {
            id: 42
        }
    });

    const response = httpMocks.createResponse();

    routeHandler(request, response);

    const data = response._getJSONData(); // short-hand for JSON.parse( response._getData() );
    test.equal('Bob Dog', data.name);
    test.equal(42, data.age);
    test.equal('bob@dog.com', data.email);

    test.equal(200, response.statusCode);
    test.ok(response._isEndCalled());
    test.ok(response._isJSON());
    test.ok(response._isUTF8());

    test.done();
};
```

## TypeScript Support

### Express.js TypeScript Example
```typescript
it('should handle expressjs requests', () => {
    const mockExpressRequest = httpMocks.createRequest({
        method: 'GET',
        url: '/user/42',
        params: {
            id: 42
        }
    });
    const mockExpressResponse = httpMocks.createResponse();

    routeHandler(request, response);

    const data = response._getJSONData();
    test.equal('Bob Dog', data.name);
    test.equal(42, data.age);
    test.equal('bob@dog.com', data.email);

    test.equal(200, response.statusCode);
    test.ok(response._isEndCalled());
    test.ok(response._isJSON());
    test.ok(response._isUTF8());

    test.done();
});
```

### Next.js TypeScript Example
```typescript
import { NextApiRequest, NextApiResponse } from 'next';

it('should handle nextjs requests', () => {
    const mockExpressRequest = httpMocks.createRequest<NextApiRequest>({
        method: 'GET',
        url: '/user/42',
        params: {
            id: 42
        }
    });
    const mockExpressResponse = httpMocks.createResponse<NextApiResponse>();

    // ... the rest of the test as above.
});
```

### Next.js App Router TypeScript Example
```typescript
import { NextRequest, NextResponse } from 'next/server';

it('should handle nextjs app router requests', () => {
    const mockExpressRequest = httpMocks.createRequest<NextRequest>({
        method: 'GET',
        url: '/user/42',
        params: {
            id: 42
        }
    });
    const mockExpressResponse = httpMocks.createResponse<NextResponse>();

    // ... the rest of the test as above.
});
```

## API Reference

### .createRequest(options)
Creates a mock HTTP request object.

#### Options
| Option | Description | Default Value |
|--------|-------------|---------------|
| `method` | request HTTP method | 'GET' |
| `url` | request URL | '' |
| `originalUrl` | request original URL | `url` |
| `baseUrl` | request base URL | `url` |
| `path` | request path | '' |
| `params` | object hash with params | {} |
| `session` | object hash with session values | `undefined` |
| `cookies` | object hash with request cookies | {} |
| `socket` | object hash with request socket | {} |
| `signedCookies` | object hash with signed cookies | `undefined` |
| `headers` | object hash with request headers | {} |
| `body` | object hash with body | {} |
| `query` | object hash with query values | {} |
| `files` | object hash with values | {} |

#### Express Request Functions Support
The object returned supports Express request functions:
- `.accepts()`
- `.is()`
- `.get()`
- `.range()`
- And more...

### .createResponse(options)
Creates a mock HTTP response object.

#### Options
| Option | Description | Default Value |
|--------|-------------|---------------|
| `locals` | object that contains `response` local variables | `{}` |
| `eventEmitter` | event emitter used by `response` object | `mockEventEmitter` |
| `writableStream` | writable stream used by `response` object | `mockWritableStream` |
| `req` | Request object being responded to | null |

### .createMocks(reqOptions, resOptions)
Merges `createRequest` and `createResponse`. Passes given options object to each constructor. Returns an object with properties `req` and `res`.

```javascript
const { req, res } = httpMocks.createMocks(
    { method: 'GET', url: '/test' },
    { locals: { user: 'test' } }
);
```

## Advanced Usage

### Event Emitter Support
```javascript
const httpMocks = require('node-mocks-http');
const res = httpMocks.createResponse({
  eventEmitter: require('events').EventEmitter
});

// ...
it('should do something', function(done) {
    res.on('end', function() {
        assert.equal(...);
        done();
    });
});
// ...
```

### Request Body and Events
```javascript
const httpMocks = require('node-mocks-http');
const req = httpMocks.createRequest();
const res = httpMocks.createResponse({
    eventEmitter: require('events').EventEmitter
});

// ...
it('should do something', function (done) {
    res.on('end', function () {
        expect(response._getData()).to.equal('data sent in request');
        done();
    });

    route(req, res);

    req.send('data sent in request');
});

function route(req, res) {
    let data = [];
    req.on('data', (chunk) => {
        data.push(chunk);
    });
    req.on('end', () => {
        data = Buffer.concat(data);
        res.write(data);
        res.end();
    });
}
// ...
```

## Response Object Methods

### Data Inspection
- `response._getData()` - Get response data as string
- `response._getJSONData()` - Get response data as parsed JSON
- `response._getBuffer()` - Get response data as Buffer

### Status Checking
- `response._isEndCalled()` - Check if response.end() was called
- `response._isJSON()` - Check if response content type is JSON
- `response._isUTF8()` - Check if response encoding is UTF-8

### Headers
- `response._getHeaders()` - Get all response headers
- `response._getHeader(name)` - Get specific header value

## Testing Patterns

### Middleware Testing
```javascript
const httpMocks = require('node-mocks-http');

describe('Auth Middleware', () => {
    it('should authenticate valid token', () => {
        const req = httpMocks.createRequest({
            headers: { authorization: 'Bearer valid-token' }
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
    });

    it('should reject invalid token', () => {
        const req = httpMocks.createRequest({
            headers: { authorization: 'Bearer invalid-token' }
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res._getJSONData().error).toBe('Invalid token');
    });
});
```

### Route Handler Testing
```javascript
describe('User Routes', () => {
    it('should create user', () => {
        const req = httpMocks.createRequest({
            method: 'POST',
            url: '/users',
            body: {
                name: 'John Doe',
                email: 'john@example.com'
            }
        });
        const res = httpMocks.createResponse();

        createUserHandler(req, res);

        expect(res.statusCode).toBe(201);
        const userData = res._getJSONData();
        expect(userData.name).toBe('John Doe');
        expect(userData.id).toBeDefined();
    });
});
```

## Best Practices

1. **Use fresh mock objects for each test**
   ```javascript
   beforeEach(() => {
       req = httpMocks.createRequest();
       res = httpMocks.createResponse();
   });
   ```

2. **Set up realistic request/response scenarios**
   ```javascript
   const req = httpMocks.createRequest({
       method: 'POST',
       url: '/api/users',
       headers: {
           'content-type': 'application/json',
           'authorization': 'Bearer token'
       },
       body: { name: 'Test User' }
   });
   ```

3. **Test middleware behavior thoroughly**
   ```javascript
   // Test that next() is called
   expect(next).toHaveBeenCalled();
   
   // Test that middleware modifies request
   expect(req.user).toBeDefined();
   
   // Test error responses
   expect(res.statusCode).toBe(400);
   ```

4. **Use event emitters for async testing**
   ```javascript
   const res = httpMocks.createResponse({
       eventEmitter: require('events').EventEmitter
   });
   ```

## Framework Compatibility
- **Express.js**: Full support for Express request/response objects
- **Next.js**: Support for both Pages API and App Router
- **Koa**: Compatible with Koa context objects
- **Node.js**: Works with any Node.js HTTP server

## Dependencies
The package has 10 dependencies for various HTTP mocking functionality.

## Keywords
- mock
- stub
- dummy
- nodejs
- js
- testing
- test
- http
- http mock

## Maintainers
- eugef

## Design Philosophy
- Simple mocks without a large framework
- Mocks act like original framework objects
- Allow setting values before calling
- Allow inspecting values after calling
- Good starting point for HTTP mocking needs

## Contributing
The project welcomes contributions. See [Contributing Guidelines](https://github.com/eugef/node-mocks-http/blob/HEAD/CONTRIBUTING.md) for details.

## Release History
See the [Release History](https://github.com/eugef/node-mocks-http/blob/HEAD/HISTORY.md) for detailed release notes.

## Last Updated
September 21, 2025 (Package version 1.17.2 published 5 months ago)

---

*This documentation is based on the official npm package page and repository documentation.*
