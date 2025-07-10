import { BaseService, ServiceConfig } from './BaseService';
import { WebSocketManager } from '../core/WebSocketManager';

export interface RealtimeServiceConfig extends ServiceConfig {
  wsManager?: WebSocketManager;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  heartbeatInterval?: number;
}

export interface Subscription {
  id: string;
  channel: string;
  handler: MessageHandler;
  options: SubscriptionOptions;
  active: boolean;
}

export interface SubscriptionOptions {
  filter?: Record<string, any>;
  priority?: number;
}

export interface QueuedMessage {
  event: string;
  data: any;
  timestamp: number;
}

export interface WebSocketMessage {
  channel: string;
  event: string;
  data: any;
}

export type MessageHandler = (event: string, data: any) => void;

export abstract class BaseRealtimeService extends BaseService {
  protected wsManager: WebSocketManager;
  protected subscriptions: Map<string, Subscription> = new Map();
  protected messageQueue: QueuedMessage[] = [];
  protected socket: WebSocketManager; // Expose socket property for child classes
  private heartbeatTimer?: NodeJS.Timeout;

  constructor(config: RealtimeServiceConfig) {
    super(config);
    
    this.wsManager = config.wsManager || new WebSocketManager({
      autoReconnect: config.autoReconnect ?? true,
      reconnectInterval: config.reconnectInterval ?? 5000,
    });
    
    this.socket = this.wsManager; // Expose as socket for backward compatibility
    this.setupEventHandlers();
    
    if (config.heartbeatInterval) {
      this.startHeartbeat(config.heartbeatInterval);
    }
  }

  private setupEventHandlers(): void {
    this.wsManager.on('connected', () => {
      this.emit('realtime:connected');
      this.resubscribeAll();
      this.flushMessageQueue();
    });

    this.wsManager.on('disconnected', () => {
      this.emit('realtime:disconnected');
    });

    this.wsManager.on('error', (error: any) => {
      this.emit('realtime:error', error);
    });

    this.wsManager.on('message', (message) => {
      this.handleMessage(message);
    });
  }

  protected subscribe(
    channel: string,
    handler: MessageHandler,
    options: SubscriptionOptions = {}
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    
    const subscription: Subscription = {
      id: subscriptionId,
      channel,
      handler,
      options,
      active: false
    };

    this.subscriptions.set(subscriptionId, subscription);

    if (this.wsManager.isConnected()) {
      this.activateSubscription(subscription);
    }

    return subscriptionId;
  }

  protected unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;

    if (subscription.active && this.wsManager.isConnected()) {
      this.wsManager.send('unsubscribe', { channel: subscription.channel });
    }

    this.subscriptions.delete(subscriptionId);
  }

  protected send(event: string, data: any): void {
    if (this.wsManager.isConnected()) {
      this.wsManager.send(event, data);
    } else {
      // Queue message for later
      this.messageQueue.push({
        event,
        data,
        timestamp: Date.now()
      });
    }
  }

  private activateSubscription(subscription: Subscription): void {
    this.wsManager.send('subscribe', {
      channel: subscription.channel,
      ...subscription.options
    });
    subscription.active = true;
  }

  private resubscribeAll(): void {
    for (const subscription of this.subscriptions.values()) {
      if (!subscription.active) {
        this.activateSubscription(subscription);
      }
    }
  }

  private flushMessageQueue(): void {
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of queue) {
      // Skip old messages
      if (Date.now() - message.timestamp > 30000) continue;
      
      this.wsManager.send(message.event, message.data);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const { channel, event, data } = message;

    // Find matching subscriptions
    for (const subscription of this.subscriptions.values()) {
      if (subscription.channel === channel || subscription.channel === '*') {
        try {
          subscription.handler(event, data);
        } catch (error) {
          console.error('Error in subscription handler:', error);
        }
      }
    }

    // Emit for general listening
    this.emit(`message:${channel}:${event}`, data);
  }

  private startHeartbeat(interval: number): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.wsManager.isConnected()) {
        this.wsManager.send('heartbeat', { timestamp: Date.now() });
      }
    }, interval);
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public destroy(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    this.subscriptions.clear();
    this.messageQueue = [];
    this.wsManager.disconnect();
    this.removeAllListeners();
  }
}