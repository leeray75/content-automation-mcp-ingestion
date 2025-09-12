#!/usr/bin/env sh
set -euo pipefail

IMAGE_NAME="content-automation-mcp-ingestion"
TAG="${1:-latest}"

echo "Building Docker image ${IMAGE_NAME}:${TAG}"
docker build -t "${IMAGE_NAME}:${TAG}" .

echo "Docker image ${IMAGE_NAME}:${TAG} built successfully"
