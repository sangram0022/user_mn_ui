import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@features/auth/providers/AuthProvider';
import { routes, notFoundRoute } from '@app/routes/config';
import { ProtectedRoute, PublicRoute } from '@app/routes/RouteGuards';
import RouteRenderer from '@app/routes/RouteRenderer';
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
    <AuthProvider>
      <Router>
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
      </Router>
    </AuthProvider>
  );
}

export default App;
