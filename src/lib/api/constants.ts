/**
 * API-related constants and configuration
 * Re-exports from consolidated constants
 * @deprecated Import directly from ../../shared/config/constants
 */

import { API, ERROR_MESSAGES as ERRORS } from '../../shared/config/constants';

// Re-export for backward compatibility
export const API_CONFIG = {
  BASE_URL: API.BASE_URL,
  TIMEOUT: API.TIMEOUT.DEFAULT,
  RETRY_ATTEMPTS: API.RETRY.ATTEMPTS,
  RETRY_DELAY: API.RETRY.DELAY,
};

export const API_ENDPOINTS = {
  ...API.ENDPOINTS.AUTH,
  // User endpoints
  USERS: API.ENDPOINTS.USERS.LIST,
  USER_BY_ID: API.ENDPOINTS.USERS.DETAIL,
  USER_PROFILE: API.ENDPOINTS.USERS.PROFILE,
  USER_ANALYTICS: API.ENDPOINTS.USERS.ANALYTICS,
  USER_BULK_ACTIONS: '/users/bulk-actions',
  // Upload endpoints
  UPLOAD_AVATAR: API.ENDPOINTS.FILES.UPLOAD_AVATAR,
  UPLOAD_DOCUMENTS: API.ENDPOINTS.FILES.UPLOAD_DOCUMENTS,
};

export const ERROR_MESSAGES = ERRORS;
