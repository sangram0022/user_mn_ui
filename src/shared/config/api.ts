// Centralized API Configuration
// Single source of truth for all backend URLs

export const BACKEND_CONFIG = {
  // Backend Base URL - Change this single value to update entire app
  BASE_URL: import.meta.env['VITE_BACKEND_URL'] || 'http://127.0.0.1:8000',
  API_BASE_URL: import.meta.env.DEV 
    ? '/api/v1'  // Use proxy in development
    : (import.meta.env['VITE_BACKEND_URL'] 
        ? `${import.meta.env['VITE_BACKEND_URL']}/api/v1`
        : 'http://127.0.0.1:8000/api/v1'),
  
  // For development with proxy
  USE_PROXY: import.meta.env.DEV,
  
  // Timeout settings
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Get the appropriate base URL based on environment
export const getApiBaseUrl = (): string => { if (BACKEND_CONFIG.USE_PROXY && import.meta.env.DEV) {
    return '/api/v1'; // Use proxy in development
  }
  return BACKEND_CONFIG.API_BASE_URL; // Use absolute URL in production
};

// API Endpoints - All endpoints from backend_api.json
export const API_ENDPOINTS = { // Authentication Endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login', 
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    HEALTH: '/auth/health',
  },
  
  // User Management Endpoints
  USERS: {
    BASE: '/users/',
    BY_ID: (id: string) => `/users/${id}`,
    ME: '/users/me',
    PASSWORD_RESET_REQUEST: '/users/password-reset/request',
    PASSWORD_RESET_CONFIRM: '/users/password-reset/confirm',
    CHANGE_PASSWORD: '/users/change-password',
  },
  
  // Admin Endpoints
  ADMIN: { STATS: '/admin/stats',
    HEALTH: '/admin/health',
  },
  
  // Health Monitoring Endpoints
  HEALTH: { BASIC: '/health/',
    DETAILED: '/health/detailed',
    METRICS: '/health/metrics',
    PERFORMANCE: '/health/performance',
    DATABASE: '/health/database',
    CACHE: '/health/cache',
    ALERTS: '/health/alerts',
    CONFIGURATION: '/health/configuration',
    API: '/health',
  },
  
  // Root Endpoints
  ROOT: '/',
} as const;

// Build full URL for an endpoint
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
};

// Environment detection
export const isProduction = (): boolean => import.meta.env.PROD;
export const isDevelopment = (): boolean => import.meta.env.DEV;

export default BACKEND_CONFIG;
