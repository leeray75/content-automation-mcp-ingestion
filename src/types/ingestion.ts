import { ContentType, IngestionStatus } from '../utils/constants.js';

export interface IngestionRequest {
  content: unknown;
  contentType?: ContentType;
  metadata?: Record<string, any>;
}

export interface IngestionResponse {
  id: string;
  status: IngestionStatus;
  contentType?: ContentType;
  timestamp: string;
  message?: string;
  errors?: any[];
}

export interface IngestionRecord {
  id: string;
  content: any;
  contentType: ContentType;
  status: IngestionStatus;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
  errors?: any[];
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  connections: number;
  uptime: number;
  version: string;
}

export interface MCPToolRequest {
  name: string;
  arguments?: Record<string, any>;
}

export interface MCPResourceRequest {
  uri: string;
}
