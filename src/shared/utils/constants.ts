// Application constants and configuration
import type { ApiEndpoints, TableColumn, FilterOption, User } from '../types';

/**
 * API Configuration
 */
export const API_CONFIG = { BASE_URL: import.meta.env['VITE_API_BASE_URL'] || '', // Use empty string to use relative URLs with proxy
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, } as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS: ApiEndpoints = {
  // Authentication
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  CHANGE_PASSWORD: '/auth/change-password',

  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_PROFILE: '/users/profile',
  USER_ANALYTICS: '/users/analytics',
  USER_BULK_ACTIONS: '/users/bulk',
  USER_EXPORT: '/users/export',
  USER_IMPORT: '/users/import',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_SYSTEM_HEALTH: '/admin/health',

  // File uploads
  UPLOAD_AVATAR: '/upload/avatar',
  UPLOAD_DOCUMENTS: '/upload/documents',
} as const;

/**
 * User Roles with hierarchical permissions
 */
export const USER_ROLES = { super_admin: {
    label: 'Super Admin',
    level: 100,
    permissions: ['*'],
    color: 'bg-red-500 text-white'
  },
  admin: { label: 'Administrator',
    level: 80,
    permissions: [
      'users.read', 'users.write', 'users.delete',
      'settings.read', 'settings.write',
      'audit.read'
    ],
    color: 'bg-purple-500 text-white'
  },
  moderator: { label: 'Moderator',
    level: 60,
    permissions: [
      'users.read', 'users.write',
      'content.moderate'
    ],
    color: 'bg-blue-500 text-white'
  },
  user: { label: 'User',
    level: 20,
    permissions: [
      'profile.read', 'profile.write'
    ],
    color: 'bg-green-500 text-white'
  },
  guest: { label: 'Guest',
    level: 0,
    permissions: ['profile.read'],
    color: 'bg-gray-500 text-white'
  }
} as const;

/**
 * User Status Configuration
 */
export const USER_STATUS = { active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    icon: 'CheckCircle'
  },
  inactive: { label: 'Inactive',
    color: 'bg-gray-100 text-gray-800',
    icon: 'XCircle'
  },
  pending: { label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'Clock'
  },
  suspended: { label: 'Suspended',
    color: 'bg-red-100 text-red-800',
    icon: 'AlertTriangle'
  }
} as const;

/**
 * Table Configuration for User Management
 */
export const USER_TABLE_COLUMNS: TableColumn<User>[] = [
  { key: 'id',
    label: 'ID',
    sortable: true,
    width: '80px'
  },
  { key: 'full_name',
    label: 'Name',
    sortable: true,
    width: '200px'
  },
  { key: 'email',
    label: 'Email',
    sortable: true,
    width: '250px'
  },
  { key: 'role',
    label: 'Role',
    sortable: true,
    width: '120px'
  },
  { key: 'is_active',
    label: 'Status',
    sortable: true,
    width: '100px'
  },
  { key: 'created_at',
    label: 'Created',
    sortable: true,
    width: '120px'
  },
  { key: 'last_login_at',
    label: 'Last Login',
    sortable: true,
    width: '120px'
  }
] as const;

/**
 * Filter Options for User Management
 */
export const USER_FILTERS: FilterOption[] = [
  { key: 'role',
    label: 'Role',
    type: 'select',
    options: Object.entries(USER_ROLES).map(([value, config]) => ({
      value: value as string,
      label: (config as { label: string }).label
    }))
  },
  { key: 'status',
    label: 'Status',
    type: 'select',
    options: Object.entries(USER_STATUS).map(([value, config]) => ({
      value: value as string,
      label: (config as { label: string }).label
    }))
  },
  { key: 'dateRange',
    label: 'Created Date',
    type: 'dateRange'
  },
  { key: 'lastLogin',
    label: 'Last Login',
    type: 'dateRange'
  }
] as const;

/**
 * Pagination Configuration
 */
export const PAGINATION_CONFIG = { DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
  MAX_VISIBLE_PAGES: 5 } as const;

/**
 * Validation Rules
 */
export const VALIDATION_RULES = { EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-()]+$/,
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },
  USERNAME: { MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_]+$/
  },
  NAME: { MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s]+$/
  }
} as const;

/**
 * File Upload Configuration
 */
export const UPLOAD_CONFIG = { AVATAR: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    MAX_DIMENSIONS: { width: 1024, height: 1024 }
  },
  DOCUMENTS: { MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
  }
} as const;

/**
 * Application Settings
 */
export const APP_CONFIG = { NAME: 'User Management System',
  VERSION: '2.0.0',
  DESCRIPTION: 'Advanced User Management with Analytics',
  COMPANY: 'Your Company',
  SUPPORT_EMAIL: 'support@yourcompany.com',
  DOCUMENTATION_URL: 'https://docs.yourcompany.com',
  
  // Feature flags
  FEATURES: {
    ANALYTICS: true,
    BULK_OPERATIONS: true,
    EXPORT_IMPORT: true,
    AUDIT_LOGS: true,
    TWO_FACTOR_AUTH: true,
    EMAIL_VERIFICATION: true,
    PASSWORD_POLICY: true,
    SESSION_MANAGEMENT: true
  },

  // UI Configuration
  UI: { THEME: 'light' as 'light' | 'dark' | 'auto',
    ANIMATIONS: true,
    COMPACT_MODE: false,
    SIDEBAR_COLLAPSED: false
  },

  // Cache Configuration
  CACHE: { USER_LIST_TTL: 5 * 60 * 1000, // 5 minutes
    ANALYTICS_TTL: 10 * 60 * 1000, // 10 minutes
    SETTINGS_TTL: 30 * 60 * 1000, // 30 minutes
  },

  // Security Settings
  SECURITY: { SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    INACTIVITY_WARNING: 5 * 60 * 1000, // 5 minutes before timeout
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    PASSWORD_HISTORY: 5, // Remember last 5 passwords
  }
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = { NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
  
  // Authentication specific
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Account has been locked due to too many failed login attempts.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before signing in.',
  PASSWORD_EXPIRED: 'Your password has expired. Please reset it.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  
  // Validation specific
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_TOO_WEAK: 'Password must contain at least 8 characters with uppercase, lowercase, numbers, and special characters.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  USERNAME_TAKEN: 'Username is already taken.',
  EMAIL_TAKEN: 'Email address is already registered.' } as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = { USER_CREATED: 'User created successfully.',
  USER_UPDATED: 'User updated successfully.',
  USER_DELETED: 'User deleted successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  EMAIL_VERIFIED: 'Email verified successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
  EXPORT_COMPLETED: 'Export completed successfully.',
  IMPORT_COMPLETED: 'Import completed successfully.',
  BULK_ACTION_COMPLETED: 'Bulk action completed successfully.' } as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = { AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_STATE: 'sidebar_state',
  TABLE_SETTINGS: 'table_settings',
  RECENT_SEARCHES: 'recent_searches' } as const;

/**
 * Event Names for Analytics
 */
export const ANALYTICS_EVENTS = { USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  PASSWORD_CHANGED: 'password_changed',
  PROFILE_VIEWED: 'profile_viewed',
  SETTINGS_CHANGED: 'settings_changed',
  EXPORT_GENERATED: 'export_generated',
  IMPORT_PROCESSED: 'import_processed',
  BULK_ACTION_PERFORMED: 'bulk_action_performed',
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  PAGE_VIEW: 'page_view' } as const;
