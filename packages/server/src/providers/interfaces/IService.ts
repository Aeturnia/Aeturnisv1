/**
 * Base interface for all services
 * All service interfaces should extend this interface
 */
export interface IService {
  /**
   * Optional initialization method for services that need setup
   */
  initialize?(): Promise<void>;

  /**
   * Optional shutdown method for services that need cleanup
   */
  shutdown?(): Promise<void>;

  /**
   * Get the service name (useful for debugging)
   */
  getName?(): string;
}