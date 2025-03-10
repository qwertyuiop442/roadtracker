
/**
 * Utility class to manage offline functionality
 * Modified for offline-only operation
 */
export class OfflineManager {
  /**
   * Always returns true since we're in offline-only mode
   */
  public static isOffline(): boolean {
    return true;
  }

  /**
   * Register service worker for offline-first operation
   */
  public static async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service worker registered for offline mode:', registration);
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  }

  /**
   * Force update service worker (not used in offline-only mode)
   */
  public static async updateServiceWorker(): Promise<void> {
    // No-op in offline-only mode
    console.log('Service worker updates disabled in offline-only mode');
  }

  /**
   * Register network listeners - not needed since we're always offline
   * Kept for API compatibility
   */
  public static registerNetworkListeners(
    offlineCallback: () => void,
    onlineCallback: () => void
  ): void {
    // Call offline callback immediately since we're always offline
    offlineCallback();
  }

  /**
   * Unregister network listeners - not needed since we're always offline
   * Kept for API compatibility
   */
  public static unregisterNetworkListeners(
    offlineCallback: () => void,
    onlineCallback: () => void
  ): void {
    // No-op in offline-only mode
  }
}
