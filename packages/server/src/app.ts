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
import characterRoutes from './routes/character.routes';
import currencyRoutes from './routes/currency.routes';
import bankRoutes from './routes/bank.routes';
import equipmentRoutes from './routes/equipment.routes';
import combatRoutes from './routes/combat.routes';
import { deathRoutes } from './routes/death.routes';
import { lootRoutes } from './routes/loot.routes';
import monsterRoutes from './routes/monster.routes';
import npcRoutes from './routes/npc.routes';
import zoneRoutes from './routes/zone.routes';
import movementRoutes from './routes/movement.routes';
import progressionRoutes from './routes/progression.routes';
import { tutorialRoutes } from './routes/tutorial.routes';
import { affinityRoutes } from './routes/affinity.routes';
import { debugRoutes } from './routes/debug.routes';

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

  // Security middleware - Permissive CSP for development
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: process.env.NODE_ENV === 'development' ? false : {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:", "data:"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "ws:", "wss:", "https:"],
        fontSrc: ["'self'", "data:", "https:"],
        frameAncestors: ["'self'", "*.replit.dev", "*.replit.com", "*.replit.app", "replit.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "data:", "blob:"],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["'self'", "blob:"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
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

  // Apply general rate limiting (disabled for combat routes to use cooldown system)
  // app.use(generalLimiter);

  // Health check endpoints (API-specific routes first before fallback)
  // API status endpoint moved below - preventing duplicate routes

  // Root route removed - now serves React testing frontend

  // Serve production mobile client
  app.use(express.static(path.join(__dirname, '../public')));
  
  // SPA fallback for React Router
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    
    // Serve index.html for all non-API routes
    res.sendFile(path.join(__dirname, '../public/index.html'));
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
  
  // Debug routes for ServiceProvider troubleshooting
  app.use('/api/debug', debugRoutes);
  app.use('/api/v1/characters', generalLimiter, characterRoutes);
  app.use('/api/v1/currency', generalLimiter, currencyRoutes);
  app.use('/api/v1/bank', generalLimiter, bankRoutes);
  app.use('/api/v1/equipment', generalLimiter, equipmentRoutes);
  app.use('/api/v1/combat', generalLimiter, combatRoutes);
  app.use('/api/v1/death', generalLimiter, deathRoutes);
  app.use('/api/v1/loot', generalLimiter, lootRoutes);
  app.use('/api/v1/monsters', generalLimiter, monsterRoutes);
  app.use('/api/v1/npcs', generalLimiter, npcRoutes);
  app.use('/api/v1/zones', generalLimiter, zoneRoutes);
  app.use('/api/v1/movement', generalLimiter, movementRoutes);
  app.use('/api/v1/progression', generalLimiter, progressionRoutes);
  app.use('/api/v1/tutorial', generalLimiter, tutorialRoutes);
  app.use('/api/v1/affinity', generalLimiter, affinityRoutes);

  // Legacy auth routes (for backward compatibility)
  app.use('/api/auth', authLimiter, authRoutes);

  // API status endpoint
  app.get('/api/status', (_req, res) => {
    res.json({
      message: 'Aeturnis Online API',
      status: 'operational',
      version: '2.8.0',
      architecture: 'MMORPG Backend with Tutorial & Affinity Systems',
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
        death: '/api/v1/death',
        loot: '/api/v1/loot',
        monsters: '/api/v1/monsters',
        npcs: '/api/v1/npcs',
        zones: '/api/v1/zones',
        movement: '/api/v1/movement',
        progression: '/api/v1/progression',
        tutorial: '/api/v1/tutorial',
        affinity: '/api/v1/affinity',
      },
      services: {
        database: 'connected',
        redis: 'disabled',
        socketio: 'port_3001',
      },
    });
  });

  // Testing environment endpoint
  app.get('/testing', (_req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Aeturnis Online Testing Environment</title>
        <style>
          body { margin: 0; padding: 20px; background-color: #111827; color: #f3f4f6; font-family: Arial, sans-serif; }
          .container { max-width: 1200px; margin: 0 auto; }
          h1 { color: #06b6d4; }
          .info { background: #374151; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .button { background: #06b6d4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 10px 0; }
          .button:hover { background: #0891b2; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🧪 Aeturnis Online Testing Environment</h1>
          <div class="info">
            <p><strong>Status:</strong> Testing Environment has been moved to App-Testing.tsx</p>
            <p><strong>Note:</strong> The main page now has a clean solid background for UI/UX development</p>
            <p><strong>To restore full testing:</strong> Replace App.tsx with App-Testing.tsx content</p>
          </div>
          <button class="button" onclick="window.location.href='/'">Return to Main Page</button>
        </div>
      </body>
      </html>
    `);
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
    return res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;