import { EventEmitter } from '../../core/EventEmitter';
import { ServiceLayerConfig } from '../../index';

export abstract class MockService extends EventEmitter {
  protected config: ServiceLayerConfig['mockConfig'];
  protected isOnline: boolean = true;

  constructor(config?: ServiceLayerConfig['mockConfig']) {
    super();
    this.config = config || {};
    
    // Simulate offline mode if configured
    if (this.config.offlineMode) {
      this.isOnline = false;
    }
  }

  /**
   * Simulate network delay
   */
  protected async simulateDelay(): Promise<void> {
    const delay = this.config.delay || 0;
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  /**
   * Simulate random errors based on error rate
   */
  protected shouldSimulateError(): boolean {
    const errorRate = this.config.errorRate || 0;
    return Math.random() < errorRate;
  }

  /**
   * Simulate an error response
   */
  protected simulateError(message: string = 'Mock service error'): never {
    throw new Error(message);
  }

  /**
   * Check if service should work offline
   */
  protected checkOnline(): void {
    if (!this.isOnline && !this.config.offlineMode) {
      throw new Error('Service is offline');
    }
  }

  /**
   * Toggle online/offline state
   */
  public setOnlineStatus(online: boolean): void {
    this.isOnline = online;
    this.emit(online ? 'online' : 'offline');
  }

  /**
   * Get mock data with optional delay
   */
  protected async getMockData<T>(data: T): Promise<T> {
    await this.simulateDelay();
    
    if (this.shouldSimulateError()) {
      this.simulateError('Random mock error occurred');
    }

    this.checkOnline();
    
    return data;
  }

  /**
   * Initialize the mock service
   */
  public async initialize(): Promise<void> {
    // Base initialization - can be overridden
    console.log(`Mock ${this.constructor.name} initialized`);
  }

  /**
   * Destroy the mock service
   */
  public destroy(): void {
    this.removeAllListeners();
    console.log(`Mock ${this.constructor.name} destroyed`);
  }
}