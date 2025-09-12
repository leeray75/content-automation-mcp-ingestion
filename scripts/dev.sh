#!/bin/bash

# Development script for Content Automation MCP Ingestion Server

set -e

echo "Starting Content Automation MCP Ingestion Server in development mode..."

# Set development environment
export NODE_ENV=development
export LOG_LEVEL=debug
export TRANSPORT=http
export PORT=3001

# Run with tsx for hot reloading
npm run dev
