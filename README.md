# Content Automation MCP Ingestion Server

A Model Context Protocol (MCP) server for content ingestion with validation and processing capabilities. This server provides tools and resources for ingesting articles, ads, and landing pages with schema validation.

## Quick Start (30 minutes)

1. Clone the repository and install:
   ```bash
   git clone https://github.com/leeray75/content-automation-mcp-ingestion.git
   cd content-automation-mcp-ingestion
   npm ci
   ```

2. Build and run in HTTP mode:
   ```bash
   npm run build
   TRANSPORT=http PORT=3001 npm start
   ```

3. Verify:
   ```bash
   curl http://localhost:3001/health
   curl -X POST http://localhost:3001/ingest -H "Content-Type: application/json" -d '{"content":{"headline":"Test","body":"Test body","author":"Test Author","publishDate":"2025-01-01","tags":["test"]}}'
   ```

4. Run the MCP inspector:
   ```bash
   npm run inspector:http
   ```

## Table of Contents

1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Setup Instructions](#2-step-by-step-setup-instructions)
3. [File/Directory Naming Conventions](#3-filedirectory-naming-conventions)
4. [Code Explanations](#4-code-explanations)
5. [API Endpoints](#5-api-endpoints)
6. [Docker Instructions](#6-basic-dockerfile-instructions)
7. [Environment Variables](#7-environment-variables--configuration)
8. [Testing Instructions](#8-testing-instructions)
9. [Troubleshooting & FAQ](#9-troubleshooting-best-practices--faq)
10. [External Resources](#10-useful-external-resource-links)

## 1. Project Overview & Architecture

### High-level Components
- Entry point (`src/index.ts`) — bootstraps server and global error handlers
- MCP orchestration (`src/server/mcp-server.ts`) — SDK Server wiring, handler registration, lifecycle
- Transports (`src/server/transport.ts`) — STDIO / HTTP (SSE + Express endpoints)
- Handlers (`src/handlers/*-handlers.ts`) — request validation and delegation
- Services (`src/services/ingestion-service.ts`) — content ingestion business logic and health/stats
- Types & utils (`src/types/*`, `src/utils/*`) — shared shape definitions and helpers
- Scripts — local and Docker convenience scripts

### Folder Layout
```
src/
├── index.ts
├── server/
│   ├── mcp-server.ts
│   └── transport.ts
├── handlers/
│   ├── tool-handlers.ts
│   └── resource-handlers.ts
├── services/
│   └── ingestion-service.ts
├── types/
│   └── ingestion.ts
└── utils/
    ├── logger.ts
    ├── constants.ts
    └── validator.ts
scripts/
build/ (compiled output)
package.json
Dockerfile
mcp.json
```

### Component Interactions
1. `index.ts` creates `MCPServer`
2. `MCPServer` constructs services and handlers, instantiates `TransportManager`, and registers SDK request handlers
3. Transport (stdio/http) is created: stdio connects the SDK Server directly; http starts Express routes for JSON-RPC and SSE
4. Handlers call services to implement business behavior and produce SDK-shaped responses

## 2. Step-by-step Setup Instructions

### Prerequisites
- Node.js >= 22
- npm (or compatible package manager)
- Docker (for containerized workflows)

### Install
```bash
git clone https://github.com/leeray75/content-automation-mcp-ingestion.git
cd content-automation-mcp-ingestion
npm ci
```

### Development (fast feedback)
```bash
npm run dev
```
Use `.env` or export environment variables for local overrides.

### Build
```bash
npm run build
```
Produces `build/` directory with compiled JavaScript.

### Start
**STDIO (default):**
```bash
npm start
```

**HTTP:**
```bash
TRANSPORT=http PORT=3001 npm start
```

### Docker
```bash
docker build -t content-automation-mcp-ingestion .
docker run -e TRANSPORT=http -e PORT=3001 -p 3001:3001 content-automation-mcp-ingestion
```

### MCP Inspector
```bash
npm run inspector:dev    # dev mode
npm run inspector:http   # HTTP mode
npm run inspector:cli    # built CLI mode
```

## 3. File/Directory Naming Conventions

### Rules
- Use hyphenated filenames: `tool-handlers.ts` not `toolHandlers.ts`
- Classes: PascalCase (e.g., `IngestionService`)
- Factory functions: camelCase (e.g., `createIngestionService`)
- One primary responsibility per file

## 4. Code Explanations

### index.ts
Bootstraps the app, configures global error handlers, instantiates and starts `MCPServer`.

### mcp-server.ts
- Creates `Server` from `@modelcontextprotocol/sdk`
- Creates services and handlers
- Creates `TransportManager`
- Calls `server.setRequestHandler(...)` with SDK request schemas to wire handlers
- Lifecycle: `start()` begins transport and attaches handlers; `stop()` shuts down

### transport.ts
- `TransportManager` handles `stdio` or `http` modes
- `HttpTransport` implements:
  - `/health` - Health check endpoint
  - `/mcp` - Server metadata endpoint
  - `/sse` - Server-Sent Events for MCP connections
  - `/ingest` - Direct ingestion endpoint (non-MCP)

### handlers & services
- Keep handlers thin: validate input, log, call services, and return SDK-shaped responses
- Services implement business logic and expose `getHealth()` / `getStats()` helpers

### utils
- `logger.ts`: Pino-based structured logging with configurable levels
- `validator.ts`: Content validation using Zod schemas
- `constants.ts`: Server constants and type definitions

## 5. API Endpoints

### A. Health Check
```
GET /health
```
Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-11T20:00:00.000Z",
  "connections": 0,
  "uptime": 12345,
  "version": "0.1.0"
}
```

### B. MCP Server Metadata
```
GET /mcp
```
Response:
```json
{
  "name": "content-automation-mcp-ingestion",
  "version": "0.1.0",
  "description": "MCP server for content ingestion with validation and processing",
  "capabilities": {
    "tools": ["ingest_content", "get_ingestion_stats"],
    "resources": ["ingestion://status", "ingestion://records"]
  }
}
```

### C. Direct Content Ingestion
```
POST /ingest
Content-Type: application/json

{
  "content": {
    "headline": "Sample Article",
    "body": "Article content here...",
    "author": "John Doe",
    "publishDate": "2025-01-01",
    "tags": ["sample", "test"]
  },
  "contentType": "article",
  "metadata": {
    "source": "api"
  }
}
```

Response (202 Accepted):
```json
{
  "id": "uuid-here",
  "status": "completed",
  "contentType": "article",
  "timestamp": "2025-09-11T20:00:00.000Z",
  "message": "Content ingested successfully"
}
```

### D. Server-Sent Events
```
GET /sse
```
For MCP connections over HTTP with SSE transport.

### MCP Tools
1. **ingest_content** - Ingest and validate content (articles, ads, landing pages)
2. **get_ingestion_stats** - Get ingestion service statistics

### MCP Resources
1. **ingestion://status** - Current service status and statistics
2. **ingestion://records** - All ingestion records
3. **ingestion://records/completed** - Successfully completed records
4. **ingestion://records/failed** - Failed ingestion records
5. **ingestion://records/{id}** - Specific record by ID

## 6. Basic Dockerfile Instructions

Multi-stage build pattern:
- **Builder stage**: Compile TypeScript, install dependencies
- **Production stage**: Minimal runtime, non-root user, health check

Security features:
- Runs as non-root user (UID 1001 `mcp`)
- No secrets baked into image
- Health check adapts to transport mode

## 7. Environment Variables & Configuration

### Common Environment Variables
- `TRANSPORT` — `stdio` or `http` (default: `stdio`)
- `PORT` — HTTP port (default: `3001`)
- `NODE_ENV` — `production` or `development`
- `LOG_LEVEL` — Log level (`debug`, `info`, `warn`, `error`)
- `STORAGE_PATH` — Future: persistent storage path

### Local Development
Create a `.env` file:
```env
NODE_ENV=development
TRANSPORT=http
PORT=3001
LOG_LEVEL=debug
```

## 8. Testing Instructions

### Unit Tests
```bash
npm test
npm run test:coverage
```

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test content ingestion
curl -X POST http://localhost:3001/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "headline": "Test Article",
      "body": "This is a test article.",
      "author": "Test Author",
      "publishDate": "2025-01-01",
      "tags": ["test"]
    }
  }'
```

## 9. Troubleshooting, Best Practices & FAQ

### Common Issues

**Unsupported transport type:**
- Verify `TRANSPORT` env var is set to `stdio` or `http`

**Inspector connection fails:**
- Confirm server is running in HTTP mode
- Check that port 3001 is accessible
- Verify `/sse` endpoint is responding

**Content validation errors:**
- Check that content matches expected schema (article, ad, or landing page)
- Review validation error details in response

### Best Practices

**Security:**
- Never hardcode secrets in code or Dockerfile
- Use `.env` files for local development (excluded from source control)

**Logging:**
- Use structured JSON logs for production
- Configure appropriate log levels

**Performance:**
- Avoid blocking the main event loop
- Offload heavy tasks asynchronously

### FAQ

**Q: How do I add new content types?**
A: Update the validator schemas in `src/utils/validator.ts` and add corresponding type definitions.

**Q: Can I use persistent storage?**
A: Currently uses in-memory storage. Persistent storage can be added by extending the `IngestionService`.

**Q: How do I add new MCP tools?**
A: Follow the Quick Add-Tool checklist in the MCP documentation template.

## 10. Useful External Resource Links

- [Model Context Protocol SDK](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [MCP Inspector](https://www.npmjs.com/package/@modelcontextprotocol/inspector)
- [JSON-RPC Specification](https://www.jsonrpc.org/specification)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [Node.js Docker Guide](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Zod Schema Validation](https://zod.dev/)
- [Pino Logging](https://getpino.io/)

## Quick Add-Tool Checklist

To add a new MCP capability:

1. **Add service implementation:**
   - `src/services/my-tool-service.ts` — business logic + `getHealth()`/`getStats()`

2. **Add handler:**
   - `src/handlers/my-tool-handlers.ts` — implement `handleList`, `handleCall`

3. **Wire into MCPServer:**
   - In `src/server/mcp-server.ts` register handlers with `server.setRequestHandler(...)`

4. **Add types:**
   - Update `src/types/ingestion.ts` with new type definitions

5. **Tests:**
   - Add unit/integration tests for service + handler

6. **Document:**
   - Add README snippet with example usage

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

For issues and feature requests, please use the [GitHub Issues](https://github.com/leeray75/content-automation-mcp-ingestion/issues) page.
