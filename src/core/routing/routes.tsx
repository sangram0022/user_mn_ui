// ⭐ SINGLE SOURCE OF TRUTH for all routes
// Centralized route configuration with type-safe paths

export const ROUTE_PATHS = {
  // Public routes
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  
  // Auth routes
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password/:token',
  VERIFY_EMAIL: '/auth/verify-email/:token',
  CHANGE_PASSWORD: '/auth/change-password',
  
  // Profile routes
  PROFILE: '/profile',
  PROFILE_SETTINGS: '/profile/settings',
  
  // User management routes (admin)
  USERS_LIST: '/users',
  USERS_DETAIL: '/users/:id',
  USERS_CREATE: '/users/create',
  USERS_EDIT: '/users/:id/edit',
  
  // RBAC routes (admin)
  ROLES_LIST: '/rbac/roles',
  ROLES_DETAIL: '/rbac/roles/:id',
  ROLES_CREATE: '/rbac/roles/create',
  PERMISSIONS_LIST: '/rbac/permissions',
  RBAC_CACHE: '/rbac/cache',
  
  // Admin dashboard
  ADMIN_DASHBOARD: '/admin',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Audit & GDPR
  AUDIT_LOGS: '/audit/logs',
  AUDIT_DETAIL: '/audit/logs/:id',
  GDPR_EXPORT: '/gdpr/export',
  GDPR_DELETE: '/gdpr/delete',
  
  // Monitoring
  MONITORING_HEALTH: '/monitoring/health',
  MONITORING_CIRCUITS: '/monitoring/circuit-breakers',
  MONITORING_METRICS: '/monitoring/metrics',
  MONITORING_SYSTEM: '/monitoring/system',
  
  // Reference UI pages (for development only - delete before production)
  REFERENCE_INDEX: '/reference',
  REFERENCE_HTML_SHOWCASE: '/reference/html-showcase',
  REFERENCE_MODERN_HTML: '/reference/modern-html',
  REFERENCE_PRODUCTS: '/reference/products',
  REFERENCE_SERVICES: '/reference/services',
  REFERENCE_UI_ELEMENTS: '/reference/ui-elements',
  REFERENCE_FORM_PATTERNS: '/reference/form-patterns',
  REFERENCE_COMPONENT_PATTERNS: '/reference/component-patterns',
} as const;

// Type-safe navigation helpers
export const navigate = {
  toUserDetail: (id: string) => `/users/${id}`,
  toUserEdit: (id: string) => `/users/${id}/edit`,
  toRoleDetail: (id: string) => `/rbac/roles/${id}`,
  toAuditDetail: (id: string) => `/audit/logs/${id}`,
  toResetPassword: (token: string) => `/auth/reset-password/${token}`,
  toVerifyEmail: (token: string) => `/auth/verify-email/${token}`,
};

// Route metadata
export const ROUTE_META = {
  [ROUTE_PATHS.HOME]: { title: 'Home', requiresAuth: false },
  [ROUTE_PATHS.LOGIN]: { title: 'Login', requiresAuth: false },
  [ROUTE_PATHS.REGISTER]: { title: 'Register', requiresAuth: false },
  [ROUTE_PATHS.PROFILE]: { title: 'Profile', requiresAuth: true },
  [ROUTE_PATHS.USERS_LIST]: { title: 'Users', requiresAuth: true, roles: ['admin'] },
  [ROUTE_PATHS.ADMIN_DASHBOARD]: { title: 'Admin Dashboard', requiresAuth: true, roles: ['admin'] },
} as const;
