# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- [issue-2](https://github.com/leeray75/content-automation-stack/issues/2) - Add pino-pretty dependency to resolve logger crash in production environments
- Resolved service crash: "unable to determine transport target for pino-pretty" by adding missing dependency
- Fixed Docker container restart loop caused by missing logging dependency

## [0.3.0] - 2025-09-21
### Changed
- [issue-5](https://github.com/leeray75/content-automation-mcp-ingestion/issues/5) - **Breaking**: Removed SSE transport support - server now uses Streamable HTTP only
- [issue-5](https://github.com/leeray75/content-automation-mcp-ingestion/issues/5) - Updated documentation to remove SSE references and reflect modern HTTP streaming transport
- [issue-5](https://github.com/leeray75/content-automation-mcp-ingestion/issues/5) - Enhanced authentication middleware with JWT and API key support
- [issue-5](https://github.com/leeray75/content-automation-mcp-ingestion/issues/5) - Improved transport implementation using StreamableHTTPServerTransport

### Removed
- [issue-5](https://github.com/leeray75/content-automation-mcp-ingestion/issues/5) - SSE transport endpoint `/sse` - use `/mcp` for MCP Inspector connections
- [issue-5](https://github.com/leeray75/content-automation-mcp-ingestion/issues/5) - SSE-related imports and dependencies from transport layer

## [0.2.0] - 2025-09-21
### Added
- [issue-4](https://github.com/leeray75/content-automation-mcp-ingestion/issues/4) - **MCP Build Server Modernization Complete** - Upgraded to @modelcontextprotocol/sdk@1.18.1 with full Inspector integration
- [issue-4](https://github.com/leeray75/content-automation-mcp-ingestion/issues/4) - Streamable HTTP transport implementation according to official MCP SDK documentation
- [issue-4](https://github.com/leeray75/content-automation-mcp-ingestion/issues/4) - **Critical Fix**: Added missing InitializeRequestSchema handler for MCP protocol compliance
- [issue-4](https://github.com/leeray75/content-automation-mcp-ingestion/issues/4) - Session management with proper session ID handling for Streamable HTTP
- [issue-4](https://github.com/leeray75/content-automation-mcp-ingestion/issues/4) - Bearer authentication middleware skeleton (disabled by default, MCP_AUTH_ENABLED)
- [issue-4](https://github.com/leeray75/content-automation-mcp-ingestion/issues/4) - Enhanced SSE event streaming with backlog queue management
- [issue-4](https://github.com/leeray75/content-automation-mcp-ingestion/issues/4) - Multi-stage Docker build with node:22-alpine for production optimization

### Changed
- [issue-4](https://github.com/leeray75/content-automation-mcp-ingestion/issues/4) - **Breaking**: Removed STDIO transport support (use HTTP inspector script only)
- [issue-4](https://github.com/leeray75/content-automation-mcp-ingestion/issues/4) - Complete transport.ts rewrite implementing proper Streamable HTTP according to MCP SDK v1.18.1
- [issue-4](https://github.com/leeray75/content-automation-mcp-ingestion/issues/4) - Enhanced error handling and JSON-RPC response formatting
- [issue-4](https://github.com/leeray75/content-automation-mcp-ingestion/issues/4) - Improved Docker container security with non-root user and proper permissions

### Fixed
- [issue-4](https://github.com/leeray75/content-automation-mcp-ingestion/issues/4) - **Major Fix**: Resolved "Error handling MCP initialize" messages that prevented Inspector connections
- [issue-4](https://github.com/leeray75/content-automation-mcp-ingestion/issues/4) - Fixed MCP protocol handshake completion with proper capabilities response
- [issue-4](https://github.com/leeray75/content-automation-mcp-ingestion/issues/4) - Resolved transport lifecycle management and session cleanup issues
- [issue-4](https://github.com/leeray75/content-automation-mcp-ingestion/issues/4) - Fixed TypeScript compilation errors in logger calls throughout the application

### Technical Details
- **Inspector Status**: ✅ **WORKING** - Successfully connecting via StreamableHttp transport
- **MCP SDK Version**: Upgraded from 0.5.0 to 1.18.1 (latest)
- **Transport**: Streamable HTTP (primary) with SSE fallback for backward compatibility
- **Protocol Compliance**: Full MCP protocol handshake and JSON-RPC response formatting
- **Session Management**: Proper session ID handling with cleanup and error recovery
- **Docker**: Multi-stage build with security hardening and performance optimization

## [0.1.1] - 2025-09-12
### Fixed
- [issue-2](https://github.com/leeray75/content-automation-mcp-ingestion/issues/2) - Enable MCP Inspector connectivity and Docker support for Ingestion server
- Fixed HTTP /mcp POST endpoint to properly handle MCP Inspector connections using SSE transport
- Resolved TypeScript compilation errors in logger calls for improved build stability
- Enhanced mcp.json with detailed tool input schemas and resource URIs for better Inspector metadata display

### Added
- Comprehensive MCP Inspector testing documentation with step-by-step instructions
- Docker usage examples with proper environment variable configuration
- Acceptance criteria checklist for validating all transport modes (stdio dev, stdio built, Docker HTTP)
- Troubleshooting guide for common Inspector connection issues
- Enhanced tool schemas with proper input validation for Inspector interface
- Resource URI definitions for improved Inspector navigation and resource access

### Changed
- Improved HTTP transport implementation with proper SSE integration for MCP connections
- Enhanced error handling and logging for transport connection management
- Updated README.md with detailed testing procedures and Docker deployment instructions
- Simplified logger interface calls to ensure TypeScript compatibility

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
