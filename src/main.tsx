import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import '@/lib/i18n';
import { App } from '@/app/app';

// Register PWA service worker only if supported on secure origin (HTTPS/localhost)
if (
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      try {
        registerSW({ immediate: true });
      } catch (e) {
        console.warn('PWA ServiceWorker registration error:', e);
      }
    })
    .catch((err) => {
      console.warn('PWA ServiceWorker module not loaded:', err);
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
