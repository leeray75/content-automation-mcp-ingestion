# Issue #4 — SDK Pinning Plan

## Overview
This document outlines the plan for pinning the @modelcontextprotocol/sdk to version 1.18.1 as part of Phase 1 modernization efforts.

## Rationale for Pinning to 1.18.1
- Ensures reproducible builds and consistent SDK behavior across environments
- Provides a stable foundation for Phase 2 refactoring work
- Avoids unexpected breaking changes during development
- Allows controlled testing of SDK compatibility before major refactoring

## SDK APIs Exercised by Repository
Based on code analysis, this repository uses the following SDK components:

### Types and Schemas
- `ListResourcesRequestSchema` - for resource listing validation
- `ReadResourceRequestSchema` - for resource reading validation  
- `CallToolRequestSchema` - for tool call validation
- `ListToolsRequestSchema` - for tool listing validation

### Server Components
- `Server` - main MCP server class from `@modelcontextprotocol/sdk/server/index.js`
- `StdioServerTransport` - STDIO transport (being phased out)
- `SSEServerTransport` - Server-Sent Events transport for HTTP

### Handler Integration
- Resource handlers in `src/handlers/resource-handlers.ts`
- Tool handlers in `src/handlers/tool-handlers.ts`
- Server setup in `src/server/mcp-server.ts`
- Transport management in `src/server/transport.ts`

## Test Steps to Validate SDK Behavior
1. **Compilation Test**: Verify TypeScript compilation succeeds
2. **Unit Tests**: Run existing test suite to ensure no regressions
3. **HTTP Transport Test**: Start server in HTTP mode and verify endpoints
4. **Inspector Integration**: Test HTTP inspector connectivity
5. **Handler Functionality**: Verify resource and tool handlers work correctly

## Success Criteria
- [ ] TypeScript compilation passes without errors
- [ ] All existing unit tests pass
- [ ] HTTP server starts successfully on Node 22
- [ ] Inspector HTTP script connects and lists capabilities
- [ ] Resource handlers (ListResources, ReadResource) function correctly
- [ ] Tool handlers (ListTools, CallTool) function correctly
- [ ] No runtime errors during basic server operations

## Risk Mitigation
- **API Changes**: Review SDK changelog for breaking changes between 1.0.0 and 1.18.1
- **Type Compatibility**: Monitor TypeScript compilation for type mismatches
- **Transport Changes**: Test both STDIO and SSE transports (though STDIO will be deprecated)
- **Rollback Plan**: Keep original package.json changes in git history for easy reversion

## Next Steps After Pinning
1. Run comprehensive test suite
2. Document any compatibility issues found
3. Prepare for Phase 2 refactoring based on SDK 1.18.1 capabilities
4. Update CI/CD to use pinned version consistently
