/**
 * API Configuration
 * Central configuration for API endpoints and constants
 */

export const TOKEN_KEYS = {
  USER_DATA: 'user_data',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  CSRF_TOKEN: 'csrf_token',
} as const;

export const API_ENDPOINTS = {
  PROFILE: {
    ME: '/api/v1/profile/me',
  },
  ADMIN: {
    USERS: '/api/v1/admin/users',
    USER_DETAIL: (id: string) => `/api/v1/admin/users/${id}`,
    APPROVE_USER: '/api/v1/admin/users/approve',
    REJECT_USER: (id: string) => `/api/v1/admin/users/${id}/reject`,
    ROLES: '/api/v1/admin/roles',
    STATS: '/api/v1/admin/stats',
    AUDIT_LOGS: '/api/v1/admin/audit-logs',
  },
  GDPR: {
    EXPORT_DATA: '/api/v1/gdpr/export/my-data',
    DELETE_ACCOUNT: '/api/v1/gdpr/delete-account',
  },
  BULK: {
    CREATE_USERS: '/api/v1/bulk/users',
    VALIDATE_USERS: '/api/v1/bulk/users/validate',
  },
  AUDIT: {
    LOGS: '/api/v1/audit/logs',
    SUMMARY: '/api/v1/audit/summary',
  },
} as const;
