
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { TimeTrackingProvider } from './context/TimeTrackingContext';
import './index.css';

createRoot(document.getElementById("root")!).render(
  <TimeTrackingProvider>
    <App />
  </TimeTrackingProvider>
);
