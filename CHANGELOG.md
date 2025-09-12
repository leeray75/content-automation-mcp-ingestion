# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-09-11
### Added
- [issue-1](https://github.com/leeray75/content-automation-mcp-ingestion/issues/1) - Complete MCP server implementation for content ingestion with validation and processing capabilities
- MCP SDK integration with @modelcontextprotocol/sdk for standard protocol compliance
- Content validation system using Zod schemas for articles, ads, and landing pages
- Dual transport support: STDIO for MCP clients and HTTP for web-based integration
- Express HTTP server with REST endpoints for direct content ingestion
- In-memory storage system with UUID-based record tracking and status management
- Comprehensive structured logging with Pino JSON logger
- TypeScript configuration with ESNext modules for modern Node.js compatibility
- Docker support with multi-stage build for production deployment
- Unit testing framework with Vitest and coverage reporting
- Development tooling with hot-reload support using tsx
- MCP Inspector integration for interactive testing and debugging
- Health check endpoint for monitoring and load balancer integration
- Server-Sent Events (SSE) support for browser-based MCP clients
- Graceful shutdown handling with proper resource cleanup
- Comprehensive error handling and validation throughout the application
- AI workspace documentation with implementation planning and completion reports
- Project scaffolding following MCP server documentation template best practices

### Technical Implementation
- **MCP Tools**: `ingest_content` for content validation and ingestion, `get_ingestion_stats` for service metrics
- **MCP Resources**: `ingestion://status`, `ingestion://records`, `ingestion://records/completed`, `ingestion://records/failed`, `ingestion://records/{id}`
- **HTTP Endpoints**: `GET /health`, `GET /mcp`, `GET /sse`, `POST /ingest`
- **Content Types**: Support for articles, ads, and landing pages with automatic type detection
- **Validation**: Schema-based validation with detailed error reporting and structured responses
- **Storage**: In-memory Map-based storage with full CRUD operations and filtering
- **Logging**: Configurable log levels with pretty printing in development mode
- **Testing**: Unit tests for core ingestion service with validation scenarios

### Infrastructure
- TypeScript strict mode configuration with comprehensive type checking
- ESNext module system for optimal Node.js performance
- Express.js middleware stack with CORS support and request parsing
- Pino high-performance logging with structured JSON output
- Vitest testing framework with coverage reporting capabilities
- Docker containerization with security best practices (non-root user)
- Development scripts for local testing and debugging workflows
- MCP Inspector integration scripts for all transport modes
