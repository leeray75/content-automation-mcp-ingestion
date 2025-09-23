# Issue #9 - Phase 4: Validation and Error Handling

## Overview
**Goal**: Ensure robust validation and proper error handling per Issue #9 specifications

**Duration**: 2-4 hours  
**Priority**: High - Critical for production readiness  
**Dependencies**: Phase 3 completion

## Current State Analysis (from Phase 1)

### Existing Validation Implementation
Based on code review, the following validation components exist:
- ✅ **Zod Schemas**: Basic schemas for Article, Ad, LandingPage
- ✅ **ContentValidator**: Class with validation methods
- ✅ **Error Handling**: Basic error responses in services
- ⚠️ **validateOrThrow Helper**: Missing from Issue #9 requirements

### Gaps Identified
1. **Missing validateOrThrow Helper**: Issue #9 specifically mentions this utility
2. **Request Correlation**: X-Request-Id handling may need enhancement
3. **Error Response Format**: Need to verify compliance with Issue #9 specs

## Implementation Tasks

### Task 1: validateOrThrow Helper Implementation
**Objective**: Implement the validateOrThrow helper mentioned in Issue #9

#### Subtasks
1. **Create validateOrThrow Function**
   ```typescript
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
       throw error;
     }
   }
   ```

2. **Create ValidationError Class**
   ```typescript
   export class ValidationError extends Error {
     constructor(
       message: string,
       public readonly details: z.ZodIssue[]
     ) {
       super(message);
       this.name = 'ValidationError';
     }
   }
   ```

3. **Update ContentValidator to Use validateOrThrow**
   - Replace existing validation logic
   - Use validateOrThrow for consistent error handling
   - Maintain backward compatibility

4. **Integration with Services**
   - Update IngestionService to use validateOrThrow
   - Ensure proper error propagation
   - Maintain existing error response format

#### Expected Outcome
- validateOrThrow helper available and working
- Consistent validation error handling
- Improved error messages with context

### Task 2: Zod Schema Completeness
**Objective**: Ensure all content type schemas are complete and accurate

#### Subtasks
1. **Article Schema Verification**
   ```typescript
   const ArticleSchema = z.object({
     headline: z.string().min(1, "Headline is required"),
     body: z.string().min(1, "Body is required"),
     author: z.string().min(1, "Author is required"),
     publishDate: z.string().datetime("Invalid date format"),
     tags: z.array(z.string()).optional(),
     excerpt: z.string().optional(),
     category: z.string().optional()
   });
   ```

2. **Ad Schema Verification**
   ```typescript
   const AdSchema = z.object({
     adText: z.string().min(1, "Ad text is required"),
     targetAudience: z.string().min(1, "Target audience is required"),
     callToAction: z.string().optional(),
     budget: z.number().positive().optional(),
     duration: z.number().positive().optional(),
     platform: z.string().optional()
   });
   ```

3. **Landing Page Schema Verification**
   ```typescript
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
   ```

4. **Schema Testing**
   - Test each schema with valid data
   - Test with invalid data to verify error messages
   - Ensure error details are helpful

#### Expected Outcome
- Complete and accurate Zod schemas
- Helpful validation error messages
- Comprehensive content type support

### Task 3: HTTP Error Mapping
**Objective**: Ensure proper HTTP error responses per Issue #9 specifications

#### Subtasks
1. **Validation Error Mapping (HTTP 400)**
   ```typescript
   // In HTTP transport layer
   if (error instanceof ValidationError) {
     res.status(400).json({
       error: 'Validation failed',
       message: error.message,
       details: error.details,
       timestamp: new Date().toISOString(),
       requestId: req.headers['x-request-id'] || 'unknown'
     });
     return;
   }
   ```

2. **Internal Error Mapping (HTTP 500)**
   ```typescript
   // Safe error envelope for internal errors
   res.status(500).json({
     error: 'Internal server error',
     message: 'An unexpected error occurred',
     timestamp: new Date().toISOString(),
     requestId: req.headers['x-request-id'] || 'unknown'
     // Note: Don't expose internal error details in production
   });
   ```

3. **Error Response Format Standardization**
   - Consistent error response structure
   - Include request correlation IDs
   - Proper HTTP status codes
   - Safe error messages for production

4. **Error Middleware Implementation**
   ```typescript
   export function errorHandler(
     error: Error,
     req: Request,
     res: Response,
     next: NextFunction
   ) {
     const requestId = req.headers['x-request-id'] as string || randomUUID();
     
     logger.error({ error, requestId }, 'Request error');
     
     if (error instanceof ValidationError) {
       return res.status(400).json({
         error: 'Validation failed',
         message: error.message,
         details: error.details,
         timestamp: new Date().toISOString(),
         requestId
       });
     }
     
     // Default to 500 for unknown errors
     return res.status(500).json({
       error: 'Internal server error',
       message: 'An unexpected error occurred',
       timestamp: new Date().toISOString(),
       requestId
     });
   }
   ```

