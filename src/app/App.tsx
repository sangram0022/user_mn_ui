import { GlobalErrorBoundary } from '@app/GlobalErrorBoundary';
import { SkipLink } from '@components/common/SkipLink';
import { LocalizationProvider } from '@contexts/LocalizationProvider';
import { ThemeProvider } from '@contexts/ThemeContext';
import { AuthProvider } from '@domains/auth/providers/AuthProvider';
import { useKeyboardDetection } from '@hooks/useKeyboardDetection';
import { notFoundRoute, routes } from '@routing/config';
import { ProtectedRoute, PublicRoute } from '@routing/RouteGuards';
import { RoutePreloadTrigger } from '@routing/routePreloader';
import RouteRenderer from '@routing/RouteRenderer';
import { initializePreloading, preloadPredictedRoutes } from '@routing/useNavigationPreload';
import { ToastProvider } from '@shared/components/ui/Toast';
import { PageErrorBoundary as ErrorBoundary } from '@shared/errors/ErrorBoundary';
import '@styles/theme-components.css';
import type { ComponentProps, FC } from 'react';
import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { initPerformanceMonitoring } from '../monitoring/performance';
import { initSentry } from '../monitoring/sentry';
import '../shared/config/env'; // Validate environment on app startup

// Initialize Sentry error tracking
initSentry();

// Initialize performance monitoring
initPerformanceMonitoring();

type RouterWithFutureProps = ComponentProps<typeof Router> & {
  future?: {
    v7_startTransition?: boolean;
    v7_relativeSplatPath?: boolean;
  };
};

const RouterWithFuture = Router as unknown as FC<RouterWithFutureProps>;

const wrapWithGuard = (route: (typeof routes)[number], element: React.ReactNode) => {
  switch (route.guard) {
    case 'protected':
      return <ProtectedRoute>{element}</ProtectedRoute>;
    case 'public':
      return <PublicRoute>{element}</PublicRoute>;
    default:
      return element;
  }
};

function App() {
  // Initialize keyboard detection for accessibility
  useKeyboardDetection();

  // Initialize performance optimizations
  useEffect(() => {
    // ✅ React 19: Initialize navigation preloading system
    initializePreloading();

    // ✅ React 19: Preload commonly accessed routes
    preloadPredictedRoutes('/');

    // Preconnect to API
    if (typeof document !== 'undefined') {
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8001';
      document.head.appendChild(preconnect);
    }
    // Note: Web Vitals monitoring is handled by AWS CloudWatch RUM
  }, []);

  return (
    <GlobalErrorBoundary>
      <ErrorBoundary>
        <ThemeProvider>
          <LocalizationProvider defaultLocale="en">
            <ToastProvider>
              <AuthProvider>
                <RouterWithFuture future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  {/* Skip link for keyboard navigation */}
                  <SkipLink />
                  <RoutePreloadTrigger>
                    <main id="main-content">
                      <Routes>
                        {routes.map((route) => (
                          <Route
                            key={route.path}
                            path={route.path}
                            element={wrapWithGuard(route, <RouteRenderer route={route} />)}
                          />
                        ))}
                        <Route path="*" element={<RouteRenderer route={notFoundRoute} />} />
                      </Routes>
                    </main>
                  </RoutePreloadTrigger>
                </RouterWithFuture>
              </AuthProvider>
            </ToastProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </GlobalErrorBoundary>
  );
}

export default App;
