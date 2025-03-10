
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { TimeTrackingProvider } from './context/TimeTrackingContext';
import './index.css';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
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
  // Optionally, send analytics event that PWA install was available
  console.log('PWA install prompt available');
  
  // Show your custom install prompt if needed
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'block';
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        // We've used the prompt, and can't use it again, discard it
        deferredPrompt = null;
        // Hide the install button
        installButton.style.display = 'none';
        // Log the outcome
        console.log(`User ${outcome} the installation`);
      }
    });
  }
});

createRoot(document.getElementById("root")!).render(
  <TimeTrackingProvider>
    <App />
  </TimeTrackingProvider>
);
