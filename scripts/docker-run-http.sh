#!/usr/bin/env sh
set -euo pipefail

IMAGE_NAME="content-automation-mcp-ingestion"
TAG="${1:-latest}"
CONTAINER_NAME="${2:-content-ingestion-http}"
HOST_PORT="${3:-3001}"
CONTAINER_PORT="${4:-3001}"

echo "Running Docker container (http) ${CONTAINER_NAME} from image ${IMAGE_NAME}:${TAG}"
echo "Port mapping: host:${HOST_PORT} -> container:${CONTAINER_PORT}"

docker run --rm -d \
  --name "${CONTAINER_NAME}" \
  -e TRANSPORT=http \
  -e NODE_ENV=production \
  -e PORT=${CONTAINER_PORT} \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  "${IMAGE_NAME}:${TAG}"

echo "Container ${CONTAINER_NAME} started successfully"
echo "Health check: curl http://localhost:${HOST_PORT}/health"
echo "MCP Inspector: npm run docker:inspect"
