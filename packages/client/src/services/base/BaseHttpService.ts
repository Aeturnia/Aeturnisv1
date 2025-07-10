import { BaseService, ServiceConfig, ServiceResponse } from './BaseService';
import { ApiClient } from '../core/ApiClient';
import { CacheService } from '../cache/CacheService';
import { OfflineQueue } from '../cache/OfflineQueue';
import { NetworkError } from './ServiceError';

export interface HttpServiceConfig extends ServiceConfig {
  apiClient?: ApiClient;
  baseURL: string;
  cacheService?: CacheService;
  offlineQueue?: OfflineQueue;
}

export interface RequestOptions {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  useCache?: boolean;
  cacheTTL?: number;
  optimisticResponse?: any;
}

export interface CachedData<T> {
  data: T;
  metadata: {
    timestamp: number;
    version?: string;
  };
  ttl?: number;
}

export abstract class BaseHttpService extends BaseService {
  protected apiClient: ApiClient;
  protected cacheService?: CacheService;
  protected offlineQueue?: OfflineQueue;
  protected http: ApiClient; // Expose http property for child classes

  constructor(config: HttpServiceConfig) {
    super(config);
    
    this.apiClient = config.apiClient || new ApiClient({ 
      baseURL: config.baseURL,
      timeout: 30000
    });
    this.http = this.apiClient; // Expose as http for backward compatibility
    this.cacheService = config.cacheService;
    this.offlineQueue = config.offlineQueue;
  }

  protected async get<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ServiceResponse<T>> {
    const cacheKey = this.getCacheKey('GET', endpoint, options.params);
    
    // Check cache first
    if (this.config.cacheEnabled && this.cacheService && options.useCache !== false) {
      const cached = await this.cacheService.get<T>(cacheKey);
      if (cached && !this.isCacheExpired(cached)) {
        return {
          data: cached.data,
          metadata: { 
            ...cached.metadata, 
            cached: true,
            ...((!this.isOnline) && { offline: true })
          }
        };
      }
    }

    // Make request
    try {
      const response = await this.executeWithRetry(() =>
        this.apiClient.get<T>(endpoint, options)
      );

      // Cache successful response
      if (this.config.cacheEnabled && this.cacheService) {
        await this.cacheService.set(cacheKey, response.data, {
          ttl: options.cacheTTL || 300000 // 5 minutes default
        });
      }

      return {
        data: response.data,
        metadata: { timestamp: Date.now(), cached: false }
      };
    } catch (error) {
      // Return cached data if available when offline
      if (!this.isOnline && this.cacheService) {
        const cached = await this.cacheService.get<T>(cacheKey);
        if (cached) {
          return {
            data: cached.data,
            metadata: { ...cached.metadata, cached: true, offline: true }
          };
        }
      }
      throw error;
    }
  }

  protected async post<T>(
    endpoint: string,
    data: any,
    options: RequestOptions = {}
  ): Promise<ServiceResponse<T>> {
    if (!this.isOnline && this.config.offlineEnabled && this.offlineQueue) {
      // Queue for later
      const operation = {
        method: 'POST',
        endpoint,
        data,
        options,
        timestamp: Date.now()
      };
      
      await this.offlineQueue.add(operation);
      
      // Return optimistic response if provided
      if (options.optimisticResponse) {
        return {
          data: options.optimisticResponse,
          metadata: { timestamp: Date.now(), cached: false, queued: true }
        };
      }
      
      throw new NetworkError('Operation queued for offline sync');
    }

    const response = await this.executeWithRetry(() =>
      this.apiClient.post<T>(endpoint, data, options)
    );

    return {
      data: response.data,
      metadata: { timestamp: Date.now(), cached: false }
    };
  }

  protected async put<T>(
    endpoint: string,
    data: any,
    options: RequestOptions = {}
  ): Promise<ServiceResponse<T>> {
    if (!this.isOnline && this.config.offlineEnabled && this.offlineQueue) {
      const operation = {
        method: 'PUT',
        endpoint,
        data,
        options,
        timestamp: Date.now()
      };
      
      await this.offlineQueue.add(operation);
      
      if (options.optimisticResponse) {
        return {
          data: options.optimisticResponse,
          metadata: { timestamp: Date.now(), cached: false, queued: true }
        };
      }
      
      throw new NetworkError('Operation queued for offline sync');
    }

    const response = await this.executeWithRetry(() =>
      this.apiClient.put<T>(endpoint, data, options)
    );

    return {
      data: response.data,
      metadata: { timestamp: Date.now(), cached: false }
    };
  }

  protected async delete<T = void>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ServiceResponse<T>> {
    if (!this.isOnline && this.config.offlineEnabled && this.offlineQueue) {
      const operation = {
        method: 'DELETE',
        endpoint,
        options,
        timestamp: Date.now()
      };
      
      await this.offlineQueue.add(operation);
      
      throw new NetworkError('Operation queued for offline sync');
    }

    const response = await this.executeWithRetry(() =>
      this.apiClient.delete<T>(endpoint, options)
    );

    return {
      data: response.data,
      metadata: { timestamp: Date.now(), cached: false }
    };
  }

  protected getCacheKey(method: string, endpoint: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${method}:${endpoint}:${paramString}`;
  }

  protected isCacheExpired(cached: CachedData<any>): boolean {
    const now = Date.now();
    return now - cached.metadata.timestamp > (cached.ttl || 300000);
  }

  public destroy(): void {
    this.removeAllListeners();
  }
}