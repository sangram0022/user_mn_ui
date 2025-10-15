/**
 * API Constants
 *
 * Constants for API endpoints, timeouts, retry logic, and HTTP status codes
 * @module constants/api
 */

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const HTTP_STATUS = {
  /** Success responses */
  SUCCESS: {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
  } as const,

  /** Client error responses */
  CLIENT_ERROR: {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
  } as const,

  /** Server error responses */
  SERVER_ERROR: {
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  } as const,
} as const;

// ============================================================================
// API Timeouts
// ============================================================================

export const API_TIMEOUT = {
  /** Default request timeout (30 seconds) */
  DEFAULT: 30_000,
  /** Short timeout for quick operations (5 seconds) */
  SHORT: 5_000,
  /** Long timeout for slow operations (60 seconds) */
  LONG: 60_000,
  /** File upload timeout (5 minutes) */
  UPLOAD: 5 * 60 * 1000,
} as const;

// ============================================================================
// Retry Configuration
// ============================================================================

export const RETRY_CONFIG = {
  /** Maximum retry attempts */
  MAX_ATTEMPTS: 3,
  /** Initial retry delay in milliseconds */
  INITIAL_DELAY: 1_000,
  /** Maximum retry delay in milliseconds */
  MAX_DELAY: 10_000,
  /** Exponential backoff multiplier */
  BACKOFF_MULTIPLIER: 2,
} as const;

// ============================================================================
// Rate Limiting
// ============================================================================

export const RATE_LIMIT = {
  /** Maximum requests per minute */
  MAX_REQUESTS_PER_MINUTE: 60,
  /** Maximum requests per hour */
  MAX_REQUESTS_PER_HOUR: 1_000,
  /** Burst limit (short-term spike) */
  BURST_LIMIT: 10,
} as const;
