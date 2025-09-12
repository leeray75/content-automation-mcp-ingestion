export const SERVER_INFO = {
  name: process.env.MCP_SERVER_NAME || 'content-automation-mcp-ingestion',
  version: process.env.MCP_SERVER_VERSION || '0.1.0',
  description: 'MCP server for content ingestion with validation and processing'
};

export const DEFAULT_PORT = 3001;
export const DEFAULT_TRANSPORT = 'http';
export const DEFAULT_LOG_LEVEL = 'info';

export const CONTENT_TYPES = {
  ARTICLE: 'article',
  AD: 'ad',
  LANDING_PAGE: 'landingPage'
} as const;

export const INGESTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];
export type IngestionStatus = typeof INGESTION_STATUS[keyof typeof INGESTION_STATUS];
