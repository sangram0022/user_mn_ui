/* eslint-disable react-refresh/only-export-components */
/**
 * Simplified Routing Configuration
 * Expert-level React routing with security and performance
 */

import type React from 'react';
import { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import { PageErrorBoundary } from '../errors/ErrorBoundary';
import { SkeletonLoader } from '../performance/lazyLoading';

// Simple placeholder component
const SimplePlaceholder = () => (
  <div className="text-center py-12">
    <h1 className="text-3xl font-bold text-[color:var(--color-text-primary)] mb-4">Welcome</h1>
    <p className="text-[color:var(--color-text-secondary)]">This is a simple routing setup.</p>
  </div>
);

// Simple layout component
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-[color:var(--color-background)]">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-[color:var(--color-text-primary)]">
                  User Management System
                </h1>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Suspense fallback={<SkeletonLoader />}>{children}</Suspense>
        </main>
      </div>
    </PageErrorBoundary>
  );
}

// Route definitions
const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <Layout>
        <SimplePlaceholder />
      </Layout>
    ),
  },
  {
    path: '/design-system',
    element: (
      <Layout>
        <SimplePlaceholder />
      </Layout>
    ),
  },
  {
    path: '*',
    element: (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-4">
            Page Not Found
          </h2>
          <p className="text-[color:var(--color-text-secondary)] mb-8">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <a
            href="/"
            className="font-medium py-2 px-4 rounded-md transition-colors inline-block"
            style={{ background: 'var(--color-primary)', color: 'var(--color-text-inverse)' }}
          >
            Go Home
          </a>
        </div>
      </Layout>
    ),
  },
];

// Create router with performance optimizations
export const appRouter = createBrowserRouter(routes);

export default appRouter;
