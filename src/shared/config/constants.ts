/**
 * Consolidated Application Constants
 * Single source of truth for all application-wide constants
 *
 * @module constants
 */

import { BACKEND_CONFIG } from './api';

// ==================== ENVIRONMENT CONFIGURATION ====================

export const ENV = {
  NODE_ENV: import.meta.env.MODE || 'development',
  API_BASE_URL: BACKEND_CONFIG.API_BASE_URL,
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  BUILD_TIME: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
} as const;

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const isTest = import.meta.env.MODE === 'test';

// ==================== HTTP STATUS CODES ====================

export const HTTP_STATUS = {
  SUCCESS: {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
  },
  CLIENT_ERROR: {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
  },
  SERVER_ERROR: {
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  },
} as const;

// ==================== API CONFIGURATION ====================

export const API = {
  BASE_URL: ENV.API_BASE_URL,
  TIMEOUT: {
    DEFAULT: 30000,
    SHORT: 5000,
    LONG: 60000,
    UPLOAD: 300000, // 5 minutes
  },
  RETRY: {
    ATTEMPTS: 3,
    DELAY: 1000,
    MAX_DELAY: 10000,
    BACKOFF_MULTIPLIER: 2,
  },
  RATE_LIMIT: {
    MAX_REQUESTS_PER_MINUTE: 60,
    MAX_REQUESTS_PER_HOUR: 1000,
    BURST_LIMIT: 10,
  },
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes

  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      VERIFY_EMAIL: '/auth/verify-email',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      CHANGE_PASSWORD: '/auth/change-password',
      PROFILE: '/auth/profile',
    },
    USERS: {
      LIST: '/users',
      DETAIL: (id: string) => `/users/${id}`,
      CREATE: '/users',
      UPDATE: (id: string) => `/users/${id}`,
      DELETE: (id: string) => `/users/${id}`,
      BULK_DELETE: '/users/bulk-delete',
      EXPORT: '/users/export',
      IMPORT: '/users/import',
      PROFILE: '/users/profile',
      ANALYTICS: '/users/analytics',
    },
    ROLES: {
      LIST: '/roles',
      DETAIL: (id: string) => `/roles/${id}`,
      CREATE: '/roles',
      UPDATE: (id: string) => `/roles/${id}`,
      DELETE: (id: string) => `/roles/${id}`,
      PERMISSIONS: '/roles/permissions',
    },
    SYSTEM: {
      HEALTH: '/system/health',
      METRICS: '/system/metrics',
      LOGS: '/system/logs',
      SETTINGS: '/system/settings',
      BACKUP: '/system/backup',
      RESTORE: '/system/restore',
    },
    FILES: {
      UPLOAD: '/files/upload',
      UPLOAD_AVATAR: '/upload/avatar',
      UPLOAD_DOCUMENTS: '/upload/documents',
      DOWNLOAD: (id: string) => `/files/${id}/download`,
      DELETE: (id: string) => `/files/${id}`,
      LIST: '/files',
    },
  },
} as const;

// ==================== AUTHENTICATION & SESSION ====================

export const AUTH = {
  TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_DATA_KEY: 'user_data',
  REMEMBER_ME_KEY: 'remember_me',
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
} as const;

export const SESSION = {
  MAX_INACTIVE_TIME: 30 * 60 * 1000, // 30 minutes
  WARNING_TIME: 5 * 60 * 1000, // 5 minutes
  CHECK_INTERVAL: 30 * 1000, // 30 seconds
  SESSION_ID_KEY: 'session_id',
  LAST_ACTIVITY_KEY: 'last_activity',
} as const;

// ==================== UI CONFIGURATION ====================

export const UI = {
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    NOTIFICATION: 1080,
  },
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 750,
  },
  SIZES: {
    SIDEBAR_WIDTH: 256,
    HEADER_HEIGHT: 64,
    FOOTER_HEIGHT: 80,
    MOBILE_MENU_WIDTH: 280,
  },
  COLORS: {
    PRIMARY: '#3B82F6',
    SECONDARY: '#6B7280',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#06B6D4',
  },
  VIRTUAL_SCROLL: {
    DEFAULT_ITEM_HEIGHT: 72,
    DEFAULT_CONTAINER_HEIGHT: 600,
    ESTIMATED_ITEM_HEIGHT: 150,
    OVERSCAN_COUNT: 3,
    TARGET_FPS: 60,
    MAX_ITEMS: 10000,
  },
  TOAST: {
    MAX_TOASTS: 5,
    DEFAULT_DURATION: 5000,
    ANIMATION_DURATION: 300,
  },
  DEBOUNCE: {
    SEARCH: 300,
    VALIDATION: 500,
    AUTO_SAVE: 2000,
  },
  LAYOUT: {
    GRID_GAP: 16,
    PADDING: {
      SMALL: 8,
      MEDIUM: 16,
      LARGE: 24,
      XLARGE: 32,
    },
    MARGIN: {
      SMALL: 8,
      MEDIUM: 16,
      LARGE: 24,
      XLARGE: 32,
    },
  },
} as const;

