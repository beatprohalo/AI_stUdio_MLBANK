// Dev Tools Manager - Prevents disconnection issues during heavy processing
// Handles browser stability during intensive MIDI generation

interface DevToolsState {
  isConnected: boolean;
  lastHeartbeat: number;
  reconnectAttempts: number;
}

class DevToolsManager {
  private static instance: DevToolsManager;
  private state: DevToolsState = {
    isConnected: true,
    lastHeartbeat: Date.now(),
    reconnectAttempts: 0
  };
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 3;

  static getInstance(): DevToolsManager {
    if (!DevToolsManager.instance) {
      DevToolsManager.instance = new DevToolsManager();
    }
    return DevToolsManager.instance;
  }

  // Start monitoring dev tools connection
  startMonitoring(): void {
    this.heartbeatInterval = setInterval(() => {
      this.checkConnection();
    }, 1000);

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.handleReconnection();
      }
    });

    // Listen for beforeunload to cleanup
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  // Check if dev tools are still connected
  private checkConnection(): void {
    const now = Date.now();
    const timeSinceLastHeartbeat = now - this.state.lastHeartbeat;

    // If no heartbeat for 5 seconds, consider disconnected
    if (timeSinceLastHeartbeat > 5000) {
      this.state.isConnected = false;
      this.handleDisconnection();
    }
  }

  // Handle dev tools disconnection
  private handleDisconnection(): void {
    console.warn('Dev tools disconnected, implementing recovery measures');
    
    // Force garbage collection
    if ('gc' in window) {
      (window as any).gc();
    }

    // Clear any pending timeouts/intervals
    this.clearPendingOperations();

    // Notify user if needed
    this.notifyDisconnection();
  }

  // Handle dev tools reconnection
  private handleReconnection(): void {
    if (!this.state.isConnected) {
      console.log('Dev tools reconnected');
      this.state.isConnected = true;
      this.state.reconnectAttempts = 0;
      this.state.lastHeartbeat = Date.now();
    }
  }

  // Clear pending operations that might cause issues
  private clearPendingOperations(): void {
    // Clear any pending audio contexts
    if (window.AudioContext) {
      const contexts = (window as any).__audioContexts || [];
      contexts.forEach((ctx: AudioContext) => {
        if (ctx.state !== 'closed') {
          ctx.close();
        }
      });
    }

    // Clear any pending workers
    if (typeof Worker !== 'undefined') {
      // This would need to be implemented with the worker manager
      console.log('Clearing pending workers...');
    }
  }

  // Notify user about disconnection
  private notifyDisconnection(): void {
    // Only notify if we haven't exceeded max attempts
    if (this.state.reconnectAttempts < this.maxReconnectAttempts) {
      this.state.reconnectAttempts++;
      
      // Show user-friendly notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-family: system-ui, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      notification.textContent = 'Dev tools disconnected. Page will reload to prevent issues.';
      
      document.body.appendChild(notification);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);

      // Reload page after a delay to prevent data loss
      setTimeout(() => {
        if (this.state.reconnectAttempts >= this.maxReconnectAttempts) {
          window.location.reload();
        }
      }, 2000);
    }
  }

  // Update heartbeat (call this during intensive operations)
  updateHeartbeat(): void {
    this.state.lastHeartbeat = Date.now();
    this.state.isConnected = true;
  }

  // Check if it's safe to perform intensive operations
  canPerformIntensiveOperation(): boolean {
    return this.state.isConnected && this.state.reconnectAttempts < this.maxReconnectAttempts;
  }

  // Get current connection status
  getConnectionStatus(): DevToolsState {
    return { ...this.state };
  }

  // Cleanup
  cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export const devToolsManager = DevToolsManager.getInstance();
export default DevToolsManager;
