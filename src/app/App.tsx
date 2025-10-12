import '@app/App.css';
import { GlobalErrorBoundary } from '@app/GlobalErrorBoundary';
import { AuthProvider } from '@domains/auth/providers/AuthProvider';
import { notFoundRoute, routes } from '@routing/config';
import { ProtectedRoute, PublicRoute } from '@routing/RouteGuards';
import RouteRenderer from '@routing/RouteRenderer';
import { PageErrorBoundary as ErrorBoundary } from '@shared/errors/ErrorBoundary';
import SuspenseBoundary from '@shared/ui/SuspenseBoundary';
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
  return (
    <GlobalErrorBoundary>
      <ErrorBoundary>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
    </GlobalErrorBoundary>
  );
}

export default App;
