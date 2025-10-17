/**
 * Centralized constants barrel export
 *
 * ALL CONSTANTS HAVE BEEN CONSOLIDATED into ../config/constants.ts
 * This file maintains backward compatibility by re-exporting from the consolidated file.
 *
 * @deprecated Import directly from '../config/constants' instead
 * @module constants
 */

// Re-export everything from the consolidated constants file
export * from '../config/constants';

// Legacy re-exports for backward compatibility
export {
  ANIMATION,
  API_TIMEOUT,
  HTTP_STATUS as HTTP_STATUS_CODES,
  LAYOUT,
  RATE_LIMIT,
  RETRY_CONFIG,
  SESSION_STORAGE_KEYS,
  SESSION_TIMEOUT,
  TOAST,
  VIRTUAL_SCROLL,
} from '../config/constants';

// Deprecated: these are now in ../config/constants
export const APP_NAME = 'User Management System';
export const DEFAULT_LANGUAGE = 'en';
