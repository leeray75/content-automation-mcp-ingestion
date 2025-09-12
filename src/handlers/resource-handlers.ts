import { ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { IngestionService } from '../services/ingestion-service.js';
import { logger } from '../utils/logger.js';
import type { MCPResourceRequest } from '../types/ingestion.js';

export class ResourceHandlers {
  constructor(private ingestionService: IngestionService) {}

  /**
   * Handle resources/list request
   */
  async handleListResources() {
    logger.debug('Handling resources/list request');
    
    return {
      resources: [
        {
          uri: 'ingestion://status',
          name: 'Ingestion Status',
          description: 'Current status and statistics of the ingestion service',
          mimeType: 'application/json'
        },
        {
          uri: 'ingestion://records',
          name: 'Ingestion Records',
          description: 'All ingestion records',
          mimeType: 'application/json'
        },
        {
          uri: 'ingestion://records/completed',
          name: 'Completed Records',
          description: 'Successfully completed ingestion records',
          mimeType: 'application/json'
        },
        {
          uri: 'ingestion://records/failed',
          name: 'Failed Records',
          description: 'Failed ingestion records',
          mimeType: 'application/json'
        }
      ]
    };
  }

  /**
   * Handle resources/read request
   */
  async handleReadResource(request: MCPResourceRequest) {
    logger.debug('Handling resources/read request');

    try {
      switch (request.uri) {
        case 'ingestion://status':
          return await this.handleStatusResource();
        
        case 'ingestion://records':
          return await this.handleRecordsResource();
        
        case 'ingestion://records/completed':
          return await this.handleCompletedRecordsResource();
        
        case 'ingestion://records/failed':
          return await this.handleFailedRecordsResource();
        
        default:
          // Check if it's a specific record request
          const recordMatch = request.uri.match(/^ingestion:\/\/records\/(.+)$/);
          if (recordMatch) {
            return await this.handleSpecificRecordResource(recordMatch[1]);
          }
          
          throw new Error(`Unknown resource URI: ${request.uri}`);
      }
    } catch (error) {
      logger.error('Error handling resource read');
      
      return {
        contents: [{
          uri: request.uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            error: `Error reading resource: ${error instanceof Error ? error.message : 'Unknown error'}`
          }, null, 2)
        }]
      };
    }
  }

  /**
   * Handle status resource
   */
  private async handleStatusResource() {
    const health = this.ingestionService.getHealth();
    const stats = this.ingestionService.getStats();

    return {
      contents: [{
        uri: 'ingestion://status',
        mimeType: 'application/json',
        text: JSON.stringify({
          health,
          stats,
          timestamp: new Date().toISOString()
        }, null, 2)
      }]
    };
  }

  /**
   * Handle all records resource
   */
  private async handleRecordsResource() {
    const records = this.ingestionService.getAllRecords();

    return {
      contents: [{
        uri: 'ingestion://records',
        mimeType: 'application/json',
        text: JSON.stringify({
          records,
          count: records.length,
          timestamp: new Date().toISOString()
        }, null, 2)
      }]
    };
  }

  /**
   * Handle completed records resource
   */
  private async handleCompletedRecordsResource() {
    const records = this.ingestionService.getRecordsByStatus('completed');

    return {
      contents: [{
        uri: 'ingestion://records/completed',
        mimeType: 'application/json',
        text: JSON.stringify({
          records,
          count: records.length,
          timestamp: new Date().toISOString()
        }, null, 2)
      }]
    };
  }

  /**
   * Handle failed records resource
   */
  private async handleFailedRecordsResource() {
    const records = this.ingestionService.getRecordsByStatus('failed');

    return {
      contents: [{
        uri: 'ingestion://records/failed',
        mimeType: 'application/json',
        text: JSON.stringify({
          records,
          count: records.length,
          timestamp: new Date().toISOString()
        }, null, 2)
      }]
    };
  }

  /**
   * Handle specific record resource
   */
  private async handleSpecificRecordResource(recordId: string) {
    const record = this.ingestionService.getRecord(recordId);

    if (!record) {
      return {
        contents: [{
          uri: `ingestion://records/${recordId}`,
          mimeType: 'application/json',
          text: JSON.stringify({
            error: `Record not found: ${recordId}`
          }, null, 2)
        }]
      };
    }

    return {
      contents: [{
        uri: `ingestion://records/${recordId}`,
        mimeType: 'application/json',
        text: JSON.stringify({
          record,
          timestamp: new Date().toISOString()
        }, null, 2)
      }]
    };
  }
}
