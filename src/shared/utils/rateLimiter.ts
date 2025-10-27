/**
 * Rate Limiter Utility
 *
 * Provides client-side rate limiting to prevent abuse and improve UX.
 * Tracks request attempts and enforces time-based limits.
 *
 * Security Features:
 * - Prevents brute force attacks
 * - Limits API request frequency
 * - Improves user experience with clear feedback
 *
 * @example
 * if (!rateLimiter.canMakeRequest('login', 5, 60000)) {
 *   toast.error('Too many attempts. Please wait.');
 *   return;
 * }
 */

/**
 * Rate limiter for client-side request throttling
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Check if a request can be made based on rate limits
   *
   * @param key - Unique identifier for the action (e.g., 'login', 'submit-form')
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if request can be made, false if rate limit exceeded
   *
   * @example
   * // Allow max 5 login attempts per minute
   * if (!rateLimiter.canMakeRequest('login', 5, 60000)) {
   *   toast.error('Too many login attempts. Please wait 1 minute.');
   *   return;
   * }
   */
  canMakeRequest(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove requests outside the time window
    const validRequests = requests.filter((timestamp) => now - timestamp < windowMs);

    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);

    return true;
  }

  /**
   * Get time until next request is allowed
   *
   * @param key - Unique identifier for the action
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Milliseconds until next request allowed, or 0 if allowed now
   *
   * @example
   * const waitTime = rateLimiter.getWaitTime('login', 5, 60000);
   * if (waitTime > 0) {
   *   toast.error(`Please wait ${Math.ceil(waitTime / 1000)} seconds`);
   * }
   */
  getWaitTime(key: string, maxRequests: number, windowMs: number): number {
    const requests = this.requests.get(key) || [];
    if (requests.length < maxRequests) {
      return 0;
    }

    const now = Date.now();
    const oldestRequest = requests[0];
    const waitTime = windowMs - (now - oldestRequest);

    return Math.max(0, waitTime);
  }

  /**
   * Get remaining requests before rate limit
   *
   * @param key - Unique identifier for the action
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Number of requests remaining
   */
  getRemainingRequests(key: string, maxRequests: number, windowMs: number): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter((timestamp) => now - timestamp < windowMs);

    return Math.max(0, maxRequests - validRequests.length);
  }

  /**
   * Reset rate limit for a specific key
   *
   * @param key - Unique identifier to reset
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limit data
   */
  clear(): void {
    this.requests.clear();
  }
}

/**
 * Singleton rate limiter instance
 */
export const rateLimiter = new RateLimiter();

/**
 * Common rate limit configurations
 */
export const RATE_LIMITS = {
  /** Login attempts: 5 per minute */
  LOGIN: { maxRequests: 5, windowMs: 60_000 },

  /** Password reset: 3 per hour */
  PASSWORD_RESET: { maxRequests: 3, windowMs: 3_600_000 },

  /** Form submission: 10 per minute */
  FORM_SUBMIT: { maxRequests: 10, windowMs: 60_000 },

  /** Search requests: 20 per minute */
  SEARCH: { maxRequests: 20, windowMs: 60_000 },

  /** API requests: 60 per minute */
  API_REQUEST: { maxRequests: 60, windowMs: 60_000 },

  /** File upload: 5 per 5 minutes */
  FILE_UPLOAD: { maxRequests: 5, windowMs: 300_000 },
} as const;

/**
 * React hook for rate-limited actions
 * React 19: Removed useCallback - compiler handles memoization automatically
 *
 * @param key - Unique identifier for the action
 * @param config - Rate limit configuration
 * @returns Object with canExecute flag and execute function
 *
 * @example
 * const { canExecute, execute, remaining } = useRateLimitedAction('login', RATE_LIMITS.LOGIN);
 *
 * const handleLogin = () => {
 *   execute(() => {
 *     // Login logic here
 *     loginMutation.mutate({ email, password });
 *   });
 * };
 */
export function useRateLimitHook(key: string, config: { maxRequests: number; windowMs: number }) {
  const [canExecute, setCanExecute] = React.useState(true);
  const [remaining, setRemaining] = React.useState(config.maxRequests);
  const [waitTime, setWaitTime] = React.useState(0);

  // React 19: Removed useCallback - compiler handles memoization automatically
  const updateState = () => {
    const allowed = rateLimiter.canMakeRequest(key, config.maxRequests, config.windowMs);
    const remainingRequests = rateLimiter.getRemainingRequests(
      key,
      config.maxRequests,
      config.windowMs
    );
    const wait = rateLimiter.getWaitTime(key, config.maxRequests, config.windowMs);

    setCanExecute(allowed);
    setRemaining(remainingRequests);
    setWaitTime(wait);

    return allowed;
  };

  // React 19: Removed useCallback - compiler handles memoization automatically
  const execute = (action: () => void | Promise<void>) => {
    if (updateState()) {
      return action();
    }
  };

  React.useEffect(() => {
    updateState();
  }, [key, config.maxRequests, config.windowMs]);

  return {
    canExecute,
    remaining,
    waitTime,
    waitTimeSeconds: Math.ceil(waitTime / 1000),
    execute,
    reset: () => rateLimiter.reset(key),
  };
}

// React import
import React from 'react';
