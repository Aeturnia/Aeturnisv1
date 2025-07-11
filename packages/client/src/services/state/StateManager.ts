import { EventEmitter } from 'events';

export interface StateSlice<T> {
  data: T;
  loading: boolean;
  error: Error | null;
  lastUpdated: number;
  version: number;
}

export interface StateOptions {
  persist?: boolean;
}

export interface UpdateOptions {
  persist?: boolean;
}

export type StateUpdater<T> = T | ((current: T) => T);
export type StateSubscriber<T = any> = (slice: StateSlice<T>) => void;
export type StateMiddleware = (
  key: string,
  prevState: StateSlice<any>,
  nextState: StateSlice<any>
) => StateSlice<any>;

export class StateManager extends EventEmitter {
  private state: Map<string, StateSlice<any>> = new Map();
  private subscribers: Map<string, Set<StateSubscriber>> = new Map();
  private middleware: StateMiddleware[] = [];
  private persistedKeys: Set<string> = new Set();

  public register<T>(
    key: string,
    initialData: T,
    options: StateOptions = {}
  ): void {
    const slice: StateSlice<T> = {
      data: initialData,
      loading: false,
      error: null,
      lastUpdated: Date.now(),
      version: 0
    };

    this.state.set(key, slice);
    
    if (options.persist) {
      this.persistedKeys.add(key);
      this.loadPersistedState(key);
    }
  }

  public update<T>(
    key: string,
    updater: StateUpdater<T>,
    options: UpdateOptions = {}
  ): void {
    const slice = this.state.get(key);
    if (!slice) {
      throw new Error(`State slice "${key}" not found`);
    }

    const prevState = { ...slice };
    const nextData = typeof updater === 'function' 
      ? updater(slice.data) 
      : updater;

    const nextSlice: StateSlice<T> = {
      ...slice,
      data: nextData,
      lastUpdated: Date.now(),
      version: slice.version + 1
    };

    // Apply middleware
    const finalSlice = this.applyMiddleware(key, prevState, nextSlice);
    
    this.state.set(key, finalSlice);
    
    // Notify subscribers
    this.notifySubscribers(key, finalSlice);
    
    // Emit change event
    this.emit('state:changed', {
      key,
      previous: prevState,
      current: finalSlice
    });

    // Persist if needed
    if (options.persist !== false && this.isPersisted(key)) {
      this.persistState(key, finalSlice);
    }
  }

  public updateSlice<T>(
    key: string,
    updates: Partial<StateSlice<T>>,
    options: UpdateOptions = {}
  ): void {
    const slice = this.state.get(key);
    if (!slice) {
      throw new Error(`State slice "${key}" not found`);
    }

    const prevState = { ...slice };
    const nextSlice: StateSlice<T> = {
      ...slice,
      ...updates,
      lastUpdated: Date.now(),
      version: slice.version + 1
    };

    // Apply middleware
    const finalSlice = this.applyMiddleware(key, prevState, nextSlice);
    
    this.state.set(key, finalSlice);
    
    // Notify subscribers
    this.notifySubscribers(key, finalSlice);
    
    // Emit change event
    this.emit('state:changed', {
      key,
      previous: prevState,
      current: finalSlice
    });

    // Persist if needed
    if (options.persist !== false && this.isPersisted(key)) {
      this.persistState(key, finalSlice);
    }
  }

  public select<T>(key: string): T | undefined {
    const slice = this.state.get(key);
    return slice?.data;
  }

  public selectSlice<T>(key: string): StateSlice<T> | undefined {
    return this.state.get(key);
  }

  public subscribe<T>(
    key: string,
    subscriber: StateSubscriber<T>
  ): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key)!.add(subscriber);

    // Call subscriber with current state
    const currentSlice = this.state.get(key);
    if (currentSlice) {
      subscriber(currentSlice);
    }
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(key)?.delete(subscriber);
    };
  }

  public use(middleware: StateMiddleware): void {
    this.middleware.push(middleware);
  }

  public async loadAllPersistedState(): Promise<void> {
    for (const key of this.persistedKeys) {
      this.loadPersistedState(key);
    }
  }

  private applyMiddleware(
    key: string,
    prevState: StateSlice<any>,
    nextState: StateSlice<any>
  ): StateSlice<any> {
    return this.middleware.reduce(
      (state, middleware) => middleware(key, prevState, state),
      nextState
    );
  }

  private notifySubscribers(key: string, slice: StateSlice<any>): void {
    const subscribers = this.subscribers.get(key);
    if (!subscribers) return;

    for (const subscriber of subscribers) {
      try {
        subscriber(slice);
      } catch (error) {
        console.error('Error in state subscriber:', error);
      }
    }
  }

  private isPersisted(key: string): boolean {
    return this.persistedKeys.has(key);
  }

  private persistState(key: string, slice: StateSlice<any>): void {
    try {
      localStorage.setItem(
        `state:${key}`,
        JSON.stringify({
          data: slice.data,
          version: slice.version,
          timestamp: slice.lastUpdated
        })
      );
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }

  private loadPersistedState(key: string): void {
    try {
      const stored = localStorage.getItem(`state:${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.update(key, parsed.data, { persist: false });
      }
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    }
  }

  public reset(key: string): void {
    const slice = this.state.get(key);
    if (!slice) return;

    const initialData = this.getInitialData(key);
    if (initialData !== undefined) {
      this.update(key, initialData);
    }
  }

  public resetAll(): void {
    for (const key of this.state.keys()) {
      this.reset(key);
    }
  }

  private getInitialData(key: string): any {
    // This would need to be enhanced to store initial values
    // For now, return null
    return null;
  }

  public getKeys(): string[] {
    return Array.from(this.state.keys());
  }

  public hasKey(key: string): boolean {
    return this.state.has(key);
  }

  public clear(): void {
    this.state.clear();
    this.subscribers.clear();
    this.persistedKeys.clear();
  }
}