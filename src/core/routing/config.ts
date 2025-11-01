// ========================================
// Routing Configuration - SINGLE SOURCE OF TRUTH
// ========================================
// Industry-standard routing setup following:
// - React Router v6 best practices
// - Code splitting with lazy loading
// - Type-safe route definitions
// - Role-based access control
// ========================================

import type { ComponentType, LazyExoticComponent } from 'react';
import { lazy } from 'react';

// ========================================
// Types
// ========================================

export type RouteGuard = 'public' | 'protected' | 'admin' | 'none';
export type RouteLayout = 'default' | 'auth' | 'admin' | 'none';

export interface RouteConfig {
  path: string;
  component: LazyExoticComponent<ComponentType>;
  layout: RouteLayout;
  guard: RouteGuard;
  title: string;
  description?: string;
  /**
   * Roles required to access this route
   * Empty array = any authenticated user
   * ['admin'] = only admin users
   */
  requiredRoles?: string[];
}

// ========================================
// Lazy-loaded Components (Code Splitting)
// ========================================

// Auth Pages
const LazyLoginPage = lazy(() => import('../../domains/auth/pages/LoginPage'));
const LazyRegisterPage = lazy(() => import('../../domains/auth/pages/RegisterPage'));
const LazyForgotPasswordPage = lazy(() => import('../../domains/auth/pages/ForgotPasswordPage'));
const LazyResetPasswordPage = lazy(() => import('../../domains/auth/pages/ResetPasswordPage'));
const LazyChangePasswordPage = lazy(() => import('../../domains/auth/pages/ChangePasswordPage'));

// Admin Pages
const LazyAdminDashboardPage = lazy(() => import('../../domains/admin/pages/DashboardPage'));
const LazyAdminAuditLogsPage = lazy(() => import('../../domains/admin/pages/AuditLogsPage'));

// Auditor Pages
const LazyAuditorDashboardPage = lazy(() => import('../../domains/auditor/pages/DashboardPage'));

// User Pages
const LazyUserDashboardPage = lazy(() => import('../../domains/user/pages/DashboardPage'));

// Public Pages
const LazyHomePage = lazy(() => import('../../pages/HomePage'));
const LazyContactPage = lazy(() => import('../../pages/ContactPage'));

// Reference Pages (Development only)
const LazyHtmlShowcase = lazy(() => import('../../pages/HtmlShowcase'));
const LazyProductsPage = lazy(() => import('../../pages/ProductsPage'));
const LazyServicesPage = lazy(() => import('../../pages/ServicesPage'));

// 404 Page
const LazyNotFoundPage = lazy(() => import('../../pages/NotFoundPage'));

// ========================================
// Route Definitions - SINGLE SOURCE OF TRUTH
// ========================================

