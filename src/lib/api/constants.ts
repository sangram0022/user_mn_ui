/**
 * API-related constants and configuration
 */

export const API_CONFIG = { BASE_URL: import.meta.env['VITE_API_BASE_URL'] || '/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, };

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  CHANGE_PASSWORD: '/auth/change-password',
  
  // User endpoints
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_PROFILE: '/users/profile',
  USER_ANALYTICS: '/users/analytics',
  USER_BULK_ACTIONS: '/users/bulk-actions',
  
  // Upload endpoints
  UPLOAD_AVATAR: '/upload/avatar',
  UPLOAD_DOCUMENTS: '/upload/documents',
};

export const ERROR_MESSAGES = { NETWORK: 'Network error occurred. Please check your connection.',
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  TIMEOUT: 'Request timeout. Please try again.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  UNKNOWN: 'An unexpected error occurred.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
  VALIDATION_ERROR: 'Validation failed. Please check your input.', };