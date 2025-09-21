# Multi-stage build for Content Automation MCP Ingestion Server
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S mcp && \
    adduser -S mcp -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Copy mcp.json for metadata
COPY mcp.json ./

# Create data directory for storage
RUN mkdir -p /app/data && chown -R mcp:mcp /app

# Switch to non-root user
USER mcp

# Expose port
EXPOSE 3001

# Install curl for health check
USER root
RUN apk add --no-cache curl
USER mcp

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost:${PORT:-3001}/health || exit 1

# Default environment variables
ENV NODE_ENV=production
ENV TRANSPORT=http
ENV PORT=3001
ENV LOG_LEVEL=info
ENV IN_DOCKER=true

# Start the application
CMD ["node", "build/index.js"]
