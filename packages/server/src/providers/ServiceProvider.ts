import { logger } from '../utils/logger';
import { IService } from './interfaces/IService';

// Global service registry - exported for direct access
export const globalServices = new Map<string, IService>();

/**
 * Service Provider Registry
 * Static-only implementation for managing service instances across the application
 */
export class ServiceProvider {
  /**
   * Get the singleton instance (backward compatibility)
   */
  static getInstance(): typeof ServiceProvider {
    return ServiceProvider;
  }

  /**
   * Register a service with the provider
   */
  static register<T extends IService>(name: string, service: T): void {
    globalServices.set(name, service);
    logger.info(`Service registered: ${name} (total: ${globalServices.size})`);
  }

  /**
   * Get a service from the provider
   */
  static get<T>(name: string): T {
    const service = globalServices.get(name);
    if (!service) {
      const availableServices = Array.from(globalServices.keys()).join(', ');
      logger.error(`Service ${name} not registered. Available services: ${availableServices}`);
      throw new Error(`Service ${name} not registered. Available services: ${availableServices}`);
    }
    return service as T;
  }

  /**
   * Get list of registered service names
   */
  static getRegisteredServices(): string[] {
    return Array.from(globalServices.keys());
  }

  /**
   * Get the number of registered services
   */
  static getServiceCount(): number {
    return globalServices.size;
  }

  /**
   * Check if a service is registered
   */
  static isRegistered(name: string): boolean {
    return globalServices.has(name);
  }

  /**
   * Check if a service is registered (alias)
   */
  static has(name: string): boolean {
    return globalServices.has(name);
  }

  /**
   * Clear all registered services
   */
  static clear(): void {
    globalServices.clear();
    logger.info('All services cleared from ServiceProvider');
  }

  // Instance methods for backward compatibility
  register<T extends IService>(name: string, service: T): void {
    ServiceProvider.register(name, service);
  }

  get<T>(name: string): T {
    return ServiceProvider.get<T>(name);
  }

  getRegisteredServices(): string[] {
    return ServiceProvider.getRegisteredServices();
  }

  getServiceCount(): number {
    return ServiceProvider.getServiceCount();
  }

  isRegistered(name: string): boolean {
    return ServiceProvider.isRegistered(name);
  }

  has(name: string): boolean {
    return ServiceProvider.has(name);
  }

  clear(): void {
    ServiceProvider.clear();
  }
}