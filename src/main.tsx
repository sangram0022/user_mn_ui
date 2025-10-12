import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

// Performance monitoring - Web Vitals
if (import.meta.env.PROD) {
  import('web-vitals')
    .then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(console.log);
      onFID(console.log);
      onFCP(console.log);
      onLCP(console.log);
      onTTFB(console.log);
      onINP(console.log);
    })
    .catch(() => {
      // Silently ignore web vitals setup failures
    });
}

// Accessibility tooling (development only)
if (import.meta.env.DEV) {
  void import('@axe-core/react')
    .then(async ({ default: axe }) => {
      const ReactDOM = await import('react-dom');
      axe(React, ReactDOM, 1000);
    })
    .catch(() => {
      // Silently ignore accessibility tooling setup failures in development
    });
}

// Remove initial loading spinner
const removeInitialLoader = () => {
  const loader = document.querySelector('.initial-loader');
  if (loader) {
    loader.remove();
  }
};

// Concurrent rendering with priority
const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement, {
  // Improve hydration performance
  identifierPrefix: 'app-',
});

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Clean up loader after first paint
requestAnimationFrame(() => {
  requestAnimationFrame(removeInitialLoader);
});