// ==================== PAGINATION ====================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// ==================== VALIDATION ====================

export const VALIDATION = {
  PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[\d\s\-()]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
    URL: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
    HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  },
  LIMITS: {
    USERNAME: { MIN: 3, MAX: 20 },
    PASSWORD: { MIN: 8, MAX: 128 },
    EMAIL: { MAX: 254 },
    NAME: { MIN: 1, MAX: 100 },
    DESCRIPTION: { MAX: 1000 },
    TITLE: { MAX: 200 },
    COMMENT: { MAX: 500 },
  },
  MESSAGES: {
    REQUIRED: 'This field is required',
    EMAIL_INVALID: 'Please enter a valid email address',
    PASSWORD_WEAK:
      'Password must contain at least 8 characters with uppercase, lowercase, number and special character',
    PASSWORD_MISMATCH: 'Passwords do not match',
    USERNAME_INVALID:
      'Username must be 3-20 characters and contain only letters, numbers, and underscores',
    PHONE_INVALID: 'Please enter a valid phone number',
    URL_INVALID: 'Please enter a valid URL',
    MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
    MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
    MIN_VALUE: (min: number) => `Must be at least ${min}`,
    MAX_VALUE: (max: number) => `Must be no more than ${max}`,
    PATTERN_MISMATCH: 'Invalid format',
    FILE_TOO_LARGE: (max: string) => `File size must be less than ${max}`,
    FILE_TYPE_INVALID: 'File type not allowed',
  },
} as const;

// ==================== STORAGE KEYS ====================

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  TABLE_SETTINGS: 'table_settings',
  FILTER_PREFERENCES: 'filter_preferences',
  LAST_ROUTE: 'last_route',
  FORM_DRAFTS: 'form_drafts',
  RECENT_SEARCHES: 'recent_searches',
  API_CACHE: 'api_cache',
  USER_CACHE: 'user_cache',
  ERROR_LOGS: 'error_logs',
  PERFORMANCE_METRICS: 'performance_metrics',
  SESSION_ID: 'session_id',
  LAST_ACTIVITY: 'last_activity',
  DEBUG_FLAG: 'DEBUG_USER_MANAGEMENT',
} as const;

// ==================== USER ROLES & PERMISSIONS ====================

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest',
} as const;

export const PERMISSIONS = {
  // User management
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_BULK_DELETE: 'users:bulk_delete',
  USERS_EXPORT: 'users:export',
  USERS_IMPORT: 'users:import',
  // Legacy permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  // Role management
  ROLES_VIEW: 'roles:view',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  // System management
  SYSTEM_VIEW: 'system:view',
  SYSTEM_UPDATE: 'system:update',
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_RESTORE: 'system:restore',
  SYSTEM_LOGS: 'system:logs',
  ADMIN_PANEL: 'admin:panel',
  ADMIN_USERS: 'admin:users',
  ADMIN_SYSTEM: 'admin:system',
  // Moderation
  MODERATE_CONTENT: 'moderate:content',
  MODERATE_REPORTS: 'moderate:reports',
  // Reports & Analytics
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_EXPORT,
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.ROLES_CREATE,
    PERMISSIONS.ROLES_UPDATE,
    PERMISSIONS.SYSTEM_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ADMIN_PANEL,
    PERMISSIONS.ADMIN_USERS,
    PERMISSIONS.ADMIN_SYSTEM,
    PERMISSIONS.MODERATE_CONTENT,
    PERMISSIONS.MODERATE_REPORTS,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.MODERATE_CONTENT,
    PERMISSIONS.MODERATE_REPORTS,
  ],
  [ROLES.USER]: [PERMISSIONS.USERS_VIEW, PERMISSIONS.USER_READ],
  [ROLES.GUEST]: [],
} as const;

// ==================== FILE UPLOAD CONFIGURATION ====================

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  CHUNK_SIZE: 1024 * 1024, // 1MB
  MAX_FILES: 5,
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    DOCUMENTS: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    SPREADSHEETS: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    ARCHIVES: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
  },
  EXTENSIONS: {
    IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    DOCUMENTS: ['.pdf', '.doc', '.docx'],
    SPREADSHEETS: ['.xls', '.xlsx'],
    ARCHIVES: ['.zip', '.rar', '.7z'],
  },
} as const;

