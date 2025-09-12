#!/usr/bin/env sh
set -euo pipefail

INSPECT_URL="${1:-http://localhost:3001/mcp}"

echo "Launching MCP Inspector for ${INSPECT_URL}"
echo "Make sure the Docker container is running with HTTP transport"
echo "Use 'npm run docker:run:http' to start the container if needed"

npx @modelcontextprotocol/inspector "${INSPECT_URL}"
