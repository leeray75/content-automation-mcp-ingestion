import { z } from 'zod';
import { logger } from './logger.js';

// Temporary schemas until content-automation-schemas is properly built
const ArticleSchema = z.object({
  headline: z.string(),
  body: z.string(),
  author: z.string(),
  publishDate: z.string(),
  tags: z.array(z.string()).optional()
});

const AdSchema = z.object({
  adText: z.string(),
  targetAudience: z.string(),
  callToAction: z.string().optional()
});

const LandingPageSchema = z.object({
  pageTitle: z.string(),
  heroSection: z.object({
    headline: z.string(),
    subheadline: z.string().optional()
  })
});

const ContentSchema = z.union([ArticleSchema, AdSchema, LandingPageSchema]);

export interface ValidationResult {
  success: boolean;
  data?: any;
  error?: string;
  details?: any;
}

export class ContentValidator {
  /**
   * Validate content against the appropriate schema
   */
  static validateContent(content: unknown): ValidationResult {
    try {
      const validatedContent = ContentSchema.parse(content);
      logger.info('Content validation successful');
      
      return {
        success: true,
        data: validatedContent
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Content validation failed');
        
        return {
          success: false,
          error: 'Validation failed',
          details: error.errors
        };
      }
      
      logger.error('Unexpected validation error');
      return {
        success: false,
        error: 'Unexpected validation error'
      };
    }
  }

  /**
   * Validate specific content type
   */
  static validateArticle(content: unknown): ValidationResult {
    return this.validateWithSchema(content, ArticleSchema, 'article');
  }

  static validateAd(content: unknown): ValidationResult {
    return this.validateWithSchema(content, AdSchema, 'ad');
  }

  static validateLandingPage(content: unknown): ValidationResult {
    return this.validateWithSchema(content, LandingPageSchema, 'landingPage');
  }

  /**
   * Helper method to validate with a specific schema
   */
  private static validateWithSchema(content: unknown, schema: z.ZodSchema, type: string): ValidationResult {
    try {
      const validatedContent = schema.parse(content);
      logger.info(`${type} validation successful`);
      
      return {
        success: true,
        data: validatedContent
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn(`${type} validation failed`);
        
        return {
          success: false,
          error: `${type} validation failed`,
          details: error.errors
        };
      }
      
      logger.error(`Unexpected ${type} validation error`);
      return {
        success: false,
        error: `Unexpected ${type} validation error`
      };
    }
  }

  /**
   * Determine content type from validated content
   */
  private static getContentType(content: any): string {
    if ('headline' in content && 'body' in content && 'author' in content) {
      return 'article';
    }
    if ('adText' in content && 'targetAudience' in content) {
      return 'ad';
    }
    if ('pageTitle' in content && 'heroSection' in content) {
      return 'landingPage';
    }
    return 'unknown';
  }
}
