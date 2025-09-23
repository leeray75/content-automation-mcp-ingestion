# MCP Inspector Connectivity Guide

## Overview

This guide provides step-by-step instructions for connecting the MCP Inspector to the Content Automation MCP Ingestion Server in both STDIO and HTTP transport modes.

## Prerequisites

- Node.js >= 22
- npm or compatible package manager
- Built project (`npm run build`)
- MCP Inspector package (`@modelcontextprotocol/inspector`)

## STDIO Mode (Local Development)

### 1. Start Server in STDIO Mode

```bash
cd content-automation-platform/content-automation-mcp-ingestion
npm run build
TRANSPORT=stdio npm start
```

**Expected Output:**
```
{"level":30,"msg":"Starting STDIO transport"}
{"level":30,"msg":"STDIO transport connected"}
{"level":30,"msg":"MCP server ready for Inspector connection"}
{"level":30,"msg":"Use: npx @modelcontextprotocol/inspector node build/index.js"}
```

### 2. Connect MCP Inspector

In a new terminal:

```bash
cd content-automation-platform/content-automation-mcp-ingestion
npx @modelcontextprotocol/inspector node build/index.js
```

**Expected Behavior:**
- Inspector opens in your default browser
- Connection status shows "Connected"
- Tools section lists: `ingest_content`, `get_ingestion_stats`
- Resources section lists ingestion:// URIs

### 3. Test Tool Invocation

1. Click on `ingest_content` tool in Inspector
2. Use this test payload:

```json
{
  "content": {
    "headline": "Test Article via Inspector",
    "body": "This is a test article submitted through MCP Inspector.",
    "author": "Inspector User",
    "publishDate": "2025-01-01T00:00:00.000Z",
    "tags": ["inspector", "test"]
  },
  "contentType": "article"
}
```

3. Expected response: JSON with `status: "completed"` and generated ID

## HTTP Mode (Container/Production)

### 1. Start Server in HTTP Mode

```bash
cd content-automation-platform/content-automation-mcp-ingestion
npm run build
TRANSPORT=http PORT=3001 npm start
```

**Expected Output:**
```
{"level":30,"msg":"Starting HTTP transport"}
{"level":30,"msg":"HTTP server listening on port 3001"}
{"level":30,"msg":"Health check: http://localhost:3001/health"}
{"level":30,"msg":"MCP endpoint: http://localhost:3001/mcp"}
```

### 2. Verify HTTP Endpoints

Test the endpoints before connecting Inspector:

```bash
# Health check
curl http://localhost:3001/health

# MCP metadata
curl http://localhost:3001/mcp-info

# Test direct ingestion
curl -X POST http://localhost:3001/ingest \
  -H "Content-Type: application/json" \
  -H "X-Request-Id: test-123" \
  -d '{
    "content": {
      "headline": "Test Article",
      "body": "Test body content",
      "author": "Test Author",
      "publishDate": "2025-01-01T00:00:00.000Z"
    }
  }'
```

### 3. Connect MCP Inspector via HTTP

```bash
npx @modelcontextprotocol/inspector http://localhost:3001/mcp
```

**Expected Behavior:**
- Inspector connects via HTTP Streamable transport
- All tools and resources available
- Session management works correctly

## Docker Mode

### 1. Build and Run Docker Container

```bash
cd content-automation-platform/content-automation-mcp-ingestion

# Build image
docker build -t content-automation-mcp-ingestion .

# Run container
docker run --rm -d --name mcp-ingestion \
  -e TRANSPORT=http -e PORT=3001 -p 3001:3001 \
  content-automation-mcp-ingestion

# Check logs
docker logs mcp-ingestion
```

### 2. Test Container Endpoints

```bash
# Health check
curl http://localhost:3001/health

# MCP metadata
curl http://localhost:3001/mcp-info
```

### 3. Connect Inspector to Container

```bash
npx @modelcontextprotocol/inspector http://localhost:3001/mcp
```

## Expected Tools and Resources

