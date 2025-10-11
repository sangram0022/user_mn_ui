import '@app/App.css';
import { notFoundRoute, routes } from '@routing/config';
import { ProtectedRoute, PublicRoute } from '@routing/RouteGuards';
import RouteRenderer from '@routing/RouteRenderer';
import { SuspenseBoundary } from '@shared/components/ui';
import { PageErrorBoundary as ErrorBoundary } from '@shared/errors/ErrorBoundary';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from '../contexts';

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
    <ErrorBoundary>
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
