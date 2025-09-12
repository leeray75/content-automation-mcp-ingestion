#!/usr/bin/env sh
set -euo pipefail

CONTAINER_NAME="${1:-content-ingestion-http}"
FOLLOW="${2:-}"

if [ "${FOLLOW}" = "--no-follow" ]; then
  echo "Getting logs for ${CONTAINER_NAME}"
  docker logs "${CONTAINER_NAME}"
else
  echo "Tailing logs for ${CONTAINER_NAME} (Ctrl+C to stop)"
  docker logs -f "${CONTAINER_NAME}"
fi
