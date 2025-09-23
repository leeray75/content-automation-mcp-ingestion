import { z } from 'zod';
import { logger } from './logger.js';
import { validateOrThrow, ValidationError } from './validation.js';

// Enhanced schemas per Issue #9 Phase 4 specifications
const ArticleSchema = z.object({
  headline: z.string().min(1, "Headline is required"),
  body: z.string().min(1, "Body is required"),
  author: z.string().min(1, "Author is required"),
  publishDate: z.string().datetime("Invalid date format"),
  tags: z.array(z.string()).optional(),
  excerpt: z.string().optional(),
  category: z.string().optional()
});

const AdSchema = z.object({
  adText: z.string().min(1, "Ad text is required"),
  targetAudience: z.string().min(1, "Target audience is required"),
  callToAction: z.string().optional(),
  budget: z.number().positive().optional(),
  duration: z.number().positive().optional(),
  platform: z.string().optional()
});

const LandingPageSchema = z.object({
  pageTitle: z.string().min(1, "Page title is required"),
  heroSection: z.object({
    headline: z.string().min(1, "Hero headline is required"),
    subheadline: z.string().optional(),
    ctaText: z.string().optional(),
    ctaUrl: z.string().url().optional()
  }),
  sections: z.array(z.object({
    type: z.enum(['text', 'image', 'video', 'form']),
    content: z.string(),
    order: z.number().int().min(0)
  })).optional()
});

const ContentSchema = z.union([ArticleSchema, AdSchema, LandingPageSchema]);

// Export schemas for external use
export { ArticleSchema, AdSchema, LandingPageSchema, ContentSchema };

// Legacy interface for backward compatibility
export interface ValidationResult {
  success: boolean;
  data?: any;
  error?: string;
  details?: any;
}

export class ContentValidator {
  /**
   * Validate content against the appropriate schema using validateOrThrow
   * @throws ValidationError if validation fails
   */
  static validateContent(content: unknown) {
    return validateOrThrow(content, ContentSchema, 'content validation');
  }

  /**
   * Validate specific content types using validateOrThrow
   * @throws ValidationError if validation fails
   */
  static validateArticle(content: unknown) {
    return validateOrThrow(content, ArticleSchema, 'article validation');
  }

  static validateAd(content: unknown) {
    return validateOrThrow(content, AdSchema, 'ad validation');
  }

  static validateLandingPage(content: unknown) {
    return validateOrThrow(content, LandingPageSchema, 'landing page validation');
  }

  /**
   * Legacy method that returns ValidationResult for backward compatibility
   * @deprecated Use validateContent() which throws ValidationError instead
   */
  static validateContentLegacy(content: unknown): ValidationResult {
    try {
      const validatedContent = this.validateContent(content);
      logger.info('Content validation successful');
      
      return {
        success: true,
        data: validatedContent
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn('Content validation failed');
        
        return {
          success: false,
          error: error.message,
          details: error.details
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
   * Determine content type from validated content
   */
  static getContentType(content: any): string {
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
