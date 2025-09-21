# Issue #4 — Phase 1: Preparation & Environment Setup

## Overview
Phase 1 prepares the repository and environment to implement MCP Build Server modernization:
- Pin MCP SDK to @modelcontextprotocol/sdk@1.18.1
- Update package.json (engines, scripts)
- Add feature branch and CI/test scripts
- Add a non-enforced bearer auth middleware placeholder
- Document migration plan and success criteria

## Goals
- Ensure the codebase can build and run on Node 22 locally and in Docker.
- Confirm the MCP SDK can be upgraded without breaking core functionality.
- Provide a minimal, disabled-by-default auth middleware and configuration points.
- Add planning artifacts and checklists for Phase 2.

## Tasks
1. Create feature branch: `mcp-modernize/issue-4/phase-1-setup`
2. Update package.json:
   - Pin `@modelcontextprotocol/sdk` to `1.18.1`.
   - Set `engines.node` to `>=22`.
   - Remove scripts referencing STDIO transport (if any).
   - Ensure `start`, `dev`, `test` scripts remain working.
3. Add environment variables to `.env.example`:
   - PORT=3001
   - MCP_AUTH_ENABLED=false
   - MCP_AUTH_BEARER=
4. Add disabled bearer auth middleware file (skeleton):
   - `src/server/middleware/auth.ts` (checks env var, no-op when disabled)
5. Verify tests run under Node 22 locally (run `npm test`).
6. Document Phase 1 completion in ai-workspace planning and update CHANGELOG.md Unreleased.

## Acceptance Criteria (Phase 1)
- [ ] repo builds and tests run with Node 22
- [ ] `@modelcontextprotocol/sdk` pinned to `1.18.1` in package.json
- [ ] `.env.example` contains new env variables
- [ ] Auth middleware skeleton exists but disabled by default
- [ ] Planning documents added to `ai-workspace/planning/`

## Risks & Mitigations
- SDK API changes: mitigate by running tests and reading SDK changelog before refactor.
- Local Node 22 unavailability: document required Node version and provide Docker build instructions to validate.
