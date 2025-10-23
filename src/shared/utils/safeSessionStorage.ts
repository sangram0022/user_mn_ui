/**
 * Safe SessionStorage Utility
 *
 * Provides safe access to sessionStorage with proper error handling for:
 * - Server-Side Rendering (SSR)
 * - Storage quota exceeded errors
 * - Storage disabled by user
 * - Private browsing modes
 *
 * @example
 * ```ts
 * import { safeSessionStorage } from '@shared/utils/safeSessionStorage';
 *
 * // Get item
 * const token = safeSessionStorage.getItem('access_token');
 *
 * // Set item
 * safeSessionStorage.setItem('access_token', 'xyz123');
 *
 * // Load auth session
 * const session = safeSessionStorage.loadAuthSession();
 *
 * // Save auth session
 * safeSessionStorage.saveAuthSession({ accessToken: 'xyz', refreshToken: 'abc' });
 * ```
 */

import { logger } from './logger';

/**
 * Authentication session stored in sessionStorage
 */
export interface StoredSession {
  accessToken: string;
  refreshToken?: string;
  issuedAt?: string;
  expiresIn?: number;
}

/**
 * Token storage keys
 */
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  TOKEN: 'token', // Legacy fallback
  REFRESH_TOKEN: 'refresh_token',
  ISSUED_AT: 'token_issued_at',
  EXPIRES_IN: 'token_expires_in',
} as const;

/**
 * Safe SessionStorage wrapper with automatic SSR handling
 */
class SafeSessionStorage {
  /**
   * Check if sessionStorage is available
   */
  private isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
  }

  /**
   * Get item from sessionStorage
   * @param key - Storage key
   * @returns Value or null if not found
   */
  getItem(key: string): string | null {
    if (!this.isAvailable()) return null;

    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      logger.warn(`[SafeSessionStorage] Failed to get item "${key}"`, { error });
      return null;
    }
  }

  /**
   * Set item in sessionStorage
   * @param key - Storage key
   * @param value - Value to store
   * @returns true if successful, false otherwise
   */
  setItem(key: string, value: string): boolean {
    if (!this.isAvailable()) return false;

    try {
      window.sessionStorage.setItem(key, value);
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        logger.error(
          `[SafeSessionStorage] Storage quota exceeded for key: ${key}`,
          error instanceof Error ? error : new Error('QuotaExceededError')
        );
      } else {
        logger.warn(`[SafeSessionStorage] Failed to set item "${key}"`, { error });
      }
      return false;
    }
  }

  /**
   * Remove item from sessionStorage
   * @param key - Storage key
   * @returns true if successful, false otherwise
   */
  removeItem(key: string): boolean {
    if (!this.isAvailable()) return false;

    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.warn(`[SafeSessionStorage] Failed to remove item "${key}"`, { error });
      return false;
    }
  }

  /**
   * Clear all sessionStorage
   * @returns true if successful, false otherwise
   */
  clear(): boolean {
    if (!this.isAvailable()) return false;

    try {
      window.sessionStorage.clear();
      return true;
    } catch (error) {
      logger.error(
        '[SafeSessionStorage] Failed to clear sessionStorage',
        error instanceof Error ? error : new Error('Failed to clear sessionStorage')
      );
      return false;
    }
  }

  /**
   * Get storage key by index
   * @param index - Index of key
   * @returns Key name or null
   */
  key(index: number): string | null {
    if (!this.isAvailable()) return null;

    try {
      return window.sessionStorage.key(index);
    } catch (error) {
      logger.warn(`[SafeSessionStorage] Failed to get key at index ${index}`, { error });
      return null;
    }
  }

  /**
   * Get number of items in sessionStorage
   */
  get length(): number {
    if (!this.isAvailable()) return 0;

    try {
      return window.sessionStorage.length;
    } catch (error) {
      logger.warn('[SafeSessionStorage] Failed to get sessionStorage length', { error });
      return 0;
    }
  }

  /**
   * Check if sessionStorage is actually available
   */
  get available(): boolean {
    return this.isAvailable();
  }

  /**
   * Get item and parse as JSON
   * @param key - Storage key
   * @returns Parsed object or null
   */
  getJSON<T = unknown>(key: string): T | null {
    const value = this.getItem(key);
    if (value === null) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      logger.warn(`[SafeSessionStorage] Failed to parse JSON for key "${key}"`, { error });
      return null;
    }
  }

  /**
   * Set item as JSON
   * @param key - Storage key
   * @param value - Value to stringify and store
   * @returns true if successful, false otherwise
   */
  setJSON<T = unknown>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      return this.setItem(key, serialized);
    } catch (error) {
      logger.error(
        `[SafeSessionStorage] Failed to stringify JSON for key "${key}"`,
        error instanceof Error ? error : new Error('Failed to stringify JSON')
      );
      return false;
    }
  }

  // ============================================================================
  // AUTHENTICATION SESSION HELPERS
  // ============================================================================

  /**
   * Load authentication session from sessionStorage
   * @returns Stored session or null if not found
   */
  loadAuthSession(): StoredSession | null {
    const accessToken =
      this.getItem(TOKEN_KEYS.ACCESS_TOKEN) ?? this.getItem(TOKEN_KEYS.TOKEN) ?? null;

    if (!accessToken) return null;

    const refreshToken = this.getItem(TOKEN_KEYS.REFRESH_TOKEN) ?? undefined;
    const issuedAt = this.getItem(TOKEN_KEYS.ISSUED_AT) ?? undefined;
    const expiresInString = this.getItem(TOKEN_KEYS.EXPIRES_IN);
    const expiresIn = expiresInString ? Number(expiresInString) : undefined;

    return { accessToken, refreshToken, issuedAt, expiresIn };
  }

  /**
   * Save authentication session to sessionStorage
   * @param session - Session to save, or null to clear
   * @returns true if successful, false otherwise
   */
  saveAuthSession(session: StoredSession | null): boolean {
    if (!session) {
      // Clear all auth tokens
      this.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
      this.removeItem(TOKEN_KEYS.TOKEN);
      this.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
      this.removeItem(TOKEN_KEYS.ISSUED_AT);
      this.removeItem(TOKEN_KEYS.EXPIRES_IN);
      return true;
    }

    // Save tokens
    this.setItem(TOKEN_KEYS.ACCESS_TOKEN, session.accessToken);
    this.setItem(TOKEN_KEYS.TOKEN, session.accessToken); // Legacy fallback

    if (session.refreshToken) {
      this.setItem(TOKEN_KEYS.REFRESH_TOKEN, session.refreshToken);
    } else {
      this.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    }

    if (session.issuedAt) {
      this.setItem(TOKEN_KEYS.ISSUED_AT, session.issuedAt);
    }

    if (typeof session.expiresIn === 'number') {
      this.setItem(TOKEN_KEYS.EXPIRES_IN, String(session.expiresIn));
    }

    return true;
  }

  /**
   * Clear authentication session
   * @returns true if successful, false otherwise
   */
  clearAuthSession(): boolean {
    return this.saveAuthSession(null);
  }
}

/**
 * Export singleton instance
 */
export const safeSessionStorage = new SafeSessionStorage();

/**
 * For testing or custom implementations
 */
export { SafeSessionStorage, TOKEN_KEYS };
