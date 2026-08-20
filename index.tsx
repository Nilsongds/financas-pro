
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker only outside the temporary Google AI Studio preview.
// In the preview, remove old workers so code changes appear immediately.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    if (window.location.hostname.endsWith('.run.app')) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
      return;
    }

    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Falha ao registrar ServiceWorker:', error);
    });
  });
}