// ==================== NOTIFICATIONS ====================

export const NOTIFICATIONS = {
  DURATION: {
    SUCCESS: 3000,
    INFO: 4000,
    WARNING: 5000,
    ERROR: 0, // Persistent until dismissed
  },
  MAX_NOTIFICATIONS: 5,
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },
  POSITIONS: {
    TOP_LEFT: 'top-left',
    TOP_RIGHT: 'top-right',
    TOP_CENTER: 'top-center',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_CENTER: 'bottom-center',
  },
} as const;

// ==================== DATE & TIME ====================

export const DATE_TIME = {
  FORMATS: {
    DATE: 'yyyy-MM-dd',
    DATE_TIME: 'yyyy-MM-dd HH:mm:ss',
    DATE_DISPLAY: 'MMM dd, yyyy',
    DATE_TIME_DISPLAY: 'MMM dd, yyyy at h:mm a',
    TIME: 'HH:mm',
    TIME_DISPLAY: 'h:mm a',
    ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  },
  TIMEZONES: [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ],
  DEFAULT_TIMEZONE: 'UTC',
} as const;

// ==================== FEATURE FLAGS ====================

export const FEATURES = {
  DARK_MODE: true,
  NOTIFICATIONS: true,
  ANALYTICS: true,
  EXPORT_FUNCTIONALITY: true,
  BULK_OPERATIONS: true,
  ADVANCED_SEARCH: true,
  REAL_TIME_UPDATES: false,
  BETA_FEATURES: isDevelopment,
} as const;

// ==================== ERROR CODES ====================

export const ERROR_CODES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  // Server
  SERVER_ERROR: 'SERVER_ERROR',
  SERVER_UNAVAILABLE: 'SERVER_UNAVAILABLE',
  // Not Found
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  PAGE_NOT_FOUND: 'PAGE_NOT_FOUND',
  NOT_FOUND: 'NOT_FOUND',
  // Conflict
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  // File Upload
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_TYPE_NOT_ALLOWED: 'FILE_TYPE_NOT_ALLOWED',
  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  UNKNOWN: 'UNKNOWN',
} as const;

// ==================== ERROR MESSAGES ====================

export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: 'Network error occurred. Please check your connection.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Request timeout. Please try again.',
  [ERROR_CODES.UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [ERROR_CODES.FORBIDDEN]: 'Access denied.',
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_CODES.SERVER_ERROR]: 'Internal server error. Please try again later.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Validation failed. Please check your input.',
  // Legacy keys
  NETWORK: 'Network error occurred. Please check your connection.',
  TIMEOUT: 'Request timeout. Please try again.',
  UNKNOWN: 'An unexpected error occurred.',
} as const;

// ==================== SUCCESS MESSAGES ====================

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  PASSWORD_RESET_SUCCESS: 'Password reset email sent!',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully!',
  SETTINGS_SAVE_SUCCESS: 'Settings saved successfully!',
} as const;

// ==================== ROUTES ====================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  USERS: '/users',
  ADMIN: '/admin',
  NOT_FOUND: '/404',
} as const;

// ==================== PERFORMANCE ====================

export const PERFORMANCE = {
  MAX_METRICS: 100,
  SAMPLE_RATE: 1.0,
  PERCENTILES: {
    MEDIAN: 50,
    P95: 95,
    P99: 99,
  },
} as const;

// ==================== LEGACY EXPORTS (DEPRECATED) ====================

// @deprecated Use API instead
export const API_CONFIG = {
  BASE_URL: API.BASE_URL,
  TIMEOUT: API.TIMEOUT.DEFAULT,
  RETRY_ATTEMPTS: API.RETRY.ATTEMPTS,
  RETRY_DELAY: API.RETRY.DELAY,
} as const;

// @deprecated Use API.ENDPOINTS instead
export const API_ENDPOINTS = API.ENDPOINTS.USERS;

// @deprecated Use AUTH instead
export const AUTH_CONFIG = {
  tokenKey: AUTH.TOKEN_KEY,
  refreshTokenKey: AUTH.REFRESH_TOKEN_KEY,
  userKey: AUTH.USER_DATA_KEY,
  sessionTimeout: AUTH.SESSION_TIMEOUT,
  refreshThreshold: AUTH.REFRESH_THRESHOLD,
} as const;

