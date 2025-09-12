#!/usr/bin/env sh
set -euo pipefail

MODE="${1:-dev}"

case "${MODE}" in
  dev)
    echo "Starting MCP Inspector in development mode (stdio)"
    npm run inspector:dev
    ;;
  http)
    echo "Starting MCP Inspector in HTTP mode"
    npm run inspector:http
    ;;
  cli)
    echo "Starting MCP Inspector for built CLI"
    npm run inspector:cli
    ;;
  docker)
    echo "Starting MCP Inspector for Docker container"
    npm run docker:inspect
    ;;
  *)
    echo "Usage: $0 [dev|http|cli|docker]"
    echo "  dev    - Connect to development server (stdio)"
    echo "  http   - Connect to local HTTP server"
    echo "  cli    - Connect to built CLI server (stdio)"
    echo "  docker - Connect to Docker container (http)"
    exit 1
    ;;
esac
