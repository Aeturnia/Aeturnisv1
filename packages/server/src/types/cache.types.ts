export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  namespace?: string;
}

export interface CacheEntry<T = any> {
  value: T;
  ttl?: number;
  createdAt: string;
}