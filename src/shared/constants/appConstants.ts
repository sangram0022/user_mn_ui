/**
 * Application Constants and Configuration
 * Centralized constants for the entire application
 */

import { BACKEND_CONFIG } from '../config/api';

// API Configuration
export const API_CONFIG = {
  BASE_URL: BACKEND_CONFIG.API_BASE_URL,
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'authToken',
  USER_KEY: 'user',
  REFRESH_TOKEN_KEY: 'refreshToken',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes before expiry
  MAX_LOGIN_ATTEMPTS: 3,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
} as const;

// UI Configuration
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 280,
  SIDEBAR_COLLAPSED_WIDTH: 80,
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
  NOTIFICATION_DURATION: 5000,
  ANIMATION_DURATION: 300,
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  DEFAULT_THEME: 'system' as const,
  STORAGE_KEY: 'app-theme',
  DARK_MODE_CLASS: 'dark',
} as const;

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks for large file uploads
} as const;

// Validation Configuration
export const VALIDATION_CONFIG = {
  EMAIL_REGEX: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  USERNAME_REGEX: /^[a-zA-Z0-9_-]+$/,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',

  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Account is temporarily locked due to multiple failed login attempts.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to view this resource.',

  // Validation errors
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD:
    'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  INVALID_USERNAME:
    'Username must be 3-30 characters and contain only letters, numbers, hyphens, and underscores.',

  // File upload errors
  FILE_TOO_LARGE: `File size must be less than ${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB.`,
  INVALID_FILE_TYPE: 'File type is not supported.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',

  // Data errors
  NOT_FOUND: 'The requested resource was not found.',
  ALREADY_EXISTS: 'A resource with this information already exists.',
  INVALID_DATA: 'The provided data is invalid.',

  // System errors
  MAINTENANCE_MODE: 'The system is currently under maintenance. Please try again later.',
  FEATURE_DISABLED: 'This feature is currently disabled.',
  RATE_LIMITED: 'Too many requests. Please wait and try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in.',
  LOGOUT_SUCCESS: 'Successfully logged out.',
  REGISTRATION_SUCCESS: 'Account created successfully.',
  PASSWORD_RESET_SUCCESS: 'Password reset link sent to your email.',
  PASSWORD_UPDATE_SUCCESS: 'Password updated successfully.',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully.',
  EMAIL_VERIFIED: 'Email verified successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
  DATA_SAVED: 'Data saved successfully.',
  DATA_DELETED: 'Data deleted successfully.',
  FILE_UPLOADED: 'File uploaded successfully.',
  INVITATION_SENT: 'Invitation sent successfully.',
} as const;

// Routes Configuration
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  EMAIL_VERIFICATION: '/verify-email',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  USERS: '/users',
  ANALYTICS: '/analytics',
  REPORTS: '/reports',
  HELP: '/help',
  NOT_FOUND: '/404',
} as const;

// User Roles and Permissions
export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  VIEWER: 'viewer',
} as const;

export const PERMISSIONS = {
  // User management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',
  ANALYTICS_VIEW: 'analytics:view',
  REPORTS_VIEW: 'reports:view',
  REPORTS_CREATE: 'reports:create',

  // System
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_MONITOR: 'system:monitor',
  SETTINGS_MANAGE: 'settings:manage',
} as const;

// Role-based permission mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.SYSTEM_ADMIN,
    PERMISSIONS.SYSTEM_MONITOR,
    PERMISSIONS.SETTINGS_MANAGE,
  ],
  [USER_ROLES.MODERATOR]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.SYSTEM_MONITOR,
  ],
  [USER_ROLES.USER]: [PERMISSIONS.USER_READ, PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.REPORTS_VIEW],
  [USER_ROLES.VIEWER]: [PERMISSIONS.USER_READ, PERMISSIONS.DASHBOARD_VIEW],
} as const;

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  VIRTUAL_LIST_THRESHOLD: 100,
  IMAGE_LAZY_LOADING_OFFSET: 200,
  CACHE_CLEANUP_INTERVAL: 60 * 1000, // 1 minute
  PERFORMANCE_BUDGET: {
    RENDER_TIME: 16, // 60fps
    BUNDLE_SIZE: 500 * 1024, // 500KB
    MEMORY_USAGE: 50, // 50MB
    LCP: 2500, // 2.5s
    FID: 100, // 100ms
    CLS: 0.1,
  },
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_PUSH_NOTIFICATIONS: import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === 'true',
  ENABLE_REAL_TIME_UPDATES: import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES === 'true',
  ENABLE_ADVANCED_SEARCH: import.meta.env.VITE_ENABLE_ADVANCED_SEARCH === 'true',
  ENABLE_FILE_UPLOADS: import.meta.env.VITE_ENABLE_FILE_UPLOADS === 'true',
  ENABLE_DARK_MODE: import.meta.env.VITE_ENABLE_DARK_MODE !== 'false',
  ENABLE_OFFLINE_MODE: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
} as const;

// Environment Configuration
export const ENV_CONFIG = {
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  IS_TEST: import.meta.env.MODE === 'test',
  APP_VERSION: import.meta.env.VITE_VERSION || '1.0.0',
  BUILD_NUMBER: import.meta.env.VITE_BUILD_NUMBER || 'unknown',
  COMMIT_HASH: import.meta.env.VITE_COMMIT_HASH || 'unknown',
} as const;

// Monitoring and Logging Configuration
export const MONITORING_CONFIG = {
  ERROR_REPORTING_ENDPOINT: import.meta.env.VITE_ERROR_REPORTING_ENDPOINT,
  ANALYTICS_ENDPOINT: import.meta.env.VITE_ANALYTICS_ENDPOINT,
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'warn',
  ENABLE_PERFORMANCE_MONITORING: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  SAMPLE_RATE: parseFloat(import.meta.env.VITE_SAMPLE_RATE || '0.1'),
} as const;

// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  URL: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001',
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_ATTEMPTS: 10,
  HEARTBEAT_INTERVAL: 30000,
} as const;

// Export all constants as a single object for convenience
export const APP_CONSTANTS = {
  API_CONFIG,
  AUTH_CONFIG,
  UI_CONFIG,
  THEME_CONFIG,
  PAGINATION_CONFIG,
  UPLOAD_CONFIG,
  VALIDATION_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  USER_ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  PERFORMANCE_CONFIG,
  FEATURE_FLAGS,
  ENV_CONFIG,
  MONITORING_CONFIG,
  WEBSOCKET_CONFIG,
} as const;

// Type exports for external use
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export type Route = (typeof ROUTES)[keyof typeof ROUTES];
export type ThemeMode = typeof THEME_CONFIG.DEFAULT_THEME;

export default APP_CONSTANTS;
