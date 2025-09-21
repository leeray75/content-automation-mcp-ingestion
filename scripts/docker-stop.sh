#!/usr/bin/env sh
set -euo pipefail

CONTAINER_NAME="${1:-content-ingestion-http}"

# If no argument provided, try to stop both containers
if [ "$#" -eq 0 ]; then
  echo "No container name specified, attempting to stop both HTTP and stdio containers..."
  
  # Stop HTTP container
  if docker ps -a --format '{{.Names}}' | grep -q "^content-ingestion-http$"; then
    echo "Stopping HTTP container: content-ingestion-http"
    docker stop "content-ingestion-http" || true
    docker rm "content-ingestion-http" || true
    echo "HTTP container stopped and removed"
  else
    echo "HTTP container not found"
  fi
  
  # Stop stdio container
  if docker ps -a --format '{{.Names}}' | grep -q "^content-ingestion-stdio$"; then
    echo "Stopping stdio container: content-ingestion-stdio"
    docker stop "content-ingestion-stdio" || true
    docker rm "content-ingestion-stdio" || true
    echo "Stdio container stopped and removed"
  else
    echo "Stdio container not found"
  fi
else
  # Stop specific container
  if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "Stopping container ${CONTAINER_NAME}"
    docker stop "${CONTAINER_NAME}" || true
    docker rm "${CONTAINER_NAME}" || true
    echo "Container ${CONTAINER_NAME} stopped and removed"
  else
    echo "Container ${CONTAINER_NAME} not found"
  fi
fi
