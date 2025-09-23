import { z } from 'zod';

/**
 * Custom validation error class that wraps Zod validation errors
 * with a consistent structure for error handling
 */
export class ValidationError extends Error {
  public readonly name = 'ValidationError';
  
  constructor(
    message: string,
    public readonly details: z.ZodIssue[]
  ) {
    super(message);
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
  
  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      details: this.details
    };
  }
}

/**
 * Validate data against a Zod schema and throw ValidationError on failure
 * 
 * @param data - The data to validate
 * @param schema - The Zod schema to validate against
 * @param context - Optional context string to include in error message
 * @returns The validated and typed data
 * @throws ValidationError if validation fails
 */
export function validateOrThrow<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  context?: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const contextMsg = context ? ` (${context})` : '';
      throw new ValidationError(
        `Validation failed${contextMsg}`,
        error.errors
      );
    }
    // Re-throw non-Zod errors as-is
    throw error;
  }
}
