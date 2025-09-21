# Issue #4 — Phase 2: Code Modernization (Transport, SSE, Docker, Inspector)

## Overview
Phase 2 implements the functional work: remove STDIO transport, add SSE and HTTP polling endpoints, implement /mcp inspector endpoint per SDK docs, update Dockerfile to node:22-alpine multi-stage, and ensure strict JSON contracts and tests.

## Goals
- Replace STDIO transport with SSE and HTTP endpoints.
- Ensure polling endpoints remain for backward compatibility.
- Implement /mcp inspector endpoint compliant with @modelcontextprotocol/sdk docs.
- Provide Dockerfile multi-stage image based on node:22-alpine with non-root user and HEALTHCHECK.
- Add tests for endpoints (basic SSE smoke test + HTTP).

## Detailed Tasks

### Transport & Endpoints
- Remove STDIO bootstrap and any STDIO handlers.
- Implement SSE endpoint:
  - `GET /sse` — EventSource-style SSE streaming with structured JSON payloads.
  - Use `Content-Type: text/event-stream` and `Cache-Control: no-cache`.
  - Provide example SSE event schema:
    ```json
    {
      "event": "ingest:result",
      "data": { "id": "...", "status": "completed", "contentType": "article" }
    }
    ```
- Ensure polling endpoints:
  - `POST /ingest` — accept ingestion requests (forward to IngestionService)
  - `GET /records/:id` — fetch record by id
  - `GET /records` — list records (with optional ?status=completed)
- Ensure health:
  - `GET /health` — returns structured health JSON (status, version, uptime)
- Implement an internal event queue/backlog so that SSE clients get recent events on connect.

### MCP Inspector (/mcp)
- Implement `GET /mcp` endpoint following the inspector sample in `@modelcontextprotocol/sdk@1.18.1`.
- Ensure output matches SDK expectations (capabilities, metadata, ports, endpoints).

### Handlers & SDK Refactor
- Update `src/handlers/*` to use SDK v1.18.1 APIs.
- Ensure handlers produce strict JSON error/status responses.
- Add tests for handler shapes where practical.

### Auth Middleware
- Implement `src/server/middleware/auth.ts`:
  - If `MCP_AUTH_ENABLED=true`, validate `Authorization: Bearer <token>` against `MCP_AUTH_BEARER`.
  - If disabled, middleware should be no-op.
- Decide default: disabled.

### Dockerfile
- Replace Dockerfile with multi-stage build:
  - builder: node:22-alpine, install deps, build to /app/dist
  - final: node:22-alpine, create non-root user, copy dist, expose 3001
  - HEALTHCHECK: curl --fail http://localhost:3001/health || exit 1

### Testing
- Update/extend tests:
  - Unit tests for IngestionService remain (adjust successRate rounding to integer percentage).
  - Integration tests for HTTP endpoints (use supertest or simple fetch).
  - SSE smoke test: connect and assert events are streamed on ingestion.
- Ensure tests run under Node 22 environment.

### Documentation
- Update README with new run, docker, and SSE usage.
- Add CHANGELOG Unreleased entry linking issue #4.
- Add ai-workspace completion report for issue #4 after implementation.

## Acceptance Criteria (Phase 2)
- [ ] STDIO removed
- [ ] SSE endpoint implemented and streaming structured JSON events
- [ ] Polling endpoints implemented and documented
- [ ] /mcp inspector implemented per SDK docs
- [ ] Dockerfile uses node:22-alpine, multi-stage, non-root, HEALTHCHECK
- [ ] Auth middleware present (disabled by default)
- [ ] Tests updated and pass in CI
- [ ] README updated and CHANGELOG entry added

## Implementation Notes & Examples

### SSE example (curl):
```bash
curl -N http://localhost:3001/sse
```

### Simple SSE event format:
```
event: ingest:result
data: {"id":"...","status":"completed","contentType":"article"}

```

### POST /ingest example:
```
POST /ingest
Content-Type: application/json
Body:
{ "content": { "headline":"...", "body":"...", "author":"..." }, "metadata": { "source":"..." } }
```

## Rollout Plan
1. Complete Phase 1 and create PR for environment changes.
2. Implement Phase 2 in feature branch and open PR for code changes.
3. Run tests locally and in CI (if available).
4. Publish Docker image for verification.

## Risks & Mitigations
- SDK migration could require deeper changes in handlers — mitigate by reading SDK docs and running incremental tests.
- SSE behavior across clients — keep polling endpoints for compatibility.
