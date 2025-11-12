/**
 * AWS-Optimized Route Components
 * Pre-built lazy route components for the application
 */

import { createLazyRoute } from './routeUtils';

// ========================================
// AWS-Optimized Route Components
// ========================================

// Authentication Routes - AWS CloudFront optimizes automatically
export const LazyLoginPage = createLazyRoute(
  () => import('@/domains/auth/pages/LoginPage')
);

export const LazyRegisterPage = createLazyRoute(
  () => import('@/domains/auth/pages/RegisterPage')
);

export const LazyResetPasswordPage = createLazyRoute(
  () => import('@/domains/auth/pages/ResetPasswordPage')
);

export const LazyVerifyEmailPage = createLazyRoute(
  () => import('@/pages/VerifyEmailPage')
);

// Dashboard Routes
export const LazyDashboardPage = createLazyRoute(
  () => import('../../pages/DashboardPage')
);

export const LazyProfilePage = createLazyRoute(
  () => import('../../pages/ProfilePage')
);

// Admin Routes
export const LazyAuditLogsPage = createLazyRoute(
  () => import('@/domains/admin/pages/AuditLogsPage')
);

export const LazyUsersManagementPage = createLazyRoute(
  () => import('../../domains/admin/pages/UsersManagementPage')
);

// Content Pages
export const LazyAboutPage = createLazyRoute(
  () => import('../../pages/AboutPage')
);

export const LazyContactPage = createLazyRoute(
  () => import('@/pages/ContactPage')
);

export const LazyServicesPage = createLazyRoute(
  () => import('@/pages/ServicesPage')
);

export const LazyProductsPage = createLazyRoute(
  () => import('@/pages/ProductsPage')
);

// Error Pages - no error boundary needed
export const LazyNotFoundPage = createLazyRoute(
  () => import('@/pages/NotFoundPage'),
  { errorBoundary: false }
);