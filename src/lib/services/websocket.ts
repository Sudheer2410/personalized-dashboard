import { io, Socket } from 'socket.io-client';

export interface RealTimeMessage {
  type: 'new_content' | 'content_update' | 'system_message';
  data: any;
  timestamp: number;
}

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  error?: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private connectionStatus: ConnectionStatus = {
    connected: false,
    reconnecting: false,
  };

  // Mock WebSocket server URL - in production, this would be your actual WebSocket server
  private readonly wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://echo.websocket.org';

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // For demo purposes, we'll simulate WebSocket connection
        // In a real app, you'd connect to an actual WebSocket server
        this.simulateConnection();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private simulateConnection() {
    // Simulate WebSocket connection for demo
    this.connectionStatus.connected = true;
    this.connectionStatus.reconnecting = false;
    
    // Simulate periodic content updates
    this.startContentSimulation();
    
    // Emit connection event
    this.emit('connection_status', this.connectionStatus);
  }

  private startContentSimulation() {
    // Simulate new content every 30 seconds
    setInterval(() => {
      if (this.connectionStatus.connected) {
        const mockContent = this.generateMockContent();
        this.emit('new_content', mockContent);
      }
    }, 30000);

    // Simulate content updates every 60 seconds
    setInterval(() => {
      if (this.connectionStatus.connected) {
        const mockUpdate = this.generateMockUpdate();
        this.emit('content_update', mockUpdate);
      }
    }, 60000);
  }

  private generateMockContent() {
    const categories = ['technology', 'science', 'business', 'entertainment', 'sports', 'health', 'politics'];
    const titles = [
      'Breaking: New AI Breakthrough in Machine Learning',
      'Latest Developments in Renewable Energy',
      'Global Market Trends: What to Watch',
      'Entertainment Industry Updates',
      'Sports Highlights and Analysis',
      'Health and Wellness Tips',
      'Political Developments Around the World'
    ];

    return {
      id: `content_${Date.now()}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      summary: 'This is a simulated real-time content update for demonstration purposes.',
      publishedAt: new Date().toISOString(),
      source: 'Real-time Feed',
      url: '#',
      imageUrl: `https://picsum.photos/400/200?random=${Math.floor(Math.random() * 1000)}`
    };
  }

  private generateMockUpdate() {
    return {
      type: 'content_update',
      message: 'Content has been updated with new information',
      timestamp: Date.now()
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionStatus.connected = false;
    this.connectionStatus.reconnecting = false;
    this.emit('connection_status', this.connectionStatus);
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event listener:', error);
        }
      });
    }
  }

  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  // Method to manually trigger content refresh (for demo purposes)
  triggerContentRefresh() {
    if (this.connectionStatus.connected) {
      const mockContent = this.generateMockContent();
      this.emit('new_content', mockContent);
    }
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();
export default webSocketService; 