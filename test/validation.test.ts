import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validateOrThrow, ValidationError } from '../src/utils/validation.js';
import { ArticleSchema, AdSchema, LandingPageSchema } from '../src/utils/validator.js';

describe('validateOrThrow', () => {
  describe('with valid data', () => {
    it('should return typed object for valid article', () => {
      const validArticle = {
        headline: 'Test Article',
        body: 'This is a test article body',
        author: 'Test Author',
        publishDate: '2025-01-01T00:00:00.000Z',
        tags: ['test', 'article']
      };

      const result = validateOrThrow(validArticle, ArticleSchema);
      
      expect(result).toEqual(validArticle);
      expect(result.headline).toBe('Test Article');
      expect(result.author).toBe('Test Author');
    });

    it('should return typed object for valid ad', () => {
      const validAd = {
        adText: 'Buy our product!',
        targetAudience: 'Tech enthusiasts',
        callToAction: 'Click here',
        budget: 1000,
        platform: 'social'
      };

      const result = validateOrThrow(validAd, AdSchema);
      
      expect(result).toEqual(validAd);
      expect(result.adText).toBe('Buy our product!');
      expect(result.budget).toBe(1000);
    });

    it('should return typed object for valid landing page', () => {
      const validLandingPage = {
        pageTitle: 'Welcome to Our Site',
        heroSection: {
          headline: 'Hero Headline',
          subheadline: 'Hero Subheadline',
          ctaText: 'Get Started',
          ctaUrl: 'https://example.com/signup'
        },
        sections: [
          {
            type: 'text' as const,
            content: 'Some text content',
            order: 0
          }
        ]
      };

      const result = validateOrThrow(validLandingPage, LandingPageSchema);
      
      expect(result).toEqual(validLandingPage);
      expect(result.pageTitle).toBe('Welcome to Our Site');
      expect(result.heroSection.headline).toBe('Hero Headline');
    });
  });

  describe('with invalid data', () => {
    it('should throw ValidationError for invalid article', () => {
      const invalidArticle = {
        headline: '', // Empty headline should fail
        body: 'Valid body',
        author: 'Valid author',
        publishDate: 'invalid-date' // Invalid date format
      };

      expect(() => {
        validateOrThrow(invalidArticle, ArticleSchema);
      }).toThrow(ValidationError);

      try {
        validateOrThrow(invalidArticle, ArticleSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.details).toHaveLength(2); // headline and publishDate errors
        expect(validationError.details[0].message).toContain('Headline is required');
        expect(validationError.details[1].message).toContain('Invalid date format');
      }
    });

    it('should throw ValidationError for missing required fields', () => {
      const incompleteAd = {
        adText: 'Valid ad text'
        // Missing targetAudience
      };

      expect(() => {
        validateOrThrow(incompleteAd, AdSchema);
      }).toThrow(ValidationError);

      try {
        validateOrThrow(incompleteAd, AdSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        // Check for the actual error message from Zod
        expect(validationError.details.some(d => 
          d.message.includes('Target audience is required') || 
          d.message.includes('Required') ||
          d.path.includes('targetAudience')
        )).toBe(true);
      }
    });

    it('should throw ValidationError for invalid URL', () => {
      const invalidLandingPage = {
        pageTitle: 'Valid Title',
        heroSection: {
          headline: 'Valid Headline',
          ctaUrl: 'not-a-valid-url' // Invalid URL
        }
      };

      expect(() => {
        validateOrThrow(invalidLandingPage, LandingPageSchema);
      }).toThrow(ValidationError);

      try {
        validateOrThrow(invalidLandingPage, LandingPageSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.details.some(d => d.message.includes('Invalid url'))).toBe(true);
      }
    });
  });

  describe('with context parameter', () => {
    it('should include context in error message when provided', () => {
      const invalidData = { invalid: 'data' };
      const context = 'user profile validation';

      try {
        validateOrThrow(invalidData, ArticleSchema, context);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.message).toContain(context);
        expect(validationError.message).toBe(`Validation failed (${context})`);
      }
    });

    it('should not include context when not provided', () => {
      const invalidData = { invalid: 'data' };

      try {
        validateOrThrow(invalidData, ArticleSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.message).toBe('Validation failed');
      }
    });
  });
});

describe('ValidationError', () => {
  it('should have correct name and structure', () => {
    const mockZodIssues: z.ZodIssue[] = [
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['headline'],
        message: 'Expected string, received number'
      }
    ];

    const error = new ValidationError('Test validation failed', mockZodIssues);
    
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Test validation failed');
    expect(error.details).toEqual(mockZodIssues);
    expect(error).toBeInstanceOf(Error);
  });

  it('should serialize to JSON correctly', () => {
    const mockZodIssues: z.ZodIssue[] = [
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['headline'],
        message: 'Expected string, received number'
      }
    ];

    const error = new ValidationError('Test validation failed', mockZodIssues);
    const json = error.toJSON();
    
    expect(json).toEqual({
      name: 'ValidationError',
      message: 'Test validation failed',
      details: mockZodIssues
    });
  });
});
