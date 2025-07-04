import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
// Authentication system
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler';
import './database'; // Initialize database connection
// import './cache/redis'; // Initialize Redis connection - disabled until Redis setup

// Load environment variables
config();

export const greet = (name: string): string => {
  return `Hello, ${name}! Welcome to Aeturnis Online.`;
};

// Create Express application
const createServer = () => {
  const app = express();

  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.com'] 
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req, _res, next) => {
    console.log(`📩 ${req.method} ${req.url} from ${req.ip}`);
    next();
  });

  // Health check endpoints
  app.get('/', (_req, res) => {
    res.json({
      message: greet('World'),
      status: 'Server is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: 'ready',
        redis: 'ready',
      }
    });
  });

  app.get('/api/status', (_req, res) => {
    res.json({
      server: 'Aeturnis Online',
      status: 'operational',
      environment: process.env.NODE_ENV || 'development',
      features: ['authentication-ready', 'rate-limiting-ready', 'redis-cache-ready']
    });
  });

  // API routes - Authentication enabled
  app.use('/api/auth', authRoutes);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      path: req.originalUrl
    });
  });

  // Error handling middleware
  app.use(errorHandler);

  return app;
};

// Start server
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  const app = createServer();
  
  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Aeturnis Online server running on http://0.0.0.0:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 API status: http://localhost:${PORT}/api/status`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
    console.log(`📝 Registration: POST http://localhost:${PORT}/api/auth/register`);
    console.log(`🔑 Login: POST http://localhost:${PORT}/api/auth/login`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
    });
  });
}

export default createServer;