#!/usr/bin/env sh
set -euo pipefail

CONTAINER_NAME="${1:-content-ingestion-http}"
FOLLOW="${2:-}"

# If no container name provided, check which containers are running
if [ "$#" -eq 0 ]; then
  echo "No container specified, checking for running containers..."
  
  HTTP_RUNNING=$(docker ps --format '{{.Names}}' | grep "^content-ingestion-http$" || echo "")
  STDIO_RUNNING=$(docker ps --format '{{.Names}}' | grep "^content-ingestion-stdio$" || echo "")
  
  if [ -n "$HTTP_RUNNING" ] && [ -n "$STDIO_RUNNING" ]; then
    echo "Both containers are running. Defaulting to HTTP container."
    echo "Use 'docker:logs content-ingestion-stdio' for stdio container logs."
    CONTAINER_NAME="content-ingestion-http"
  elif [ -n "$HTTP_RUNNING" ]; then
    echo "Using HTTP container: content-ingestion-http"
    CONTAINER_NAME="content-ingestion-http"
  elif [ -n "$STDIO_RUNNING" ]; then
    echo "Using stdio container: content-ingestion-stdio"
    CONTAINER_NAME="content-ingestion-stdio"
  else
    echo "No content-ingestion containers are currently running."
    echo "Available containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    exit 1
  fi
fi

if [ "${FOLLOW}" = "--no-follow" ]; then
  echo "Getting logs for ${CONTAINER_NAME}"
  docker logs "${CONTAINER_NAME}"
else
  echo "Tailing logs for ${CONTAINER_NAME} (Ctrl+C to stop)"
  docker logs -f "${CONTAINER_NAME}"
fi
