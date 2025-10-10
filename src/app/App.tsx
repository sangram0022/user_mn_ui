import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@features/auth/providers/AuthProvider';
import { routes, notFoundRoute } from '@routing/config';
import { ProtectedRoute, PublicRoute } from '@routing/RouteGuards';
import RouteRenderer from '@routing/RouteRenderer';
import { ErrorBoundary } from '@shared/components/ErrorBoundary';
import { SuspenseBoundary } from '@shared/components/ui';
import '@app/App.css';

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
  return (
    <ErrorBoundary enableReporting={true}>
      <AuthProvider>
        <Router>
          <SuspenseBoundary loadingText="Loading application...">
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
          </SuspenseBoundary>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
