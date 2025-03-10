
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { TimeTrackingProvider } from './context/TimeTrackingContext';
import './index.css';
import { toast } from 'sonner';

// Register service worker for PWA with update handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
        
        // Check for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                toast.info(
                  "Nueva versión disponible", 
                  {
                    description: "Hay una actualización lista para instalar.",
                    action: {
                      label: "Actualizar",
                      onClick: () => {
                        // Force the waiting service worker to become active
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                        window.location.reload();
                      }
                    },
                    duration: 10000
                  }
                );
              }
            });
          }
        });
      })
      .catch(error => {
        console.log('SW registration failed: ', error);
      });
      
    // Listen for the controllerchange event to reload the page after update
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('New service worker activated, reloading page for fresh content');
      window.location.reload();
    });
  });
}

// Add PWA installation event
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Optionally, send analytics event that PWA install was available
  console.log('PWA install prompt available');
});

// Handle app installed event
window.addEventListener('appinstalled', (event) => {
  console.log('PWA installed successfully');
  // You might want to log this event to analytics
});

// Handle online/offline events
window.addEventListener('online', () => {
  toast.success('Conexión restaurada', {
    description: 'Tu conexión a internet está activa nuevamente.'
  });
});

window.addEventListener('offline', () => {
  toast.warning('Sin conexión', {
    description: 'Trabajando en modo offline. Tus datos se guardarán localmente.'
  });
});

createRoot(document.getElementById("root")!).render(
  <TimeTrackingProvider>
    <App />
  </TimeTrackingProvider>
);
