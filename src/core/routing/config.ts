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
import type { UserRole } from '../../domains/rbac/types/rbac.types';

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
  requiredRoles?: UserRole[];
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
const LazyVerifyEmailPage = lazy(() => import('../../domains/auth/pages/VerifyEmailPage'));
const LazyVerifyEmailPendingPage = lazy(() => import('../../domains/auth/pages/VerifyEmailPendingPage'));

// Admin Pages
const LazyAdminDashboardPage = lazy(() => import('../../domains/admin/pages/DashboardPage'));
const LazyAdminAuditLogsPage = lazy(() => import('../../domains/admin/pages/AuditLogsPage'));
const LazyAdminUsersPage = lazy(() => import('../../domains/admin/pages/UsersPage'));
const LazyAdminUserDetailPage = lazy(() => import('../../domains/admin/pages/UserDetailPage'));
const LazyAdminUserViewPage = lazy(() => import('../../domains/admin/pages/UserViewPage'));
const LazyAdminUserEditPage = lazy(() => import('../../domains/admin/pages/UserEditPage'));
const LazyAdminUserApprovalPage = lazy(() => import('../../domains/admin/pages/UserApprovalPage'));
const LazyAdminRolesPage = lazy(() => import('../../domains/admin/pages/RolesPage'));
const LazyAdminRoleDetailPage = lazy(() => import('../../domains/admin/pages/RoleDetailPage'));
const LazyAdminReportsPage = lazy(() => import('../../domains/admin/pages/ReportsPage'));

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
    layout: 'default',
    guard: 'public',
    title: 'Login',
    description: 'Sign in to your account',
  },
  {
    path: '/auth/login',
    component: LazyLoginPage,
    layout: 'default',
    guard: 'public',
    title: 'Login',
    description: 'Sign in to your account',
  },
  {
    path: '/register',
    component: LazyRegisterPage,
    layout: 'default',
    guard: 'public',
    title: 'Register',
    description: 'Create a new account',
  },
  {
    path: '/auth/register',
    component: LazyRegisterPage,
    layout: 'default',
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
  {
    path: '/auth/verify/:token',
    component: LazyVerifyEmailPage,
    layout: 'auth',
    guard: 'public',
    title: 'Verify Email',
    description: 'Verify your email address',
  },
  {
    path: '/auth/verify-email-pending',
    component: LazyVerifyEmailPendingPage,
    layout: 'auth',
    guard: 'public',
    title: 'Verify Email - Check Your Inbox',
    description: 'Check your email to verify your account',
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
    path: '/admin/users',
    component: LazyAdminUsersPage,
    layout: 'admin',
    guard: 'admin',
    title: 'Users Management',
    description: 'Manage all users in the system',
    requiredRoles: ['admin', 'super_admin'],
  },
  {
    path: '/admin/users/approvals',
    component: LazyAdminUserApprovalPage,
    layout: 'admin',
    guard: 'admin',
    title: 'User Approvals',
    description: 'Review and approve pending user registrations',
    requiredRoles: ['admin', 'super_admin'],
  },
  {
    path: '/admin/users/:userId/edit',
    component: LazyAdminUserEditPage,
    layout: 'admin',
    guard: 'admin',
    title: 'Edit User',
    description: 'Edit user information',
    requiredRoles: ['admin', 'super_admin'],
  },
  {
    path: '/admin/users/:userId',
    component: LazyAdminUserViewPage,
    layout: 'admin',
    guard: 'admin',
    title: 'View User',
    description: 'View user profile',
    requiredRoles: ['admin', 'super_admin'],
  },
  {
    path: '/admin/users/:id',
    component: LazyAdminUserDetailPage,
    layout: 'admin',
    guard: 'admin',
    title: 'User Details',
    description: 'View and edit user details',
    requiredRoles: ['admin', 'super_admin'],
  },
  {
    path: '/admin/roles',
    component: LazyAdminRolesPage,
    layout: 'admin',
    guard: 'admin',
    title: 'Roles Management',
    description: 'Manage roles and permissions',
    requiredRoles: ['admin', 'super_admin'],
  },
  {
    path: '/admin/roles/:name',
    component: LazyAdminRoleDetailPage,
    layout: 'admin',
    guard: 'admin',
    title: 'Role Details',
    description: 'View and edit role permissions',
    requiredRoles: ['admin', 'super_admin'],
  },
  {
    path: '/admin/audit-logs',
    component: LazyAdminAuditLogsPage,
    layout: 'admin',
    guard: 'admin',
    title: 'Audit Logs',
    description: 'Monitor and review system activity',
    requiredRoles: ['admin', 'super_admin'],
  },
  {
    path: '/admin/reports',
    component: LazyAdminReportsPage,
    layout: 'admin',
    guard: 'admin',
    title: 'Reports',
    description: 'Generate and manage system reports',
    requiredRoles: ['admin', 'super_admin'],
  },
  {
    path: '/users',
    component: LazyAdminUsersPage,
    layout: 'admin',
    guard: 'admin',
    title: 'Users Management',
    description: 'Manage all users in the system',
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
  AUDITOR_DASHBOARD: '/auditor/dashboard',
  AUDITOR: '/auditor',
  
  // Admin routes
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_VIEW: '/admin/users/:userId',
  ADMIN_USER_EDIT: '/admin/users/:userId/edit',
  ADMIN_USER_DETAIL: '/admin/users/:id',
  ADMIN_USER_APPROVALS: '/admin/users/approvals',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_ROLE_DETAIL: '/admin/roles/:name',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_REPORTS: '/admin/reports',
  
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
  
  // Admin navigation helpers
  adminDashboard: () => '/admin',
  adminUsers: () => '/admin/users',
  adminUserView: (userId: string) => `/admin/users/${userId}`,
  adminUserEdit: (userId: string) => `/admin/users/${userId}/edit`,
  adminUserDetail: (userId: string) => `/admin/users/${userId}`,
  adminUserApprovals: () => '/admin/users/approvals',
  adminRoles: () => '/admin/roles',
  adminRoleDetail: (roleName: string) => `/admin/roles/${roleName}`,
  adminAuditLogs: () => '/admin/audit-logs',
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
