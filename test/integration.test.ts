import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MCPServer } from '../src/server/mcp-server.js';
import { TransportManager } from '../src/server/transport.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

describe('Integration: HTTP endpoints and MCP Client', () => {
  let mcpServer: MCPServer;
  let transportManager: TransportManager;
  let serverPort: number;
  let baseUrl: string;

  beforeAll(async () => {
    // Set up test environment
    process.env.TRANSPORT = 'http';
    process.env.PORT = '0'; // Use ephemeral port
    process.env.MCP_AUTH_ENABLED = 'false'; // Disable auth for integration tests
    
    // Create and start server
    mcpServer = new MCPServer();
    await mcpServer.start();
    
    transportManager = new TransportManager(mcpServer);
    await transportManager.start();
    
    // Get the actual port (since we used 0 for ephemeral)
    // We'll use a default port for testing
    serverPort = parseInt(process.env.PORT || '3001');
    baseUrl = `http://localhost:${serverPort}`;
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

  beforeEach(() => {
    // Reset any test-specific environment variables
    delete process.env.MCP_AUTH_ENABLED;
    delete process.env.MCP_AUTH_METHOD;
    delete process.env.MCP_API_KEY;
    delete process.env.MCP_JWT_SECRET;
  });

  describe('Health Endpoint', () => {
    it('should return health status', async () => {
      const response = await request(baseUrl)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.version).toBe('0.1.0');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('MCP Info Endpoint', () => {
    it('should return server metadata', async () => {
      const response = await request(baseUrl)
        .get('/mcp-info')
        .expect(200);
      
      expect(response.body.name).toBe('content-automation-mcp-ingestion');
      expect(response.body.version).toBe('0.1.0');
      expect(response.body.capabilities).toBeDefined();
      expect(response.body.capabilities.tools).toBeDefined();
      expect(response.body.capabilities.resources).toBeDefined();
      expect(response.body.endpoints).toBeDefined();
      expect(response.body.metadata).toBeDefined();
      expect(response.body.metadata.auth.enabled).toBe(false);
    });
  });

  describe('Direct Ingestion Endpoint', () => {
    it('should accept valid article content', async () => {
      const validArticle = {
        content: {
          headline: 'Integration Test Article',
          body: 'This is an integration test article body.',
          author: 'Integration Tester',
          publishDate: '2025-01-01',
          tags: ['integration', 'test']
        }
      };

      const response = await request(baseUrl)
        .post('/ingest')
        .send(validArticle)
        .expect(202);
      
      expect(response.body.status).toBe('completed');
      expect(response.body.id).toBeDefined();
      expect(response.body.contentType).toBe('article');
      expect(response.body.message).toBe('Content ingested successfully');
    });

    it('should reject invalid content', async () => {
      const invalidContent = {
        content: {
          invalid: 'content structure'
        }
      };

      const response = await request(baseUrl)
        .post('/ingest')
        .send(invalidContent)
        .expect(400);
      
      expect(response.body.status).toBe('failed');
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should handle missing content field', async () => {
      const response = await request(baseUrl)
        .post('/ingest')
        .send({})
        .expect(400);
      
      expect(response.body.status).toBe('failed');
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Records Endpoints', () => {
    let recordId: string;

    beforeAll(async () => {
      // Create a test record
      const validArticle = {
        content: {
          headline: 'Test Record Article',
          body: 'Test body for records endpoint.',
          author: 'Test Author',
          publishDate: '2025-01-01',
          tags: ['test']
        }
      };

      const response = await request(baseUrl)
        .post('/ingest')
        .send(validArticle)
        .expect(202);
      
      recordId = response.body.id;
    });

    it('should return all records', async () => {
      const response = await request(baseUrl)
        .get('/records')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Find our test record
      const testRecord = response.body.find((r: any) => r.id === recordId);
      expect(testRecord).toBeDefined();
      expect(testRecord.status).toBe('completed');
    });

    it('should return specific record by ID', async () => {
      const response = await request(baseUrl)
        .get(`/records/${recordId}`)
        .expect(200);
      
      expect(response.body.id).toBe(recordId);
      expect(response.body.status).toBe('completed');
      expect(response.body.contentType).toBe('article');
    });

    it('should return 404 for non-existent record', async () => {
      const response = await request(baseUrl)
        .get('/records/non-existent-id')
        .expect(404);
      
      expect(response.body.error).toBe('Not found');
      expect(response.body.message).toContain('not found');
    });

    it('should filter records by status', async () => {
      const response = await request(baseUrl)
        .get('/records?status=completed')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      // All returned records should have completed status
      response.body.forEach((record: any) => {
        expect(record.status).toBe('completed');
      });
    });
  });

  describe('MCP Protocol Endpoints', () => {
    it('should handle MCP initialize request', async () => {
      const initializeRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0'
          }
        }
      };

      const response = await request(baseUrl)
        .post('/mcp')
        .send(initializeRequest)
        .expect(200);
      
      expect(response.body.jsonrpc).toBe('2.0');
      expect(response.body.id).toBe(1);
      expect(response.body.result).toBeDefined();
      expect(response.body.result.protocolVersion).toBe('2024-11-05');
      expect(response.body.result.capabilities).toBeDefined();
      expect(response.body.result.serverInfo).toBeDefined();
      expect(response.body.result.serverInfo.name).toBe('content-automation-mcp-ingestion');
    });

    it('should handle tools/list request', async () => {
      const listToolsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      };

      const response = await request(baseUrl)
        .post('/mcp')
        .send(listToolsRequest)
        .expect(200);
      
      expect(response.body.jsonrpc).toBe('2.0');
      expect(response.body.id).toBe(2);
      expect(response.body.result).toBeDefined();
      expect(response.body.result.tools).toBeDefined();
      expect(Array.isArray(response.body.result.tools)).toBe(true);
      
      // Should have ingest_content tool
      const ingestTool = response.body.result.tools.find((tool: any) => tool.name === 'ingest_content');
      expect(ingestTool).toBeDefined();
      expect(ingestTool.description).toBeDefined();
    });

    it('should handle resources/list request', async () => {
      const listResourcesRequest = {
        jsonrpc: '2.0',
        id: 3,
        method: 'resources/list',
        params: {}
      };

      const response = await request(baseUrl)
        .post('/mcp')
        .send(listResourcesRequest)
        .expect(200);
      
      expect(response.body.jsonrpc).toBe('2.0');
      expect(response.body.id).toBe(3);
      expect(response.body.result).toBeDefined();
      expect(response.body.result.resources).toBeDefined();
      expect(Array.isArray(response.body.result.resources)).toBe(true);
      
      // Should have ingestion resources
      const statusResource = response.body.result.resources.find((resource: any) => 
        resource.uri === 'ingestion://status'
      );
      expect(statusResource).toBeDefined();
    });

    it('should handle tools/call request for ingest_content', async () => {
      const callToolRequest = {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'ingest_content',
          arguments: {
            content: {
              headline: 'MCP Tool Test',
              body: 'Testing via MCP tool call.',
              author: 'MCP Tester',
              publishDate: '2025-01-01',
              tags: ['mcp', 'tool']
            }
          }
        }
      };

      const response = await request(baseUrl)
        .post('/mcp')
        .send(callToolRequest)
        .expect(200);
      
      expect(response.body.jsonrpc).toBe('2.0');
      expect(response.body.id).toBe(4);
      expect(response.body.result).toBeDefined();
      expect(response.body.result.content).toBeDefined();
      
      // Parse the result content
      const resultContent = response.body.result.content[0];
      expect(resultContent.type).toBe('text');
      
      const resultData = JSON.parse(resultContent.text);
      expect(resultData.status).toBe('completed');
      expect(resultData.id).toBeDefined();
      expect(resultData.contentType).toBe('article');
    });

    it('should handle invalid MCP requests', async () => {
      const invalidRequest = {
        jsonrpc: '2.0',
        id: 5,
        method: 'invalid/method',
        params: {}
      };

      const response = await request(baseUrl)
        .post('/mcp')
        .send(invalidRequest)
        .expect(200);
      
      expect(response.body.jsonrpc).toBe('2.0');
      expect(response.body.id).toBe(5);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBeDefined();
      expect(response.body.error.message).toBeDefined();
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in responses', async () => {
      const response = await request(baseUrl)
        .get('/health')
        .expect(200);
      
      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['access-control-allow-methods']).toContain('GET');
      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });

    it('should handle OPTIONS requests', async () => {
      const response = await request(baseUrl)
        .options('/health')
        .expect(200);
      
      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['access-control-allow-methods']).toBeDefined();
      expect(response.headers['access-control-allow-headers']).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON in POST requests', async () => {
      const response = await request(baseUrl)
        .post('/ingest')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
      
      // Should return some kind of error response
      expect(response.body).toBeDefined();
    });

    it('should handle requests to non-existent endpoints', async () => {
      await request(baseUrl)
        .get('/non-existent-endpoint')
        .expect(404);
    });
  });

  describe('Authentication Integration (when enabled)', () => {
    it('should work without auth when disabled', async () => {
      process.env.MCP_AUTH_ENABLED = 'false';
      
      const response = await request(baseUrl)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
    });

    // Note: Full auth integration tests would require restarting the server
    // with different auth configurations, which is complex in this test setup.
    // The auth middleware is tested separately in auth.test.ts
  });
});
