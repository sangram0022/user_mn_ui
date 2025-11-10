// ========================================
// Timing Constants - Single Source of Truth
// ========================================
// Centralized timing values for consistency across the app.
// All values in milliseconds unless noted otherwise.
// ========================================

/**
 * API and network timing
 */
export const API_TIMING = {
  /** Simulated API delay for development/demo (1.5 seconds) */
  DEMO_DELAY: 1500,
  /** Standard API simulation delay (2 seconds) */
  STANDARD_DELAY: 2000,
  /** Fast API simulation delay (300ms) */
  FAST_DELAY: 300,
  /** Medium API simulation delay (500ms) */
  MEDIUM_DELAY: 500,
  /** Mock service delay (100ms) */
  MOCK_DELAY: 100,
  /** Form submission delay (1 second) */
  FORM_SUBMIT_DELAY: 1000,
} as const;

/**
 * UI feedback and animation timing
 */
export const UI_TIMING = {
  /** Toast notification display duration (3 seconds) */
  TOAST_DURATION: 3000,
  /** Success message display before redirect (3 seconds) */
  SUCCESS_REDIRECT_DELAY: 3000,
  /** Debounce delay for search/input (300ms) */
  DEBOUNCE_DELAY: 300,
  /** Throttle delay for scroll events (100ms) */
  THROTTLE_DELAY: 100,
  /** Animation duration (200ms) */
  ANIMATION_DURATION: 200,
} as const;

/**
 * Polling and refresh intervals
 */
export const INTERVAL_TIMING = {
  /** Dashboard auto-refresh (30 seconds) */
  DASHBOARD_REFRESH: 30000,
  /** Health check interval (60 seconds) */
  HEALTH_CHECK: 60000,
  /** Session check interval (1 second) */
  SESSION_CHECK: 1000,
  /** Token expiry check (1 second) */
  TOKEN_EXPIRY_CHECK: 1000,
  /** Activity tracking update (5 seconds) */
  ACTIVITY_TRACKING: 5000,
} as const;

/**
 * Timeout values
 */
export const TIMEOUT_VALUES = {
  /** API request timeout (30 seconds) */
  API_REQUEST: 30000,
  /** Session timeout warning (5 minutes) */
  SESSION_WARNING: 300000,
  /** Idle timeout (30 minutes) */
  IDLE_TIMEOUT: 1800000,
  /** Cache TTL (1 hour) */
  CACHE_TTL: 3600000,
} as const;

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  /** Maximum number of retries */
  MAX_RETRIES: 3,
  /** Initial retry delay (1 second) */
  INITIAL_DELAY: 1000,
  /** Retry backoff multiplier */
  BACKOFF_MULTIPLIER: 2,
} as const;
