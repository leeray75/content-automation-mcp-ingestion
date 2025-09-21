#!/usr/bin/env sh
set -euo pipefail

IMAGE_NAME="content-automation-mcp-ingestion"
TAG="${1:-latest}"
CONTAINER_NAME="${2:-content-ingestion-stdio}"

echo "Running Docker container (stdio) ${CONTAINER_NAME} from image ${IMAGE_NAME}:${TAG}"
docker run --rm -it \
  --name "${CONTAINER_NAME}" \
  -e TRANSPORT=stdio \
  -e NODE_ENV=production \
  "${IMAGE_NAME}:${TAG}"