#### Expected Outcome
- Proper HTTP status codes for different error types
- Consistent error response format
- Safe error messages that don't expose internals
- Request correlation in all error responses

### Task 4: Request Correlation Implementation
**Objective**: Implement X-Request-Id header handling for request tracing

#### Subtasks
1. **Request ID Middleware**
   ```typescript
   export function requestIdMiddleware(
     req: Request,
     res: Response,
     next: NextFunction
   ) {
     const requestId = req.headers['x-request-id'] as string || randomUUID();
     
     // Set on request for downstream use
     req.requestId = requestId;
     
     // Echo back in response headers
     res.setHeader('x-request-id', requestId);
     
     next();
   }
   ```

2. **Logger Integration**
   ```typescript
   // Update logger to include requestId in all log entries
   export function createRequestLogger(requestId: string) {
     return logger.child({ requestId });
   }
   ```

3. **Service Layer Integration**
   - Pass requestId to ingestion service
   - Include in job tracking
   - Add to all log entries

4. **Response Headers**
   - Echo X-Request-Id in all responses
   - Include in error responses
   - Ensure consistency across endpoints

#### Expected Outcome
- Request correlation works end-to-end
- All log entries include request IDs
- Response headers include correlation IDs
- Debugging and tracing improved

## Technical Implementation Details

### ValidationError Class
```typescript
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly details: z.ZodIssue[]
  ) {
    super(message);
    this.name = 'ValidationError';
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      details: this.details
    };
  }
}
```

### Enhanced Content Validator
```typescript
export class ContentValidator {
  static validateArticle(content: unknown): Article {
    return validateOrThrow(content, ArticleSchema, 'article validation');
  }
  
  static validateAd(content: unknown): Ad {
    return validateOrThrow(content, AdSchema, 'ad validation');
  }
  
  static validateLandingPage(content: unknown): LandingPage {
    return validateOrThrow(content, LandingPageSchema, 'landing page validation');
  }
  
  static validateContent(content: unknown, contentType?: string): ValidatedContent {
    if (contentType) {
      switch (contentType) {
        case 'article':
          return { type: 'article', data: this.validateArticle(content) };
        case 'ad':
          return { type: 'ad', data: this.validateAd(content) };
        case 'landingPage':
          return { type: 'landingPage', data: this.validateLandingPage(content) };
        default:
          throw new ValidationError(`Unknown content type: ${contentType}`, []);
      }
    }
    
    // Auto-detect content type and validate
    return this.autoValidateContent(content);
  }
}
```

### Request ID Types
```typescript
// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}
```

## Testing Strategy

### Unit Tests
1. **validateOrThrow Tests**
   - Test with valid data
   - Test with invalid data
   - Test error message formatting
   - Test context parameter

2. **Validation Error Tests**
   - Test error construction
   - Test JSON serialization
   - Test error details format

3. **Schema Tests**
   - Test each content type schema
   - Test edge cases and validation rules
   - Test error message quality

### Integration Tests
1. **HTTP Error Response Tests**
   - Test 400 responses for validation errors
   - Test 500 responses for internal errors
   - Test error response format
   - Test request ID inclusion

2. **Request Correlation Tests**
   - Test X-Request-Id header handling
   - Test request ID generation
   - Test logging integration
   - Test response header echoing

### End-to-End Tests
1. **Full Validation Flow**
   - Submit valid content via HTTP
   - Submit invalid content via HTTP
   - Verify error responses
   - Check request correlation

## Success Criteria
- [ ] validateOrThrow helper implemented and working
- [ ] All content type schemas complete and accurate
- [ ] HTTP error responses follow Issue #9 format
- [ ] Request correlation works end-to-end
- [ ] Validation errors return HTTP 400 with details
- [ ] Internal errors return HTTP 500 with safe envelope
- [ ] All responses include request correlation IDs
- [ ] Logging includes proper correlation IDs

## Risk Assessment

### Low Risk
- Validation logic already exists
- Error handling patterns established
- HTTP response structure defined

### Medium Risk
- validateOrThrow integration may require refactoring
- Request correlation may need middleware updates
- Error response format changes may affect clients

### High Risk
- None identified - mostly enhancement of existing functionality

## Dependencies

### External
- zod (already integrated)
- Express types for request extension

### Internal
- Existing ContentValidator
- HTTP transport layer
- Logging infrastructure
- Ingestion service

## Deliverables
1. **validateOrThrow helper** implemented and tested
2. **Enhanced Zod schemas** with better validation
3. **Standardized error responses** following Issue #9 format
4. **Request correlation system** working end-to-end
5. **Updated error handling** throughout the application
6. **Comprehensive test coverage** for validation and errors

## Next Phase Dependencies
Phase 5 cannot begin until:
- validateOrThrow helper is implemented
- Error responses follow Issue #9 format
- Request correlation works correctly
- All validation tests pass

## Notes
- Focus on Issue #9 compliance for error handling
- Maintain backward compatibility where possible
- Ensure error messages are helpful for debugging
- Don't expose internal details in production errors
