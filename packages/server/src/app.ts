import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { config } from 'dotenv';

// Middleware
import { requestLogger } from './middleware/requestLogger';
import { performanceTracker } from './middleware/performanceTracker';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter, authLimiter } from './middleware/rateLimiter';

// Routes
import authRoutes from './routes/auth.routes';
import sessionRoutes from './routes/session.routes';
import characterRoutes from './routes/character.routes.simple';

// Services
// import { shutdownServices } from './services/index';

// Utilities
import { logger, morganStream } from './utils/logger';

// Initialize environment variables
config();

// Create Express application
export const createApp = () => {
  const app = express();

  // Trust proxy for rate limiting and IP detection
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        frameAncestors: ["'self'", "*.replit.dev", "*.replit.com", "*.replit.app", "replit.com"],
      },
    },
  }));

  // Compression middleware
  app.use(compression());

  // CORS configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com']
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging middleware
  app.use(morgan('combined', { stream: morganStream }));

  // Custom middleware
  app.use(requestLogger);
  app.use(performanceTracker);

  // Serve static frontend files FIRST (before rate limiting and other middleware)
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html');
        // Ensure CSP headers allow Replit iframe embedding
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      }
    }
  }));

  // Apply general rate limiting
  app.use(generalLimiter);

  // Health check endpoints (API-specific routes first before fallback)
  app.get('/api/status', (_req, res) => {
    res.json({
      message: 'Welcome to Aeturnis Online API',
      status: 'Server is running',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    });
  });

  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      services: {
        database: 'connected',
        redis: 'disabled',
      },
    });
  });

  // API routes
  app.use('/api/v1/auth', authLimiter, authRoutes);
  app.use('/api/v1/sessions', generalLimiter, sessionRoutes);
  app.use('/api/v1/characters', generalLimiter, characterRoutes);

  // Legacy auth routes (for backward compatibility)
  app.use('/api/auth', authLimiter, authRoutes);

  // API status endpoint
  app.get('/api/status', (_req, res) => {
    res.json({
      server: 'Aeturnis Online API',
      status: 'operational',
      environment: process.env.NODE_ENV || 'development',
      features: [
        'authentication',
        'rate-limiting',
        'structured-logging',
        'security-headers',
        'compression',
        'performance-tracking',
      ],
      endpoints: {
        auth: '/api/v1/auth',
        health: '/health',
        status: '/api/status',
      },
    });
  });

  // Fallback route to serve React app for client-side routing
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });

  // 404 handler for non-GET requests
  app.use('*', (req, res) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found',
      },
      path: req.originalUrl,
    });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;