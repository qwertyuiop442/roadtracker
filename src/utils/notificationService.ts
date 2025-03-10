
// Helper functions for handling push notifications

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('Este navegador no soporta notificaciones');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Send a notification
export const sendNotification = (title: string, options: NotificationOptions = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.warn('No hay permiso para enviar notificaciones');
    return;
  }

  // Set default icon if not provided
  const notificationOptions: NotificationOptions = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    ...options,
  };

  return new Notification(title, notificationOptions);
};

// Register for push notifications (this would connect to your push server)
export const registerForPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications no soportadas');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // This would be where you'd subscribe to push notifications
    // For a complete implementation, you would need a push server
    console.log('Service Worker listo para push notifications');
    
    return true;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return false;
  }
};

// Schedule a local notification
export const scheduleLocalNotification = (title: string, options: NotificationOptions = {}, delayInSeconds = 0) => {
  if (delayInSeconds > 0) {
    setTimeout(() => {
      sendNotification(title, options);
    }, delayInSeconds * 1000);
  } else {
    sendNotification(title, options);
  }
};
