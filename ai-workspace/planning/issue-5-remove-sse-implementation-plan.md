# Issue #5: Remove SSE transport and update MCP Inspector connectivity to modern HTTP streaming

## Overview
Remove all SSE (Server-Sent Events) transport code and references from the project, as SSE is deprecated for MCP Inspector and client connectivity. Update the MCP Inspector integration and HTTP transport implementation to use the latest MCP SDK's recommended HTTP streaming transport. Ensure all documentation, Docker, and testing instructions reflect this change, and lay the groundwork for future scalability and enterprise integration.

## Implementation Plan

### Phase 1: Analysis
- [ ] Analyze current codebase for SSE references
- [ ] Review existing transport implementation in `src/server/transport.ts`
- [ ] Identify all files referencing SSE, SSEServerTransport, or `/sse` endpoint
- [ ] Check current MCP SDK version and HTTP streaming capabilities
- [ ] Review Docker configuration and health checks
- [ ] Audit scripts for SSE-specific references

### Phase 2: Core Implementation
- [ ] Remove SSEServerTransport from `src/server/transport.ts`
- [ ] Remove `/sse` Express endpoint and SSE-specific headers
- [ ] Implement HTTP streaming transport using @modelcontextprotocol/sdk
- [ ] Refactor `/mcp` POST endpoint for modern HTTP streaming
- [ ] Update server initialization to default to HTTP transport
- [ ] Remove or flag STDIO support for backward compatibility

### Phase 3: Authentication Scaffold
- [ ] Create `src/server/middleware/auth.ts` with bearer token scaffold
- [ ] Add authentication middleware hooks (disabled by default)
- [ ] Document future enterprise integration points
- [ ] Ensure modular design for future auth/metrics/batching features

### Phase 4: Documentation & Scripts
- [ ] Update README.md to remove SSE references
- [ ] Update ai-workspace documentation
- [ ] Modify `scripts/docker-inspect.sh` for HTTP streaming
- [ ] Update `scripts/inspector.sh` for new transport
- [ ] Ensure `scripts/docker-run-http.sh` is default
- [ ] Update Dockerfile health checks

### Phase 5: Testing
- [ ] Update unit tests to remove SSE dependencies
- [ ] Add HTTP streaming transport tests
- [ ] Create Inspector connectivity integration test
- [ ] Update `test/ingestion.test.ts` for new transport
- [ ] Verify all tests pass with new implementation

### Phase 6: Final Validation
- [ ] Run full test suite
- [ ] Test Docker container with HTTP transport
- [ ] Verify Inspector connectivity via HTTP streaming
- [ ] Validate health checks and logging
- [ ] Create completion report

## Technical Considerations

### Architecture Decisions
- **Transport Layer**: Use @modelcontextprotocol/sdk HTTP streaming as primary transport
- **Backward Compatibility**: Remove STDIO unless specifically requested
- **Authentication**: Scaffold middleware for future enterprise needs
- **Modularity**: Keep transport and handler code extensible

### Technology Choices
- **MCP SDK**: Latest @modelcontextprotocol/sdk for HTTP streaming
- **Express**: Continue using Express for HTTP endpoints
- **Docker**: Maintain containerized deployment with HTTP transport
- **Testing**: Jest/Node.js testing framework for transport validation

### Potential Challenges
- **SDK Breaking Changes**: Lock SDK version and test compatibility
- **Inspector Connectivity**: Ensure seamless transition from SSE to HTTP streaming
- **Test Migration**: Update all SSE-dependent tests to use HTTP mocks
- **Documentation Sync**: Ensure all docs reflect new transport method

## Success Criteria

### Functional Requirements
- [ ] No SSEServerTransport or `/sse` references remain in codebase
- [ ] MCP Inspector connects successfully via HTTP streaming transport
- [ ] Docker container runs with HTTP transport by default
- [ ] All health checks and logging work without SSE references
- [ ] Authentication middleware scaffold is present but disabled

