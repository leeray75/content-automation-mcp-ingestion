#!/usr/bin/env sh
set -euo pipefail

CONTAINER_NAME="${1:-content-ingestion-http}"
FOLLOW="${2:-}"

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Container ${CONTAINER_NAME} is not running."
  echo "Available containers:"
  docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
  exit 1
fi

if [ "${FOLLOW}" = "--no-follow" ]; then
  echo "Getting logs for ${CONTAINER_NAME}"
  docker logs "${CONTAINER_NAME}"
else
  echo "Tailing logs for ${CONTAINER_NAME} (Ctrl+C to stop)"
  docker logs -f "${CONTAINER_NAME}"
fi
