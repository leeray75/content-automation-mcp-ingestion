import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import autocannon from 'autocannon';
import { MCPServer } from '../src/server/mcp-server.js';
import { TransportManager } from '../src/server/transport.js';

describe('Performance Tests', () => {
  let mcpServer: MCPServer;
  let transportManager: TransportManager;
  let serverPort: number;
  let baseUrl: string;

  beforeAll(async () => {
    // Set up test environment
    process.env.TRANSPORT = 'http';
    process.env.PORT = '0'; // Use ephemeral port
    process.env.MCP_AUTH_ENABLED = 'false'; // Disable auth for performance tests
    
    // Create and start server
    mcpServer = new MCPServer();
    await mcpServer.start();
    
    transportManager = new TransportManager(mcpServer);
    await transportManager.start();
    
    // Use a test port for performance testing
    serverPort = 3002; // Different from integration tests
    baseUrl = `http://localhost:${serverPort}`;
    
    // Wait a moment for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    if (transportManager) {
      await transportManager.stop();
    }
    
    // Clean up environment
    delete process.env.TRANSPORT;
    delete process.env.PORT;
    delete process.env.MCP_AUTH_ENABLED;
  });

  describe('Health Endpoint Performance', () => {
    it('should handle load on health endpoint', async () => {
      const result = await autocannon({
        url: `${baseUrl}/health`,
        connections: 10,
        duration: 5,
        method: 'GET'
      });
      
      // Performance assertions
      expect(result.latency.p95).toBeLessThan(100); // 95th percentile < 100ms
      expect(result.requests.average).toBeGreaterThan(100); // > 100 req/sec
      expect(result.errors).toBe(0); // No errors
      expect(result.timeouts).toBe(0); // No timeouts
      
      console.log('Health endpoint performance:', {
        avgLatency: result.latency.average,
        p95Latency: result.latency.p95,
        avgReqPerSec: result.requests.average,
        errors: result.errors
      });
    }, 10000); // 10 second timeout
  });

  describe('Ingestion Endpoint Performance', () => {
    it('should handle load on ingestion endpoint', async () => {
      const testPayload = {
        content: {
          headline: 'Performance Test Article',
          body: 'This is a performance test article body with some content to make it realistic.',
          author: 'Performance Tester',
          publishDate: '2025-01-01',
          tags: ['performance', 'test', 'load']
        }
      };

      const result = await autocannon({
        url: `${baseUrl}/ingest`,
        connections: 20,
        duration: 10,
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });
      
      // Performance assertions
      expect(result.latency.p95).toBeLessThan(200); // 95th percentile < 200ms
      expect(result.requests.average).toBeGreaterThan(50); // > 50 req/sec
      expect(result.errors).toBe(0); // No errors
      expect(result.timeouts).toBe(0); // No timeouts
      expect(result.non2xx).toBe(0); // All successful responses
      
      console.log('Ingestion endpoint performance:', {
        avgLatency: result.latency.average,
        p95Latency: result.latency.p95,
        avgReqPerSec: result.requests.average,
        errors: result.errors,
        non2xx: result.non2xx
      });
    }, 15000); // 15 second timeout
  });

  describe('MCP Protocol Performance', () => {
    it('should handle load on MCP initialize requests', async () => {
      const initializePayload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'perf-test-client',
            version: '1.0.0'
          }
        }
      };

      const result = await autocannon({
        url: `${baseUrl}/mcp`,
        connections: 15,
        duration: 8,
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(initializePayload)
      });
      
      // Performance assertions
      expect(result.latency.p95).toBeLessThan(150); // 95th percentile < 150ms
      expect(result.requests.average).toBeGreaterThan(75); // > 75 req/sec
      expect(result.errors).toBe(0); // No errors
      expect(result.timeouts).toBe(0); // No timeouts
      
      console.log('MCP initialize performance:', {
        avgLatency: result.latency.average,
        p95Latency: result.latency.p95,
        avgReqPerSec: result.requests.average,
        errors: result.errors
      });
    }, 12000); // 12 second timeout
  });

  describe('MCP Tools Performance', () => {
    it('should handle load on tools/list requests', async () => {
      const listToolsPayload = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      };

      const result = await autocannon({
        url: `${baseUrl}/mcp`,
        connections: 25,
        duration: 6,
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(listToolsPayload)
      });
      
      // Performance assertions
      expect(result.latency.p95).toBeLessThan(100); // 95th percentile < 100ms
      expect(result.requests.average).toBeGreaterThan(100); // > 100 req/sec
      expect(result.errors).toBe(0); // No errors
      expect(result.timeouts).toBe(0); // No timeouts
      
      console.log('MCP tools/list performance:', {
        avgLatency: result.latency.average,
        p95Latency: result.latency.p95,
        avgReqPerSec: result.requests.average,
        errors: result.errors
      });
    }, 10000); // 10 second timeout
  });

  describe('Mixed Workload Performance', () => {
    it('should handle mixed request types under load', async () => {
      // Test with multiple request types using autocannon's requests array
      const requests = [
        {
          method: 'GET',
          path: '/health'
        },
        {
          method: 'GET',
          path: '/mcp-info'
        },
        {
          method: 'POST',
          path: '/ingest',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            content: {
              headline: 'Mixed Load Test',
              body: 'Testing mixed workload performance.',
              author: 'Load Tester',
              publishDate: '2025-01-01',
              tags: ['mixed', 'load']
            }
          })
        }
      ];

      const result = await autocannon({
        url: baseUrl,
        connections: 30,
        duration: 12,
        requests: requests
      });
      
      // Performance assertions for mixed workload
      expect(result.latency.p95).toBeLessThan(250); // 95th percentile < 250ms
      expect(result.requests.average).toBeGreaterThan(40); // > 40 req/sec
      expect(result.errors).toBeLessThan(5); // < 5 errors allowed for mixed load
      expect(result.timeouts).toBe(0); // No timeouts
      
      // Calculate error rate
      const totalRequests = result.requests.total || 1;
      const errorRate = result.errors / totalRequests;
      expect(errorRate).toBeLessThan(0.01); // < 1% error rate
      
      console.log('Mixed workload performance:', {
        avgLatency: result.latency.average,
        p95Latency: result.latency.p95,
        avgReqPerSec: result.requests.average,
        errors: result.errors,
        errorRate: errorRate,
        totalRequests: totalRequests
      });
    }, 18000); // 18 second timeout
  });

  describe('Stress Testing', () => {
    it('should handle high concurrency without degradation', async () => {
      const result = await autocannon({
        url: `${baseUrl}/health`,
        connections: 100, // High concurrency
        duration: 5,
        method: 'GET'
      });
      
      // Stress test assertions (more lenient)
      expect(result.latency.p95).toBeLessThan(500); // 95th percentile < 500ms
      expect(result.requests.average).toBeGreaterThan(50); // > 50 req/sec
      expect(result.timeouts).toBeLessThan(10); // < 10 timeouts allowed
      
      // Calculate success rate
      const totalRequests = result.requests.total || 1;
      const successRate = (totalRequests - result.errors - result.timeouts) / totalRequests;
      expect(successRate).toBeGreaterThan(0.95); // > 95% success rate
      
      console.log('Stress test performance:', {
        avgLatency: result.latency.average,
        p95Latency: result.latency.p95,
        maxLatency: result.latency.max,
        avgReqPerSec: result.requests.average,
        errors: result.errors,
        timeouts: result.timeouts,
        successRate: successRate
      });
    }, 10000); // 10 second timeout
  });

  describe('Memory and Resource Usage', () => {
    it('should maintain reasonable resource usage under load', async () => {
      // Record initial memory usage
      const initialMemory = process.memoryUsage();
      
      const result = await autocannon({
        url: `${baseUrl}/ingest`,
        connections: 50,
        duration: 10,
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          content: {
            headline: 'Memory Test Article',
            body: 'Testing memory usage under load with a reasonably sized payload.',
            author: 'Memory Tester',
            publishDate: '2025-01-01',
            tags: ['memory', 'resource', 'test']
          }
        })
      });
      
      // Record final memory usage
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
      
      // Performance and resource assertions
      expect(result.errors).toBe(0);
      expect(memoryIncreaseMB).toBeLessThan(100); // < 100MB memory increase
      
      console.log('Resource usage test:', {
        avgReqPerSec: result.requests.average,
        totalRequests: result.requests.total,
        memoryIncreaseMB: memoryIncreaseMB.toFixed(2),
        initialHeapMB: (initialMemory.heapUsed / (1024 * 1024)).toFixed(2),
        finalHeapMB: (finalMemory.heapUsed / (1024 * 1024)).toFixed(2)
      });
    }, 15000); // 15 second timeout
  });
});
