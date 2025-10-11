/**
 * Application Constants and Configuration
 * Centralized configuration management by 20-year React expert
 */

// ==================== ENVIRONMENT CONFIGURATION ====================

export const ENV = {
  NODE_ENV: process.env['NODE_ENV'] || 'development',
  API_BASE_URL: process.env['VITE_API_BASE_URL'] || 'http://localhost:3001/api',
  APP_URL: process.env['VITE_APP_URL'] || 'http://localhost:5173',
  VERSION: process.env['VITE_APP_VERSION'] || '1.0.0',
  BUILD_TIME: process.env['VITE_BUILD_TIME'] || new Date().toISOString(),
  DEBUG: process.env['VITE_DEBUG'] === 'true',
} as const;

export const isDevelopment = ENV.NODE_ENV === 'development';
export const isProduction = ENV.NODE_ENV === 'production';
export const isTest = ENV.NODE_ENV === 'test';

// ==================== API CONFIGURATION ====================

export const API = {
  BASE_URL: ENV.API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes

  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      VERIFY_EMAIL: '/auth/verify-email',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      PROFILE: '/auth/profile',
    },

    // Users
    USERS: {
      LIST: '/users',
      DETAIL: (id: string) => `/users/${id}`,
      CREATE: '/users',
      UPDATE: (id: string) => `/users/${id}`,
      DELETE: (id: string) => `/users/${id}`,
      BULK_DELETE: '/users/bulk-delete',
      EXPORT: '/users/export',
      IMPORT: '/users/import',
    },

    // Roles & Permissions
    ROLES: {
      LIST: '/roles',
      DETAIL: (id: string) => `/roles/${id}`,
      CREATE: '/roles',
      UPDATE: (id: string) => `/roles/${id}`,
      DELETE: (id: string) => `/roles/${id}`,
      PERMISSIONS: '/roles/permissions',
    },

    // System
    SYSTEM: {
      HEALTH: '/system/health',
      METRICS: '/system/metrics',
      LOGS: '/system/logs',
      SETTINGS: '/system/settings',
      BACKUP: '/system/backup',
      RESTORE: '/system/restore',
    },

    // Files
    FILES: {
      UPLOAD: '/files/upload',
      DOWNLOAD: (id: string) => `/files/${id}/download`,
      DELETE: (id: string) => `/files/${id}`,
      LIST: '/files',
    },
  },
} as const;

// ==================== UI CONFIGURATION ====================

export const UI = {
  // Breakpoints (matching Tailwind CSS)
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },

  // Z-index layers
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

  // Animation durations (in ms)
  ANIMATION: { FAST: 150, NORMAL: 300, SLOW: 500, VERY_SLOW: 750 },

  // Common sizes
  SIZES: { SIDEBAR_WIDTH: 256, HEADER_HEIGHT: 64, FOOTER_HEIGHT: 80, MOBILE_MENU_WIDTH: 280 },

  // Colors (for programmatic use)
  COLORS: {
    PRIMARY: '#3B82F6',
    SECONDARY: '#6B7280',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#06B6D4',
  },
} as const;

// ==================== FORM CONFIGURATION ====================

export const FORMS = {
  // Validation patterns
  PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[\d\s\-()]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
    URL: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
    HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  },

  // Field limits
  LIMITS: {
    USERNAME: { MIN: 3, MAX: 20 },
    PASSWORD: { MIN: 8, MAX: 128 },
    EMAIL: { MAX: 254 },
    NAME: { MIN: 1, MAX: 100 },
    DESCRIPTION: { MAX: 1000 },
    TITLE: { MAX: 200 },
    COMMENT: { MAX: 500 },
  },

  // Debounce delays (in ms)
  DEBOUNCE: { SEARCH: 300, VALIDATION: 500, AUTO_SAVE: 2000 },
} as const;

// ==================== PAGINATION CONFIGURATION ====================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// ==================== STORAGE KEYS ====================

