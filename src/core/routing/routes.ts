/**
 * Route Path Constants
 * Centralized route definitions for the application
 */

export const ROUTE_PATHS = {
  // Public routes
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',

  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password/:token',
  VERIFY_EMAIL: '/auth/verify/:token',

  // Profile routes (protected)
  PROFILE: '/profile',
  CHANGE_PASSWORD: '/profile/change-password',

  // User management routes (protected - admin only)
  USERS_LIST: '/users',
  USER_DETAILS: '/users/:id',

  // Admin routes (protected - admin only)
  ADMIN_DASHBOARD: '/admin',
  ROLES_LIST: '/admin/roles',
  AUDIT_LOGS: '/admin/audit-logs',
  REPORTS: '/admin/reports',
  MONITORING_HEALTH: '/admin/monitoring',

  // Reference UI pages (development only - delete before production)
  REFERENCE_INDEX: '/reference',
  REFERENCE_HTML_SHOWCASE: '/reference/html-showcase',
  REFERENCE_MODERN_HTML: '/reference/modern-html',
  REFERENCE_PRODUCTS: '/reference/products',
  REFERENCE_SERVICES: '/reference/services',
  REFERENCE_UI_ELEMENTS: '/reference/ui-elements',
  REFERENCE_FORM_PATTERNS: '/reference/form-patterns',
  REFERENCE_COMPONENT_PATTERNS: '/reference/component-patterns',
} as const;

/**
 * Helper function to build route with parameters
 * @example buildRoute(ROUTE_PATHS.USER_DETAILS, { id: '123' }) => '/users/123'
 */
export function buildRoute(
  path: string,
  params: Record<string, string | number>
): string {
  let result = path;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
  });
  return result;
}

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  ROUTE_PATHS.HOME,
  ROUTE_PATHS.ABOUT,
  ROUTE_PATHS.CONTACT,
  ROUTE_PATHS.LOGIN,
  ROUTE_PATHS.REGISTER,
  ROUTE_PATHS.FORGOT_PASSWORD,
  ROUTE_PATHS.RESET_PASSWORD,
  ROUTE_PATHS.VERIFY_EMAIL,
] as const;

/**
 * Protected routes that require authentication
 */
export const PROTECTED_ROUTES = [
  ROUTE_PATHS.PROFILE,
  ROUTE_PATHS.CHANGE_PASSWORD,
  ROUTE_PATHS.USERS_LIST,
  ROUTE_PATHS.USER_DETAILS,
  ROUTE_PATHS.ADMIN_DASHBOARD,
] as const;

/**
 * Admin-only routes
 */
export const ADMIN_ROUTES = [
  ROUTE_PATHS.USERS_LIST,
  ROUTE_PATHS.USER_DETAILS,
  ROUTE_PATHS.ADMIN_DASHBOARD,
] as const;