// @deprecated Use UI instead
export const UI_CONFIG = {
  defaultPageSize: PAGINATION.DEFAULT_LIMIT,
  maxPageSize: PAGINATION.MAX_LIMIT,
  debounceDelay: UI.DEBOUNCE.SEARCH,
  toastDuration: UI.TOAST.DEFAULT_DURATION,
  loadingMinDuration: 500,
} as const;

// @deprecated Use ROLES instead
export const USER_ROLES = ROLES;

// @deprecated Use DATE_TIME.FORMATS instead
export const DATE_FORMATS = DATE_TIME.FORMATS;

// @deprecated Use VALIDATION.RULES instead
export const VALIDATION_RULES = {
  email: {
    pattern: VALIDATION.PATTERNS.EMAIL,
    message: VALIDATION.MESSAGES.EMAIL_INVALID,
  },
  password: {
    minLength: VALIDATION.LIMITS.PASSWORD.MIN,
    maxLength: VALIDATION.LIMITS.PASSWORD.MAX,
    pattern: VALIDATION.PATTERNS.PASSWORD,
    message: VALIDATION.MESSAGES.PASSWORD_WEAK,
  },
  name: {
    minLength: VALIDATION.LIMITS.NAME.MIN,
    maxLength: VALIDATION.LIMITS.NAME.MAX,
    pattern: /^[a-zA-Z\s-']+$/,
    message: 'Name must contain only letters, spaces, hyphens, and apostrophes',
  },
  username: {
    minLength: VALIDATION.LIMITS.USERNAME.MIN,
    maxLength: VALIDATION.LIMITS.USERNAME.MAX,
    pattern: VALIDATION.PATTERNS.USERNAME,
    message: VALIDATION.MESSAGES.USERNAME_INVALID,
  },
} as const;

// @deprecated Use FEATURES instead
export const FEATURE_FLAGS = FEATURES;

// @deprecated Use STORAGE_KEYS instead
export const SESSION_STORAGE_KEYS = {
  ACCESS_TOKEN: STORAGE_KEYS.ACCESS_TOKEN,
  REFRESH_TOKEN: STORAGE_KEYS.REFRESH_TOKEN,
  USER_PROFILE: STORAGE_KEYS.USER_DATA,
  LAST_ACTIVITY: STORAGE_KEYS.LAST_ACTIVITY,
  SESSION_ID: 'session_id', // Session tracking
  DEBUG_FLAG: 'debug_mode', // Debug mode flag
} as const;

// ==================== ENVIRONMENT ====================

export const ENVIRONMENT = {
  PRODUCTION: 'production',
  STAGING: 'staging',
  DEVELOPMENT: 'development',
  TEST: 'test',
} as const;

// @deprecated Use SESSION instead
export const SESSION_TIMEOUT = SESSION.MAX_INACTIVE_TIME;

// @deprecated Use HTTP_STATUS instead
export const HTTP_STATUS_CODES = HTTP_STATUS;

// @deprecated Use API.TIMEOUT instead
export const API_TIMEOUT = API.TIMEOUT;

// @deprecated Use API.RETRY instead
export const RETRY_CONFIG = API.RETRY;

// @deprecated Use API.RATE_LIMIT instead
export const RATE_LIMIT = API.RATE_LIMIT;

// @deprecated Use UI.VIRTUAL_SCROLL instead
export const VIRTUAL_SCROLL = UI.VIRTUAL_SCROLL;

// @deprecated Use UI.TOAST instead
export const TOAST = UI.TOAST;

// @deprecated Use UI.ANIMATION instead
export const ANIMATION = UI.ANIMATION;

// @deprecated Use UI.LAYOUT instead
export const LAYOUT = UI.LAYOUT;

// ==================== TYPE EXPORTS ====================

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
export type Route = (typeof ROUTES)[keyof typeof ROUTES];
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
export type HttpStatusCode =
  | (typeof HTTP_STATUS.SUCCESS)[keyof typeof HTTP_STATUS.SUCCESS]
  | (typeof HTTP_STATUS.CLIENT_ERROR)[keyof typeof HTTP_STATUS.CLIENT_ERROR]
  | (typeof HTTP_STATUS.SERVER_ERROR)[keyof typeof HTTP_STATUS.SERVER_ERROR];

// ==================== DEFAULT EXPORT ====================

export const APP_CONFIG = {
  ENV,
  API,
  AUTH,
  SESSION,
  UI,
  PAGINATION,
  VALIDATION,
  STORAGE_KEYS,
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  FILE_UPLOAD,
  NOTIFICATIONS,
  DATE_TIME,
  FEATURES,
  ERROR_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  PERFORMANCE,
  HTTP_STATUS,
} as const;

export default APP_CONFIG;
