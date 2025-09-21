# Supertest Dependency Documentation

## Package Information
- **Package Name**: supertest
- **Latest Version**: 7.1.4
- **NPM URL**: https://www.npmjs.com/package/supertest
- **Repository**: https://github.com/ladjs/supertest
- **Homepage**: https://github.com/ladjs/supertest#readme
- **License**: MIT
- **Weekly Downloads**: 7,813,741
- **Unpacked Size**: 26.1 kB

## Description
HTTP assertions made easy via [superagent](http://github.com/ladjs/superagent). Maintained for [Forward Email](https://github.com/forwardemail) and [Lad](https://github.com/ladjs).

## About
The motivation with this module is to provide a high-level abstraction for testing HTTP, while still allowing you to drop down to the [lower-level API](https://ladjs.github.io/superagent/) provided by superagent.

## Installation
```bash
npm install supertest --save-dev
```

## Key Features
- High-level abstraction for HTTP testing
- Built on top of superagent
- Works with any test framework
- Supports promises and async/await
- HTTP/2 protocol support
- Cookie persistence with agents
- Multipart file upload testing
- Custom assertion functions

## Basic Usage

### Simple Example
```javascript
const request = require('supertest');
const express = require('express');

const app = express();

app.get('/user', function(req, res) {
  res.status(200).json({ name: 'john' });
});

request(app)
  .get('/user')
  .expect('Content-Type', /json/)
  .expect('Content-Length', '15')
  .expect(200)
  .end(function(err, res) {
    if (err) throw err;
  });
```

### With Mocha
```javascript
describe('GET /user', function() {
  it('responds with json', function(done) {
    request(app)
      .get('/user')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
```

### With Promises
```javascript
describe('GET /users', function() {
  it('responds with json', function() {
    return request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
         expect(response.body.email).toEqual('foo@bar.com');
      })
  });
});
```

### With Async/Await
```javascript
describe('GET /users', function() {
  it('responds with json', async function() {
    const response = await request(app)
      .get('/users')
      .set('Accept', 'application/json')
    expect(response.headers["Content-Type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.email).toEqual('foo@bar.com');
  });
});
```

## Advanced Features

### HTTP/2 Support
```javascript
// Enable HTTP/2 for request
request(app, { http2: true })
  .get('/user')
  .expect('Content-Type', /json/)
  .expect(200)
  .end(function(err, res) {
    if (err) throw err;
  });

// Enable HTTP/2 for agent
request.agent(app, { http2: true })
  .get('/user')
  .expect('Content-Type', /json/)
  .expect(200)
  .end(function(err, res) {
    if (err) throw err;
  });
```

### Authentication
```javascript
describe('GET /user', function() {
  it('responds with json', function(done) {
    request(app)
      .get('/user')
      .auth('username', 'password')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
```

### Custom Assertions
```javascript
request(app)
  .get('/')
  .expect(hasPreviousAndNextKeys)
  .end(done);

function hasPreviousAndNextKeys(res) {
  if (!('next' in res.body)) throw new Error("missing next key");
  if (!('prev' in res.body)) throw new Error("missing prev key");
}
```

### Multipart File Uploads
```javascript
request(app)
  .post('/')
  .field('name', 'my awesome avatar')
  .field('complex_object', '{"attribute": "value"}', {contentType: 'application/json'})
  .attach('avatar', 'test/fixtures/avatar.jpg')
  .expect(200);
```

### Cookie Persistence
```javascript
const request = require('supertest');
const should = require('should');
const express = require('express');
const cookieParser = require('cookie-parser');

describe('request.agent(app)', function() {
  const app = express();
  app.use(cookieParser());

  app.get('/', function(req, res) {
    res.cookie('cookie', 'hey');
    res.send();
  });

  app.get('/return', function(req, res) {
    if (req.cookies.cookie) res.send(req.cookies.cookie);
    else res.send(':(')
  });

  const agent = request.agent(app);

  it('should save cookies', function(done) {
    agent
    .get('/')
    .expect('set-cookie', 'cookie=hey; Path=/', done);
  });

  it('should send cookies', function(done) {
    agent
    .get('/return')
    .expect('hey', done);
  });
});
```

### Multiple Cookies
```javascript
agent(app)
  .get('/api/content')
  .set('Cookie', ['nameOne=valueOne;nameTwo=valueTwo'])
  .send()
  .expect(200)
  .end((err, res) => {
    if (err) {
      return done(err);
    }
    expect(res.text).to.be.equal('hey');
    return done();
  });
```

## API Reference

### .expect(status[, fn])
Assert response status code.

### .expect(status, body[, fn])
Assert response status code and body.

### .expect(body[, fn])
Assert response body text with a string, regular expression, or parsed body object.

### .expect(field, value[, fn])
Assert header field value with a string or regular expression.

### .expect(function(res) {})
Pass a custom assertion function. It'll be given the response object to check. If the check fails, throw an error.

### .end(fn)
Perform the request and invoke fn(err, res).

## Error Handling

### With .end() Method
```javascript
describe('POST /users', function() {
  it('responds with json', function(done) {
    request(app)
      .post('/users')
      .send({name: 'john'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        return done();
      });
  });
});
```

## Best Practices

1. **Use async/await for cleaner code**
2. **Test both success and error scenarios**
3. **Validate response status codes and body content**
4. **Use proper test isolation with beforeEach/afterEach**
5. **Leverage custom assertion functions for complex validations**
6. **Use agents for testing stateful interactions**
7. **Test file uploads and multipart data**

## Compatibility
- Works with any test framework (Mocha, Jest, Vitest, etc.)
- Compatible with Express, Koa, and other Node.js frameworks
- Supports both callback and promise-based testing
- HTTP/1.1 and HTTP/2 support

## Dependencies
- superagent (HTTP client library)
- methods (HTTP methods constants)

## Keywords
- bdd
- http
- request
- superagent
- tdd
- test
- testing

## Maintainers
- niftylettuce
- tjholowaychuk
- kof
- defunctzombie
- mikelax
- titanism

## Related Packages
- [@types/supertest](https://www.npmjs.com/package/@types/supertest) - TypeScript definitions
- [superagent](https://www.npmjs.com/package/superagent) - Underlying HTTP client

## Last Updated
September 21, 2025 (Package version 7.1.4 published 2 months ago)

---

*This documentation is based on the official npm package page and repository documentation.*