### Tools
- **ingest_content**: Ingest and validate content (articles, ads, landing pages)
- **get_ingestion_stats**: Get ingestion service statistics

### Resources
- **ingestion://status**: Current service status and statistics
- **ingestion://records**: All ingestion records
- **ingestion://records/completed**: Successfully completed records
- **ingestion://records/failed**: Failed ingestion records
- **ingestion://records/{id}**: Specific record by ID

## Troubleshooting

### Inspector Connection Issues

**Problem**: Inspector fails to connect
**Solutions**:
1. Verify server is running and listening on correct port
2. Check server logs for connection errors
3. Ensure correct transport mode (stdio vs http)
4. For HTTP mode, verify port 3001 is not in use by another process

**Problem**: Tools don't appear in Inspector
**Solutions**:
1. Check handler registration in `mcp-server.ts`
2. Verify tool definitions in `tool-handlers.ts`
3. Review MCP SDK version compatibility
4. Check server logs for handler registration messages

### STDIO Mode Issues

**Problem**: "STDIO transport disabled in Docker containers"
**Solution**: Use HTTP transport in Docker environments:
```bash
docker run -e TRANSPORT=http -p 3001:3001 content-automation-mcp-ingestion
```

**Problem**: Inspector command not found
**Solution**: Install MCP Inspector globally:
```bash
npm install -g @modelcontextprotocol/inspector
```

### HTTP Mode Issues

**Problem**: Connection refused on port 3001
**Solutions**:
1. Check if port is already in use: `lsof -i :3001`
2. Try a different port: `PORT=3002 npm start`
3. Check firewall settings

**Problem**: CORS errors in browser
**Solution**: Server includes proper CORS headers, but verify with:
```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS http://localhost:3001/mcp
```

### Docker Issues

**Problem**: Container fails to start
**Solutions**:
1. Check Docker logs: `docker logs mcp-ingestion`
2. Verify environment variables are set correctly
3. Ensure port mapping is correct: `-p 3001:3001`

**Problem**: Inspector can't connect to Docker container
**Solutions**:
1. Verify container is running: `docker ps`
2. Check port mapping and ensure container port matches
3. Test direct HTTP access first: `curl http://localhost:3001/health`

## Performance Considerations

### STDIO Mode
- Lower latency for local development
- Direct process communication
- Best for development and testing

### HTTP Mode
- Higher latency due to HTTP overhead
- Better for production and containerized environments
- Supports multiple concurrent connections
- Required for Docker deployments

## Security Notes

### STDIO Mode
- Local process communication only
- No network exposure
- Suitable for development environments

### HTTP Mode
- Network-accessible endpoints
- CORS headers configured for browser access
- Consider authentication for production use
- Monitor for unauthorized access

## Integration Examples

### Programmatic MCP Client

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// STDIO client
const transport = new StdioClientTransport({
  command: 'node',
  args: ['build/index.js']
});

const client = new Client({
  name: 'test-client',
  version: '1.0.0'
}, {
  capabilities: {}
});

await client.connect(transport);
```

### HTTP Client

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// HTTP client
const transport = new StreamableHTTPClientTransport(
  new URL('http://localhost:3001/mcp')
);

const client = new Client({
  name: 'test-client',
  version: '1.0.0'
}, {
  capabilities: {}
});

await client.connect(transport);
```

## Useful Commands

### Development Workflow
```bash
# Start development server with auto-reload
npm run dev

# Build and start production server
npm run build && npm start

# Run tests
npm test

# Check server health
curl http://localhost:3001/health
```

### Docker Workflow
```bash
# Build and run with npm scripts
npm run docker:build
npm run docker:run:http
npm run docker:logs
npm run docker:stop

# Connect Inspector to Docker container
npm run docker:inspect
```

### Debugging
```bash
# Enable debug logging
LOG_LEVEL=debug npm start

# Monitor server logs
tail -f logs/server.log

# Check process status
ps aux | grep node
```

This guide should help you successfully connect the MCP Inspector to the Content Automation MCP Ingestion Server in any deployment scenario.
