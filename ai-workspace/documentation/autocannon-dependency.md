# autocannon Dependency Documentation

## Package Information
- **Package Name**: autocannon
- **Latest Version**: 8.0.0
- **NPM URL**: https://www.npmjs.com/package/autocannon
- **Repository**: https://github.com/mcollina/autocannon
- **Homepage**: https://github.com/mcollina/autocannon#readme
- **License**: MIT
- **Weekly Downloads**: 239,343
- **Unpacked Size**: 585 kB
- **Total Files**: 99
- **TypeScript Definitions**: Available via @types/autocannon

## Description
An HTTP/1.1 benchmarking tool written in node, greatly inspired by [wrk](https://github.com/wg/wrk) and [wrk2](https://github.com/giltene/wrk2), with support for HTTP pipelining and HTTPS. On many systems, autocannon can produce more load than `wrk` and `wrk2`.

## Installation

### Global Installation
```bash
npm i autocannon -g
```

### As Dependency
```bash
npm i autocannon --save-dev
```

## Key Features
- HTTP/1.1 benchmarking with pipelining support
- HTTPS support
- Worker threads for multi-threaded load testing
- Programmable API for integration with test suites
- Detailed latency and throughput statistics
- HAR file support for complex request sequences
- Rate limiting and connection management
- Real-time progress tracking
- JSON output for automation

## Command Line Usage

### Basic Syntax
```bash
autocannon [opts] URL
```

### Common Options
- `-c/--connections NUM` - Number of concurrent connections (default: 10)
- `-d/--duration SEC` - Duration in seconds (default: 10)
- `-p/--pipelining NUM` - Number of pipelined requests (default: 1)
- `-m/--method METHOD` - HTTP method (default: 'GET')
- `-b/--body BODY` - Request body
- `-H/--headers K=V` - Request headers
- `-w/--workers` - Number of worker threads
- `-j/--json` - Output as JSON
- `-l/--latency` - Print detailed latency data

### Example Commands
```bash
# Basic load test
autocannon http://localhost:3000

# POST request with body
autocannon -m POST -b '{"test": "data"}' -H 'content-type=application/json' http://localhost:3000/api

# High concurrency test
autocannon -c 100 -d 30 http://localhost:3000

# Worker threads for heavy load
autocannon -c 100 -w 4 http://localhost:3000
```

## Programmatic API

### Basic Usage
```javascript
'use strict'

const autocannon = require('autocannon')

autocannon({
  url: 'http://localhost:3000',
  connections: 10, //default
  pipelining: 1, // default
  duration: 10 // default
}, console.log)
```

### Async/Await Usage
```javascript
async function loadTest() {
  const result = await autocannon({
    url: 'http://localhost:3000',
    connections: 10,
    pipelining: 1,
    duration: 10
  })
  console.log(result)
}
```

### Advanced Configuration
```javascript
const autocannon = require('autocannon')

const instance = autocannon({
  url: 'http://localhost:3000',
  connections: 100,
  duration: 30,
  pipelining: 10,
  method: 'POST',
  headers: {
    'content-type': 'application/json'
  },
  body: JSON.stringify({ test: 'data' }),
  timeout: 10,
  bailout: 10,
  maxConnectionRequests: 1000,
  connectionRate: 100,
  title: 'My Load Test'
}, (err, result) => {
  if (err) {
    console.error('Load test failed:', err)
  } else {
    console.log('Load test completed:', result)
  }
})
```

## API Options

### Core Options
- `url` - Target URL (required)
- `connections` - Number of concurrent connections (default: 10)
- `duration` - Test duration in seconds (default: 10)
- `amount` - Number of requests to make (overrides duration)
- `timeout` - Request timeout in seconds (default: 10)
- `method` - HTTP method (default: 'GET')
- `headers` - Request headers object
- `body` - Request body (string or buffer)

### Advanced Options
- `workers` - Number of worker threads
- `pipelining` - Number of pipelined requests per connection
- `bailout` - Number of errors before stopping
- `maxConnectionRequests` - Max requests per connection
- `maxOverallRequests` - Max total requests
- `connectionRate` - Requests per second per connection
- `overallRate` - Total requests per second
- `reconnectRate` - Reconnect after N requests

### Customization Options
- `setupClient` - Function to customize each client
- `verifyBody` - Function to verify response bodies
- `requests` - Array of request objects for sequences
- `initialContext` - Initial context object
- `idReplacement` - Enable ID replacement in request bodies

## Worker Threads

### Basic Worker Usage
```javascript
const autocannon = require('autocannon')

autocannon({
  url: 'http://localhost:3000',
  connections: 40, // Will be divided among workers
  workers: 4,      // 10 connections per worker
  duration: 10
}, console.log)
```

### Worker Considerations
- `connections` and `amount` are divided among workers
- Other parameters apply per-worker
- File paths required for functions in worker mode
- `maxOverallRequests` and `overallRate` apply per worker

## Request Sequences

### Multiple Request Types
```javascript
autocannon({
  url: 'http://localhost:3000',
  requests: [
    {
      method: 'GET',
      path: '/users'
    },
    {
      method: 'POST',
      path: '/users',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Test User' })
    },
    {
      method: 'GET',
      path: '/users/1'
    }
  ]
}, console.log)
```

### Dynamic Request Setup
```javascript
autocannon({
  url: 'http://localhost:3000',
  requests: [
    {
      setupRequest: (req, context) => {
        // Modify request based on context
        req.path = `/users/${context.userId || 1}`
        return req
      },
      onResponse: (status, body, context) => {
        // Process response and update context
        if (status === 200) {
          const data = JSON.parse(body)
          context.userId = data.id
        }
      }
    }
  ]
}, console.log)
```

## Event Handling

### Instance Events
```javascript
const instance = autocannon({
  url: 'http://localhost:3000',
  duration: 30
})

instance.on('start', () => {
  console.log('Load test started')
})

instance.on('tick', (stats) => {
  console.log(`Current: ${stats.counter} requests, ${stats.bytes} bytes`)
})

instance.on('response', (client, statusCode, resBytes, responseTime) => {
  console.log(`Response: ${statusCode} in ${responseTime}ms`)
})

instance.on('done', (result) => {
  console.log('Load test completed:', result)
})

instance.on('error', (err) => {
  console.error('Load test error:', err)
})
```

### Client Customization
```javascript
autocannon({
  url: 'http://localhost:3000',
  setupClient: (client) => {
    // Customize each client connection
    client.setHeaders({ 'x-custom': 'header' })
    
    client.on('response', (statusCode, resBytes, responseTime) => {
      if (statusCode >= 400) {
        console.log(`Error response: ${statusCode}`)
      }
    })
  }
}, console.log)
```

## Results Object

### Result Structure
```javascript
{
  title: 'Load Test',
  url: 'http://localhost:3000',
  requests: {
    average: 1000,
    mean: 1000,
    stddev: 50,
    min: 900,
    max: 1100,
    p2_5: 950,
    p50: 1000,
    p97_5: 1050,
    p99: 1080
  },
  latency: {
    average: 10,
    mean: 10,
    stddev: 2,
    min: 5,
    max: 50,
    p2_5: 8,
    p50: 10,
    p97_5: 15,
    p99: 20
  },
  throughput: {
    average: 1048576,
    mean: 1048576,
    stddev: 52428,
    min: 1000000,
    max: 1100000
  },
  duration: 10.05,
  errors: 0,
  timeouts: 0,
  mismatches: 0,
  non2xx: 0,
  resets: 0,
  start: Date,
  finish: Date,
  connections: 10,
  pipelining: 1,
  statusCodeStats: {
    '200': { count: 10000 },
    '404': { count: 5 }
  }
}
```

## Performance Testing Patterns

### Basic Performance Test
```javascript
const autocannon = require('autocannon')

async function performanceTest() {
  const result = await autocannon({
    url: 'http://localhost:3000/api/endpoint',
    connections: 50,
    duration: 30,
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      test: 'data',
      timestamp: Date.now()
    })
  })
  
  // Assert performance requirements
  console.assert(result.latency.p95 < 100, 'P95 latency should be under 100ms')
  console.assert(result.requests.average > 1000, 'Should handle 1000+ req/sec')
  console.assert(result.errors === 0, 'Should have no errors')
  
  return result
}
```

### Stress Testing
```javascript
async function stressTest() {
  const phases = [
    { connections: 10, duration: 10 },
    { connections: 50, duration: 10 },
    { connections: 100, duration: 10 },
    { connections: 200, duration: 10 }
  ]
  
  const results = []
  
  for (const phase of phases) {
    console.log(`Testing with ${phase.connections} connections...`)
    
    const result = await autocannon({
      url: 'http://localhost:3000',
      connections: phase.connections,
      duration: phase.duration
    })
    
    results.push({
      connections: phase.connections,
      avgLatency: result.latency.average,
      reqPerSec: result.requests.average,
      errors: result.errors
    })
  }
  
  return results
}
```

### Integration with Test Frameworks

#### Vitest Integration
```javascript
import { describe, it, expect } from 'vitest'
import autocannon from 'autocannon'

describe('Performance Tests', () => {
  it('should handle expected load', async () => {
    const result = await autocannon({
      url: 'http://localhost:3001/api/test',
      connections: 20,
      duration: 5,
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ test: 'data' })
    })
    
    expect(result.latency.p95).toBeLessThan(100)
    expect(result.requests.average).toBeGreaterThan(500)
    expect(result.errors).toBe(0)
  }, 10000) // 10 second timeout
})
```

#### Jest Integration
```javascript
const autocannon = require('autocannon')

describe('API Performance', () => {
  test('endpoint should meet performance requirements', async () => {
    const result = await autocannon({
      url: 'http://localhost:3000/api/users',
      connections: 30,
      duration: 10
    })
    
    expect(result.latency.average).toBeLessThan(50)
    expect(result.throughput.average).toBeGreaterThan(1000000)
    expect(result.non2xx).toBe(0)
  })
})
```

## Utility Functions

### Progress Tracking
```javascript
const autocannon = require('autocannon')

const instance = autocannon({
  url: 'http://localhost:3000',
  duration: 60
})

// Track progress with custom options
autocannon.track(instance, {
  renderProgressBar: true,
  renderResultsTable: true,
  renderLatencyTable: true,
  progressBarString: 'Testing [:bar] :percent (:current/:total)'
})
```

### Result Formatting
```javascript
const autocannon = require('autocannon')

autocannon({
  url: 'http://localhost:3000'
}, (err, result) => {
  if (err) throw err
  
  // Print formatted results
  const output = autocannon.printResult(result, {
    renderResultsTable: true,
    renderLatencyTable: true
  })
  
  console.log(output)
})
```

### Result Aggregation
```javascript
// For distributed testing across multiple machines
const results = [result1, result2, result3] // From different instances

const aggregated = autocannon.aggregateResult(results, {
  url: 'http://localhost:3000',
  connections: 30, // Total across all instances
  duration: 10
})

console.log('Aggregated results:', aggregated)
```

## Best Practices

### Performance Testing
1. **Start with baseline tests** - Establish performance baselines
2. **Use realistic payloads** - Test with production-like data
3. **Test different load patterns** - Gradual ramp-up, sustained load, spike tests
4. **Monitor system resources** - CPU, memory, network during tests
5. **Test error scenarios** - Include negative test cases

### Configuration Guidelines
1. **Choose appropriate connection counts** - Start low and increase gradually
2. **Use workers for high load** - Distribute load across multiple threads
3. **Set realistic timeouts** - Match production timeout settings
4. **Enable pipelining carefully** - Only if your server supports it
5. **Use rate limiting** - Prevent overwhelming the system

### CI/CD Integration
```javascript
// Example CI performance test
const autocannon = require('autocannon')

async function ciPerformanceTest() {
  const result = await autocannon({
    url: process.env.TEST_URL || 'http://localhost:3000',
    connections: 20,
    duration: 10,
    bailout: 5 // Stop on 5 errors
  })
  
  // Performance gates for CI
  const requirements = {
    maxP95Latency: 100,
    minReqPerSec: 1000,
    maxErrorRate: 0.01
  }
  
  const errorRate = result.errors / (result.requests.total || 1)
  
  if (result.latency.p95 > requirements.maxP95Latency) {
    throw new Error(`P95 latency ${result.latency.p95}ms exceeds ${requirements.maxP95Latency}ms`)
  }
  
  if (result.requests.average < requirements.minReqPerSec) {
    throw new Error(`Request rate ${result.requests.average} below ${requirements.minReqPerSec}`)
  }
  
  if (errorRate > requirements.maxErrorRate) {
    throw new Error(`Error rate ${errorRate} exceeds ${requirements.maxErrorRate}`)
  }
  
  console.log('Performance test passed!')
  return result
}
```

## Limitations

### CPU Considerations
- Autocannon is CPU-bound and single-threaded (without workers)
- May saturate CPU before reaching server limits
- Use workers for high-load scenarios
- Consider `wrk2` for extremely high loads

### Comparison with Other Tools
- **vs wrk**: Autocannon uses more CPU but supports HTTP/1.1 pipelining
- **vs wrk2**: wrk2 may be better for CPU-constrained scenarios
- **vs ab**: Autocannon provides more detailed statistics and modern features

## Keywords
- http
- soak
- load
- fast
- wrk
- ab
- test

## Maintainers
- matteo.collina
- thekemkid
- davidmarkclements

## Contributors
- [Glen Keane](https://github.com/GlenTiki)
- [Salman Mitha](https://github.com/salmanm)

## Acknowledgements
- Sponsored by [nearForm](http://nearform.com)
- Logo by Cosmic Fox Design
- Inspired by [wrk](https://github.com/wg/wrk) and [wrk2](https://github.com/giltene/wrk2)

## Related Packages
- [@types/autocannon](https://www.npmjs.com/package/@types/autocannon) - TypeScript definitions
- [hdr-histogram-percentiles-obj](https://github.com/thekemkid/hdr-histogram-percentiles-obj) - Statistics objects

## Last Updated
September 21, 2025 (Package version 8.0.0 published a year ago)

---

*This documentation is based on the official npm package page and repository documentation.*
