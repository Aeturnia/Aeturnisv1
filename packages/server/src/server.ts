import { createApp } from './app';
import { AuthService } from './services/AuthService';
import { createSocketServer } from './sockets/SocketServer';
import { checkDatabaseConnection } from './database/config';
import { logger } from './utils/logger';
import { initializeProviders } from './providers';
import { ServerMonitor } from './utils/server-monitor';
import os from 'os';

// Initialize environment variables
import { config } from 'dotenv';
import path from 'path';

// Load .env file from the server package directory
config({ path: path.resolve(__dirname, '../.env') });

// Use environment PORT or default to 8080
const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Debug: Log the PORT being used
console.log(`🔍 Environment PORT: ${process.env.PORT}`);
console.log(`🔍 Using PORT: ${PORT}`);

// Initialize server monitor
const serverMonitor = new ServerMonitor();


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

// Process monitoring and debugging
process.on('uncaughtException', (error) => {
  logger.error('🚨 UNCAUGHT EXCEPTION - Server will restart:', {
    message: error.message,
    stack: error.stack,
    name: error.name,
  });
  console.error('🚨 UNCAUGHT EXCEPTION:', error);
  serverMonitor.stop();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('🚨 UNHANDLED REJECTION - Server will restart:', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: String(promise),
  });
  console.error('🚨 UNHANDLED REJECTION:', reason);
  serverMonitor.stop();
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM received - Server shutting down gracefully');
  serverMonitor.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🛑 SIGINT received - Server shutting down gracefully');
  serverMonitor.stop();
  process.exit(0);
});


async function startServer() {
  try {
    // Check database connection
    logger.info('Initializing database connection...', { service: 'aeturnis-api' });
    const dbConnected = await checkDatabaseConnection();

    if (!dbConnected) {
      logger.error('Failed to connect to database', { service: 'aeturnis-api' });
      process.exit(1);
    }

    // Initialize Service Providers - FORCE MOCK SERVICES FOR TESTING ENVIRONMENT
    logger.info('Initializing service providers...', { service: 'aeturnis-api' });
    const useMocks = true; // Force mock services for testing environment
    await initializeProviders(useMocks);
    logger.info(`Service providers initialized with ${useMocks ? 'MOCK' : 'REAL'} services`, { 
      service: 'aeturnis-api',
      useMocks,
      note: 'Forced to use MOCK services for testing environment'
    });

    // Create Express app
    logger.info('Creating Express app...', { service: 'aeturnis-api' });
    const app = createApp();
    logger.info('Express app created successfully', { service: 'aeturnis-api' });

    // Initialize auth service
    logger.info('Initializing auth service...', { service: 'aeturnis-api' });
    const authService = new AuthService();
    logger.info('Auth service initialized successfully', { service: 'aeturnis-api' });

    // Start Express server (for REST API)
    logger.info('Starting Express server...', { service: 'aeturnis-api', port: PORT, host: HOST });

    const expressServer = app.listen(PORT, HOST, () => {
      logger.info('Server started successfully', {
        service: 'aeturnis-api',
        port: PORT,
        host: HOST,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        cpuCount: os.cpus().length,
        totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
      });

      // eslint-disable-next-line no-console
      console.log(`🚀 Aeturnis Online server running on http://0.0.0.0:${PORT}`);
      // eslint-disable-next-line no-console
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      // eslint-disable-next-line no-console
      console.log(`🔍 API status: http://localhost:${PORT}/api/status`);
      // eslint-disable-next-line no-console
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/v1/auth`);
      // eslint-disable-next-line no-console
      console.log(`📝 Registration: POST http://localhost:${PORT}/api/v1/auth/register`);
      // eslint-disable-next-line no-console
      console.log(`🔑 Login: POST http://localhost:${PORT}/api/v1/auth/login`);

      // Start server monitoring
      serverMonitor.start();
      logger.info('📊 Server monitoring started', { service: 'aeturnis-api' });
    });

    expressServer.on('error', (error: any) => {
      logger.error('Express server error detected', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
        address: error.address,
        port: PORT,
        host: HOST,
        service: 'aeturnis-api',
      });

      // eslint-disable-next-line no-console
      console.error('❌ Express server failed to start:', error.message);

      if (error.code === 'EADDRINUSE') {
        // eslint-disable-next-line no-console
        console.error(`❌ Port ${PORT} is already in use. Try using a different port.`);
      } else if (error.code === 'EACCES') {
        // eslint-disable-next-line no-console
        console.error(`❌ Permission denied on port ${PORT}. Try using a port > 1024.`);
      }

      throw error;
    });

    expressServer.on('close', () => {
      logger.info('🛑 Express server closed', { service: 'aeturnis-api' });
    });

    logger.info('Express server listener registered', { service: 'aeturnis-api' });

    // Socket.IO server TEMPORARILY DISABLED to isolate restart loop issue
    let socketServer: any = null;

    logger.info('Socket.IO server temporarily disabled for debugging restart loop', {
      service: 'aeturnis-api',
    });

    // eslint-disable-next-line no-console
    console.log('🔌 Socket.IO server temporarily disabled - Express only mode');

    // Wait a moment to ensure Express server is stable
    await new Promise(resolve => setTimeout(resolve, 1000));

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
      if (socketServer) {
        await socketServer.stop();
      }

      // Close database connections
      const { closeDatabaseConnection } = await import('./database/config');
      await closeDatabaseConnection();

      logger.info('Graceful shutdown completed', { service: 'aeturnis-api' });
      process.exit(0);
    };

    // Graceful shutdown handlers are already set up at the top of the file

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
startServer()
  .then(() => {
    logger.info('✅ Server startup completed successfully', { service: 'aeturnis-api' });
    // eslint-disable-next-line no-console
    console.log('✅ All systems initialized - Server is ready');
  })
  .catch((error) => {
    logger.error('Startup failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      service: 'aeturnis-api',
    });
    process.exit(1);
  });