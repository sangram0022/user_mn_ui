/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

import { BACKEND_SERVER_CONFIG } from '../shared/config/backend';

export const API_CONFIG = {
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    `http://${BACKEND_SERVER_CONFIG.DIRECT.HOST}:${BACKEND_SERVER_CONFIG.DIRECT.PORT}/api/v1`,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    PASSWORD_RESET: '/auth/password-reset',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // Profile endpoints
  PROFILE: {
    ME: '/profile/me',
  },

  // Admin endpoints
  ADMIN: {
    USERS: '/admin/users',
    USER_DETAIL: (id: string) => `/admin/users/${id}`,
    APPROVE_USER: '/admin/approve-user',
    REJECT_USER: (id: string) => `/admin/users/${id}/reject`,
    ROLES: '/admin/roles',
    AUDIT_LOGS: '/admin/audit-logs',
    STATS: '/admin/stats',
  },

  // Audit endpoints
  AUDIT: {
    LOGS: '/audit/logs',
    SUMMARY: '/audit/summary',
  },

  // Bulk operations endpoints
  BULK: {
    CREATE_USERS: '/bulk/users/create',
    VALIDATE_USERS: '/bulk/users/validate',
  },

  // GDPR endpoints
  GDPR: {
    EXPORT_DATA: '/gdpr/export/my-data',
    DELETE_ACCOUNT: '/gdpr/delete/my-account',
  },

  // Health check endpoints
  HEALTH: {
    BASIC: '/health/',
    READY: '/health/ready',
    DETAILED: '/health/detailed',
    DATABASE: '/health/db',
    SYSTEM: '/health/system',
  },
} as const;

export const RATE_LIMITS = {
  AUTH: { requests: 5, window: 60 },
  PROFILE: { requests: 30, window: 60 },
  ADMIN: { requests: 60, window: 60 },
  BULK: { requests: 10, window: 3600 },
  HEALTH: { requests: Infinity, window: 60 },
} as const;

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
} as const;

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
} as const;
