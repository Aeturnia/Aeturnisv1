import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import * as path from 'path';
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
import currencyRoutes from './routes/currency.routes';
import bankRoutes from './routes/bank.routes';
import equipmentRoutes from './routes/equipment.routes.simple';
import combatRoutes from './routes/combat.routes';

// Services
// import { shutdownServices } from './services/index';

// Utilities
import { logger, stream } from './utils/logger';

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
  app.use(morgan('combined', { stream }));

  // Custom middleware
  app.use(requestLogger);
  app.use(performanceTracker);

  // Backend API server - no static file serving needed

  // Apply general rate limiting
  app.use(generalLimiter);

  // Health check endpoints (API-specific routes first before fallback)
  // API status endpoint moved below - preventing duplicate routes

  // Root route removed - now serves React testing frontend

  // Serve testing frontend
  app.use(express.static(path.join(__dirname, '../public')));

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
  app.use('/api/v1/currency', generalLimiter, currencyRoutes);
  app.use('/api/v1/bank', generalLimiter, bankRoutes);
  app.use('/api/v1/equipment', generalLimiter, equipmentRoutes);
  app.use('/api/v1/combat', generalLimiter, combatRoutes);

  // Legacy auth routes (for backward compatibility)
  app.use('/api/auth', authLimiter, authRoutes);

  // API status endpoint
  app.get('/api/status', (_req, res) => {
    res.json({
      message: 'Aeturnis Online API',
      status: 'operational',
      version: '2.2.0',
      architecture: 'MMORPG Backend',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/v1/auth',
        health: '/health',
        status: '/api/status',
        currency: '/api/v1/currency',
        bank: '/api/v1/bank',
        characters: '/api/v1/characters',
        equipment: '/api/v1/equipment',
        combat: '/api/v1/combat',
      },
      services: {
        database: 'connected',
        redis: 'disabled',
        socketio: 'port_3001',
      },
    });
  });

  // SPA fallback route - serve React app for all non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      // API routes should return 404 JSON
      logger.warn(`404 - API route not found: ${req.method} ${req.originalUrl}`);
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'The requested API endpoint was not found',
        },
        path: req.originalUrl,
      });
    }
    
    // Serve React app for all other routes
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;