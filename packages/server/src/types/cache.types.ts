export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  namespace?: string;
}

export interface CacheEntry<T = unknown> {
  value: T;
  ttl?: number;
  createdAt: string;
}