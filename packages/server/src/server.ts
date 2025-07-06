import { createApp } from './app';
import { AuthService } from './services/AuthService';
import { createSocketServer } from './sockets/SocketServer';
import { checkDatabaseConnection } from './database/config';
import { logger } from './utils/logger';

// Initialize environment variables
import { config } from 'dotenv';
config();

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';


// Environment validation
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error('Missing required environment variables', {
    missingVars: missingEnvVars,
    service: 'server',
  });
  process.exit(1);
}

async function startServer() {
  try {
    // Check database connection
    logger.info('Initializing database connection...', { service: 'aeturnis-api' });
    const dbConnected = await checkDatabaseConnection();
    
    if (!dbConnected) {
      logger.error('Failed to connect to database', { service: 'aeturnis-api' });
      process.exit(1);
    }

    // Create Express app
    const app = createApp();
    
    // Initialize auth service
    const authService = new AuthService();

    // Start Express server (for REST API)
    const expressServer = app.listen(PORT, HOST, () => {
      logger.info('Server started successfully', {
        service: 'aeturnis-api',
        port: PORT,
        host: HOST,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        cpuCount: require('os').cpus().length,
        totalMemory: `${Math.round(require('os').totalmem() / 1024 / 1024 / 1024)}GB`,
      });

      // eslint-disable-next-line no-console
      console.log('🚀 Aeturnis Online server running on http://0.0.0.0:5000');
      // eslint-disable-next-line no-console
      console.log('📊 Health check: http://localhost:5000/health');
      // eslint-disable-next-line no-console
      console.log('🔍 API status: http://localhost:5000/api/status');
      // eslint-disable-next-line no-console
      console.log('🔐 Auth endpoints: http://localhost:5000/api/v1/auth');
      // eslint-disable-next-line no-console
      console.log('📝 Registration: POST http://localhost:5000/api/v1/auth/register');
      // eslint-disable-next-line no-console
      console.log('🔑 Login: POST http://localhost:5000/api/v1/auth/login');
    });

    // Create Socket.IO server attached to the same HTTP server
    const socketServer = createSocketServer(expressServer, authService, {
      corsOrigins: [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:5173',
        ...(process.env.ALLOWED_ORIGINS?.split(',') || [])
      ],
      useRedisAdapter: process.env.NODE_ENV === 'production',
      redisUrl: process.env.REDIS_URL,
    });

    // Start Socket.IO server
    await socketServer.start();

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`, {
        service: 'aeturnis-api',
      });

      // Stop accepting new connections
      expressServer.close(() => {
        logger.info('Express server closed', { service: 'aeturnis-api' });
      });

      // Stop Socket.IO server
      await socketServer.stop();

      // Close database connections
      const { closeDatabaseConnection } = await import('./database/config');
      await closeDatabaseConnection();

      logger.info('Graceful shutdown completed', { service: 'aeturnis-api' });
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', {
        error: error.message,
        stack: error.stack,
        service: 'aeturnis-api',
      });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', {
        reason,
        promise,
        service: 'aeturnis-api',
      });
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      service: 'aeturnis-api',
    });
    process.exit(1);
  }
}

// Start the server
startServer();