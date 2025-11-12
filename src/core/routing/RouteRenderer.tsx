// ========================================
// Route Renderer - Handles route rendering with layouts and guards
// ========================================
// Following React 19 and Router v6 best practices:
// - Suspense for lazy loading
// - Error boundaries
// - Layout composition
// - Type-safe route guards
// ========================================

import type { FC } from 'react';
import { Suspense } from 'react';
import type { RouteConfig } from './config';
import { ProtectedRoute, PublicRoute, AdminRoute, NoGuard } from './RouteGuards';
import Layout from '../layout/Layout'; // Import the actual Layout component

// Auth Layout - Special layout for login/register pages (no header/footer)
const AuthLayout: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-linear-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center p-4">
    <main id="main-content" tabIndex={-1}>
      {children}
    </main>
  </div>
);

// Admin Layout - Uses full Layout with Header/Footer
const AdminLayout: FC<{ children: React.ReactNode }> = ({ children }) => (
  <Layout>
    {children}
  </Layout>
);

// Default Layout - Uses full Layout with Header/Footer
const DefaultLayout: FC<{ children: React.ReactNode }> = ({ children }) => (
  <Layout>
    {children}
  </Layout>
);

const NoLayout: FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

// ========================================
// Layout Map
// ========================================

const layouts = {
  default: DefaultLayout,
  auth: AuthLayout,
  admin: AdminLayout,
  none: NoLayout,
};

// ========================================
// Guard Map
// ========================================

const guards = {
  public: PublicRoute,
  protected: ProtectedRoute,
  admin: AdminRoute,
  none: NoGuard,
};

// ========================================
// Loading Fallback
// ========================================
// Updated to use PageSkeleton for better UX
import { PageSkeleton } from '@/shared/components/skeletons';

const RouteLoadingFallback: FC = () => <PageSkeleton />;

// ========================================
// Route Renderer Component
// ========================================

interface RouteRendererProps {
  route: RouteConfig;
}

export const RouteRenderer: FC<RouteRendererProps> = ({ route }) => {
  const { component: Component, layout, guard, requiredRoles } = route;

  const LayoutComponent = layouts[layout];
  const GuardComponent = guards[guard];

  return (
    <GuardComponent requiredRoles={requiredRoles}>
      <LayoutComponent>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Component />
        </Suspense>
      </LayoutComponent>
    </GuardComponent>
  );
};
