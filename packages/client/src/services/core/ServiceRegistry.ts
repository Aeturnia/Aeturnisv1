export interface IService {
  initialize?(): Promise<void>;
  destroy?(): void | Promise<void>;
  getName?(): string;
}

export class ServiceRegistry {
  private services: Map<string, IService> = new Map();
  private initialized: Set<string> = new Set();

  public register(name: string, service: IService): void {
    if (this.services.has(name)) {
      throw new Error(`Service "${name}" is already registered`);
    }
    this.services.set(name, service);
  }

  public unregister(name: string): void {
    const service = this.services.get(name);
    if (service && service.destroy) {
      service.destroy();
    }
    this.services.delete(name);
    this.initialized.delete(name);
  }

  public get<T extends IService>(name: string): T | undefined {
    return this.services.get(name) as T;
  }

  public getRequired<T extends IService>(name: string): T {
    const service = this.get<T>(name);
    if (!service) {
      throw new Error(`Service "${name}" not found`);
    }
    return service;
  }

  public has(name: string): boolean {
    return this.services.has(name);
  }

  public getAll(): IService[] {
    return Array.from(this.services.values());
  }

  public getAllNames(): string[] {
    return Array.from(this.services.keys());
  }

  public async initialize(name: string): Promise<void> {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service "${name}" not found`);
    }

    if (this.initialized.has(name)) {
      return;
    }

    if (service.initialize) {
      await service.initialize();
    }
    
    this.initialized.add(name);
  }

  public async initializeAll(): Promise<void> {
    const promises: Promise<void>[] = [];
    
    for (const [name, service] of this.services) {
      if (!this.initialized.has(name) && service.initialize) {
        promises.push(
          service.initialize()
            .then(() => this.initialized.add(name))
            .catch(error => {
              console.error(`Failed to initialize service "${name}":`, error);
              throw error;
            })
        );
      }
    }

    await Promise.all(promises);
  }

  public async destroy(name: string): Promise<void> {
    const service = this.services.get(name);
    if (service && service.destroy) {
      await service.destroy();
    }
    this.initialized.delete(name);
  }

  public async destroyAll(): Promise<void> {
    const promises: Promise<void>[] = [];
    
    for (const [name, service] of this.services) {
      if (service.destroy) {
        promises.push(
          Promise.resolve(service.destroy())
            .catch(error => {
              console.error(`Failed to destroy service "${name}":`, error);
            })
        );
      }
    }

    await Promise.all(promises);
    this.services.clear();
    this.initialized.clear();
  }

  public isInitialized(name: string): boolean {
    return this.initialized.has(name);
  }
}