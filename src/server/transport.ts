import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { MCPServer } from './mcp-server.js';
import { logger } from '../utils/logger.js';
import { DEFAULT_PORT } from '../utils/constants.js';
import bearerAuthMiddleware from './middleware/auth.js';
import { globalEventQueue, EventSubscriber, MCPEvent } from './eventQueue.js';
import { randomUUID } from 'crypto';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';

export class TransportManager {
  private mcpServer: MCPServer;
  private app?: express.Application;
  private httpServer?: any;

  constructor(mcpServer: MCPServer) {
    this.mcpServer = mcpServer;
  }

  /**
   * Start transport based on environment
   */
  async start() {
    const transport = process.env.TRANSPORT || 'http';
    
    // Explicitly reject stdio in Docker containers
    if (transport.toLowerCase() === 'stdio' && process.env.IN_DOCKER === 'true') {
      logger.error('STDIO transport is not supported in Docker containers. Use HTTP transport instead.');
      logger.error('To run with STDIO, use node/npm directly on the host: TRANSPORT=stdio npm start');
      throw new Error('STDIO transport disabled in Docker containers');
    }
    
    switch (transport.toLowerCase()) {
      case 'http':
        await this.startHttpTransport();
        break;
      default:
        logger.error(`Unsupported transport: ${transport}. Only 'http' is supported.`);
        throw new Error(`Unsupported transport: ${transport}`);
    }
  }

