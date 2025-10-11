import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { globalErrorHandler } from './shared/utils/GlobalErrorHandler';
import './styles/index.css';

// Initialize global error handler
void globalErrorHandler;

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
