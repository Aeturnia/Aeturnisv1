import { logger } from '../utils/logger';

/**
 * Service Provider Registry
 * Singleton pattern for managing service instances across the application
 */
export class ServiceProvider {
  private static instance: ServiceProvider;
  private services = new Map<string, any>();

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    logger.info('ServiceProvider initialized');
  }

  /**
   * Get the singleton instance of ServiceProvider
   * @returns The ServiceProvider instance
   */
  static getInstance(): ServiceProvider {
    if (!ServiceProvider.instance) {
      ServiceProvider.instance = new ServiceProvider();
    }
    return ServiceProvider.instance;
  }

  /**
   * Register a service with the provider
   * @param name - The service name/identifier
   * @param service - The service instance
   */
  register<T>(name: string, service: T): void {
    if (this.services.has(name)) {
      logger.warn(`Service ${name} is being overwritten`);
    }
    this.services.set(name, service);
    logger.info(`Service registered: ${name}`);
  }

  /**
   * Get a service from the provider
   * @param name - The service name/identifier
   * @returns The service instance
   * @throws Error if service is not registered
   */
  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      const error = `Service ${name} not registered. Available services: ${Array.from(this.services.keys()).join(', ')}`;
      logger.error(error);
      throw new Error(error);
    }
    return service as T;
  }

  /**
   * Check if a service is registered
   * @param name - The service name/identifier
   * @returns Whether the service is registered
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Clear all registered services
   * Useful for testing
   */
  clear(): void {
    this.services.clear();
    logger.info('All services cleared from ServiceProvider');
  }

  /**
   * Get list of all registered service names
   * @returns Array of service names
   */
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }
}