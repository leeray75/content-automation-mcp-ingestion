# Issue #5 Phase 2: Core Implementation

## Overview
Remove SSE transport code and endpoints from the core server implementation. This phase focuses on the main transport.ts file and related server code.

## Objectives
- [ ] Remove SSE import and unused transport code
- [ ] Remove `/sse` endpoint and event streaming functionality
- [ ] Clean up SSE-related middleware and headers
- [ ] Preserve HTTP streaming transport for MCP connections
- [ ] Update endpoint metadata

## Tasks

### Core Transport Changes (`src/server/transport.ts`)
- [ ] Remove `SSEServerTransport` import from `@modelcontextprotocol/sdk/server/sse.js`
- [ ] Remove `/sse` GET endpoint handler (lines ~120-160)
- [ ] Remove SSE-related headers in CORS middleware
- [ ] Remove `globalEventQueue` SSE subscriber logic
- [ ] Update `/mcp-info` endpoint to remove SSE endpoint reference
- [ ] Remove SSE logging statements in startup messages

### Event Queue Cleanup (`src/server/eventQueue.ts`)
- [ ] Remove SSE-specific subscriber interface if only used for SSE
- [ ] Keep event queue if used by other features, remove if SSE-only
- [ ] Update event publishing to remove SSE-specific formatting

### Middleware Updates
- [ ] Remove SSE-specific CORS headers (`text/event-stream`, `Cache-Control: no-cache`)
- [ ] Keep standard HTTP CORS headers for MCP streaming
- [ ] Remove SSE connection tracking if present

## Files to Modify
- `src/server/transport.ts` (primary changes)
- `src/server/eventQueue.ts` (if SSE-specific)
- `src/server/middleware/auth.ts` (review for SSE references)

## Verification Steps
- [ ] Server starts successfully with HTTP transport
- [ ] `/health` endpoint responds correctly
- [ ] `/mcp` endpoint handles MCP connections via HTTP streaming
- [ ] `/ingest` endpoint continues to work
- [ ] No SSE endpoints accessible (404 on `/sse`)
- [ ] MCP Inspector can connect via HTTP

## Acceptance Criteria
- [ ] No SSE imports or references in transport code
- [ ] HTTP streaming transport fully functional
- [ ] All existing non-SSE endpoints operational
- [ ] Server startup logs show only HTTP endpoints
- [ ] No breaking changes to MCP protocol functionality

## Estimated Time
2-3 hours

## Risk Mitigation
- Preserve all `StreamableHTTPServerTransport` functionality
- Keep event queue if used by non-SSE features
- Maintain backward compatibility for HTTP MCP connections
- Test thoroughly before proceeding to next phase

## Next Phase
Phase 3 will scaffold authentication middleware for enterprise integration.
