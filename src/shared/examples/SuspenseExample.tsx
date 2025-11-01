/**
 * React 19: Modern Suspense Patterns
 * 
 * Demonstrates proper use of Suspense boundaries for:
 * - Code splitting
 * - Async data loading
 * - Nested suspense boundaries
 */

import { Suspense, lazy, use } from 'react';
import { Button, LoadingSpinner, SkeletonCard } from '../../components';

// React 19: Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// React 19: use() hook works with Promises
async function fetchUser(userId: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { id: userId, name: 'John Doe', email: 'john@example.com' };
}

// Component that uses async data
function UserProfile({ userId }: { userId: string }) {
  // React 19: use() hook for async data
  const user = use(fetchUser(userId));
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">{user.name}</h3>
      <p className="text-gray-600">{user.email}</p>
    </div>
  );
}

// Loading fallback components
function UserSkeleton() {
  return <SkeletonCard />;
}

function ComponentSkeleton() {
  return (
    <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-400">Loading component...</div>
    </div>
  );
}

/**
 * React 19: Nested Suspense Boundaries
 * Each boundary can have its own loading state
 */
export function SuspenseExample() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">React 19 Suspense Patterns</h2>

      {/* Suspense Boundary 1: Async Data Loading */}
      <section className="space-y-3">
        <h3 className="text-xl font-semibold">1. Async Data with use() Hook</h3>
        <Suspense fallback={<UserSkeleton />}>
          <UserProfile userId="123" />
        </Suspense>
      </section>

      {/* Suspense Boundary 2: Code Splitting */}
      <section className="space-y-3">
        <h3 className="text-xl font-semibold">2. Lazy Loading Components</h3>
        <Suspense fallback={<ComponentSkeleton />}>
          <HeavyComponent />
        </Suspense>
      </section>

      {/* Suspense Boundary 3: Multiple Async Items */}
      <section className="space-y-3">
        <h3 className="text-xl font-semibold">3. Multiple Async Items</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Suspense fallback={<UserSkeleton />}>
            <UserProfile userId="456" />
          </Suspense>
          <Suspense fallback={<UserSkeleton />}>
            <UserProfile userId="789" />
          </Suspense>
        </div>
      </section>

      {/* Best Practices */}
      <section className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">✅ Best Practices:</h3>
        <ul className="space-y-1 text-sm">
          <li>• Use nested Suspense boundaries for granular loading states</li>
          <li>• Keep loading fallbacks visually similar to content</li>
          <li>• use() hook can unwrap Promises automatically</li>
          <li>• Suspense works with lazy(), use(), and async components</li>
          <li>• Always provide meaningful loading fallbacks</li>
        </ul>
      </section>
    </div>
  );
}

/**
 * React 19: Suspense + Error Boundary Pattern
 * Best practice for production apps
 */
export function SuspenseWithErrorBoundary() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingFallback />}>
        <AsyncComponent />
      </Suspense>
    </ErrorBoundary>
  );
}

function ErrorFallback() {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-lg font-semibold text-red-700 mb-2">Something went wrong</h3>
      <p className="text-red-600 mb-4">Failed to load this content.</p>
      <Button onClick={() => window.location.reload()}>
        Reload Page
      </Button>
    </div>
  );
}

function LoadingFallback() {
  return <LoadingSpinner text="Loading content..." />;
}

function AsyncComponent() {
  // Placeholder for async component
  return <div>Async content loaded!</div>;
}

// Simple ErrorBoundary component
function ErrorBoundary({ children }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return children; // Simplified for example - use real ErrorBoundary in production
}

/**
 * Key Concepts:
 * 
 * 1. Suspense Boundaries - Wrap async code to show loading states
 * 2. use() Hook - Unwrap Promises in render (React 19 feature)
 * 3. Nested Boundaries - Each section can load independently
 * 4. Error Boundaries - Catch errors from async operations
 * 5. Code Splitting - Lazy load heavy components
 */
