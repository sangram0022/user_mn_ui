/**
 * Application-wide constants and configuration
 */

// Application metadata
export const APP_CONFIG = { name: 'User Management System',
  version: '1.0.0',
  description: 'Modern React TypeScript User Management Application',
  author: 'Your Organization', } as const;

// API Configuration
export const API_CONFIG = { baseUrl: import.meta.env['VITE_API_BASE_URL'] || '/api/v1',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000, } as const;

// Authentication Configuration
export const AUTH_CONFIG = { tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'user_data',
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  refreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry } as const;

// UI Configuration
export const UI_CONFIG = { defaultPageSize: 10,
  maxPageSize: 100,
  debounceDelay: 300,
  toastDuration: 5000,
  loadingMinDuration: 500, } as const;

// Validation Rules
export const VALIDATION_RULES = { email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  password: { minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
  },
  name: { minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s-']+$/,
    message: 'Name must contain only letters, spaces, hyphens, and apostrophes',
  },
  username: { minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
    message: 'Username must contain only letters, numbers, underscores, and hyphens',
  },
} as const;

// Feature Flags
export const FEATURE_FLAGS = { enableDarkMode: import.meta.env['VITE_ENABLE_DARK_MODE'] === 'true',
  enableAnalytics: import.meta.env['VITE_ENABLE_ANALYTICS'] === 'true',
  enableNotifications: import.meta.env['VITE_ENABLE_NOTIFICATIONS'] === 'true',
  enableExperimentalFeatures: import.meta.env['VITE_ENABLE_EXPERIMENTAL'] === 'true',
  enableErrorReporting: import.meta.env['VITE_ENABLE_ERROR_REPORTING'] === 'true', } as const;

// Date and Time Formats
export const DATE_FORMATS = { display: 'MMM dd, yyyy',
  displayWithTime: 'MMM dd, yyyy HH:mm',
  iso: 'yyyy-MM-dd',
  isoWithTime: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  relative: 'relative', } as const;

// File Upload Configuration
export const FILE_UPLOAD_CONFIG = { maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  maxFiles: 5, } as const;

// User Roles and Permissions
export const USER_ROLES = { ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user', } as const;

export const PERMISSIONS = { // User permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Admin permissions
  ADMIN_PANEL: 'admin:panel',
  ADMIN_USERS: 'admin:users',
  ADMIN_SYSTEM: 'admin:system',
  
  // Moderation permissions
  MODERATE_CONTENT: 'moderate:content',
  MODERATE_REPORTS: 'moderate:reports', } as const;

// Role-based permissions mapping
export const ROLE_PERMISSIONS = { [USER_ROLES.ADMIN]: [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ADMIN_PANEL,
    PERMISSIONS.ADMIN_USERS,
    PERMISSIONS.ADMIN_SYSTEM,
    PERMISSIONS.MODERATE_CONTENT,
    PERMISSIONS.MODERATE_REPORTS,
  ],
  [USER_ROLES.MODERATOR]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.MODERATE_CONTENT,
    PERMISSIONS.MODERATE_REPORTS,
  ],
  [USER_ROLES.USER]: [
    PERMISSIONS.USER_READ,
  ], } as const;

// Error Messages
export const ERROR_MESSAGES = { NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.', } as const;

// Success Messages
export const SUCCESS_MESSAGES = { LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  PASSWORD_RESET_SUCCESS: 'Password reset email sent!',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully!',
  SETTINGS_SAVE_SUCCESS: 'Settings saved successfully!', } as const;

// Routes
export const ROUTES = { HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  USERS: '/users',
  ADMIN: '/admin',
  NOT_FOUND: '/404', } as const;

// Local Storage Keys
export const STORAGE_KEYS = { AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  PREFERENCES: 'user_preferences', } as const;

// Theme Configuration
export const THEME_CONFIG = { colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a',
    },
    secondary: { 50: '#f9fafb',
      100: '#f3f4f6',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      900: '#111827',
    },
  },
  breakpoints: { sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Component Sizes
export const COMPONENT_SIZES = { SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large', } as const;

// Component Variants
export const COMPONENT_VARIANTS = { PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info', } as const;

// Type exports for better TypeScript support
export type AppConfig = typeof APP_CONFIG;
export type ApiConfig = typeof API_CONFIG;
export type AuthConfig = typeof AUTH_CONFIG;
export type UIConfig = typeof UI_CONFIG;
export type ValidationRules = typeof VALIDATION_RULES;
export type FeatureFlags = typeof FEATURE_FLAGS;
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type Route = typeof ROUTES[keyof typeof ROUTES];
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type ComponentSize = typeof COMPONENT_SIZES[keyof typeof COMPONENT_SIZES];
export type ComponentVariant = typeof COMPONENT_VARIANTS[keyof typeof COMPONENT_VARIANTS];