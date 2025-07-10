import { createApp } from './app';
import { logger } from './utils/logger';
import { checkDatabaseConnection } from './database/config';
import { config } from 'dotenv';
import os from 'os';

// Load environment variables
config();

// Environment validation
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Export greet function for backward compatibility
export const greet = (name: string): string => {
  return `Hello, ${name}! Welcome to Aeturnis Online.`;
};

// Startup function
const startServer = async () => {
  try {
    // Initialize database connection
    logger.info('Initializing database connection...');
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }
    logger.info('Database connection established');

    // Create Express application
    const app = createApp();
    
    // Configure server
    const PORT = Number(process.env.PORT) || 8080;
    const HOST = '0.0.0.0';
    
    // Start server
    const server = app.listen(PORT, HOST, () => {
      logger.info('Server started successfully', {
        port: PORT,
        host: HOST,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: os.platform(),
        cpuCount: os.cpus().length,
        totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
      });
      
      console.log(`🚀 Aeturnis Online server running on http://${HOST}:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔍 API status: http://localhost:${PORT}/api/status`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/v1/auth`);
      console.log(`📝 Registration: POST http://localhost:${PORT}/api/v1/auth/register`);
      console.log(`🔑 Login: POST http://localhost:${PORT}/api/v1/auth/login`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          // Close database connections
          const { closeDatabaseConnection } = await import('./database/config');
          await closeDatabaseConnection();
          logger.info('Database connections closed');
          
          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });
      
      // Force exit after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if this is the main module
if (require.main === module) {
  startServer();
}

export default createApp;