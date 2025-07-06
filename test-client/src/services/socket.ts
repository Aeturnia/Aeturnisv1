import { io, Socket } from 'socket.io-client';

export class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private token: string | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    // Initialize Socket.IO client connection to port 3001
    this.socket = io('ws://localhost:3001', {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket.IO connected');
      this.isConnected = true;
      this.emit('socket:connected', { timestamp: new Date() });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      this.isConnected = false;
      this.emit('socket:disconnected', { reason, timestamp: new Date() });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.emit('socket:error', { error: error.message, timestamp: new Date() });
    });

    // Monster events
    this.socket.on('monster:spawned', (data) => {
      this.emit('monster:spawned', { ...data, timestamp: new Date() });
    });

    this.socket.on('monster:killed', (data) => {
      this.emit('monster:killed', { ...data, timestamp: new Date() });
    });

    this.socket.on('monster:state-changed', (data) => {
      this.emit('monster:state-changed', { ...data, timestamp: new Date() });
    });

    // NPC events
    this.socket.on('npc:dialogue-started', (data) => {
      this.emit('npc:dialogue-started', { ...data, timestamp: new Date() });
    });

    this.socket.on('npc:dialogue-updated', (data) => {
      this.emit('npc:dialogue-updated', { ...data, timestamp: new Date() });
    });

    this.socket.on('npc:trade-started', (data) => {
      this.emit('npc:trade-started', { ...data, timestamp: new Date() });
    });

    // Combat events
    this.socket.on('combat:started', (data) => {
      this.emit('combat:started', { ...data, timestamp: new Date() });
    });

    this.socket.on('combat:action', (data) => {
      this.emit('combat:action', { ...data, timestamp: new Date() });
    });

    this.socket.on('combat:ended', (data) => {
      this.emit('combat:ended', { ...data, timestamp: new Date() });
    });

    // Death events
    this.socket.on('death:occurred', (data) => {
      this.emit('death:occurred', { ...data, timestamp: new Date() });
    });

    this.socket.on('death:respawned', (data) => {
      this.emit('death:respawned', { ...data, timestamp: new Date() });
    });

    // Loot events
    this.socket.on('loot:dropped', (data) => {
      this.emit('loot:dropped', { ...data, timestamp: new Date() });
    });

    this.socket.on('loot:picked-up', (data) => {
      this.emit('loot:picked-up', { ...data, timestamp: new Date() });
    });

    // Error handling
    this.socket.on('error', (data) => {
      this.emit('socket:server-error', { ...data, timestamp: new Date() });
    });
  }

  public connect(authToken?: string) {
    if (authToken) {
      this.token = authToken;
    }

    if (this.socket && !this.isConnected) {
      // Attach authentication if token is available
      if (this.token) {
        this.socket.auth = { token: this.token };
      }
      
      this.socket.connect();
    }
  }

  public disconnect() {
    if (this.socket && this.isConnected) {
      this.socket.disconnect();
    }
  }

  public subscribeToZone(zoneId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('zone:subscribe', { zoneId });
      this.emit('zone:subscribed', { zoneId, timestamp: new Date() });
    }
  }

  public unsubscribeFromZone(zoneId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('zone:unsubscribe', { zoneId });
      this.emit('zone:unsubscribed', { zoneId, timestamp: new Date() });
    }
  }

  public on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  public off(event: string, handler?: Function) {
    if (!this.eventHandlers.has(event)) return;

    if (handler) {
      const handlers = this.eventHandlers.get(event)!;
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(event);
    }
  }

  private emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  public getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      hasAuth: !!this.token,
    };
  }

  // Test methods
  public sendTestPing() {
    if (this.socket && this.isConnected) {
      this.socket.emit('test-ping', { message: 'Hello from client', timestamp: new Date() });
    }
  }
}

// Singleton instance
export const socketService = new SocketService();