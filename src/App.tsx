// ========================================
// App Root Component - FULLY MODERNIZED
// ========================================
// Ultra-Modern React 19 application with:
// - Enhanced error boundaries with recovery
// - Performance monitoring with Core Web Vitals
// - Route preloading and intelligent caching
// - Accessibility enhancements (WCAG 2.1 AA)
// - Advanced form patterns with persistence
// - Service worker integration & offline support
// - Comprehensive development tools
// ========================================

import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Modern Components
import { AppErrorBoundary } from './shared/components/error/ModernErrorBoundary';
import { AuthProvider } from './domains/auth/context/AuthContext';
import { routes, notFoundRoute } from './core/routing/config';
import { RouteRenderer } from './core/routing/RouteRenderer';

// New Advanced Features
import { SkipLinks, PageAnnouncements } from './shared/components/accessibility/AccessibilityEnhancements';

// Performance & Error Handling
// AWS CloudWatch handles global error monitoring
// AWS CloudFront handles font preloading and bundle optimization

// ========================================
// Query Client Configuration
// ========================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: unknown) => {
        // Don't retry on auth errors
        if (error && typeof error === 'object' && 'status' in error) {
          const statusCode = (error as { status: number }).status;
          if (statusCode === 401 || statusCode === 403) return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

// ========================================
// Modern App Component
// ========================================

export default function App() {

  // AWS CloudFront handles performance optimization and font preloading

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense 
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading ultra-modern application...</p>
                </div>
              </div>
            }
          >
            {/* Accessibility enhancements */}
            <SkipLinks />
            <PageAnnouncements />
            
            {/* Auth Provider wraps entire app for authentication state */}
            <AuthProvider>
              <main id="main-content" tabIndex={-1} role="main">
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
              </main>
            </AuthProvider>
          </Suspense>
        </BrowserRouter>
        
        {/* React Query Devtools (development only) */}
        {import.meta.env.MODE === 'development' && (
          <ReactQueryDevtools 
            initialIsOpen={false} 
            position="bottom"
          />
        )}




      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

