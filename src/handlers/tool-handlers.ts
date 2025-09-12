import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { IngestionService } from '../services/ingestion-service.js';
import { logger } from '../utils/logger.js';
import type { MCPToolRequest } from '../types/ingestion.js';

export class ToolHandlers {
  constructor(private ingestionService: IngestionService) {}

  /**
   * Handle tools/list request
   */
  async handleListTools() {
    logger.debug('Handling tools/list request');
    
    return {
      tools: [
        {
          name: 'ingest_content',
          description: 'Ingest and validate content (articles, ads, landing pages)',
          inputSchema: {
            type: 'object',
            properties: {
              content: {
                type: 'object',
                description: 'The content to ingest (article, ad, or landing page)'
              },
              contentType: {
                type: 'string',
                enum: ['article', 'ad', 'landingPage'],
                description: 'Optional content type hint'
              },
              metadata: {
                type: 'object',
                description: 'Optional metadata for the content'
              }
            },
            required: ['content']
          }
        },
        {
          name: 'get_ingestion_stats',
          description: 'Get ingestion service statistics',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        }
      ]
    };
  }

  /**
   * Handle tools/call request
   */
  async handleCallTool(request: MCPToolRequest) {
    logger.debug('Handling tools/call request');

    try {
      switch (request.name) {
        case 'ingest_content':
          return await this.handleIngestContent(request.arguments);
        
        case 'get_ingestion_stats':
          return await this.handleGetStats();
        
        default:
          return {
            content: [{
              type: 'text',
              text: `Unknown tool: ${request.name}`
            }],
            isError: true
          };
      }
    } catch (error) {
      logger.error('Error handling tool call');
      
      return {
        content: [{
          type: 'text',
          text: `Error executing tool ${request.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }

  /**
   * Handle ingest_content tool
   */
  private async handleIngestContent(args: any) {
    if (!args || !args.content) {
      return {
        content: [{
          type: 'text',
          text: 'Missing required argument: content'
        }],
        isError: true
      };
    }

    const result = await this.ingestionService.ingestContent({
      content: args.content,
      contentType: args.contentType,
      metadata: args.metadata
    });

    const responseText = JSON.stringify({
      id: result.id,
      status: result.status,
      contentType: result.contentType,
      timestamp: result.timestamp,
      message: result.message,
      ...(result.errors && { errors: result.errors })
    }, null, 2);

    return {
      content: [{
        type: 'text',
        text: responseText
      }],
      isError: result.status === 'failed'
    };
  }

  /**
   * Handle get_ingestion_stats tool
   */
  private async handleGetStats() {
    const stats = this.ingestionService.getStats();
    const health = this.ingestionService.getHealth();

    const responseText = JSON.stringify({
      health,
      stats
    }, null, 2);

    return {
      content: [{
        type: 'text',
        text: responseText
      }]
    };
  }
}