export const STORAGE_KEYS = {
  // Authentication
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me',

  // User preferences
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  TABLE_SETTINGS: 'table_settings',
  FILTER_PREFERENCES: 'filter_preferences',

  // Application state
  LAST_ROUTE: 'last_route',
  FORM_DRAFTS: 'form_drafts',
  RECENT_SEARCHES: 'recent_searches',

  // Cache
  API_CACHE: 'api_cache',
  USER_CACHE: 'user_cache',

  // Error tracking
  ERROR_LOGS: 'error_logs',
  PERFORMANCE_METRICS: 'performance_metrics',
} as const;

// ==================== USER ROLES & PERMISSIONS ====================

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
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

  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',

  // Analytics
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
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  [ROLES.USER]: [PERMISSIONS.USERS_VIEW],
  [ROLES.GUEST]: [],
} as const;

// ==================== FILE UPLOAD CONFIGURATION ====================

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  CHUNK_SIZE: 1024 * 1024, // 1MB
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

// ==================== NOTIFICATION CONFIGURATION ====================

export const NOTIFICATIONS = {
  DURATION: {
    SUCCESS: 3000,
    INFO: 4000,
    WARNING: 5000,
    ERROR: 0, // Persistent until dismissed
  },

  MAX_NOTIFICATIONS: 5,

  TYPES: { SUCCESS: 'success', ERROR: 'error', WARNING: 'warning', INFO: 'info' } as const,

  POSITIONS: {
    TOP_LEFT: 'top-left',
    TOP_RIGHT: 'top-right',
    TOP_CENTER: 'top-center',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_CENTER: 'bottom-center',
  } as const,
} as const;

// ==================== VALIDATION MESSAGES ====================

export const VALIDATION_MESSAGES = {
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
} as const;

// ==================== DATE & TIME CONFIGURATION ====================

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

// ==================== ANALYTICS & TRACKING ====================

export const ANALYTICS = {
  ENABLED: isProduction,

  EVENTS: {
    // User actions
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    USER_REGISTER: 'user_register',

    // Page views
    PAGE_VIEW: 'page_view',

    // Feature usage
    FEATURE_USED: 'feature_used',
    SEARCH_PERFORMED: 'search_performed',
    EXPORT_DOWNLOADED: 'export_downloaded',

    // Errors
    ERROR_OCCURRED: 'error_occurred',
    API_ERROR: 'api_error',
  },

  PROPERTIES: {
    USER_ID: 'user_id',
    SESSION_ID: 'session_id',
    PAGE_PATH: 'page_path',
    USER_AGENT: 'user_agent',
    REFERRER: 'referrer',
    TIMESTAMP: 'timestamp',
  },
} as const;

// ==================== SECURITY CONFIGURATION ====================

export const SECURITY = {
  PASSWORD_REQUIREMENTS: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true,
  },

  SESSION: {
    TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    WARNING_TIME: 5 * 60 * 1000, // 5 minutes before timeout
    REFRESH_THRESHOLD: 15 * 60 * 1000, // Refresh token 15 minutes before expiry
  },

  RATE_LIMITING: { LOGIN_ATTEMPTS: 5, API_REQUESTS_PER_MINUTE: 100, EXPORT_REQUESTS_PER_HOUR: 10 },

  CSP: {
    DEFAULT_SRC: ["'self'"],
    SCRIPT_SRC: ["'self'", "'unsafe-inline'"],
    STYLE_SRC: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    FONT_SRC: ["'self'", 'https://fonts.gstatic.com'],
    IMG_SRC: ["'self'", 'data:', 'https:'],
    CONNECT_SRC: ["'self'"],
  },
} as const;

// ==================== ERROR CODES ====================

export const ERROR_CODES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',

  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',

  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',

  // Server
  SERVER_ERROR: 'SERVER_ERROR',
  SERVER_UNAVAILABLE: 'SERVER_UNAVAILABLE',

  // Not Found
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  PAGE_NOT_FOUND: 'PAGE_NOT_FOUND',

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
} as const;

// ==================== EXPORT ALL ====================

export const APP_CONFIG = {
  ENV,
  API,
  UI,
  FORMS,
  PAGINATION,
  STORAGE_KEYS,
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  FILE_UPLOAD,
  NOTIFICATIONS,
  VALIDATION_MESSAGES,
  DATE_TIME,
  FEATURES,
  ANALYTICS,
  SECURITY,
  ERROR_CODES,
} as const;

export default APP_CONFIG;
