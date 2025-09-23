# Issue #9: MCP Server Prototype Support for Ingestion Workflow

## Overview
Deliver a minimal but production-shaped MCP ingestion server that works in both STDIO and HTTP modes, exposes MCP tools/resources, and offers a direct HTTP ingestion endpoint for prototype E2E integration (UI/API/stack). Implementation should strictly follow the repository architecture described in README.md.

## Current State Analysis

### Existing Implementation (from completion reports review)
Based on the completion reports in `ai-workspace/completion-reports/`, the following components are already implemented:

#### ✅ Already Implemented
- **Core Architecture**: MCP server with SDK integration (Issues #1, #4, #5)
- **HTTP Transport**: Streamable HTTP transport with Express server (Issue #5)
- **Authentication**: Bearer token and API key auth middleware (Issues #4, #5)
- **Validation**: Zod schemas for content validation (Issue #1)
- **Service Layer**: In-memory ingestion service with stats (Issue #1)
- **MCP Handlers**: Tool and resource handlers for MCP protocol (Issue #1)
- **Docker Support**: Multi-stage build with Node 22 (Issues #2, #4)
- **Testing**: Unit and integration tests (Issue #5)
- **Logging**: Pino structured logging (Issue #1, fixed in Issue #2)

#### ⚠️ Potential Gaps (to verify)
- **STDIO Transport**: May have been removed in Issue #5 (SSE removal)
- **Request ID Correlation**: Need to verify X-Request-Id handling
- **Zod Schema Completeness**: Verify all content types (article/ad/landingPage)
- **HTTP Endpoint Completeness**: Verify all required endpoints exist
- **MCP Resource URIs**: Verify all ingestion:// resources are implemented

## Implementation Plan

### Phase 1: Current State Assessment
**Goal**: Verify existing implementation against Issue #9 requirements

#### Tasks
1. **Code Review**
   - Read all source files in `src/` to understand current implementation
   - Verify transport modes (STDIO vs HTTP)
   - Check MCP tools and resources implementation
   - Validate Zod schemas against Issue #9 requirements

2. **Build and Test Verification**
   - Run `npm install` to ensure dependencies are correct
   - Run `npm run build` to verify TypeScript compilation
   - Run `npm test` to verify existing tests pass
   - Test HTTP mode: `TRANSPORT=http PORT=3001 npm start`
   - Test STDIO mode: `TRANSPORT=stdio npm start` (if supported)

3. **Gap Analysis**
   - Document what's missing vs Issue #9 requirements
   - Identify any breaking changes needed
   - Plan minimal changes to meet acceptance criteria

#### Success Criteria
- [ ] Complete understanding of current codebase
- [ ] Build and tests pass
- [ ] Gap analysis document created
- [ ] Phase 2 plan refined based on findings

### Phase 2: Transport Layer Reconciliation
**Goal**: Ensure both STDIO and HTTP transports work as specified

#### Tasks
1. **STDIO Transport**
   - If removed, implement minimal STDIO transport for local development
   - Ensure MCP Inspector can connect via STDIO for dev workflow
   - Maintain compatibility with existing HTTP transport

2. **HTTP Transport Verification**
   - Verify all required endpoints exist and work:
     - `GET /health` - Health check with stats
     - `GET /mcp` - Server metadata and capabilities
     - `POST /ingest` - Direct ingestion endpoint
   - Ensure proper error handling and response formats

3. **Transport Manager**
   - Verify `TransportManager` correctly selects transport based on `TRANSPORT` env var
   - Ensure Docker defaults to HTTP mode
   - Ensure local dev can use STDIO mode

#### Success Criteria
- [ ] Both STDIO and HTTP transports functional
- [ ] All HTTP endpoints respond correctly
- [ ] Transport selection works via environment variables
- [ ] MCP Inspector can connect in both modes

### Phase 3: MCP Protocol Compliance
**Goal**: Ensure full MCP protocol compliance with required tools and resources

#### Tasks
1. **MCP Tools Verification**
   - Verify `ingest_content` tool implementation
   - Verify `get_ingestion_stats` tool implementation
   - Ensure tools return proper MCP ToolResult format
   - Test tools via MCP Inspector

2. **MCP Resources Verification**
   - Verify all ingestion:// resources are implemented:
     - `ingestion://status`
     - `ingestion://records`
     - `ingestion://records/completed`
     - `ingestion://records/failed`
     - `ingestion://records/{id}`
   - Test resources via MCP Inspector

3. **Server Metadata**
   - Update `mcp.json` with complete tool and resource schemas
   - Ensure `GET /mcp` endpoint returns comprehensive metadata
   - Verify capabilities are correctly advertised

#### Success Criteria
- [ ] All MCP tools functional and tested
- [ ] All MCP resources functional and tested
- [ ] MCP Inspector shows all tools and resources
- [ ] Server metadata is complete and accurate

### Phase 4: Validation and Error Handling
**Goal**: Ensure robust validation and proper error handling

#### Tasks
1. **Zod Schema Validation**
   - Verify schemas for Article, Ad, LandingPage content types
   - Ensure `validateOrThrow` helper exists and works correctly
   - Test validation with valid and invalid payloads

2. **HTTP Error Mapping**
   - Ensure Zod validation errors map to HTTP 400 with details
   - Ensure internal errors map to HTTP 500 with safe envelope
   - Test error scenarios via HTTP endpoints

3. **Request Correlation**
   - Implement X-Request-Id header handling
   - Generate request ID if not provided
   - Include requestId and jobId in all log entries

#### Success Criteria
- [ ] All content types validate correctly
- [ ] Error responses are properly formatted
- [ ] Request correlation works end-to-end
- [ ] Logging includes proper correlation IDs

### Phase 5: Testing and Documentation
**Goal**: Comprehensive testing and documentation updates

#### Tasks
1. **Testing**
   - Add/update unit tests for any new functionality
   - Add integration tests for HTTP endpoints
   - Test MCP Inspector connectivity in both modes
   - Run acceptance criteria checklist

2. **Documentation**
   - Update README.md with current functionality
   - Update CHANGELOG.md with Issue #9 changes
   - Create completion report
   - Update any outdated documentation

3. **Docker and Scripts**
   - Verify Docker build and run scripts work
   - Test container in HTTP mode
   - Verify health checks work in container

#### Success Criteria
- [ ] All tests pass
- [ ] Documentation is current and accurate
- [ ] Docker deployment works correctly
- [ ] Acceptance criteria fully met

## Acceptance Criteria Checklist

### Transport Support
- [ ] STDIO transport works for local development
- [ ] HTTP transport works for container deployment
- [ ] Transport selection via TRANSPORT environment variable
- [ ] Docker defaults to HTTP mode

### HTTP Endpoints
- [ ] `GET /health` returns health status with stats
- [ ] `GET /mcp` returns server metadata and capabilities
- [ ] `POST /ingest` accepts and validates content
- [ ] Proper error handling for all endpoints

### MCP Protocol
- [ ] `ingest_content` tool works via MCP Inspector
- [ ] `get_ingestion_stats` tool works via MCP Inspector
- [ ] All ingestion:// resources accessible via MCP Inspector
- [ ] Server capabilities correctly advertised

### Validation and Error Handling
- [ ] Zod schemas validate Article, Ad, LandingPage content
- [ ] Validation errors return HTTP 400 with details
- [ ] Internal errors return HTTP 500 with safe envelope
- [ ] Request correlation works with X-Request-Id

### Configuration and Environment
- [ ] TRANSPORT, PORT, NODE_ENV, LOG_LEVEL environment variables work
- [ ] Docker image supports HTTP mode
- [ ] Non-root user in container
- [ ] Health checks work in container

### Testing and Quality
- [ ] Unit tests pass for validator and service
- [ ] Integration tests pass for HTTP endpoints
- [ ] MCP Inspector connectivity verified
- [ ] Build process works correctly

## Risk Assessment

### Low Risk
- Most functionality already implemented in previous issues
- Well-tested codebase with comprehensive completion reports
- Docker and build processes already working

### Medium Risk
- STDIO transport may need re-implementation if removed
- Request correlation may need enhancement
- Some integration tests may need updates

### High Risk
- None identified - this appears to be primarily a verification and minor enhancement task

## Dependencies

### Internal
- Existing codebase from Issues #1, #2, #4, #5
- content-automation-schemas package (if used)

### External
- @modelcontextprotocol/sdk (pinned to 1.18.1)
- Node.js 22
- Docker for containerization

## Timeline Estimate

- **Phase 1**: 2-4 hours (assessment and gap analysis)
- **Phase 2**: 2-6 hours (transport reconciliation)
- **Phase 3**: 1-3 hours (MCP protocol verification)
- **Phase 4**: 2-4 hours (validation and error handling)
- **Phase 5**: 2-4 hours (testing and documentation)

**Total**: 9-21 hours depending on gaps found in Phase 1

## Success Definition

Issue #9 will be considered complete when:

1. All acceptance criteria are met and verified
2. MCP Inspector can connect and use all tools/resources in both STDIO and HTTP modes
3. All HTTP endpoints work correctly with proper error handling
4. Docker deployment works with HTTP transport
5. Documentation is updated and accurate
6. All tests pass

The implementation should be minimal and focused on meeting the prototype requirements while maintaining the existing architecture and quality standards established in previous issues.
