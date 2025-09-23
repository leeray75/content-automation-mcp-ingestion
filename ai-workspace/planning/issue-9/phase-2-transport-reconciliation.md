# Issue #9 - Phase 2: Transport Layer Reconciliation

## Overview
**Goal**: Ensure both STDIO and HTTP transports work as specified in Issue #9

**Duration**: 2-6 hours  
**Priority**: High - Critical for Issue #9 requirements  
**Dependencies**: Phase 1 completion

## Current State Analysis (from Phase 1)

### Findings from Code Review
Based on the transport.ts analysis, the current implementation:
- ✅ **HTTP Transport**: Fully implemented with Streamable HTTP
- ❌ **STDIO Transport**: Explicitly removed and throws error
- ✅ **HTTP Endpoints**: All required endpoints exist (/health, /mcp, /ingest)
- ✅ **MCP Protocol**: Modern StreamableHTTPServerTransport implementation

### Key Issue Identified
The transport layer currently rejects STDIO transport with this logic:
```typescript
switch (transport.toLowerCase()) {
  case 'http':
    await this.startHttpTransport();
    break;
  default:
    logger.error(`Unsupported transport: ${transport}. Only 'http' is supported.`);
    throw new Error(`Unsupported transport: ${transport}`);
}
```

## Implementation Tasks

### Task 1: STDIO Transport Implementation
**Objective**: Add STDIO transport support for local development

#### Subtasks
1. **Add STDIO Transport Case**
   ```typescript
   case 'stdio':
     await this.startStdioTransport();
     break;
   ```

2. **Implement startStdioTransport Method**
   - Create new method in TransportManager class
   - Use StdioServerTransport from MCP SDK
   - Connect to MCP server instance
   - Handle graceful shutdown

3. **STDIO Transport Implementation**
   ```typescript
   private async startStdioTransport() {
     logger.info('Starting STDIO transport');
     
     const transport = new StdioServerTransport();
     await this.mcpServer.getServer().connect(transport);
     
     logger.info('STDIO transport connected');
     logger.info('MCP server ready for Inspector connection');
   }
   ```

4. **Environment Variable Handling**
   - Ensure TRANSPORT=stdio works correctly
   - Maintain Docker container restriction (IN_DOCKER check)
   - Default to 'stdio' for local development

#### Expected Outcome
- STDIO transport works for local MCP Inspector connections
- HTTP transport continues to work for containers
- Proper error messages for unsupported combinations

### Task 2: HTTP Transport Verification
**Objective**: Verify all HTTP endpoints work correctly per Issue #9 specs

#### Subtasks
1. **Health Endpoint Verification**
   - Verify GET /health returns correct format:
     ```json
     {
       "status": "healthy",
       "timestamp": "...",
       "connections": <number>,
       "uptime": <ms>,
       "version": "0.1.0"
     }
     ```

2. **MCP Metadata Endpoint**
   - Verify GET /mcp returns server capabilities
   - Ensure tools and resources are properly listed
   - Check endpoint redirects work correctly

3. **Ingestion Endpoint**
   - Verify POST /ingest accepts content
   - Check 202 Accepted response format
   - Validate error handling (400 for validation, 500 for internal)

4. **Records Endpoints**
   - Verify GET /records works
   - Check GET /records/:id functionality
   - Test status filtering

#### Expected Outcome
- All HTTP endpoints respond with correct formats
- Error handling works as specified
- Response codes match Issue #9 requirements

### Task 3: Transport Selection Logic
**Objective**: Ensure proper transport selection based on environment

#### Subtasks
1. **Environment Variable Logic**
   - TRANSPORT=stdio → STDIO transport (local only)
   - TRANSPORT=http → HTTP transport
   - Default behavior based on environment

2. **Docker Container Handling**
   - Maintain IN_DOCKER check for STDIO restriction
   - Ensure Docker defaults to HTTP transport
   - Proper error messages for invalid combinations

3. **Graceful Fallback**
   - Consider fallback logic if needed
   - Ensure clear error messages
   - Document transport selection behavior

#### Expected Outcome
- Transport selection works reliably
- Clear error messages for invalid configurations
- Docker and local environments work correctly

### Task 4: MCP Inspector Compatibility
**Objective**: Ensure MCP Inspector can connect in both modes

#### Subtasks
1. **STDIO Inspector Connection**
   - Test local Inspector connection via STDIO
   - Verify tools and resources are accessible
   - Check tool invocation works correctly

