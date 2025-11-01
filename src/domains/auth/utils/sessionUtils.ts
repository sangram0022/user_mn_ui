// ========================================
// Session Utilities
// Session management and persistence helpers
// ========================================

import { isTokenExpired as checkTokenExpiration } from '../services/tokenService';

/**
 * Session storage keys
 */
export const SESSION_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  TOKEN_EXPIRES_AT: 'token_expires_at',
  LAST_ACTIVITY: 'last_activity',
  REMEMBER_ME: 'remember_me',
  CSRF_TOKEN: 'csrf_token',
} as const;

/**
 * Session timeout duration in milliseconds
 */
export const SESSION_TIMEOUT = {
  IDLE: 30 * 60 * 1000, // 30 minutes
  ABSOLUTE: 24 * 60 * 60 * 1000, // 24 hours
  REMEMBER_ME: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

/**
 * Update last activity timestamp
 * Used to track user activity for idle timeout
 */
export function updateLastActivity(): void {
  localStorage.setItem(SESSION_KEYS.LAST_ACTIVITY, Date.now().toString());
}

/**
 * Get last activity timestamp
 * 
 * @returns Last activity time in milliseconds, or null if not found
 */
export function getLastActivity(): number | null {
  const timestamp = localStorage.getItem(SESSION_KEYS.LAST_ACTIVITY);
  return timestamp ? parseInt(timestamp, 10) : null;
}

/**
 * Check if session is idle (no activity for specified duration)
 * 
 * @param timeoutMs - Idle timeout in milliseconds (default: 30 minutes)
 * @returns True if session is idle
 * 
 * @example
 * ```ts
 * if (isSessionIdle()) {
 *   // Show "You've been idle" warning
 *   // Or auto-logout
 * }
 * ```
 */
export function isSessionIdle(timeoutMs: number = SESSION_TIMEOUT.IDLE): boolean {
  const lastActivity = getLastActivity();
  
  if (!lastActivity) {
    return false; // No activity tracked yet
  }

  const now = Date.now();
  const timeSinceActivity = now - lastActivity;
  
  return timeSinceActivity > timeoutMs;
}

/**
 * Check if "remember me" is enabled
 * 
 * @returns True if remember me is enabled
 */
export function isRememberMeEnabled(): boolean {
  const rememberMe = localStorage.getItem(SESSION_KEYS.REMEMBER_ME);
  return rememberMe === 'true';
}

/**
 * Set "remember me" preference
 * 
 * @param enabled - Whether to remember the user
 */
export function setRememberMe(enabled: boolean): void {
  if (enabled) {
    localStorage.setItem(SESSION_KEYS.REMEMBER_ME, 'true');
  } else {
    localStorage.removeItem(SESSION_KEYS.REMEMBER_ME);
  }
}

/**
 * Clear all session data
 * Removes tokens, user data, and session metadata
 */
export function clearSession(): void {
  const keys = Object.values(SESSION_KEYS);
  keys.forEach(key => localStorage.removeItem(key));
}

/**
 * Get session timeout duration based on "remember me" setting
 * 
 * @returns Timeout in milliseconds
 */
export function getSessionTimeout(): number {
  return isRememberMeEnabled() 
    ? SESSION_TIMEOUT.REMEMBER_ME 
    : SESSION_TIMEOUT.ABSOLUTE;
}

/**
 * Check if session has expired
 * Delegates to tokenService for consistent expiration logic
 * 
 * @returns True if session expired
 */
export function isSessionExpired(): boolean {
  return checkTokenExpiration();
}

/**
 * Get time until session expires
 * 
 * @returns Milliseconds until expiration, or 0 if expired
 */
export function getSessionTimeRemaining(): number {
  const expiresAt = localStorage.getItem(SESSION_KEYS.TOKEN_EXPIRES_AT);
  
  if (!expiresAt) {
    return 0;
  }

  const expirationTime = parseInt(expiresAt, 10);
  const now = Date.now();
  const remaining = expirationTime - now;
  
  return Math.max(0, remaining);
}

/**
 * Format time remaining into human-readable string
 * 
 * @param milliseconds - Time in milliseconds
 * @returns Formatted string (e.g., "5 minutes", "2 hours")
 * 
 * @example
 * ```ts
 * const remaining = getSessionTimeRemaining();
 * console.log(formatTimeRemaining(remaining)); // "15 minutes"
 * ```
 */
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) {
    return 'Expired';
  }

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
}

/**
 * Initialize session activity tracking
 * Sets up event listeners for user activity
 * 
 * @example
 * ```ts
 * // In your App.tsx or main component
 * useEffect(() => {
 *   const cleanup = initActivityTracking();
 *   return cleanup;
 * }, []);
 * ```
 */
export function initActivityTracking(): () => void {
  const updateActivity = () => updateLastActivity();

  // Track various user activities
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  
  events.forEach(event => {
    window.addEventListener(event, updateActivity);
  });

  // Initial activity timestamp
  updateLastActivity();

  // Return cleanup function
  return () => {
    events.forEach(event => {
      window.removeEventListener(event, updateActivity);
    });
  };
}

/**
 * Check session health
 * Performs comprehensive session validation
 * 
 * @returns Object with session health status
 * 
 * @example
 * ```ts
 * const health = checkSessionHealth();
 * if (!health.isValid) {
 *   console.log('Session issues:', health.issues);
 * }
 * ```
 */
export function checkSessionHealth(): {
  isValid: boolean;
  issues: string[];
  expiresIn: number;
  isIdle: boolean;
} {
  const issues: string[] = [];
  const expiresIn = getSessionTimeRemaining();
  const idle = isSessionIdle();

  // Check for tokens
  const accessToken = localStorage.getItem(SESSION_KEYS.ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(SESSION_KEYS.REFRESH_TOKEN);

  if (!accessToken) {
    issues.push('No access token found');
  }

  if (!refreshToken) {
    issues.push('No refresh token found');
  }

  // Check expiration
  if (isSessionExpired()) {
    issues.push('Session has expired');
  }

  // Check idle status
  if (idle) {
    issues.push('Session is idle');
  }

  // Check for user data
  const user = localStorage.getItem(SESSION_KEYS.USER);
  if (!user) {
    issues.push('No user data found');
  }

  return {
    isValid: issues.length === 0,
    issues,
    expiresIn,
    isIdle: idle,
  };
}

/**
 * Migrate session from old storage format
 * Useful when updating storage key structure
 * 
 * @param oldKey - Old storage key
 * @param newKey - New storage key
 */
export function migrateSessionKey(oldKey: string, newKey: string): void {
  const value = localStorage.getItem(oldKey);
  
  if (value) {
    localStorage.setItem(newKey, value);
    localStorage.removeItem(oldKey);
  }
}
