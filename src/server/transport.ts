import express from 'express';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { MCPServer } from './mcp-server.js';
import { logger } from '../utils/logger.js';
import { DEFAULT_PORT } from '../utils/constants.js';

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
    const transport = process.env.TRANSPORT || 'stdio';
    
    switch (transport.toLowerCase()) {
      case 'http':
        await this.startHttpTransport();
        break;
      case 'stdio':
      default:
        await this.startStdioTransport();
        break;
    }
  }

  /**
   * Start STDIO transport
   */
  private async startStdioTransport() {
    logger.info('Starting STDIO transport');
    
    const transport = new StdioServerTransport();
    await this.mcpServer.getServer().connect(transport);
    
    logger.info('MCP server connected via STDIO');
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

    // Health endpoint
    this.app.get('/health', (req, res) => {
      const health = this.mcpServer.getIngestionService().getHealth();
      res.json(health);
    });

    // MCP metadata endpoint
    this.app.get('/mcp', (req, res) => {
      res.json({
        name: 'content-automation-mcp-ingestion',
        version: '0.1.0',
        description: 'MCP server for content ingestion with validation and processing',
        capabilities: {
          tools: ['ingest_content', 'get_ingestion_stats'],
          resources: ['ingestion://status', 'ingestion://records']
        }
      });
    });

    // SSE endpoint for MCP
    this.app.get('/sse', async (req, res) => {
      logger.info('SSE connection requested');
      
      const transport = new SSEServerTransport('/sse', res);
      await this.mcpServer.getServer().connect(transport);
      
      logger.info('MCP server connected via SSE');
    });

    // MCP initialize endpoint (for streamable HTTP)
    this.app.post('/mcp', express.raw({ type: 'application/json' }), async (req, res) => {
      try {
        logger.info('MCP initialize request received');
        
        // For now, we'll use SSE transport as a fallback
        // In a full implementation, you'd use StreamableHTTPServerTransport
        res.status(501).json({
          error: 'Streamable HTTP transport not yet implemented',
          message: 'Please use SSE endpoint at /sse for MCP connections'
        });
      } catch (error) {
        logger.error('Error handling MCP initialize');
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

        if (result.status === 'failed') {
          res.status(400).json(result);
        } else {
          res.status(202).json(result);
        }
      } catch (error) {
        logger.error('Error handling ingestion request');
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
