
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { TimeTrackingProvider } from './context/TimeTrackingContext';
import './index.css';

// Make sure the app loads even if offline
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

createRoot(document.getElementById("root")!).render(
  <TimeTrackingProvider>
    <App />
  </TimeTrackingProvider>
);
