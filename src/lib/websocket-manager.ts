import {
  WsMessage,
  WsRequestMessage,
  wsTradeMessageSchema,
  wsKlineMessageSchema
} from '@/types/websocket';

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';

type WebSocketCallback = (data: WsMessage) => void;

class WebSocketError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebSocketError';
  }
}

export class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Set<WebSocketCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageId = 1;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  private async ensureConnected(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    // If already connecting, wait for that connection
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Start new connection
    this.connectionPromise = this.connect();
    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(BINANCE_WS_URL);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.resubscribeAll();
          resolve();
        };

        this.ws.onclose = () => {
          this.handleDisconnect();
        };

        this.ws.onerror = (error: Event) => {
          reject(new WebSocketError(`WebSocket error: ${error.type}`));
        };

        this.ws.onmessage = (event: MessageEvent) => {
          this.handleMessage(event);
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        reject(new WebSocketError(`Failed to connect: ${errorMessage}`));
      }
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      // Handle subscription responses
      if ('result' in data || 'error' in data) {
        if ('error' in data) {
          console.error('WebSocket subscription error:', data.error);
        }
        return;
      }

      // Validate message type
      if (!data.e) {
        console.error('Invalid message format: missing event type');
        return;
      }

      let validatedMessage: WsMessage | null = null;

      // Try to validate as trade message
      if (data.e === 'trade') {
        const tradeResult = wsTradeMessageSchema.safeParse(data);
        if (tradeResult.success) {
          validatedMessage = tradeResult.data;
        }
      }
      // Try to validate as kline message
      else if (data.e === 'kline') {
        const klineResult = wsKlineMessageSchema.safeParse(data);
        if (klineResult.success) {
          validatedMessage = klineResult.data;
        }
      }

      if (!validatedMessage) {
        console.error('Invalid message format:', data);
        return;
      }

      const symbol = validatedMessage.s;
      const channel = `${symbol.toLowerCase()}@${validatedMessage.e}`;
      
      const callbacks = this.subscriptions.get(channel);
      callbacks?.forEach(callback => callback(validatedMessage));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error processing WebSocket message:', errorMessage);
    }
  }

  private async handleDisconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      throw new WebSocketError('Max reconnection attempts reached');
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    await new Promise(resolve => setTimeout(resolve, delay));
    await this.connect();
  }

  private resubscribeAll(): void {
    const channels = Array.from(this.subscriptions.keys());
    if (channels.length === 0) return;

    const message: WsRequestMessage = {
      method: 'SUBSCRIBE',
      params: channels,
      id: this.messageId++
    };

    this.sendMessage(message);
  }

  private async sendMessage(message: WsRequestMessage): Promise<void> {
    await this.ensureConnected();
    
    if (this.ws?.readyState !== WebSocket.OPEN) {
      throw new WebSocketError('WebSocket is not connected');
    }

    this.ws.send(JSON.stringify(message));
  }

  public async subscribe(channel: string, callback: WebSocketCallback): Promise<void> {
    await this.ensureConnected();

    let callbacks = this.subscriptions.get(channel);
    if (!callbacks) {
      callbacks = new Set();
      this.subscriptions.set(channel, callbacks);

      const message: WsRequestMessage = {
        method: 'SUBSCRIBE',
        params: [channel],
        id: this.messageId++
      };

      await this.sendMessage(message);
    }

    callbacks.add(callback);
  }

  public async unsubscribe(channel: string, callback: WebSocketCallback): Promise<void> {
    const callbacks = this.subscriptions.get(channel);
    if (!callbacks) return;

    callbacks.delete(callback);

    if (callbacks.size === 0) {
      this.subscriptions.delete(channel);

      if (this.ws?.readyState === WebSocket.OPEN) {
        const message: WsRequestMessage = {
          method: 'UNSUBSCRIBE',
          params: [channel],
          id: this.messageId++
        };

        await this.sendMessage(message);
      }
    }
  }
}

export const wsManager = WebSocketManager.getInstance();