export const routes: RouteConfig[] = [
  // ============================================================================
  // Public Routes - Accessible without authentication
  // ============================================================================
  {
    path: '/',
    component: LazyHomePage,
    layout: 'default',
    guard: 'none',
    title: 'Home',
    description: 'User Management System - Home',
  },
  {
    path: '/contact',
    component: LazyContactPage,
    layout: 'default',
    guard: 'none',
    title: 'Contact',
    description: 'Get in touch with us',
  },

  // ============================================================================
  // Auth Routes - Public (redirect to dashboard if already authenticated)
  // ============================================================================
  {
    path: '/login',
    component: LazyLoginPage,
    layout: 'auth',
    guard: 'public',
    title: 'Login',
    description: 'Sign in to your account',
  },
  {
    path: '/auth/login',
    component: LazyLoginPage,
    layout: 'auth',
    guard: 'public',
    title: 'Login',
    description: 'Sign in to your account',
  },
  {
    path: '/register',
    component: LazyRegisterPage,
    layout: 'auth',
    guard: 'public',
    title: 'Register',
    description: 'Create a new account',
  },
  {
    path: '/auth/register',
    component: LazyRegisterPage,
    layout: 'auth',
    guard: 'public',
    title: 'Register',
    description: 'Create a new account',
  },
  {
    path: '/forgot-password',
    component: LazyForgotPasswordPage,
    layout: 'auth',
    guard: 'public',
    title: 'Forgot Password',
    description: 'Reset your password',
  },
  {
    path: '/auth/forgot-password',
    component: LazyForgotPasswordPage,
    layout: 'auth',
    guard: 'public',
    title: 'Forgot Password',
    description: 'Reset your password',
  },
  {
    path: '/reset-password/:token',
    component: LazyResetPasswordPage,
    layout: 'auth',
    guard: 'public',
    title: 'Reset Password',
    description: 'Set a new password',
  },
  {
    path: '/auth/reset-password/:token',
    component: LazyResetPasswordPage,
    layout: 'auth',
    guard: 'public',
    title: 'Reset Password',
    description: 'Set a new password',
  },

  // ============================================================================
  // Protected Routes - Require authentication
  // ============================================================================
  {
    path: '/change-password',
    component: LazyChangePasswordPage,
    layout: 'default',
    guard: 'protected',
    title: 'Change Password',
    description: 'Update your password',
  },
  {
    path: '/auth/change-password',
    component: LazyChangePasswordPage,
    layout: 'default',
    guard: 'protected',
    title: 'Change Password',
    description: 'Update your password',
  },

  // ============================================================================
  // Admin Routes - Require authentication + admin role
  // ============================================================================
  {
    path: '/admin/dashboard',
    component: LazyAdminDashboardPage,
    layout: 'admin',
    guard: 'admin',
    title: 'Admin Dashboard',
    description: 'Administrative dashboard for admins',
    requiredRoles: ['admin', 'super_admin'],
  },
  {
    path: '/admin',
    component: LazyAdminDashboardPage,
    layout: 'admin',
    guard: 'admin',
    title: 'Admin Dashboard',
    description: 'Administrative dashboard for admins',
    requiredRoles: ['admin', 'super_admin'],
  },
  {
    path: '/admin/audit-logs',
    component: LazyAdminAuditLogsPage,
    layout: 'admin',
    guard: 'admin',
    title: 'Audit Logs',
    description: 'Manage and review audit logs',
    requiredRoles: ['admin', 'super_admin'],
  },

  // ============================================================================
  // Auditor Routes - Require authentication + auditor role
  // ============================================================================
  {
    path: '/auditor/dashboard',
    component: LazyAuditorDashboardPage,
    layout: 'default',
    guard: 'admin',
    title: 'Auditor Dashboard',
    description: 'Auditor dashboard for auditors',
    requiredRoles: ['auditor'],
  },
  {
    path: '/auditor',
    component: LazyAuditorDashboardPage,
    layout: 'default',
    guard: 'admin',
    title: 'Auditor Dashboard',
    description: 'Auditor dashboard for auditors',
    requiredRoles: ['auditor'],
  },

  // ============================================================================
  // User Routes - Require authentication (regular users)
  // ============================================================================
  {
    path: '/dashboard',
    component: LazyUserDashboardPage,
    layout: 'default',
    guard: 'protected',
    title: 'My Dashboard',
    description: 'User dashboard',
  },
  {
    path: '/user/dashboard',
    component: LazyUserDashboardPage,
    layout: 'default',
    guard: 'protected',
    title: 'My Dashboard',
    description: 'User dashboard',
  },

  // ============================================================================
  // Reference/Development Pages (Remove before production)
  // ============================================================================
  {
    path: '/showcase',
    component: LazyHtmlShowcase,
    layout: 'default',
    guard: 'none',
    title: 'HTML Showcase',
    description: 'Component showcase',
  },
  {
    path: '/products',
    component: LazyProductsPage,
    layout: 'default',
    guard: 'none',
    title: 'Products',
    description: 'Our products',
  },
  {
    path: '/services',
    component: LazyServicesPage,
    layout: 'default',
    guard: 'none',
    title: 'Services',
    description: 'Our services',
  },
];

// ============================================================================
// 404 Not Found Route
// ============================================================================

export const notFoundRoute: RouteConfig = {
  path: '*',
  component: LazyNotFoundPage,
  layout: 'default',
  guard: 'none',
  title: '404 Not Found',
  description: 'Page not found',
};

// ============================================================================
// Route Path Constants - Type-safe navigation
// ============================================================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  CHANGE_PASSWORD: '/change-password',
  
  // Role-specific dashboards
  USER_DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN: '/admin',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  AUDITOR_DASHBOARD: '/auditor/dashboard',
  AUDITOR: '/auditor',
  
  // Public pages
  CONTACT: '/contact',
  SHOWCASE: '/showcase',
  PRODUCTS: '/products',
  SERVICES: '/services',
} as const;

// ============================================================================
// Navigation Helpers - Type-safe route building
// ============================================================================

export const buildRoute = {
  resetPassword: (token: string) => `/reset-password/${token}`,
  dashboard: () => '/dashboard',
  login: () => '/login',
  register: () => '/register',
} as const;

// ============================================================================
// Post-login Redirect Logic
// ============================================================================

/**
 * Determines where to redirect user after successful login
 * Based on user role and permissions
 * 
 * Performance: Each role gets their own optimized dashboard
 * - Admin/Super Admin → /admin/dashboard (admin-specific features)
 * - Auditor → /auditor/dashboard (auditor-specific features)
 * - User → /dashboard (user-specific features)
 */
export function getPostLoginRedirect(userRole?: string): string {
  // Admin or Super Admin → Admin Dashboard
  if (userRole === 'super_admin' || userRole === 'admin') {
    return ROUTES.ADMIN_DASHBOARD;
  }
  
  // Auditor → Auditor Dashboard
  if (userRole === 'auditor') {
    return ROUTES.AUDITOR_DASHBOARD;
  }
  
  // Regular users → User Dashboard
  return ROUTES.USER_DASHBOARD;
}

/**
 * Default redirect for unauthenticated users trying to access protected routes
 */
export const UNAUTHENTICATED_REDIRECT = ROUTES.LOGIN;

/**
 * Default redirect for unauthorized users (authenticated but insufficient permissions)
 */
export const UNAUTHORIZED_REDIRECT = ROUTES.HOME;
