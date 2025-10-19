/**
 * API Configuration
 * Central configuration for API endpoints and constants
 * Reference: API_DOCUMENTATION_COMPLETE.md
 */

export const TOKEN_KEYS = {
  USER_DATA: 'user_data',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  CSRF_TOKEN: 'csrf_token',
} as const;

export const API_ENDPOINTS = {
  // Authentication APIs
  AUTH: {
    LOGIN: '/auth/login',
    LOGIN_SECURE: '/auth/login-secure',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    REFRESH: '/auth/refresh',
    REFRESH_SECURE: '/auth/refresh-secure',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    LOGOUT: '/auth/logout',
    LOGOUT_SECURE: '/auth/logout-secure',
    CSRF_TOKEN: '/auth/csrf-token',
    VALIDATE_CSRF: '/auth/validate-csrf',
  },

  // User Profile APIs
  PROFILE: {
    ME: '/profile/me',
  },

  // Admin User Management APIs
  ADMIN: {
    USERS: '/admin/users',
    USER_DETAIL: (id: string) => `/admin/users/${id}`,
    ACTIVATE_USER: (id: string) => `/admin/users/${id}/activate`,
    DEACTIVATE_USER: (id: string) => `/admin/users/${id}/deactivate`,
    APPROVE_USER: (id: string) => `/admin/users/${id}/approve`,
    REJECT_USER: (id: string) => `/admin/users/${id}/reject`,

    // Role Management
    ROLES: '/admin/roles',
    ROLE_DETAIL: (id: string) => `/admin/roles/${id}`,

    // RBAC - Permissions
    PERMISSIONS: '/admin/permissions',
    USER_PERMISSIONS: (userId: string) => `/admin/users/${userId}/permissions`,
    CHECK_PERMISSION: (userId: string) => `/admin/users/${userId}/check-permission`,
    USER_ROLES: (userId: string) => `/admin/users/${userId}/roles`,
    ASSIGN_ROLE: (userId: string) => `/admin/users/${userId}/roles`,
    REMOVE_ROLE: (userId: string, roleId: string) => `/admin/users/${userId}/roles/${roleId}`,
    ROLE_PERMISSIONS: (roleId: string) => `/admin/roles/${roleId}/permissions`,
    ADD_PERMISSION: (roleId: string) => `/admin/roles/${roleId}/permissions`,
    REMOVE_PERMISSION: (roleId: string, permissionId: string) =>
      `/admin/roles/${roleId}/permissions/${permissionId}`,
    VERIFY_PERMISSION: (userId: string) => `/admin/users/${userId}/verify-permission`,

    // Statistics & Logs
    STATS: '/admin/stats',
    AUDIT_LOGS: '/admin/audit-logs',
  },

  // GDPR Compliance APIs
  GDPR: {
    EXPORT_DATA: '/gdpr/export/my-data',
    EXPORT_STATUS: (exportId: string) => `/gdpr/export/status/${exportId}`,
    DELETE_ACCOUNT: '/gdpr/delete/my-account',
  },

  // Audit Logging APIs
  AUDIT: {
    LOGS: '/audit/logs',
    SUMMARY: '/audit/summary',
  },

  // Bulk Operations (Extension)
  BULK: {
    CREATE_USERS: '/bulk/users',
    VALIDATE_USERS: '/bulk/users/validate',
  },
} as const;
