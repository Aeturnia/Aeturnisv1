import { EventEmitter } from 'events';
import { io, Socket } from 'socket.io-client';

export interface WebSocketConfig {
  url?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  auth?: Record<string, any>;
}

export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: Error | null;
  lastConnectedAt: number | null;
  reconnectAttempts: number;
}

export class WebSocketManager extends EventEmitter {
  private socket: Socket | null = null;
  private config: Required<WebSocketConfig>;
  private state: WebSocketState = {
    connected: false,
    connecting: false,
    error: null,
    lastConnectedAt: null,
    reconnectAttempts: 0
  };
  private reconnectTimer: NodeJS.Timer | null = null;
  private messageHandlers: Map<string, Set<Function>> = new Map();

  constructor(config: WebSocketConfig = {}) {
    super();
    this.config = {
      url: config.url || window.location.origin,
      autoReconnect: config.autoReconnect ?? true,
      reconnectInterval: config.reconnectInterval ?? 5000,
      reconnectAttempts: config.reconnectAttempts ?? Infinity,
      auth: config.auth || {}
    };
  }

  public connect(auth?: Record<string, any>): void {
    if (this.state.connected || this.state.connecting) {
      return;
    }

    this.state.connecting = true;
    this.emit('connecting');

    const authData = auth || this.config.auth;

    this.socket = io(this.config.url, {
      auth: authData,
      transports: ['websocket'],
      reconnection: false // We handle reconnection manually
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.state.connected = true;
      this.state.connecting = false;
      this.state.lastConnectedAt = Date.now();
      this.state.reconnectAttempts = 0;
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      const wasConnected = this.state.connected;
      this.state.connected = false;
      this.state.connecting = false;
      this.emit('disconnected', reason);

      if (wasConnected && this.config.autoReconnect) {
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      this.state.error = error;
      this.state.connecting = false;
      this.emit('error', error);

      if (this.config.autoReconnect && 
          this.state.reconnectAttempts < this.config.reconnectAttempts) {
        this.scheduleReconnect();
      }
    });

    // Handle all incoming messages
    this.socket.onAny((event, ...args) => {
      const data = args[0];
      this.emit('message', { event, data });

      // Trigger specific handlers
      const handlers = this.messageHandlers.get(event);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(data);
          } catch (error) {
            console.error(`Error in handler for event ${event}:`, error);
          }
        });
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.state.reconnectAttempts++;
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(1.5, this.state.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    this.emit('reconnecting', {
      attempt: this.state.reconnectAttempts,
      delay
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.state.connected = false;
    this.state.connecting = false;
  }

  public send(event: string, data?: any): void {
    if (!this.isConnected()) {
      throw new Error('WebSocket is not connected');
    }

    this.socket!.emit(event, data);
  }

  public on(event: string, handler: Function): void {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, new Set());
    }
    this.messageHandlers.get(event)!.add(handler);
  }

  public off(event: string, handler: Function): void {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(event);
      }
    }
  }

  public isConnected(): boolean {
    return this.state.connected && this.socket?.connected === true;
  }

  public getState(): Readonly<WebSocketState> {
    return { ...this.state };
  }

  public updateAuth(auth: Record<string, any>): void {
    this.config.auth = auth;
    if (this.socket) {
      this.socket.auth = auth;
    }
  }
}