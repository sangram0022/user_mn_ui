import { createElement, lazy, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import { DashboardSkeleton, PageSkeleton, TableSkeleton } from '../components/ui/Skeleton';

export type RouteGuard = 'public' | 'protected' | 'none';
export type RouteLayout = 'default' | 'auth' | 'none';

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

const LazyHomePage = lazy(() => import('../components/pages/HomePage'));
const LazyLoginPage = lazy(() => import('@pages/auth/LoginPage'));
const LazyRegisterPage = lazy(() => import('@pages/auth/RegisterPage'));
const LazyEmailConfirmationPage = lazy(() => import('@pages/auth/EmailConfirmationPage'));
const LazyEmailVerificationPage = lazy(() => import('@pages/auth/EmailVerificationPage'));
const LazyRoleBasedDashboard = lazy(() => import('../components/pages/RoleBasedDashboard'));
const LazyUserManagementEnhanced = lazy(() => import('../components/UserManagementEnhanced'));
const LazyAnalytics = lazy(() => import('@pages/analytics/AnalyticsPage'));
const LazyWorkflowManagement = lazy(() => import('../components/WorkflowManagement'));
const LazyProfilePage = lazy(() => import('../components/ProfilePage'));
const LazySettingsPage = lazy(() => import('../components/SettingsPage'));
const LazyHelpPage = lazy(() => import('../components/pages/HelpPage'));
const LazyReportsPage = lazy(() => import('../components/ReportsPage'));
const LazySecurityPage = lazy(() => import('../components/SecurityPage'));
const LazyModerationPage = lazy(() => import('../components/ModerationPage'));
const LazyApprovalsPage = lazy(() => import('../components/ApprovalsPage'));
const LazyActivityPage = lazy(() => import('../components/ActivityPage'));
const LazyAccountPage = lazy(() => import('../components/AccountPage'));
const LazySystemStatus = lazy(() => import('../components/SystemStatus'));
const LazyMyWorkflowsPage = lazy(() => import('../components/pages/MyWorkflowsPage'));
const LazyNotFoundPage = lazy(() => import('../components/pages/NotFoundPage'));

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: LazyHomePage,
    layout: 'default',
    guard: 'none',
    title: 'Home',
    description: 'Welcome to the User Management System interface.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Loading home',
      actionCount: 3,
      descriptionLines: 2
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
      descriptionLines: 1
    }),
  },
  {
    path: '/register',
    component: LazyRegisterPage,
    layout: 'auth',
    guard: 'public',
    title: 'Register',
    description: 'Create a new account for the user management platform.'
  },
  {
    path: '/email-confirmation',
    component: LazyEmailConfirmationPage,
    layout: 'auth',
    guard: 'public',
    title: 'Email Confirmation',
    description: 'Confirm your email address to activate your account.'
  },
  {
    path: '/verify-email',
    component: LazyEmailVerificationPage,
    layout: 'auth',
    guard: 'public',
    title: 'Verify Email',
    description: 'Verify your email to continue with the onboarding process.'
  },
  {
    path: '/email-verification',
    component: LazyEmailVerificationPage,
    layout: 'auth',
    guard: 'public',
    title: 'Email Verification',
    description: 'Verify your email address and unlock full access.'
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
    path: '/analytics',
    component: LazyAnalytics,
    layout: 'default',
    guard: 'protected',
    title: 'Analytics',
    description: 'Track key metrics and system analytics for informed decisions.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Loading analytics',
      actionCount: 4,
      descriptionLines: 3
    }),
  },
  {
    path: '/workflows',
    component: LazyWorkflowManagement,
    layout: 'default',
    guard: 'protected',
    title: 'Workflow Management',
    description: 'Configure and monitor approval workflows across the organization.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Loading workflows',
      actionCount: 4
    }),
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
      actionCount: 2
    }),
  },
  {
    path: '/settings',
    component: LazySettingsPage,
    layout: 'default',
    guard: 'protected',
    title: 'Settings',
    description: 'Configure application settings and preferences.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Loading settings',
      actionCount: 3
    }),
  },
  {
    path: '/help',
    component: LazyHelpPage,
    layout: 'default',
    guard: 'protected',
    title: 'Help Center',
    description: 'Find answers to common questions and contact support.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Loading help',
      actionCount: 2,
      descriptionLines: 2
    }),
  },
  {
    path: '/reports',
    component: LazyReportsPage,
    layout: 'default',
    guard: 'protected',
    title: 'Reports',
    description: 'Generate and review operational reports.',
    suspenseFallback: createElement(TableSkeleton, { rows: 5, columns: 4 }),
  },
  {
    path: '/security',
    component: LazySecurityPage,
    layout: 'default',
    guard: 'protected',
    title: 'Security Center',
    description: 'Monitor and manage security alerts, audits, and policies.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Loading security center',
      actionCount: 3
    }),
  },
  {
    path: '/moderation',
    component: LazyModerationPage,
    layout: 'default',
    guard: 'protected',
    title: 'Moderation',
    description: 'Review and act on moderation activities.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Loading moderation',
      actionCount: 4
    }),
  },
  {
    path: '/approvals',
    component: LazyApprovalsPage,
    layout: 'default',
    guard: 'protected',
    title: 'Approvals',
    description: 'Manage pending approvals across workflows.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Loading approvals',
      actionCount: 4
    }),
  },
  {
    path: '/activity',
    component: LazyActivityPage,
    layout: 'default',
    guard: 'protected',
    title: 'Activity',
    description: 'Audit and review recent activity throughout the platform.',
    suspenseFallback: createElement(TableSkeleton, { rows: 8, columns: 5 }),
  },
  {
    path: '/account',
    component: LazyAccountPage,
    layout: 'default',
    guard: 'protected',
    title: 'Account Settings',
    description: 'Control account options, billing, and subscription details.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Loading account',
      actionCount: 3
    }),
  },
  {
    path: '/status',
    component: LazySystemStatus,
    layout: 'default',
    guard: 'protected',
    title: 'System Status',
    description: 'Check current system status, health, and uptime information.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Gathering status',
      actionCount: 3,
      descriptionLines: 2
    }),
  },
  {
    path: '/my-workflows',
    component: LazyMyWorkflowsPage,
    layout: 'default',
    guard: 'protected',
    title: 'My Workflows',
    description: 'Track workflow requests and submissions assigned to you.',
    suspenseFallback: createElement(PageSkeleton, {
      heading: 'Loading workflows',
      actionCount: 1,
      descriptionLines: 2
    }),
  }
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
    descriptionLines: 1
  })
};
