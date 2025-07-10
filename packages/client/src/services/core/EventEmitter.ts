export class EventEmitter {
  private events: Map<string, Set<Function>> = new Map();

  /**
   * Add an event listener
   */
  public on(event: string, listener: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(listener);
  }

  /**
   * Remove an event listener
   */
  public off(event: string, listener: Function): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Emit an event
   */
  public emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      }
    }
  }

  /**
   * Remove all listeners for an event
   */
  public removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * Get the number of listeners for an event
   */
  public listenerCount(event: string): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.size : 0;
  }

  /**
   * Get all event names
   */
  public eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}