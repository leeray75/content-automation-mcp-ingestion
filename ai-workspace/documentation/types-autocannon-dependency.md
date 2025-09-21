# @types/autocannon Dependency Documentation

## Package Information
- **Package Name**: @types/autocannon
- **Latest Version**: 7.12.7
- **NPM URL**: https://www.npmjs.com/package/@types/autocannon
- **Repository**: https://github.com/DefinitelyTyped/DefinitelyTyped
- **Homepage**: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/autocannon
- **License**: MIT
- **Weekly Downloads**: 120,189
- **Unpacked Size**: 23.1 kB
- **Total Files**: 5
- **Built-in TypeScript Declarations**: ✅

## Description
This package contains type definitions for autocannon (https://github.com/mcollina/autocannon#readme).

## About
TypeScript type definitions for the autocannon HTTP benchmarking tool. These types provide full TypeScript support when using autocannon in TypeScript projects, including intellisense, type checking, and autocompletion for all autocannon API methods and configuration options.

## Installation
```bash
npm install --save-dev @types/autocannon
```

## Purpose
- Provides TypeScript type definitions for autocannon
- Enables type safety when using autocannon in TypeScript projects
- Offers full intellisense support in TypeScript-aware editors
- Ensures compile-time type checking for autocannon API usage
- Covers all autocannon configuration options and result types

## Key Features
- Complete type coverage for autocannon API
- Compatible with latest autocannon versions
- Maintained by the DefinitelyTyped community
- Regular updates to match autocannon API changes
- Built-in TypeScript declarations
- Comprehensive result object typing

## Dependencies
- [@types/node](https://npmjs.com/package/@types/node) - Node.js type definitions

## Usage Examples

### Basic TypeScript Usage
```typescript
import autocannon from 'autocannon';
import { Options, Result } from 'autocannon';

// Type-safe autocannon usage
const options: Options = {
  url: 'http://localhost:3000',
  connections: 10,
  duration: 10,
  method: 'GET'
};

const result: Result = await autocannon(options);
console.log(`Average latency: ${result.latency.average}ms`);
```

### With Async/Await and Full Typing
```typescript
import autocannon, { Options, Result, Instance } from 'autocannon';

async function performLoadTest(): Promise<Result> {
  const config: Options = {
    url: 'http://localhost:3000/api/test',
    connections: 50,
    duration: 30,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': 'Bearer token'
    },
    body: JSON.stringify({ test: 'data' }),
    timeout: 10,
    bailout: 5,
    maxConnectionRequests: 1000,
    connectionRate: 100
  };

  const result: Result = await autocannon(config);
  
  // TypeScript knows the shape of result
  console.log({
    avgLatency: result.latency.average,
    p95Latency: result.latency.p95,
    avgReqPerSec: result.requests.average,
    errors: result.errors,
    timeouts: result.timeouts
  });
  
  return result;
}
```

### Event-Driven Usage with Types
```typescript
import autocannon, { Options, Instance, Result } from 'autocannon';

function runLoadTestWithEvents(): Promise<Result> {
  return new Promise((resolve, reject) => {
    const options: Options = {
      url: 'http://localhost:3000',
      connections: 20,
      duration: 15
    };

    const instance: Instance = autocannon(options, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });

    // Type-safe event handlers
    instance.on('start', () => {
      console.log('Load test started');
    });

    instance.on('tick', (stats) => {
      // TypeScript knows stats structure
      console.log(`Current: ${stats.counter} requests, ${stats.bytes} bytes`);
    });

    instance.on('done', (result: Result) => {
      console.log('Load test completed');
      console.log(`Total requests: ${result.requests.total}`);
    });

    instance.on('error', (error: Error) => {
      console.error('Load test error:', error);
      reject(error);
    });
  });
}
```

### Advanced Configuration with Types
```typescript
import autocannon, { Options, RequestOptions, Result } from 'autocannon';

const advancedConfig: Options = {
  url: 'http://localhost:3000',
  connections: 100,
  duration: 60,
  workers: 4,
  pipelining: 10,
  
  // Request sequence with types
  requests: [
    {
      method: 'GET',
      path: '/api/users',
      headers: { 'accept': 'application/json' }
    },
    {
      method: 'POST',
      path: '/api/users',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Test User' })
    }
  ] as RequestOptions[],
  
  // Rate limiting
  overallRate: 1000,
  connectionRate: 50,
  
  // Error handling
  bailout: 10,
  maxOverallRequests: 50000,
  
  // Custom setup
  setupClient: (client) => {
    // TypeScript knows client structure
    client.setHeaders({ 'x-custom': 'header' });
  },
  
  // Response verification
  verifyBody: (body: string, statusCode: number) => {
    return statusCode === 200 && body.includes('success');
  }
};

async function runAdvancedTest(): Promise<void> {
  const result: Result = await autocannon(advancedConfig);
  
  // Comprehensive result analysis with types
  const analysis = {
    performance: {
      avgLatency: result.latency.average,
      p50Latency: result.latency.p50,
      p95Latency: result.latency.p95,
      p99Latency: result.latency.p99,
      maxLatency: result.latency.max
    },
    throughput: {
      avgReqPerSec: result.requests.average,
      totalRequests: result.requests.total,
      avgBytesPerSec: result.throughput.average,
      totalBytes: result.throughput.total
    },
    reliability: {
      errors: result.errors,
      timeouts: result.timeouts,
      non2xx: result.non2xx,
      successRate: ((result.requests.total - result.errors - result.timeouts) / result.requests.total) * 100
    },
    timing: {
      duration: result.duration,
      start: result.start,
      finish: result.finish
    }
  };
  
  console.log('Load test analysis:', analysis);
}
```

## Type Definitions Overview

### Main Types
```typescript
// Core function signature
function autocannon(options: Options): Promise<Result>;
function autocannon(options: Options, callback: (err: Error | null, result: Result) => void): Instance;

// Configuration options
interface Options {
  url: string;
  connections?: number;
  duration?: number;
  amount?: number;
  timeout?: number;
  pipelining?: number;
  bailout?: number;
  method?: string;
  title?: string;
  body?: string | Buffer;
  headers?: { [key: string]: string };
  // ... many more options
}

// Result object
interface Result {
  latency: HistogramResult;
  requests: HistogramResult;
  throughput: HistogramResult;
  duration: number;
  errors: number;
  timeouts: number;
  mismatches: number;
  non2xx: number;
  start: Date;
  finish: Date;
  connections: number;
  pipelining: number;
  // ... additional properties
}

// Histogram statistics
interface HistogramResult {
  average: number;
  mean: number;
  stddev: number;
  min: number;
  max: number;
  p2_5: number;
  p50: number;
  p75: number;
  p90: number;
  p97_5: number;
  p99: number;
  p99_9: number;
  p99_99: number;
  p99_999: number;
}
```

### Request Configuration Types
```typescript
interface RequestOptions {
  method?: string;
  path?: string;
  headers?: { [key: string]: string };
  body?: string | Buffer;
  setupRequest?: (req: any, context: any) => any;
  onResponse?: (status: number, body: string, context: any, headers: any) => void;
}
```

### Instance and Event Types
```typescript
interface Instance extends EventEmitter {
  stop(): void;
  // Event emitter methods with proper typing
}

// Event types
interface TickStats {
  counter: number;
  bytes: number;
}
```

## Integration with Testing Frameworks

### Vitest Integration
```typescript
import { describe, it, expect } from 'vitest';
import autocannon, { Result, Options } from 'autocannon';

describe('Performance Tests', () => {
  it('should meet performance requirements', async () => {
    const options: Options = {
      url: 'http://localhost:3001/api/test',
      connections: 20,
      duration: 5,
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ test: 'data' })
    };
    
    const result: Result = await autocannon(options);
    
    // Type-safe assertions
    expect(result.latency.p95).toBeLessThan(100);
    expect(result.requests.average).toBeGreaterThan(500);
    expect(result.errors).toBe(0);
    expect(result.timeouts).toBe(0);
  }, 10000);
});
```

### Jest Integration
```typescript
import autocannon, { Result, Options } from 'autocannon';

describe('API Performance', () => {
  test('endpoint should handle expected load', async () => {
    const config: Options = {
      url: 'http://localhost:3000/api/users',
      connections: 30,
      duration: 10,
      method: 'GET'
    };
    
    const result: Result = await autocannon(config);
    
    expect(result.latency.average).toBeLessThan(50);
    expect(result.throughput.average).toBeGreaterThan(1000000);
    expect(result.non2xx).toBe(0);
    
    // Calculate and verify success rate
    const successRate = (result.requests.total - result.errors) / result.requests.total;
    expect(successRate).toBeGreaterThan(0.99);
  });
});
```

## Best Practices

### Type Safety
1. **Always use typed configurations**
   ```typescript
   const options: Options = {
     url: 'http://localhost:3000',
     connections: 10,
     duration: 5
   };
   ```

2. **Type result objects explicitly**
   ```typescript
   const result: Result = await autocannon(options);
   ```

3. **Use typed event handlers**
   ```typescript
   instance.on('tick', (stats: TickStats) => {
     console.log(`Requests: ${stats.counter}`);
   });
   ```

### Error Handling
```typescript
import autocannon, { Options, Result } from 'autocannon';

async function safeLoadTest(options: Options): Promise<Result | null> {
  try {
    const result: Result = await autocannon(options);
    return result;
  } catch (error) {
    console.error('Load test failed:', error);
    return null;
  }
}
```

### Performance Analysis
```typescript
function analyzeResults(result: Result): {
  performance: 'excellent' | 'good' | 'poor';
  bottlenecks: string[];
} {
  const bottlenecks: string[] = [];
  
  if (result.latency.p95 > 100) {
    bottlenecks.push('High 95th percentile latency');
  }
  
  if (result.errors > 0) {
    bottlenecks.push(`${result.errors} errors occurred`);
  }
  
  if (result.timeouts > 0) {
    bottlenecks.push(`${result.timeouts} timeouts occurred`);
  }
  
  const performance = bottlenecks.length === 0 ? 'excellent' :
                     bottlenecks.length <= 2 ? 'good' : 'poor';
  
  return { performance, bottlenecks };
}
```

## Compatibility
- **TypeScript**: 4.0+
- **Node.js**: 14+
- **Autocannon**: 8.0+
- **Testing Frameworks**: Jest, Mocha, Vitest, Jasmine

## Version History
- **7.12.7** (Current) - Latest stable release
- Compatible with autocannon 8.x
- Regular updates to match autocannon API changes
- Comprehensive type coverage

## Contributors
These definitions were written by:
- [Jeremy Bensimon](https://github.com/jeremyben)

## Related Packages
- [autocannon](https://www.npmjs.com/package/autocannon) - The main autocannon library
- [@types/node](https://www.npmjs.com/package/@types/node) - Node.js type definitions

## Troubleshooting

### Common Issues

#### Import Errors
```typescript
// ❌ Incorrect
import * as autocannon from 'autocannon';

// ✅ Correct
import autocannon from 'autocannon';
import { Options, Result } from 'autocannon';
```

#### Type Mismatches
```typescript
// ❌ Untyped configuration
const config = {
  url: 'http://localhost:3000',
  connections: 10
};

// ✅ Typed configuration
const config: Options = {
  url: 'http://localhost:3000',
  connections: 10
};
```

#### Missing Type Definitions
Ensure both autocannon and @types/autocannon are installed:
```bash
npm install --save-dev autocannon @types/autocannon
```

## Configuration

### TypeScript Config
Ensure your `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "types": ["node", "autocannon"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## Last Updated
September 21, 2025 (Package version 7.12.7 published 4 months ago)

---

*This documentation is based on the official npm package page and DefinitelyTyped repository.*
