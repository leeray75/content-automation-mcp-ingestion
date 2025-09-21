# Issue: Inspector SSE connectivity — root cause and recommended approach

**Date**: 2025-09-21  
**Author**: Cline (assistant)  
**Status**: Analysis Complete  
**Priority**: Medium  

## Summary

Inspector clients cannot connect to `http://localhost:3001/sse` using Transport Type = "SSE". The Inspector expects an MCP protocol transport over SSE (SDK-provided `SSEServerTransport`) but the server's `/sse` endpoint currently streams application events only (ingest results) and does not implement the MCP transport handshake. This document explains the root cause, options, recommended approach, implementation plan, and testing steps.

## Root Cause Analysis

### Current Implementation
The `/sse` endpoint in `src/server/transport.ts` is implemented as an application event stream that:
- Sets SSE headers and writes event payloads from `globalEventQueue`
- Subscribes/unsubscribes application event subscribers
- Streams ingestion results and service events (not MCP protocol messages)

### Expected Implementation
The MCP Inspector expects an MCP transport over SSE that:
- Uses an instance of `SSEServerTransport` from `@modelcontextprotocol/sdk/server/sse.js`
- Calls `server.connect(transport)` to establish MCP protocol handling
- Calls `transport.handleRequest(req, res)` so the SDK can perform JSON-RPC/MCP handshake over SSE
- Manages MCP session lifecycle and protocol message exchange

### Gap
Because `/sse` does not create/connect an SDK SSE transport, Inspector's MCP handshake never occurs — connection fails or remains unusable for MCP protocol communication.

## Options Analysis

### Option 1: Use Streamable HTTP (Recommended - No Code Changes)
**Configuration**: 
- Inspector Transport: "Streamable HTTP" 
- URL: `http://localhost:3001/mcp`

**Pros**:
- Already fully implemented server-side
- Recommended by SDK documentation (SSE marked as deprecated)
- Fastest path to restore Inspector connectivity
- Production-ready with session management

**Cons**:
- Users expecting SSE must change configuration
- Does not address the SSE endpoint gap

### Option 2: Implement Proper MCP SSE Transport
**Implementation**: Make `/sse` a true MCP transport endpoint

**Pros**:
- Allows Inspector to connect using SSE as originally intended
- Maintains feature parity with Inspector transport options
- Provides alternative transport for clients that prefer SSE

**Cons**:
- SSE is deprecated in SDK documentation
- Additional code complexity and lifecycle management required
- Maintenance overhead for deprecated transport

### Option 3: Remove SSE References and Standardize
**Approach**: Update documentation to recommend Streamable HTTP only

**Pros**:
- Cleaner architecture aligned with SDK recommendations
- Reduces maintenance burden
- Clear guidance for users

**Cons**:
- Removes SSE support from public interface
- May disappoint users expecting SSE functionality

## Recommended Approach

### Short Term (Immediate - Recommended)
**Adopt Option 1**: Instruct users to use Streamable HTTP (`/mcp`)
- Requires no code changes
- Restores Inspector connectivity immediately
- Aligns with SDK best practices

### Medium Term (If SSE Support Required)
**Implement Option 2** only if there is concrete need for SSE support:
- Existing clients that cannot use Streamable HTTP
- Specific architectural requirements for SSE
- User preference for SSE over HTTP

### Long Term (Documentation Strategy)
- Update documentation to recommend Streamable HTTP as primary transport
- Mark SSE as "supported but deprecated" if implemented
- Maintain implementation guide for SSE support if needed

## Implementation Plan for Option 2 (If Requested)

### Phase 1: Core SSE Transport Implementation
1. **Add MCP SSE handling in `src/server/transport.ts`**:
   ```typescript
   // On incoming GET /sse (or new path like /mcp-sse)
   const transport = new SSEServerTransport({
     // Configuration options
   });
   
   // Connect to MCP server
   await this.mcpServer.getServer().connect(transport);
   
   // Handle the request through SDK
   await transport.handleRequest(req, res);
   ```

2. **Session lifecycle management**:
   - Store transports by session ID (similar to Streamable HTTP implementation)
   - Setup `transport.onclose` cleanup handlers
   - Remove transport from session map on close

3. **Headers and CORS**:
   - Ensure headers expose `mcp-session-id`
   - Configure required CORS/expose headers for Inspector compatibility

### Phase 2: Integration and Testing
1. **Add logging and error handling**:
   - Log SSE connection attempts and session creation
   - Provide clear error messages for connection failures
   - Add defensive checks for malformed requests

2. **Testing**:
   - **Manual**: Connect Inspector with SSE to `/sse` and verify tools/resources appear
   - **Automated**: Simulate initialize request to SSE transport
   - **Integration**: Verify existing Streamable HTTP functionality unaffected

### Phase 3: Documentation
1. **Update README.md**:
   - Add SSE transport example
   - Include deprecation notice
   - Provide Inspector configuration steps

2. **Update SDK reference documentation**:
   - Add SSE implementation example
   - Note deprecation status and recommend Streamable HTTP

## Estimated Effort

- **Option 1**: 0.5 hours (documentation/instruction only)
- **Option 2**: 2–4 hours (implementation, testing, documentation updates)
- **Option 3**: 1 hour (documentation cleanup)

## Testing Checklist

### Immediate (Option 1)
- [ ] Inspector connects using Streamable HTTP to `http://localhost:3001/mcp`
- [ ] Tools and resources enumerated correctly
- [ ] MCP protocol handshake successful
- [ ] Container logs show MCP session initialization

### If SSE Implemented (Option 2)
- [ ] Inspector connects using SSE to `http://localhost:3001/sse`
- [ ] MCP protocol handshake over SSE successful
- [ ] Tools and resources enumerated via SSE transport
- [ ] Session lifecycle managed correctly
- [ ] Existing Streamable HTTP functionality unaffected
- [ ] Health endpoint continues to work
- [ ] Container logs show both transport types working

## Immediate Action Items

1. **Test Streamable HTTP connectivity**:
   - Configure Inspector with Transport: "Streamable HTTP", URL: `http://localhost:3001/mcp`
   - Verify connection and functionality

2. **Decision point**:
   - If Streamable HTTP meets requirements → Document as recommended approach
   - If SSE support required → Proceed with Option 2 implementation

3. **Documentation update**:
   - Add clear Inspector configuration instructions to README
   - Update troubleshooting section with transport selection guidance

## Conclusion

The immediate issue can be resolved by using the already-implemented Streamable HTTP transport. SSE support can be added if specifically required, but given its deprecated status in the SDK, Streamable HTTP should be the recommended approach for new integrations.

**Next Steps**: Test Streamable HTTP connectivity and determine if SSE implementation is necessary based on actual user requirements.
