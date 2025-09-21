import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  InitializeRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { IngestionService } from '../services/ingestion-service.js';
import { ToolHandlers } from '../handlers/tool-handlers.js';
import { ResourceHandlers } from '../handlers/resource-handlers.js';
import { logger } from '../utils/logger.js';
import { SERVER_INFO } from '../utils/constants.js';

export class MCPServer {
  private server: Server;
  private ingestionService: IngestionService;
  private toolHandlers: ToolHandlers;
  private resourceHandlers: ResourceHandlers;

  constructor() {
    this.server = new Server(
      {
        name: SERVER_INFO.name,
        version: SERVER_INFO.version,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    // Initialize services and handlers
    this.ingestionService = new IngestionService();
    this.toolHandlers = new ToolHandlers(this.ingestionService);
    this.resourceHandlers = new ResourceHandlers(this.ingestionService);

    this.setupHandlers();
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers() {
    // Initialize handler (required by MCP protocol)
    this.server.setRequestHandler(InitializeRequestSchema, async (request) => {
      logger.info('MCP initialize request handled successfully');
      return {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          resources: {},
        },
        serverInfo: {
          name: SERVER_INFO.name,
          version: SERVER_INFO.version,
        },
      };
    });

    // Tools handlers
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return await this.toolHandlers.handleListTools();
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const result = await this.toolHandlers.handleCallTool({
        name: request.params.name,
        arguments: request.params.arguments,
      });
      return result;
    });

    // Resources handlers
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return await this.resourceHandlers.handleListResources();
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      return await this.resourceHandlers.handleReadResource({
        uri: request.params.uri,
      });
    });

    logger.info('MCP request handlers configured');
  }

  /**
   * Get the underlying MCP server instance
   */
  getServer(): Server {
    return this.server;
  }

  /**
   * Get the ingestion service instance
   */
  getIngestionService(): IngestionService {
    return this.ingestionService;
  }

  /**
   * Start the MCP server
   */
  async start() {
    logger.info('Starting MCP server');
  }

  /**
   * Stop the MCP server
   */
  async stop() {
    logger.info('Stopping MCP server');
  }
}
