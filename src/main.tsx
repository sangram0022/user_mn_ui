// Environment validation is handled by shared/config/env.ts
import { logger } from '@shared/utils/logger';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Metric } from 'web-vitals';
import App from './app/App';

// Self-hosted fonts (no blocking network requests)
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// 🎨 MODERN CSS SYSTEM - Tailwind v4 First, Minimal Custom CSS
// Single import - Clean, fast, responsive
import './styles/app.css';

// Performance monitoring - Web Vitals
if (import.meta.env.PROD) {
  import('web-vitals')
    .then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      const reportMetric = (metric: Metric) => {
        logger.info('[Web Vitals]', {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
        });
      };

      onCLS(reportMetric);
      onFCP(reportMetric);
      onLCP(reportMetric);
      onTTFB(reportMetric);
      onINP(reportMetric);
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
