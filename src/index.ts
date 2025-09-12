import 'dotenv/config';
import { MCPServer } from './server/mcp-server.js';
import { TransportManager } from './server/transport.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    logger.info('Starting Content Automation MCP Ingestion Server');

    // Create MCP server
    const mcpServer = new MCPServer();
    await mcpServer.start();

    // Create and start transport
    const transportManager = new TransportManager(mcpServer);
    await transportManager.start();

    // Handle graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      
      try {
        await transportManager.stop();
        logger.info('Server stopped successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown');
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGHUP', () => shutdown('SIGHUP'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception');
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection');
      process.exit(1);
    });

    logger.info('Server started successfully');

  } catch (error) {
    logger.error('Failed to start server');
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  logger.error('Fatal error during startup');
  process.exit(1);
});