### Testing Requirements
- [ ] All unit tests pass with new HTTP transport
- [ ] Integration tests cover Inspector connectivity
- [ ] Docker container health checks succeed
- [ ] No SSE-related test failures

### Documentation Requirements
- [ ] README.md updated with new Inspector instructions
- [ ] ai-workspace documentation reflects HTTP streaming
- [ ] Scripts updated for HTTP transport usage
- [ ] Troubleshooting guides remove SSE references

### Performance Benchmarks
- [ ] HTTP transport performs comparably to previous SSE implementation
- [ ] Inspector connection time remains acceptable
- [ ] Memory usage does not increase significantly
- [ ] Container startup time unchanged

## Files to Create/Modify

### Core Implementation Files
- `src/server/transport.ts` - Remove SSE, implement HTTP streaming
- `src/index.ts` - Update server initialization
- `src/server/middleware/auth.ts` - Create authentication scaffold
- `package.json` - Verify/add @modelcontextprotocol/sdk dependency

### Configuration Files
- `Dockerfile` - Update health checks and default transport
- `mcp.json` - Ensure HTTP transport configuration
- `.env.example` - Update environment variable examples

### Scripts
- `scripts/docker-inspect.sh` - Update for HTTP streaming
- `scripts/inspector.sh` - Modify Inspector launch command
- `scripts/docker-run-http.sh` - Ensure as default script
- `scripts/dev.sh` - Update development workflow

### Documentation
- `README.md` - Remove SSE references, add HTTP streaming docs
- `ai-workspace/documentation/` - Update technical documentation
- `ai-workspace/technical-issues/` - Update connectivity guides

### Testing
- `test/ingestion.test.ts` - Update for HTTP transport
- `test/transport.test.ts` - Create new transport tests
- `test/inspector.test.ts` - Add Inspector connectivity tests

## Risk Mitigation

### Technical Risks
- **SDK Compatibility**: Test with latest @modelcontextprotocol/sdk version
- **Breaking Changes**: Maintain feature parity during migration
- **Performance Impact**: Monitor transport performance metrics

### Operational Risks
- **Deployment Issues**: Test Docker container thoroughly
- **Documentation Gaps**: Ensure all references are updated
- **Testing Coverage**: Maintain comprehensive test coverage

### Mitigation Strategies
- **Incremental Implementation**: Implement changes in phases
- **Rollback Plan**: Maintain git history for quick rollback
- **Testing Strategy**: Comprehensive unit and integration testing
- **Documentation Review**: Multi-pass documentation updates

## Timeline Estimates

### Phase 1: Analysis (1-2 hours)
- Code analysis and dependency review
- File inventory and impact assessment

### Phase 2: Core Implementation (2-4 hours)
- Transport layer refactoring
- HTTP streaming implementation
- Server configuration updates

### Phase 3: Authentication Scaffold (1 hour)
- Middleware creation
- Enterprise integration hooks

### Phase 4: Documentation & Scripts (1-2 hours)
- Documentation updates
- Script modifications
- Docker configuration

### Phase 5: Testing (1-2 hours)
- Test updates and creation
- Integration testing
- Validation

### Phase 6: Final Validation (1 hour)
- End-to-end testing
- Completion report creation

**Total Estimated Time: 7-12 hours**

## Next Steps
1. Begin Phase 1 analysis to identify all SSE references
2. Review current MCP SDK version and HTTP streaming capabilities
3. Create feature branch for implementation
4. Proceed with systematic removal of SSE transport
5. Implement HTTP streaming transport
6. Update documentation and scripts
7. Validate with comprehensive testing
8. Create completion report

## Links
- GitHub Issue: [#5](https://github.com/leeray75/content-automation-mcp-ingestion/issues/5)
- MCP SDK Documentation: https://www.npmjs.com/package/@modelcontextprotocol/sdk
- Current Transport Implementation: [src/server/transport.ts](https://github.com/leeray75/content-automation-mcp-ingestion/blob/main/src/server/transport.ts)
