/**
 * Authentication Domain Module Configuration
 *
 * Micro-Frontend pattern implementation
 * Enables independent deployment and lazy loading
 *
 * @module domains/authentication/domain-module
 */

import { lazy } from 'react';
import type { DomainModule } from '@shared/types/micro-frontend.types';

/**
 * Authentication Domain Module
 *
 * Complete module definition for micro-frontend architecture
 *
 * Usage:
 * ```tsx
 * import { AuthenticationDomain } from '@domains/authentication/domain-module';
 *
 * // Register domain
 * domainRegistry.register('authentication', AuthenticationDomain);
 *
 * // Load domain
 * const module = await domainRegistry.load('authentication');
 * ```
 */
export const AuthenticationDomain: DomainModule = {
  name: 'authentication',
  version: '1.0.0',

  // Routes configuration
  routes: [
    {
      path: '/login',
      Component: lazy(() =>
        import('./pages/LoginPage').catch(() => import('../../shared/pages/FallbackPage'))
      ),
      meta: {
        title: 'Login',
        description: 'User login page',
        requiresAuth: false,
        icon: 'login',
      },
    },
    {
      path: '/register',
      Component: lazy(() =>
        import('./pages/RegisterPage').catch(() => import('../../shared/pages/FallbackPage'))
      ),
      meta: {
        title: 'Register',
        description: 'User registration page',
        requiresAuth: false,
        icon: 'user-plus',
      },
    },
    {
      path: '/forgot-password',
      Component: lazy(() =>
        import('./pages/ForgotPasswordPage').catch(() => import('../../shared/pages/FallbackPage'))
      ),
      meta: {
        title: 'Forgot Password',
        description: 'Password reset page',
        requiresAuth: false,
        icon: 'key',
      },
    },
    {
      path: '/reset-password/:token',
      Component: lazy(() =>
        import('./pages/ResetPasswordPage').catch(() => import('../../shared/pages/FallbackPage'))
      ),
      meta: {
        title: 'Reset Password',
        description: 'Set new password',
        requiresAuth: false,
      },
    },
  ],

  // Component registry
  components: {
    // Main components (to be imported when created)
    // LoginForm: lazy(() => import('./components/LoginForm')),
    // RegisterForm: lazy(() => import('./components/RegisterForm')),
    // AuthGuard: lazy(() => import('./components/AuthGuard')),
    // PasswordResetForm: lazy(() => import('./components/PasswordResetForm')),
  },

  // Service registry
  services: {
    // Services will be instantiated when created
    // authService: new AuthService(),
    // tokenService: new TokenService(),
    // sessionService: new SessionService(),
  },

  // State management slice
  store: {
    name: 'auth',
    initialState: {
      user: null,
      token: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    },
    actions: {
      // Zustand store actions from authStore.ts
      login: () => {},
      logout: () => {},
      register: () => {},
      refreshToken: () => {},
    },
    selectors: {
      user: (state: any) => state.user,
      isAuthenticated: (state: any) => state.isAuthenticated,
    },
  },

  // Initialization hook
  initialize: async () => {
    console.log('[Authentication] Domain initializing...');

    // Check for existing session
    // TODO: Implement session check

    // Set up API interceptors
    // TODO: Set up auth interceptors

    // Initialize monitoring
    // TODO: Set up error tracking

    console.log('[Authentication] Domain initialized ✓');
  },

  // Cleanup hook
  dispose: async () => {
    console.log('[Authentication] Domain disposing...');

    // Clear session
    // TODO: Clear auth state

    // Remove interceptors
    // TODO: Remove auth interceptors

    // Clear monitoring
    // TODO: Clear error tracking

    console.log('[Authentication] Domain disposed ✓');
  },

  // Dependencies on other domains/infrastructure
  dependencies: [
    'infrastructure/api',
    'infrastructure/storage',
    'infrastructure/monitoring',
    'infrastructure/security',
  ],

  // Metadata
  meta: {
    displayName: 'Authentication',
    description: 'User authentication and session management domain',
    author: '25-year React Expert',
    tags: ['auth', 'security', 'session', 'login', 'register'],
  },
};

/**
 * Default export
 */
export default AuthenticationDomain;
