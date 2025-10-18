import { DashboardSkeleton, PageSkeleton, TableSkeleton } from '@shared/components/ui/Skeleton';
import {
  createElement,
  lazy,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from 'react';

export type RouteGuard = 'public' | 'protected' | 'none';
export type RouteLayout = 'default' | 'auth' | 'admin' | 'none';

export interface RouteConfig {
  path: string;
  component: LazyExoticComponent<ComponentType>;
  layout: RouteLayout;
  guard: RouteGuard;
  title?: string;
  description?: string;
  suspenseFallback?: ReactNode;
  documentTitleFormatter?: (title: string) => string;
}

const LazyLoginPage = lazy(() => import('../domains/auth/pages/LoginPage'));
const LazyRegisterPage = lazy(() => import('../domains/auth/pages/RegisterPage'));
const LazyEmailConfirmationPage = lazy(() => import('../domains/auth/pages/EmailConfirmationPage'));
const LazyEmailVerificationPage = lazy(() => import('../domains/auth/pages/EmailVerificationPage'));
const LazyForgotPasswordPage = lazy(() => import('../domains/auth/pages/ForgotPasswordPage'));
const LazyResetPasswordPage = lazy(() => import('../domains/auth/pages/ResetPasswordPage'));
const LazyRoleBasedDashboard = lazy(
  () => import('../domains/dashboard/pages/RoleBasedDashboardPage')
);
const LazyUserManagementEnhanced = lazy(() => import('../domains/users/pages/UserManagementPage'));
const LazyProfilePage = lazy(() => import('../domains/profile/pages/ProfilePage'));
const LazyHomePage = lazy(() => import('../domains/home/pages/HomePage'));
const LazyNotFoundPage = lazy(() => import('@shared/pages/NotFoundPage'));

// Admin Pages - Lazy loaded for better performance
const LazyAdminDashboardPage = lazy(() => import('../domains/admin/pages/AdminDashboardPage'));
const LazyAdminAnalyticsDashboardPage = lazy(
  () => import('../domains/admin/pages/AdminAnalyticsDashboardPage')
);
const LazyAuditLogsPage = lazy(() => import('../domains/admin/pages/AuditLogsPage'));
const LazyBulkOperationsPage = lazy(() => import('../domains/admin/pages/BulkOperationsPage'));
const LazyRoleManagementPage = lazy(() => import('../domains/admin/pages/RoleManagementPage'));
const LazyGDPRCompliancePage = lazy(() => import('../domains/admin/pages/GDPRCompliancePage'));
const LazyHealthMonitoringPage = lazy(() => import('../domains/admin/pages/HealthMonitoringPage'));
const LazyPasswordManagementPage = lazy(
  () => import('../domains/admin/pages/PasswordManagementPage')
);

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: LazyHomePage,
    layout: 'none',
    guard: 'public',
    title: 'Home',
    description: 'Welcome to the User Management System - Secure user administration platform.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Loading home page',
      actionCount: 2,
      descriptionLines: 1,
    }),
  },
  {
    path: '/login',
    component: LazyLoginPage,
    layout: 'auth',
    guard: 'public',
    title: 'Login',
    description: 'Sign in to access your user management dashboard.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Preparing sign-in',
      actionCount: 1,
      descriptionLines: 1,
    }),
  },
  {
    path: '/register',
    component: LazyRegisterPage,
    layout: 'auth',
    guard: 'public',
    title: 'Register',
    description: 'Create a new account for the user management platform.',
  },
  {
    path: '/forgot-password',
    component: LazyForgotPasswordPage,
    layout: 'auth',
    guard: 'public',
    title: 'Forgot Password',
    description: 'Request a password reset link for your account.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Sending reset instructions',
      actionCount: 1,
      descriptionLines: 2,
    }),
  },
  {
    path: '/auth/forgot-password',
    component: LazyForgotPasswordPage,
    layout: 'auth',
    guard: 'public',
    title: 'Forgot Password',
    description: 'Request a password reset link for your account.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Sending reset instructions',
      actionCount: 1,
      descriptionLines: 2,
    }),
  },
  {
    path: '/reset-password',
    component: LazyResetPasswordPage,
    layout: 'auth',
    guard: 'public',
    title: 'Reset Password',
    description: 'Choose a new password to regain access to your account.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Preparing password reset',
      actionCount: 1,
      descriptionLines: 2,
    }),
  },
  {
    path: '/auth/reset-password',
    component: LazyResetPasswordPage,
    layout: 'auth',
    guard: 'public',
    title: 'Reset Password',
    description: 'Choose a new password to regain access to your account.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Preparing password reset',
      actionCount: 1,
      descriptionLines: 2,
    }),
  },
  {
    path: '/email-confirmation',
    component: LazyEmailConfirmationPage,
    layout: 'auth',
    guard: 'public',
    title: 'Email Confirmation',
    description: 'Confirm your email address to activate your account.',
  },
  {
    path: '/verify-email',
    component: LazyEmailVerificationPage,
    layout: 'auth',
    guard: 'public',
    title: 'Verify Email',
    description: 'Verify your email to continue with the onboarding process.',
  },
  {
    path: '/email-verification',
    component: LazyEmailVerificationPage,
    layout: 'auth',
    guard: 'public',
    title: 'Email Verification',
    description: 'Verify your email address and unlock full access.',
  },
  {
    path: '/dashboard',
    component: LazyRoleBasedDashboard,
    layout: 'default',
    guard: 'protected',
    title: 'Dashboard',
    description: 'View real-time insights and quick actions tailored to your role.',
    suspenseFallback: createElement(DashboardSkeleton),
  },
  {
    path: '/users',
    component: LazyUserManagementEnhanced,
    layout: 'default',
    guard: 'protected',
    title: 'User Management',
    description: 'Manage users, roles, and access policies across the system.',
    suspenseFallback: createElement(TableSkeleton, { rows: 6, columns: 5 }),
  },
  {
    path: '/profile',
    component: LazyProfilePage,
    layout: 'default',
    guard: 'protected',
    title: 'Profile',
    description: 'View and update your account profile information.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Loading profile',
      actionCount: 2,
    }),
  },

  // ============================================================================
  // Admin Routes - Protected and require admin permissions
  // ============================================================================
  {
    path: '/admin',
    component: LazyAdminDashboardPage,
    layout: 'admin',
    guard: 'protected',
    title: 'Admin Dashboard',
    description: 'Administrative dashboard with system overview and quick actions.',
    suspenseFallback: createElement(DashboardSkeleton),
  },
  {
    path: '/admin/analytics',
    component: LazyAdminAnalyticsDashboardPage,
    layout: 'admin',
    guard: 'protected',
    title: 'Admin Analytics',
    description:
      'Comprehensive analytics dashboard with user growth, engagement, and lifecycle metrics.',
    suspenseFallback: createElement(DashboardSkeleton),
  },
  {
    path: '/admin/dashboard',
    component: LazyAdminDashboardPage,
    layout: 'admin',
    guard: 'protected',
    title: 'Admin Dashboard',
    description: 'Administrative dashboard with system overview and quick actions.',
    suspenseFallback: createElement(DashboardSkeleton),
  },
  {
    path: '/admin/roles',
    component: LazyRoleManagementPage,
    layout: 'admin',
    guard: 'protected',
    title: 'Role Management',
    description: 'Manage user roles, permissions, and access control policies.',
    suspenseFallback: createElement(TableSkeleton, { rows: 8, columns: 4 }),
  },
  {
    path: '/admin/audit-logs',
    component: LazyAuditLogsPage,
    layout: 'admin',
    guard: 'protected',
    title: 'Audit Logs',
    description: 'View and search system audit logs and user activity trails.',
    suspenseFallback: createElement(TableSkeleton, { rows: 10, columns: 6 }),
  },
  {
    path: '/admin/bulk-operations',
    component: LazyBulkOperationsPage,
    layout: 'admin',
    guard: 'protected',
    title: 'Bulk Operations',
    description: 'Perform bulk user operations and batch processing tasks.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Loading bulk operations',
      actionCount: 3,
      descriptionLines: 2,
    }),
  },
  {
    path: '/admin/gdpr-compliance',
    component: LazyGDPRCompliancePage,
    layout: 'admin',
    guard: 'protected',
    title: 'GDPR Compliance',
    description: 'Manage data protection requests, exports, and consent tracking.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Loading GDPR compliance',
      actionCount: 2,
      descriptionLines: 3,
    }),
  },
  {
    path: '/admin/health-monitoring',
    component: LazyHealthMonitoringPage,
    layout: 'admin',
    guard: 'protected',
    title: 'Health Monitoring',
    description: 'Monitor system health, performance metrics, and service status.',
    suspenseFallback: createElement(DashboardSkeleton),
  },
  {
    path: '/admin/password-management',
    component: LazyPasswordManagementPage,
    layout: 'admin',
    guard: 'protected',
    title: 'Password Management',
    description: 'Manage password policies, security settings, and user credentials.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Loading password management',
      actionCount: 2,
      descriptionLines: 2,
    }),
  },
];

export const notFoundRoute: RouteConfig = {
  path: '*',
  component: LazyNotFoundPage,
  layout: 'default',
  guard: 'none',
  title: '404 Not Found',
  description: 'The page you are looking for could not be found.',
  suspenseFallback: createElement(PageSkeleton, {
    heading: 'Searching for page',
    actionCount: 0,
    descriptionLines: 1,
  }),
};
