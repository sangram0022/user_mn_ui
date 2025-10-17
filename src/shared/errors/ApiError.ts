/**
 * Canonical API Error Class
 *
 * Single source of truth for API errors across the application.
 * Combines features from all previous ApiError implementations.
 */

export interface ApiErrorInit {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
  errors?: Record<string, unknown>;
  headers?: Headers | Record<string, string>;
  timestamp?: string;
  requestId?: string;
  payload?: unknown;
}

/**
 * Rich HTTP error object for API responses.
 *
 * Captures comprehensive error metadata including:
 * - HTTP status code
 * - Error code for programmatic handling
 * - Detailed error information
 * - Correlation IDs for request tracking
 * - Retry hints from headers
 *
 * @example
 * ```ts
 * // Create from response
 * const error = ApiError.fromResponse(response, await response.json());
 *
 * // Check error type
 * if (error.isAuthError()) {
 *   // Handle authentication error
 * }
 * ```
 */
export class ApiError extends Error {
  /** HTTP status code (e.g., 404, 500) */
  public readonly status: number;

  /** Application-specific error code */
  public readonly code?: string;

  /** Additional error details */
  public readonly details?: unknown;

  /** Validation errors by field */
  public readonly errors?: Record<string, unknown>;

  /** Response headers */
  public readonly headers: Record<string, string>;

  /** Seconds to wait before retrying */
  public readonly retryAfterSeconds?: number;

  /** ISO timestamp of when error occurred */
  public readonly timestamp: string;

  /** Request correlation ID for tracing */
  public readonly requestId?: string;

  /** Original payload that caused the error */
  public readonly payload?: unknown;

  constructor(init: ApiErrorInit) {
    super(init.message);

    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.details = init.details;
    this.errors = init.errors;
    this.payload = init.payload;

    this.headers = ApiError.normalizeHeaders(init.headers);
    this.retryAfterSeconds = ApiError.parseRetryAfter(this.headers['retry-after']);
    this.timestamp = init.timestamp ?? new Date().toISOString();
    this.requestId =
      init.requestId ?? this.headers['x-request-id'] ?? this.headers['x-correlation-id'];

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Create ApiError from Response object
   */
  static fromResponse(response: Response, data?: unknown): ApiError {
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? String(data.message)
        : response.statusText || 'Request failed';

    const code =
      typeof data === 'object' && data !== null && 'error_code' in data
        ? String(data.error_code)
        : typeof data === 'object' && data !== null && 'code' in data
          ? String(data.code)
          : undefined;

    const errors =
      typeof data === 'object' && data !== null && 'errors' in data
        ? (data.errors as Record<string, unknown>)
        : undefined;

    const details =
      typeof data === 'object' && data !== null && 'details' in data ? data.details : undefined;

    return new ApiError({
      status: response.status,
      message,
      code,
      errors,
      details,
      headers: response.headers,
    });
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Check if error is authentication related (401, 403)
   */
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if error is a validation error (400, 422)
   */
  isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }

  /**
   * Check if error is a not found error (404)
   */
  isNotFoundError(): boolean {
    return this.status === 404;
  }

  /**
   * Check if request should be retried
   */
  isRetryable(): boolean {
    // Retry on server errors and rate limiting
    return this.isServerError() || this.status === 429 || this.status === 503;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    if (this.isAuthError()) {
      return 'Authentication required. Please log in again.';
    }

    if (this.isNotFoundError()) {
      return 'The requested resource was not found.';
    }

    if (this.isServerError()) {
      return 'Server error occurred. Please try again later.';
    }

    return this.message || 'An error occurred. Please try again.';
  }

  /**
   * Normalize headers to Record<string, string>
   */
  private static normalizeHeaders(
    headers?: Headers | Record<string, string>
  ): Record<string, string> {
    if (!headers) {
      return {};
    }

    if (typeof Headers !== 'undefined' && headers instanceof Headers) {
      const normalized: Record<string, string> = {};
      headers.forEach((value, key) => {
        normalized[key.toLowerCase()] = value;
      });
      return normalized;
    }

    // Convert keys to lowercase for consistent access
    const normalized: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
      normalized[key.toLowerCase()] = value;
    });
    return normalized;
  }

  /**
   * Parse Retry-After header value
   */
  private static parseRetryAfter(value?: string): number | undefined {
    if (!value) {
      return undefined;
    }

    // Try parsing as seconds (numeric value)
    const seconds = Number.parseInt(value, 10);
    if (!Number.isNaN(seconds)) {
      return seconds;
    }

    // Try parsing as HTTP date
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      const now = Date.now();
      const retryTime = date.getTime();
      return Math.max(0, Math.ceil((retryTime - now) / 1000));
    }

    return undefined;
  }

  /**
   * Convert error to JSON for logging/reporting
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
      errors: this.errors,
      timestamp: this.timestamp,
      requestId: this.requestId,
      retryAfterSeconds: this.retryAfterSeconds,
    };
  }
}

/**
 * Type guard to check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Handle unknown errors and convert to ApiError
 */
export function handleApiError(error: unknown): ApiError {
  // Already an ApiError
  if (error instanceof ApiError) {
    return error;
  }

  // Error with response property (axios-style)
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null
  ) {
    const response = error.response as { status?: number; data?: unknown; statusText?: string };

    return new ApiError({
      status: response.status ?? 500,
      message:
        typeof response.data === 'object' && response.data !== null && 'message' in response.data
          ? String(response.data.message)
          : (response.statusText ?? 'Request failed'),
      code:
        typeof response.data === 'object' && response.data !== null && 'code' in response.data
          ? String(response.data.code)
          : undefined,
      details: response.data,
    });
  }

  // Network error (request made but no response)
  if (typeof error === 'object' && error !== null && 'request' in error && !('response' in error)) {
    return new ApiError({
      status: 0,
      message: 'Network error: Unable to reach the server',
      code: 'NETWORK_ERROR',
    });
  }

  // Generic Error object
  if (error instanceof Error) {
    return new ApiError({
      status: 500,
      message: error.message || 'An unknown error occurred',
      code: 'UNKNOWN_ERROR',
    });
  }

  // Fallback for anything else
  return new ApiError({
    status: 500,
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    details: error,
  });
}
