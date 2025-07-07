import { Router } from 'express';
import { ServiceProvider, globalServices } from '../providers';

const router = Router();

// Debug endpoint to check ServiceProvider state
router.get('/services', (req, res) => {
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