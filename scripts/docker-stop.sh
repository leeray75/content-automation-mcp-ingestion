#!/usr/bin/env sh
set -euo pipefail

CONTAINER_NAME="${1:-content-ingestion-http}"

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Stopping container ${CONTAINER_NAME}"
  docker stop "${CONTAINER_NAME}" || true
  docker rm "${CONTAINER_NAME}" || true
  echo "Container ${CONTAINER_NAME} stopped and removed"
else
  echo "Container ${CONTAINER_NAME} not found"
fi
