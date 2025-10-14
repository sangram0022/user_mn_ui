import '@app/App.css';
import { GlobalErrorBoundary } from '@app/GlobalErrorBoundary';
import { LocalizationProvider } from '@contexts/LocalizationProvider';
import { AuthProvider } from '@domains/auth/providers/AuthProvider';
import { notFoundRoute, routes } from '@routing/config';
import { ProtectedRoute, PublicRoute } from '@routing/RouteGuards';
import { RoutePreloadTrigger } from '@routing/routePreloader';
import RouteRenderer from '@routing/RouteRenderer';
import { initializePreloading, preloadPredictedRoutes } from '@routing/useNavigationPreload';
import PerformanceMonitor from '@shared/components/PerformanceMonitor';
import { PageErrorBoundary as ErrorBoundary } from '@shared/errors/ErrorBoundary';
import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

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

    // Report Web Vitals in production
    if (import.meta.env.PROD) {
      import('web-vitals')
        .then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
          const reportMetric = (metric: { name: string; value: number }) => {
            console.log(`[Web Vitals] ${metric.name}:`, metric.value);
          };
          onCLS(reportMetric);
          onFID(reportMetric);
          onFCP(reportMetric);
          onLCP(reportMetric);
          onTTFB(reportMetric);
          onINP(reportMetric);
        })
        .catch(() => {
          // Silently ignore
        });
    }
  }, []);

  return (
    <GlobalErrorBoundary>
      <ErrorBoundary>
        <LocalizationProvider defaultLocale="en">
          <AuthProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <RoutePreloadTrigger>
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
              </RoutePreloadTrigger>
            </Router>
          </AuthProvider>
        </LocalizationProvider>
      </ErrorBoundary>
      <PerformanceMonitor />
    </GlobalErrorBoundary>
  );
}

export default App;