2. **HTTP Inspector Connection**
   - Test Inspector connection via HTTP transport
   - Verify Streamable HTTP protocol works
   - Check session management

3. **Protocol Compliance**
   - Ensure both transports follow MCP protocol
   - Verify tool and resource schemas
   - Test error handling in Inspector

#### Expected Outcome
- MCP Inspector connects successfully in both modes
- All tools and resources work correctly
- Protocol compliance maintained

## Technical Implementation Details

### STDIO Transport Code
```typescript
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// In TransportManager class
private async startStdioTransport() {
  logger.info('Starting STDIO transport');
  
  const transport = new StdioServerTransport();
  await this.mcpServer.getServer().connect(transport);
  
  logger.info('STDIO transport connected');
  logger.info('MCP server ready for Inspector connection');
  logger.info('Use: npx @modelcontextprotocol/inspector node build/index.js');
}
```

### Transport Selection Logic
```typescript
async start() {
  const transport = process.env.TRANSPORT || 'stdio'; // Default to stdio for local dev
  
  // Docker container check
  if (transport.toLowerCase() === 'stdio' && process.env.IN_DOCKER === 'true') {
    logger.error('STDIO transport is not supported in Docker containers. Use HTTP transport instead.');
    throw new Error('STDIO transport disabled in Docker containers');
  }
  
  switch (transport.toLowerCase()) {
    case 'stdio':
      await this.startStdioTransport();
      break;
    case 'http':
      await this.startHttpTransport();
      break;
    default:
      logger.error(`Unsupported transport: ${transport}. Supported: 'stdio', 'http'`);
      throw new Error(`Unsupported transport: ${transport}`);
  }
}
```

### Environment Configuration
```bash
# Local development (default)
TRANSPORT=stdio

# Container deployment
TRANSPORT=http
PORT=3001

# Docker environment
IN_DOCKER=true
TRANSPORT=http
```

## Testing Strategy

### Unit Tests
1. **Transport Selection Tests**
   - Test STDIO transport initialization
   - Test HTTP transport initialization
   - Test invalid transport handling
   - Test Docker environment restrictions

2. **Endpoint Tests**
   - Test all HTTP endpoints
   - Verify response formats
   - Test error handling

### Integration Tests
1. **STDIO Mode Testing**
   ```bash
   TRANSPORT=stdio npm start
   # Test with MCP Inspector
   ```

2. **HTTP Mode Testing**
   ```bash
   TRANSPORT=http PORT=3001 npm start
   # Test endpoints with curl
   # Test with MCP Inspector HTTP mode
   ```

3. **Docker Testing**
   ```bash
   docker build -t test-mcp .
   docker run -e TRANSPORT=http -p 3001:3001 test-mcp
   # Test HTTP endpoints
   ```

## Success Criteria
- [ ] STDIO transport works for local development
- [ ] HTTP transport continues to work for containers
- [ ] All HTTP endpoints respond correctly
- [ ] MCP Inspector connects in both modes
- [ ] Transport selection logic works reliably
- [ ] Docker deployment works with HTTP transport
- [ ] Error handling provides clear messages

## Risk Mitigation

### Potential Issues
1. **STDIO Transport Conflicts**: May conflict with existing HTTP-only setup
   - **Mitigation**: Careful testing and fallback logic

2. **MCP SDK Compatibility**: STDIO transport may have different requirements
   - **Mitigation**: Follow MCP SDK documentation exactly

3. **Inspector Connection Issues**: Different transports may have different connection patterns
   - **Mitigation**: Test both modes thoroughly

### Rollback Plan
If STDIO implementation causes issues:
1. Revert to HTTP-only transport
2. Document STDIO as future enhancement
3. Focus on HTTP transport compliance

## Dependencies

### External
- @modelcontextprotocol/sdk StdioServerTransport
- MCP Inspector for testing

### Internal
- Existing HTTP transport implementation
- MCP server instance
- Logger configuration

## Deliverables
1. **Updated transport.ts** with STDIO support
2. **Transport selection logic** working correctly
3. **Test results** for both transport modes
4. **Documentation updates** for transport usage
5. **Environment configuration** examples

## Next Phase Dependencies
Phase 3 cannot begin until:
- Both STDIO and HTTP transports work
- MCP Inspector connects successfully
- All HTTP endpoints verified
- Transport selection logic tested

## Notes
- Maintain backward compatibility with existing HTTP transport
- Ensure Docker deployment continues to work
- Focus on Issue #9 requirements compliance
- Document any deviations from original plan
