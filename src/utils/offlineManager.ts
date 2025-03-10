
/**
 * Utility for managing offline capabilities and data synchronization
 */
export class OfflineManager {
  /**
   * Check if the app is currently offline
   */
  static isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Register listeners for online/offline status changes
   * @param onOffline - Callback when device goes offline
   * @param onOnline - Callback when device comes back online
   */
  static registerNetworkListeners(
    onOffline: () => void,
    onOnline: () => void
  ): void {
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
  }

  /**
   * Unregister network listeners
   * @param onOffline - Original offline callback
   * @param onOnline - Original online callback
   */
  static unregisterNetworkListeners(
    onOffline: () => void,
    onOnline: () => void
  ): void {
    window.removeEventListener('offline', onOffline);
    window.removeEventListener('online', onOnline);
  }

  /**
   * Queue an action to be performed when online
   * @param actionType Type of action (e.g., 'sync-time-entries')
   * @param data Data to be synced
   */
  static queueSyncAction(actionType: string, data: any): void {
    const queueKey = `sync_queue_${actionType}`;
    const existingQueue = localStorage.getItem(queueKey);
    const queue = existingQueue ? JSON.parse(existingQueue) : [];
    
    queue.push({
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data,
      timestamp: Date.now()
    });
    
    localStorage.setItem(queueKey, JSON.stringify(queue));
    
    // Register for background sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register(actionType).catch(err => {
          console.error('Background sync registration failed:', err);
        });
      });
    }
  }

  /**
   * Check if there are pending sync actions
   * @param actionType Type of action to check
   */
  static hasPendingSyncActions(actionType: string): boolean {
    const queueKey = `sync_queue_${actionType}`;
    const existingQueue = localStorage.getItem(queueKey);
    return existingQueue ? JSON.parse(existingQueue).length > 0 : false;
  }

  /**
   * Process pending sync actions when app comes online
   * @param actionType Type of action to process
   * @param processFn Function to process each queued item
   */
  static async processPendingSyncActions(
    actionType: string, 
    processFn: (item: any) => Promise<boolean>
  ): Promise<void> {
    if (this.isOffline()) return;
    
    const queueKey = `sync_queue_${actionType}`;
    const existingQueue = localStorage.getItem(queueKey);
    
    if (!existingQueue) return;
    
    const queue = JSON.parse(existingQueue);
    const remainingItems = [];
    
    for (const item of queue) {
      try {
        const success = await processFn(item);
        if (!success) {
          remainingItems.push(item);
        }
      } catch (error) {
        console.error('Error processing sync item:', error);
        remainingItems.push(item);
      }
    }
    
    if (remainingItems.length > 0) {
      localStorage.setItem(queueKey, JSON.stringify(remainingItems));
    } else {
      localStorage.removeItem(queueKey);
    }
  }
}

export default OfflineManager;