  /**
   * Start HTTP transport with Express
   */
  private async startHttpTransport() {
    const port = parseInt(process.env.PORT || DEFAULT_PORT.toString());
    
    logger.info('Starting HTTP transport');
    
    this.app = express();
    
    // Middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // CORS headers
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Expose-Headers', 'mcp-session-id');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }
      next();
    });

    // Authentication middleware (disabled by default)
    this.app.use(bearerAuthMiddleware);

    // Health endpoint
    this.app.get('/health', (req, res) => {
      const health = this.mcpServer.getIngestionService().getHealth();
      res.json(health);
    });

    // MCP metadata endpoint (for Inspector discovery)
    this.app.get('/mcp-info', (req, res) => {
      const stats = this.mcpServer.getIngestionService().getStats();
      const eventStats = globalEventQueue.getStats();
      
      res.json({
        name: 'content-automation-mcp-ingestion',
        version: '0.1.0',
        description: 'MCP server for content ingestion with validation and processing',
        capabilities: {
          tools: [
            {
              name: 'ingest_content',
              description: 'Ingest and validate content for processing'
            },
            {
              name: 'get_ingestion_stats',
              description: 'Get ingestion service statistics'
            }
          ],
          resources: [
            {
              uri: 'ingestion://status',
              name: 'Ingestion Status',
              description: 'Current status of the ingestion service'
            },
            {
              uri: 'ingestion://records',
              name: 'Ingestion Records',
              description: 'All ingestion records with filtering support'
            }
          ]
        },
        endpoints: {
          http: {
            health: '/health',
            ingest: '/ingest',
            records: '/records',
            recordById: '/records/:id'
          },
          sse: '/sse',
          mcp: '/mcp'
        },
        metadata: {
          authEnabled: process.env.MCP_AUTH_ENABLED === 'true',
          transport: 'http',
          port: parseInt(process.env.PORT || DEFAULT_PORT.toString()),
          stats: {
            ingestion: stats,
            events: eventStats
          }
        }
      });
    });

    // SSE endpoint for event streaming
    this.app.get('/sse', (req, res) => {
      const subscriberId = randomUUID();
      logger.info({ subscriberId }, 'SSE connection requested');
      
      // Set SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Create subscriber
      const subscriber: EventSubscriber = {
        id: subscriberId,
        send: (event: MCPEvent) => {
          const sseData = `event: ${event.event}\ndata: ${JSON.stringify(event.data)}\nid: ${event.id}\n\n`;
          res.write(sseData);
        },
        close: () => {
          if (!res.destroyed) {
            res.end();
          }
        }
      };

      // Subscribe to event queue
      globalEventQueue.subscribe(subscriber);

      // Handle client disconnect
      req.on('close', () => {
        logger.info({ subscriberId }, 'SSE connection closed');
        globalEventQueue.unsubscribe(subscriberId);
      });

      req.on('error', (error) => {
        logger.error({ error, subscriberId }, 'SSE connection error');
        globalEventQueue.unsubscribe(subscriberId);
      });
    });

    // Map to store transports by session ID
    const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

    // MCP Streamable HTTP endpoint (modern implementation)
    this.app.post('/mcp', express.json(), async (req, res) => {
      try {
        logger.info('MCP request received');
        
        // Check for existing session ID
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        let transport: StreamableHTTPServerTransport;

        if (sessionId && transports[sessionId]) {
          // Reuse existing transport
          transport = transports[sessionId];
          logger.info('Reusing existing MCP transport for session: ' + sessionId);
        } else if (!sessionId && isInitializeRequest(req.body)) {
          // New initialization request
          logger.info('Creating new MCP transport for initialize request');
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (sessionId) => {
              // Store the transport by session ID
              transports[sessionId] = transport;
              logger.info('MCP session initialized: ' + sessionId);
            },
          });

          // Clean up transport when closed
          transport.onclose = () => {
            if (transport.sessionId) {
              delete transports[transport.sessionId];
              logger.info('MCP transport closed for session: ' + transport.sessionId);
            }
          };

          // Connect to the MCP server
          await this.mcpServer.getServer().connect(transport);
          logger.info('MCP server connected via StreamableHTTP');
        } else {
          // Invalid request
          logger.error('Invalid MCP request: No valid session ID provided');
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Bad Request: No valid session ID provided',
            },
            id: null,
          });
          return;
        }

        // Handle the request
        await transport.handleRequest(req, res, req.body);
        
      } catch (error) {
        logger.error('Error handling MCP request: ' + (error instanceof Error ? error.message : String(error)));
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: 'Internal server error',
              data: error instanceof Error ? error.message : 'Unknown error'
            },
            id: null,
          });
        }
      }
    });

    // Handle GET requests for server-to-client notifications via SSE
    this.app.get('/mcp', async (req, res) => {
      // Check if this is a request for MCP session handling (has session ID)
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      if (sessionId) {
        if (!transports[sessionId]) {
          res.status(400).send('Invalid or missing session ID');
          return;
        }
        
        const transport = transports[sessionId];
        await transport.handleRequest(req, res);
        return;
      }
      
      // If no session ID, redirect to metadata endpoint
      res.redirect('/mcp-info');
    });

    // Handle DELETE requests for session termination
    this.app.delete('/mcp', async (req, res) => {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
      }
      
      const transport = transports[sessionId];
      await transport.handleRequest(req, res);
    });

    // Records endpoints
    this.app.get('/records', (req, res) => {
      try {
        const status = req.query.status as string;
        const records = status 
          ? this.mcpServer.getIngestionService().getRecordsByStatus(status)
          : this.mcpServer.getIngestionService().getAllRecords();
        res.json(records);
      } catch (error) {
        logger.error({ error }, 'Error fetching records');
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    this.app.get('/records/:id', (req, res) => {
      try {
        const record = this.mcpServer.getIngestionService().getRecord(req.params.id);
        if (!record) {
          res.status(404).json({
            error: 'Not found',
            message: `Record with id ${req.params.id} not found`
          });
          return;
        }
        res.json(record);
      } catch (error) {
        logger.error({ error, recordId: req.params.id }, 'Error fetching record');
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Simple ingestion endpoint (non-MCP)
    this.app.post('/ingest', async (req, res) => {
      try {
        const result = await this.mcpServer.getIngestionService().ingestContent({
          content: req.body.content,
          contentType: req.body.contentType,
          metadata: req.body.metadata
        });

        // Push event to queue for SSE subscribers
        globalEventQueue.pushEvent({
          event: 'ingest:result',
          data: {
            id: result.id,
            status: result.status,
            contentType: result.contentType || 'unknown',
            timestamp: new Date().toISOString()
          }
        });

        if (result.status === 'failed') {
          res.status(400).json(result);
        } else {
          res.status(202).json(result);
        }
      } catch (error) {
        logger.error({ error }, 'Error handling ingestion request');
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Start HTTP server
    this.httpServer = this.app.listen(port, () => {
      logger.info(`HTTP server listening on port ${port}`);
      logger.info(`Health check: http://localhost:${port}/health`);
      logger.info(`MCP SSE endpoint: http://localhost:${port}/sse`);
      logger.info(`Direct ingestion: http://localhost:${port}/ingest`);
    });
  }

  /**
   * Stop the transport
   */
  async stop() {
    if (this.httpServer) {
      logger.info('Stopping HTTP server');
      this.httpServer.close();
    }
    
    await this.mcpServer.stop();
  }
}
