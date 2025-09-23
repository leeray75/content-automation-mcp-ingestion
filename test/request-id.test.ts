import { describe, it, expect, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requestIdMiddleware } from '../src/server/middleware/request-id.js';

interface MockRequest extends Partial<Request> {
  requestId?: string;
}

describe('Request ID Middleware', () => {
  let mockRequest: MockRequest;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let responseHeaders: Record<string, string>;

  beforeEach(() => {
    responseHeaders = {};
    
    mockRequest = {
      headers: {},
      requestId: undefined
    };
    
    mockResponse = {
      setHeader: (name: string, value: string | number | readonly string[]) => {
        responseHeaders[name.toLowerCase()] = String(value);
        return mockResponse as Response;
      }
    };
    
    nextFunction = () => {};
  });

  describe('when X-Request-Id header is provided', () => {
    it('should use existing request ID and echo it in response', () => {
      const existingRequestId = 'existing-request-123';
      mockRequest.headers = { 'x-request-id': existingRequestId };

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.requestId).toBe(existingRequestId);
      expect(responseHeaders['x-request-id']).toBe(existingRequestId);
    });

    it('should handle case-insensitive header names', () => {
      const existingRequestId = 'case-insensitive-456';
      mockRequest.headers = { 'X-REQUEST-ID': existingRequestId };

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.requestId).toBe(existingRequestId);
      expect(responseHeaders['x-request-id']).toBe(existingRequestId);
    });

    it('should handle array header values by taking first element', () => {
      const requestIds = ['first-id', 'second-id'];
      mockRequest.headers = { 'x-request-id': requestIds };

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.requestId).toBe('first-id');
      expect(responseHeaders['x-request-id']).toBe('first-id');
    });
  });

  describe('when X-Request-Id header is not provided', () => {
    it('should generate a new UUID and set it in response', () => {
      mockRequest.headers = {};

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.requestId).toBeDefined();
      expect(typeof mockRequest.requestId).toBe('string');
      expect(mockRequest.requestId!.length).toBeGreaterThan(0);
      
      // Should be a valid UUID format (basic check)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(mockRequest.requestId!)).toBe(true);
      
      expect(responseHeaders['x-request-id']).toBe(mockRequest.requestId);
    });

    it('should generate unique IDs for different requests', () => {
      const request1: MockRequest = { headers: {}, requestId: undefined };
      const request2: MockRequest = { headers: {}, requestId: undefined };
      const response1Headers: Record<string, string> = {};
      const response2Headers: Record<string, string> = {};

      const response1 = {
        setHeader: (name: string, value: string | number | readonly string[]) => {
          response1Headers[name.toLowerCase()] = String(value);
          return response1 as Response;
        }
      };

      const response2 = {
        setHeader: (name: string, value: string | number | readonly string[]) => {
          response2Headers[name.toLowerCase()] = String(value);
          return response2 as Response;
        }
      };

      requestIdMiddleware(
        request1 as Request,
        response1 as Response,
        nextFunction
      );

      requestIdMiddleware(
        request2 as Request,
        response2 as Response,
        nextFunction
      );

      expect(request1.requestId).toBeDefined();
      expect(request2.requestId).toBeDefined();
      expect(request1.requestId).not.toBe(request2.requestId);
      expect(response1Headers['x-request-id']).toBe(request1.requestId);
      expect(response2Headers['x-request-id']).toBe(request2.requestId);
    });
  });

  describe('when header is empty string', () => {
    it('should generate new UUID for empty string header', () => {
      mockRequest.headers = { 'x-request-id': '' };

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.requestId).toBeDefined();
      expect(mockRequest.requestId).not.toBe('');
      expect(typeof mockRequest.requestId).toBe('string');
      
      // Should be a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(mockRequest.requestId!)).toBe(true);
      
      expect(responseHeaders['x-request-id']).toBe(mockRequest.requestId);
    });
  });

  describe('middleware behavior', () => {
    it('should call next() function', () => {
      let nextCalled = false;
      const testNext = () => { nextCalled = true; };

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        testNext
      );

      expect(nextCalled).toBe(true);
    });

    it('should not throw errors', () => {
      expect(() => {
        requestIdMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );
      }).not.toThrow();
    });
  });
});
