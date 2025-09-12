import { describe, it, expect, beforeEach } from 'vitest';
import { IngestionService } from '../src/services/ingestion-service.js';
import { INGESTION_STATUS } from '../src/utils/constants.js';

describe('IngestionService', () => {
  let service: IngestionService;

  beforeEach(() => {
    service = new IngestionService();
  });

  describe('ingestContent', () => {
    it('should successfully ingest valid article content', async () => {
      const validArticle = {
        headline: 'Test Article',
        body: 'This is a test article body.',
        author: 'Test Author',
        publishDate: '2025-01-01',
        tags: ['test', 'article']
      };

      const result = await service.ingestContent({
        content: validArticle
      });

      expect(result.status).toBe(INGESTION_STATUS.COMPLETED);
      expect(result.id).toBeDefined();
      expect(result.contentType).toBe('article');
      expect(result.message).toBe('Content ingested successfully');
    });

    it('should fail to ingest invalid content', async () => {
      const invalidContent = {
        invalid: 'content'
      };

      const result = await service.ingestContent({
        content: invalidContent
      });

      expect(result.status).toBe(INGESTION_STATUS.FAILED);
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength.greaterThan(0);
    });

    it('should store ingestion records', async () => {
      const validArticle = {
        headline: 'Test Article',
        body: 'This is a test article body.',
        author: 'Test Author',
        publishDate: '2025-01-01',
        tags: ['test', 'article']
      };

      const result = await service.ingestContent({
        content: validArticle,
        metadata: { source: 'test' }
      });

      const record = service.getRecord(result.id);
      expect(record).toBeDefined();
      expect(record?.id).toBe(result.id);
      expect(record?.status).toBe(INGESTION_STATUS.COMPLETED);
      expect(record?.metadata?.source).toBe('test');
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      // Ingest some test content
      await service.ingestContent({
        content: {
          headline: 'Test Article',
          body: 'Test body',
          author: 'Test Author',
          publishDate: '2025-01-01',
          tags: ['test']
        }
      });

      await service.ingestContent({
        content: { invalid: 'content' }
      });

      const stats = service.getStats();
      
      expect(stats.totalRecords).toBe(2);
      expect(stats.completedRecords).toBe(1);
      expect(stats.failedRecords).toBe(1);
      expect(stats.successRate).toBe(50);
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const health = service.getHealth();
      
      expect(health.status).toBe('healthy');
      expect(health.version).toBe('0.1.0');
      expect(health.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});
