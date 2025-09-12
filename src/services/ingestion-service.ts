import { randomUUID } from 'crypto';
import { ContentValidator } from '../utils/validator.js';
import { logger } from '../utils/logger.js';
import { INGESTION_STATUS, CONTENT_TYPES } from '../utils/constants.js';
import type { 
  IngestionRequest, 
  IngestionResponse, 
  IngestionRecord, 
  HealthStatus 
} from '../types/ingestion.js';

export class IngestionService {
  private records: Map<string, IngestionRecord> = new Map();
  private startTime: number = Date.now();

  /**
   * Ingest content with validation
   */
  async ingestContent(request: IngestionRequest): Promise<IngestionResponse> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();

    logger.info('Starting content ingestion');

    try {
      // Validate the content
      const validation = ContentValidator.validateContent(request.content);
      
      if (!validation.success) {
        const response: IngestionResponse = {
          id,
          status: INGESTION_STATUS.FAILED,
          timestamp,
          message: validation.error,
          errors: validation.details
        };

        // Store failed record
        this.records.set(id, {
          id,
          content: request.content,
          contentType: this.determineContentType(request.content),
          status: INGESTION_STATUS.FAILED,
          createdAt: timestamp,
          updatedAt: timestamp,
          metadata: request.metadata,
          errors: validation.details
        });

        logger.warn('Content ingestion failed');
        return response;
      }

      // Determine content type from validated data
      const contentType = this.determineContentType(validation.data);

      // Create successful record
      const record: IngestionRecord = {
        id,
        content: validation.data,
        contentType,
        status: INGESTION_STATUS.COMPLETED,
        createdAt: timestamp,
        updatedAt: timestamp,
        metadata: request.metadata
      };

      this.records.set(id, record);

      const response: IngestionResponse = {
        id,
        status: INGESTION_STATUS.COMPLETED,
        contentType,
        timestamp,
        message: 'Content ingested successfully'
      };

      logger.info('Content ingestion completed');
      return response;

    } catch (error) {
      logger.error('Unexpected error during ingestion');

      const response: IngestionResponse = {
        id,
        status: INGESTION_STATUS.FAILED,
        timestamp,
        message: 'Unexpected error during ingestion',
        errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }]
      };

      // Store failed record
      this.records.set(id, {
        id,
        content: request.content,
        contentType: this.determineContentType(request.content),
        status: INGESTION_STATUS.FAILED,
        createdAt: timestamp,
        updatedAt: timestamp,
        metadata: request.metadata,
        errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }]
      });

      return response;
    }
  }

  /**
   * Get ingestion record by ID
   */
  getRecord(id: string): IngestionRecord | undefined {
    return this.records.get(id);
  }

  /**
   * Get all ingestion records
   */
  getAllRecords(): IngestionRecord[] {
    return Array.from(this.records.values());
  }

  /**
   * Get records by status
   */
  getRecordsByStatus(status: string): IngestionRecord[] {
    return Array.from(this.records.values()).filter(record => record.status === status);
  }

  /**
   * Get service health status
   */
  getHealth(): HealthStatus {
    const uptime = Date.now() - this.startTime;
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      connections: 0, // Will be updated by transport layer
      uptime,
      version: '0.1.0'
    };
  }

  /**
   * Get service statistics
   */
  getStats() {
    const records = Array.from(this.records.values());
    const totalRecords = records.length;
    const completedRecords = records.filter(r => r.status === INGESTION_STATUS.COMPLETED).length;
    const failedRecords = records.filter(r => r.status === INGESTION_STATUS.FAILED).length;

    const contentTypeCounts = records.reduce((acc, record) => {
      acc[record.contentType] = (acc[record.contentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRecords,
      completedRecords,
      failedRecords,
      successRate: totalRecords > 0 ? (completedRecords / totalRecords) * 100 : 0,
      contentTypeCounts,
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * Determine content type from content structure
   */
  private determineContentType(content: any): any {
    if (!content || typeof content !== 'object') {
      return 'unknown';
    }

    if ('headline' in content && 'body' in content && 'author' in content) {
      return CONTENT_TYPES.ARTICLE;
    }
    if ('adText' in content && 'targetAudience' in content) {
      return CONTENT_TYPES.AD;
    }
    if ('pageTitle' in content && 'heroSection' in content) {
      return CONTENT_TYPES.LANDING_PAGE;
    }
    
    return 'unknown';
  }
}
