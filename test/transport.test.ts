import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TransportManager } from '../src/server/transport.js';
import { MCPServer } from '../src/server/mcp-server.js';

describe('Transport (HTTP only)', () => {
  let mcpServer: MCPServer;
  let transportManager: TransportManager;

  beforeEach(() => {
    mcpServer = new MCPServer();
    transportManager = new TransportManager(mcpServer);
  });

  afterEach(async () => {
    if (transportManager) {
      await transportManager.stop();
    }
  });

  it('should initialize TransportManager without throwing', () => {
    expect(() => new TransportManager(mcpServer)).not.toThrow();
    expect(transportManager).toBeDefined();
  });

  it('should start HTTP transport successfully', async () => {
    // Set environment to HTTP mode
    const originalTransport = process.env.TRANSPORT;
    const originalPort = process.env.PORT;
    
    process.env.TRANSPORT = 'http';
    process.env.PORT = '0'; // Use ephemeral port for testing
    
    try {
      await expect(transportManager.start()).resolves.not.toThrow();
    } finally {
      // Restore original environment
      if (originalTransport !== undefined) {
        process.env.TRANSPORT = originalTransport;
      } else {
        delete process.env.TRANSPORT;
      }
      
      if (originalPort !== undefined) {
        process.env.PORT = originalPort;
      } else {
        delete process.env.PORT;
      }
    }
  });

  it('should reject STDIO transport in Docker environment', async () => {
    const originalTransport = process.env.TRANSPORT;
    const originalInDocker = process.env.IN_DOCKER;
    
    process.env.TRANSPORT = 'stdio';
    process.env.IN_DOCKER = 'true';
    
    try {
      await expect(transportManager.start()).rejects.toThrow('STDIO transport disabled in Docker containers');
    } finally {
      // Restore original environment
      if (originalTransport !== undefined) {
        process.env.TRANSPORT = originalTransport;
      } else {
        delete process.env.TRANSPORT;
      }
      
      if (originalInDocker !== undefined) {
        process.env.IN_DOCKER = originalInDocker;
      } else {
        delete process.env.IN_DOCKER;
      }
    }
  });

  it('should reject unsupported transport types', async () => {
    const originalTransport = process.env.TRANSPORT;
    
    process.env.TRANSPORT = 'invalid-transport';
    
    try {
      await expect(transportManager.start()).rejects.toThrow('Unsupported transport: invalid-transport');
    } finally {
      // Restore original environment
      if (originalTransport !== undefined) {
        process.env.TRANSPORT = originalTransport;
      } else {
        delete process.env.TRANSPORT;
      }
    }
  });

  it('should stop transport gracefully', async () => {
    const originalTransport = process.env.TRANSPORT;
    const originalPort = process.env.PORT;
    
    process.env.TRANSPORT = 'http';
    process.env.PORT = '0';
    
    try {
      await transportManager.start();
      await expect(transportManager.stop()).resolves.not.toThrow();
    } finally {
      // Restore original environment
      if (originalTransport !== undefined) {
        process.env.TRANSPORT = originalTransport;
      } else {
        delete process.env.TRANSPORT;
      }
      
      if (originalPort !== undefined) {
        process.env.PORT = originalPort;
      } else {
        delete process.env.PORT;
      }
    }
  });

  it('should use default port when PORT env is not set', async () => {
    const originalTransport = process.env.TRANSPORT;
    const originalPort = process.env.PORT;
    
    process.env.TRANSPORT = 'http';
    delete process.env.PORT;
    
    try {
      // This should not throw and should use the default port
      await expect(transportManager.start()).resolves.not.toThrow();
    } finally {
      // Restore original environment
      if (originalTransport !== undefined) {
        process.env.TRANSPORT = originalTransport;
      } else {
        delete process.env.TRANSPORT;
      }
      
      if (originalPort !== undefined) {
        process.env.PORT = originalPort;
      }
    }
  });
});
