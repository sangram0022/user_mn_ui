import { logger } from './../utils/logger';

// Centralized Backend Configuration
// Single source of truth for all backend API URLs

/**
 * Get backend configuration from environment variables with defaults
 */
const getBackendConfig = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8001';
  const url = new URL(backendUrl);

  return {
    PROTOCOL: url.protocol.replace(':', ''),
    HOST: url.hostname,
    PORT: url.port ? parseInt(url.port) : null,
    API_PREFIX: '/api/v1',
  };
};

/**
 * Backend Server Configuration
 * Change these values to point to different environments
 */
export const BACKEND_SERVER_CONFIG = {
  // Development Configuration
  DEV: {
    PROTOCOL: 'http',
    HOST: 'localhost',
    PORT: 5173,
    API_PREFIX: '/api/v1',
  },

  // Production Configuration (when deployed)
  PROD: { PROTOCOL: 'https', HOST: 'your-domain.com', PORT: null, API_PREFIX: '/api/v1' },

  // Direct Backend (for testing) - Uses environment variables
  DIRECT: getBackendConfig(),
} as const;

/**
 * Current Environment - Change this to switch environments
 */
const CURRENT_ENV = 'DIRECT'; // Force direct backend for testing

/**
 * Get the complete backend URL based on current environment
 */
export const getBackendUrl = (): string => {
  const config = BACKEND_SERVER_CONFIG[CURRENT_ENV];
  const portSuffix = config.PORT ? `:${config.PORT}` : '';
  return `${config.PROTOCOL}://${config.HOST}${portSuffix}${config.API_PREFIX}`;
};

/**
 * Backend API Base URL - Used throughout the application
 */
export const API_BASE_URL = getBackendUrl();

/**
 * Health Check URL
 */
export const HEALTH_CHECK_URL = `${API_BASE_URL.replace('/api/v1', '/api/v1/health')}`;

/**
 * Common API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    ME: '/users/me',
    CHANGE_PASSWORD: '/users/change-password',
  },

  // Roles
  ROLES: {
    BASE: '/roles',
    BY_ID: (id: string) => `/roles/${id}`,
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
  },

  // System
  SYSTEM: { HEALTH: '/health', STATUS: '/status' },
} as const;

/**
 * Debug information
 */
export const getApiDebugInfo = () => {
  logger.info('[INFO] API Configuration Debug:');
  logger.info('Current Environment', { env: CURRENT_ENV });
  logger.info('API Base URL', { url: API_BASE_URL });
  logger.info('Health Check URL', { url: HEALTH_CHECK_URL });
  logger.info('Full Config', { config: BACKEND_SERVER_CONFIG[CURRENT_ENV] });
};

// Auto-log configuration in development
if (import.meta.env.DEV) {
  getApiDebugInfo();
}
