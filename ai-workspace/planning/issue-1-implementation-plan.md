# Issue #1: Content Automation MCP Ingestion Server Implementation Plan

## Overview
Implement a Model Context Protocol (MCP) server for content ingestion with validation and processing capabilities. This server will provide tools and resources for ingesting articles, ads, and landing pages with schema validation using the shared content-automation-schemas package.

## GitHub Issue
- **Repository**: https://github.com/leeray75/content-automation-mcp-ingestion
- **Issue**: #1
- **Title**: Implement MCP server for content ingestion

## Implementation Plan

### Phase 1: Project Setup and Architecture
- [x] Create project structure following MCP server best practices
- [x] Set up TypeScript configuration with ESNext modules
- [x] Configure package.json with MCP SDK dependencies
- [x] Create environment configuration (.env.example)
- [x] Set up Git ignore patterns
- [x] Create mcp.json metadata file for MCP client discovery

### Phase 2: Core Services and Utilities
- [x] Implement logger utility using Pino
- [x] Create constants and type definitions
- [x] Implement content validator using Zod schemas from content-automation-schemas
- [x] Create ingestion service with in-memory storage
- [x] Add error handling and validation logic

### Phase 3: MCP Implementation
- [x] Create MCP tool handlers for content ingestion
- [x] Implement MCP resource handlers for status and records
- [x] Set up MCP server with SDK integration
- [x] Configure request handlers for tools and resources
- [x] Add proper MCP response formatting

### Phase 4: Transport Layer
- [x] Implement STDIO transport for MCP clients
- [x] Create HTTP transport with Express server
- [x] Add SSE (Server-Sent Events) support for MCP over HTTP
- [x] Implement health check and metadata endpoints
- [x] Add CORS support for browser-based clients

### Phase 5: Testing and Quality Assurance
- [x] Create unit tests for ingestion service
- [x] Add test coverage for validation logic
- [x] Implement basic integration tests
- [x] Set up test scripts in package.json

### Phase 6: Deployment and Documentation
- [x] Create multi-stage Dockerfile for production deployment
- [x] Add development scripts for local testing
- [x] Create comprehensive README documentation
- [x] Add ai-workspace planning and completion reports

## Technical Decisions

### Architecture Choices
- **Language**: TypeScript with ESNext modules for modern Node.js compatibility
- **MCP SDK**: @modelcontextprotocol/sdk for standard MCP implementation
- **Validation**: Zod schemas from shared content-automation-schemas package
- **Logging**: Pino for structured JSON logging with pretty printing in development
- **Transport**: Dual support for STDIO (MCP clients) and HTTP (web/testing)

### Schema Integration
- Use file: dependency to reference ../content-automation-schemas
- Import Zod schemas directly for runtime validation
- Support for articles, ads, and landing pages content types
- Automatic content type detection from validated data structure

### Storage Strategy
- In-memory storage for initial implementation (Map-based)
- Persistent storage can be added later (file system, database)
- UUID-based record identification
- Status tracking (pending, processing, completed, failed)

### Error Handling
- Structured error responses with validation details
- Graceful degradation for invalid content
- Comprehensive logging for debugging
- HTTP status codes aligned with REST conventions

## Success Criteria

### Functional Requirements
- [x] Accept and validate content via MCP tools
- [x] Provide ingestion status via MCP resources
- [x] Support articles, ads, and landing pages
- [x] Return structured validation errors
- [x] Maintain ingestion history and statistics

### Non-Functional Requirements
- [x] Follow MCP server documentation template
- [x] Support both STDIO and HTTP transports
- [x] Provide comprehensive logging
- [x] Include health check endpoints
- [x] Docker containerization support

### Testing Requirements
- [x] Unit tests for core services (>80% coverage goal)
- [x] Integration tests for MCP handlers
- [x] Manual testing with MCP Inspector
- [x] HTTP endpoint testing with curl/Postman

## API Specification

### MCP Tools
1. **ingest_content**
   - Description: Ingest and validate content (articles, ads, landing pages)
   - Input: content (object), contentType (optional), metadata (optional)
   - Output: Ingestion response with ID, status, and validation results

2. **get_ingestion_stats**
   - Description: Get ingestion service statistics
   - Input: None
   - Output: Health status and ingestion statistics

### MCP Resources
1. **ingestion://status** - Current service status and statistics
2. **ingestion://records** - All ingestion records
3. **ingestion://records/completed** - Successfully completed records
4. **ingestion://records/failed** - Failed ingestion records
5. **ingestion://records/{id}** - Specific record by ID

### HTTP Endpoints
- `GET /health` - Health check
- `GET /mcp` - Server metadata
- `GET /sse` - SSE endpoint for MCP connections
- `POST /ingest` - Direct ingestion endpoint (non-MCP)

## Environment Variables
- `NODE_ENV` - Environment (development/production)
- `TRANSPORT` - Transport type (stdio/http)
- `PORT` - HTTP server port (default: 3001)
- `LOG_LEVEL` - Logging level (debug/info/warn/error)
- `STORAGE_PATH` - Future: persistent storage path

## Development Workflow
1. `npm install` - Install dependencies
2. `npm run dev` - Start development server with hot reload
3. `npm test` - Run unit tests
4. `npm run build` - Build for production
5. `npm start` - Start production server

## Deployment Options
1. **Local Development**: `npm run dev` or `./scripts/dev.sh`
2. **Docker**: Build and run containerized version
3. **STDIO Mode**: For direct MCP client integration
4. **HTTP Mode**: For web-based testing and integration

## Next Steps
After implementation completion:
1. Add persistent storage (file system or database)
2. Implement content processing workflows
3. Add authentication and authorization
4. Create content transformation pipelines
5. Add metrics and monitoring
6. Implement content queuing for high-volume scenarios

## Links and References
- [MCP SDK Documentation](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [MCP Inspector](https://www.npmjs.com/package/@modelcontextprotocol/inspector)
- [Content Automation Schemas](../content-automation-schemas)
- [GitHub Repository](https://github.com/leeray75/content-automation-mcp-ingestion)
