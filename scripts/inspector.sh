#!/usr/bin/env sh
set -euo pipefail

MODE="${1:-dev}"

case "${MODE}" in
  dev)
    echo "Starting MCP Inspector in development mode (HTTP, local server)"
    npm run inspector:dev
    ;;
  http)
    echo "Starting MCP Inspector in HTTP mode"
    npm run inspector:http
    ;;
  cli)
    echo "Starting MCP Inspector in CLI mode"
    npm run inspector:cli
    ;;
  docker)
    echo "Starting MCP Inspector for Docker container"
    npm run docker:inspect
    ;;
  *)
    echo "Usage: $0 [dev|http|cli|docker]"
    echo "  dev    - Start MCP Inspector in development mode (HTTP, local server)"
    echo "  http   - Connect to local HTTP server"
    echo "  cli    - Start MCP Inspector in CLI mode"
    echo "  docker - Connect to Docker container (HTTP)"
    exit 1
    ;;
esac
