
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { TimeTrackingProvider } from './context/TimeTrackingContext';
import './index.css';

// Register service worker for PWA in offline-only mode
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered in offline-only mode: ', registration);
      })
      .catch(error => {
        console.log('SW registration failed: ', error);
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
  console.log('PWA install prompt available');
});

// Handle app installed event
window.addEventListener('appinstalled', (event) => {
  console.log('PWA installed successfully');
});

createRoot(document.getElementById("root")!).render(
  <TimeTrackingProvider>
    <App />
  </TimeTrackingProvider>
);
