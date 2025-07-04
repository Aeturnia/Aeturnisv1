import { createAdapter } from '@socket.io/redis-adapter';
import { createClient, RedisClientType } from 'redis';
import { logger } from '../../utils/logger';
import { Server } from 'socket.io';

export interface RedisAdapterConfig {
  url: string;
  retryDelayOnFailover?: number;
  enableReadyCheck?: boolean;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
  keepAlive?: number;
  family?: number;
  keyPrefix?: string;
}

export class SocketRedisAdapter {
  private pubClient: RedisClientType;
  private subClient: RedisClientType;
  private config: RedisAdapterConfig;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(config: RedisAdapterConfig) {
    this.config = {
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      lazyConnect: false,
      keepAlive: 30000,
      family: 4,
      keyPrefix: 'socket.io:',
      ...config,
    };

    this.pubClient = createClient({
      url: this.config.url,
      socket: {
        keepAlive: this.config.keepAlive,
        family: this.config.family,
      },
    });

    this.subClient = this.pubClient.duplicate();

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Publisher client events
    this.pubClient.on('connect', () => {
      logger.info('Redis publisher client connected', {
        url: this.config.url,
        service: 'socket-redis-adapter',
      });
    });

    this.pubClient.on('error', (err) => {
      logger.error('Redis publisher client error', {
        error: err.message,
        stack: err.stack,
        service: 'socket-redis-adapter',
      });
      this.handleConnectionError();
    });

    this.pubClient.on('reconnecting', () => {
      logger.info('Redis publisher client reconnecting', {
        attempts: this.reconnectAttempts,
        service: 'socket-redis-adapter',
      });
    });

    // Subscriber client events
    this.subClient.on('connect', () => {
      logger.info('Redis subscriber client connected', {
        url: this.config.url,
        service: 'socket-redis-adapter',
      });
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.subClient.on('error', (err) => {
      logger.error('Redis subscriber client error', {
        error: err.message,
        stack: err.stack,
        service: 'socket-redis-adapter',
      });
      this.handleConnectionError();
    });

    this.subClient.on('reconnecting', () => {
      logger.info('Redis subscriber client reconnecting', {
        attempts: this.reconnectAttempts,
        service: 'socket-redis-adapter',
      });
    });
  }

  private handleConnectionError(): void {
    this.isConnected = false;
    this.reconnectAttempts++;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max Redis reconnection attempts reached', {
        attempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        service: 'socket-redis-adapter',
      });
      return;
    }

    setTimeout(() => {
      this.reconnect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private async reconnect(): Promise<void> {
    try {
      if (!this.pubClient.isOpen) {
        await this.pubClient.connect();
      }
      if (!this.subClient.isOpen) {
        await this.subClient.connect();
      }
    } catch (error) {
      logger.error('Redis reconnection failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        attempts: this.reconnectAttempts,
        service: 'socket-redis-adapter',
      });
    }
  }

  public async initialize(): Promise<void> {
    try {
      await Promise.all([
        this.pubClient.connect(),
        this.subClient.connect(),
      ]);

      logger.info('Redis adapter initialized successfully', {
        service: 'socket-redis-adapter',
      });
    } catch (error) {
      logger.error('Failed to initialize Redis adapter', {
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'socket-redis-adapter',
      });
      throw error;
    }
  }

  public createAdapter() {
    return createAdapter(this.pubClient, this.subClient, {
      key: this.config.keyPrefix,
    });
  }

  public attachToServer(io: Server): void {
    io.adapter(this.createAdapter());
    logger.info('Redis adapter attached to Socket.IO server', {
      service: 'socket-redis-adapter',
    });
  }

  public async getConnectionStats(): Promise<{
    pubConnected: boolean;
    subConnected: boolean;
    reconnectAttempts: number;
    isHealthy: boolean;
  }> {
    return {
      pubConnected: this.pubClient.isOpen,
      subConnected: this.subClient.isOpen,
      reconnectAttempts: this.reconnectAttempts,
      isHealthy: this.isConnected && this.pubClient.isOpen && this.subClient.isOpen,
    };
  }

  public async ping(): Promise<boolean> {
    try {
      await this.pubClient.ping();
      await this.subClient.ping();
      return true;
    } catch (error) {
      logger.error('Redis ping failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'socket-redis-adapter',
      });
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await Promise.all([
        this.pubClient.disconnect(),
        this.subClient.disconnect(),
      ]);
      this.isConnected = false;
      logger.info('Redis adapter disconnected', {
        service: 'socket-redis-adapter',
      });
    } catch (error) {
      logger.error('Error during Redis adapter disconnect', {
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'socket-redis-adapter',
      });
    }
  }

  // Custom pub/sub methods for direct Redis communication
  public async publish(channel: string, message: string): Promise<void> {
    try {
      await this.pubClient.publish(channel, message);
    } catch (error) {
      logger.error('Failed to publish message to Redis', {
        channel,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'socket-redis-adapter',
      });
    }
  }

  public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      await this.subClient.subscribe(channel, callback);
      logger.info('Subscribed to Redis channel', {
        channel,
        service: 'socket-redis-adapter',
      });
    } catch (error) {
      logger.error('Failed to subscribe to Redis channel', {
        channel,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'socket-redis-adapter',
      });
    }
  }

  public async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subClient.unsubscribe(channel);
      logger.info('Unsubscribed from Redis channel', {
        channel,
        service: 'socket-redis-adapter',
      });
    } catch (error) {
      logger.error('Failed to unsubscribe from Redis channel', {
        channel,
        error: error instanceof Error ? error.message : 'Unknown error',
        service: 'socket-redis-adapter',
      });
    }
  }

  // Monitor adapter health
  public startHealthMonitor(intervalMs = 30000): void {
    setInterval(async () => {
      const stats = await this.getConnectionStats();
      logger.info('Redis adapter health check', {
        ...stats,
        service: 'socket-redis-adapter',
      });

      if (!stats.isHealthy) {
        logger.warn('Redis adapter unhealthy - attempting reconnection', {
          service: 'socket-redis-adapter',
        });
        await this.reconnect();
      }
    }, intervalMs);
  }
}

// Factory function to create Redis adapter with environment configuration
export function createRedisAdapter(config?: Partial<RedisAdapterConfig>): SocketRedisAdapter {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  const adapterConfig: RedisAdapterConfig = {
    url: redisUrl,
    keyPrefix: 'aeturnis:socket:',
    ...config,
  };

  return new SocketRedisAdapter(adapterConfig);
}

// Graceful shutdown handler
export function setupRedisShutdownHandler(adapter: SocketRedisAdapter): void {
  const gracefulShutdown = async () => {
    logger.info('Shutting down Redis adapter...');
    await adapter.disconnect();
    process.exit(0);
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}