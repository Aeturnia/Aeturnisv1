import { ServiceRegistry } from '../core/ServiceRegistry';
import { IService } from './interfaces/IService';

export class ServiceProvider {
  private static instance: ServiceProvider;
  private registry: ServiceRegistry;

  private constructor() {
    this.registry = new ServiceRegistry();
  }

  public static getInstance(): ServiceProvider {
    if (!ServiceProvider.instance) {
      ServiceProvider.instance = new ServiceProvider();
    }
    return ServiceProvider.instance;
  }

  // Static methods for backward compatibility with server pattern
  public static register(name: string, service: IService): void {
    ServiceProvider.getInstance().register(name, service);
  }

  public static get<T extends IService>(name: string): T | undefined {
    return ServiceProvider.getInstance().get<T>(name);
  }

  public static getRegisteredServices(): string[] {
    return ServiceProvider.getInstance().getRegisteredServices();
  }

  public static has(name: string): boolean {
    return ServiceProvider.getInstance().has(name);
  }

  public static async initialize(name: string): Promise<void> {
    return ServiceProvider.getInstance().initialize(name);
  }

  public static async initializeAll(): Promise<void> {
    return ServiceProvider.getInstance().initializeAll();
  }

  public static async destroy(name: string): Promise<void> {
    return ServiceProvider.getInstance().destroy(name);
  }

  public static async destroyAll(): Promise<void> {
    return ServiceProvider.getInstance().destroyAll();
  }

  // Instance methods
  public register(name: string, service: IService): void {
    this.registry.register(name, service);
  }

  public unregister(name: string): void {
    this.registry.unregister(name);
  }

  public get<T extends IService>(name: string): T | undefined {
    return this.registry.get<T>(name);
  }

  public getRequired<T extends IService>(name: string): T {
    return this.registry.getRequired<T>(name);
  }

  public has(name: string): boolean {
    return this.registry.has(name);
  }

  public getRegisteredServices(): string[] {
    return this.registry.getAllNames();
  }

  public async initialize(name: string): Promise<void> {
    return this.registry.initialize(name);
  }

  public async initializeAll(): Promise<void> {
    return this.registry.initializeAll();
  }

  public async destroy(name: string): Promise<void> {
    return this.registry.destroy(name);
  }

  public async destroyAll(): Promise<void> {
    return this.registry.destroyAll();
  }

  public isInitialized(name: string): boolean {
    return this.registry.isInitialized(name);
  }

  public getRegistry(): ServiceRegistry {
    return this.registry;
  }
}