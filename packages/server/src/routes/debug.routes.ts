import { Router } from 'express';
import { ServiceProvider, globalServices } from '../providers';

const router = Router();

// Debug endpoint to check ServiceProvider state
router.get('/services', (_req, res) => {
  try {
    const provider = ServiceProvider.getInstance();
    const registeredServices = Array.from(globalServices.keys());
    const serviceCount = globalServices.size;
    
    res.json({
      success: true,
      data: {
        registeredServices,
        serviceCount,
        timestamp: new Date().toISOString(),
        providerInstance: !!provider
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint to test service access
router.get('/test/:serviceName', (req, res) => {
  try {
    const { serviceName } = req.params;
    const provider = ServiceProvider.getInstance();
    const registeredServices = provider.getRegisteredServices();
    
    try {
      const service = provider.get(serviceName);
      res.json({
        success: true,
        data: {
          serviceName,
          serviceFound: true,
          serviceType: typeof service,
          registeredServices,
          timestamp: new Date().toISOString()
        }
      });
    } catch (serviceError) {
      res.json({
        success: false,
        data: {
          serviceName,
          serviceFound: false,
          error: serviceError instanceof Error ? serviceError.message : 'Unknown service error',
          registeredServices,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as debugRoutes };
import { Router } from 'express';
import { ServiceProvider } from '../providers/ServiceProvider';
import { logger } from '../utils/logger';

const router = Router();

router.get('/server-info', (req, res) => {
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();
  
  res.json({
    server: {
      uptime: `${Math.floor(uptime)}s`,
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
      startTime: new Date(Date.now() - uptime * 1000).toISOString()
    },
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
    },
    services: {
      count: ServiceProvider.getServiceNames().length,
      names: ServiceProvider.getServiceNames(),
      initialized: ServiceProvider.isInitialized
    },
    eventLoop: {
      delay: process.hrtime.bigint()
    }
  });
});

router.get('/logs', (req, res) => {
  // Return recent log entries if available
  res.json({
    message: 'Check server console for detailed logs',
    logLevel: 'info',
    timestamp: new Date().toISOString()
  });
});

export default router;
