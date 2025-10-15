/**
 * Session Management Constants
 *
 * Constants for session timeout, warnings, and lifecycle
 * @module constants/session
 */

// ============================================================================
// Session Timeout
// ============================================================================

export const SESSION_TIMEOUT = {
  /** Maximum inactive time before session expires (30 minutes) */
  MAX_INACTIVE_TIME: 30 * 60 * 1000,
  /** Warning time before session expiry (5 minutes) */
  WARNING_TIME: 5 * 60 * 1000,
  /** Interval to check session status (30 seconds) */
  CHECK_INTERVAL: 30 * 1000,
} as const;

// ============================================================================
// Session Storage Keys
// ============================================================================

export const SESSION_STORAGE_KEYS = {
  /** Access token key */
  ACCESS_TOKEN: 'access_token',
  /** Refresh token key */
  REFRESH_TOKEN: 'refresh_token',
  /** User profile key */
  USER_PROFILE: 'user_profile',
  /** Last activity timestamp key */
  LAST_ACTIVITY: 'last_activity',
  /** Session ID key */
  SESSION_ID: 'session_id',
  /** Debug flag key */
  DEBUG_FLAG: 'DEBUG_USER_MANAGEMENT',
} as const;

// ============================================================================
// Session ID Generation
// ============================================================================

export const SESSION_ID = {
  /** Random string length for session ID */
  RANDOM_LENGTH: 9,
  /** Base for random string generation */
  RANDOM_BASE: 36,
  /** Substring start position */
  SUBSTR_START: 2,
} as const;
