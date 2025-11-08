// ========================================
// App Root Component
// ========================================
// Industry-standard routing setup following:
// - React Router v6 with lazy loading
// - Centralized route configuration
// - Type-safe route guards
// - Performance optimized with code splitting
// - DRY principle (routes defined once in config.ts)
// ========================================

import { Routes, Route } from 'react-router-dom';
import { routes, notFoundRoute } from '../core/routing/config';
import { RouteRenderer } from '../core/routing/RouteRenderer';
import { Providers } from './providers';
import { AppErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';

// ========================================
// App Component
// ========================================

function App() {
  return (
    <AppErrorBoundary>
      <Providers>
        {/* BrowserRouter and AuthProvider are in Providers component */}
        <Routes>
          {/* Render all routes from centralized config */}
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<RouteRenderer route={route} />}
            />
          ))}
          
          {/* 404 Not Found Route (must be last) */}
          <Route
            path={notFoundRoute.path}
            element={<RouteRenderer route={notFoundRoute} />}
          />
        </Routes>
      </Providers>
    </AppErrorBoundary>
  );
}

export default App;
