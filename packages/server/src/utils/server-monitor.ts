import { logger } from './logger';
import os from 'os';
import { performance } from 'perf_hooks';

export class ServerMonitor {
  private startTime: number;
  private memoryInterval: NodeJS.Timeout | null = null;
  private healthInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startTime = performance.now();
  }

  start() {
    // Log server start
    logger.info('🚀 Server Monitor initialized', {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpus: os.cpus().length,
      totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB`,
    });

    // Memory monitoring every 30 seconds
    this.memoryInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      const uptime = Math.round((performance.now() - this.startTime) / 1000);
      
      logger.info('📊 Server Health Report', {
        uptime: `${uptime}s`,
        memory: {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        },
        system: {
          loadAvg: os.loadavg(),
          freeMemory: `${Math.round(os.freemem() / 1024 / 1024)}MB`,
        },
      });
    }, 30000);

    // Health check every 10 seconds
    this.healthInterval = setInterval(() => {
      logger.info('💚 Server heartbeat', {
        uptime: `${Math.round((performance.now() - this.startTime) / 1000)}s`,
        port: process.env.PORT || '8080',
      });
    }, 10000);

    // Process event monitoring
    this.setupProcessMonitoring();
  }

  private setupProcessMonitoring() {
    process.on('warning', (warning) => {
      logger.warn('⚠️ Process warning', {
        name: warning.name,
        message: warning.message,
        stack: warning.stack,
      });
    });

    // Monitor event loop lag (reduced frequency and higher threshold)
    let lastCheck = process.hrtime.bigint();
    setInterval(() => {
      const now = process.hrtime.bigint();
      const lag = Number(now - lastCheck) / 1000000; // Convert to ms
      
      if (lag > 500) { // Only warn if event loop is delayed by more than 500ms
        logger.warn('🐌 Event loop lag detected', {
          lag: `${lag}ms`,
        });
      }
      
      lastCheck = now;
    }, 5000); // Check every 5 seconds instead of 1 second
  }

  stop() {
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
    }
    
    logger.info('🛑 Server Monitor stopped', {
      totalUptime: `${Math.round((performance.now() - this.startTime) / 1000)}s`,
    });
  }
}