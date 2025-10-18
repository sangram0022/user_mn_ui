/**
 * CSRF Token Service - Enterprise-Grade CSRF Protection
 *
 * Implements secure CSRF token management for XSS and CSRF attack prevention.
 * Features:
 * - Secure token generation and storage
 * - Token expiration handling (1 hour default)
 * - Automatic token refresh before expiration
 * - Integration with httpOnly cookies
 * - Per-request token injection
 *
 * @author Security Team
 * @version 1.0.0
 */

import { logger } from '@shared/utils/logger';

const CSRF_CONFIG = {
  STORAGE_KEY: 'csrf_token',
  EXPIRY_KEY: 'csrf_token_expiry',
  TOKEN_TTL_MS: 3600 * 1000, // 1 hour (matches backend)
  REFRESH_THRESHOLD_MS: 5 * 60 * 1000, // Refresh 5 minutes before expiry
  HEADER_NAME: 'X-CSRF-Token',
  MIN_TOKEN_LENGTH: 20,
} as const;

interface CSRFTokenData {
  token: string;
  expiresAt: number;
  issuedAt: number;
}

/**
 * CSRF Token Service - Main API
 */
export class CSRFTokenService {
  private static instance: CSRFTokenService;
  private currentToken: CSRFTokenData | null = null;
  private refreshPromise: Promise<void> | null = null;
  private apiBaseUrl: string;

  private constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.loadStoredToken();
  }

  static getInstance(apiBaseUrl: string): CSRFTokenService {
    if (!CSRFTokenService.instance) {
      CSRFTokenService.instance = new CSRFTokenService(apiBaseUrl);
    }
    return CSRFTokenService.instance;
  }

  /**
   * Load token from sessionStorage
   */
  private loadStoredToken(): void {
    try {
      if (typeof window === 'undefined') return;

      const storedToken = window.sessionStorage.getItem(CSRF_CONFIG.STORAGE_KEY);
      const storedExpiry = window.sessionStorage.getItem(CSRF_CONFIG.EXPIRY_KEY);

      if (storedToken && storedExpiry) {
        const expiresAt = parseInt(storedExpiry, 10);

        // Check if token is still valid
        if (!isNaN(expiresAt) && expiresAt > Date.now()) {
          this.currentToken = {
            token: storedToken,
            expiresAt,
            issuedAt: expiresAt - CSRF_CONFIG.TOKEN_TTL_MS,
          };
          logger.debug('CSRF token loaded from storage', {
            expiresIn: expiresAt - Date.now(),
          });
          return;
        }

        // Token expired, clear it
        this.clearStoredToken();
      }
    } catch (error) {
      logger.warn('Failed to load CSRF token from storage', { error });
    }
  }

  /**
   * Store token in sessionStorage
   */
  private storeToken(data: CSRFTokenData): void {
    try {
      if (typeof window === 'undefined') return;

      window.sessionStorage.setItem(CSRF_CONFIG.STORAGE_KEY, data.token);
      window.sessionStorage.setItem(CSRF_CONFIG.EXPIRY_KEY, data.expiresAt.toString());

      logger.debug('CSRF token stored', {
        expiresIn: data.expiresAt - Date.now(),
      });
    } catch (error) {
      logger.warn('Failed to store CSRF token', { error });
    }
  }

  /**
   * Clear token from storage
   */
  private clearStoredToken(): void {
    try {
      if (typeof window === 'undefined') return;

      window.sessionStorage.removeItem(CSRF_CONFIG.STORAGE_KEY);
      window.sessionStorage.removeItem(CSRF_CONFIG.EXPIRY_KEY);

      logger.debug('CSRF token cleared from storage');
    } catch (error) {
      logger.warn('Failed to clear CSRF token', { error });
    }
  }

  /**
   * Check if token is expired or missing
   */
  private isTokenExpired(): boolean {
    if (!this.currentToken) return true;

    const now = Date.now();
    const expiresAt = this.currentToken.expiresAt;

    // Consider token expired if within refresh threshold
    return now >= expiresAt - CSRF_CONFIG.REFRESH_THRESHOLD_MS;
  }

  /**
   * Fetch CSRF token from backend
   */
  async fetchToken(): Promise<string> {
    try {
      // If we're already refreshing, wait for it
      if (this.refreshPromise) {
        await this.refreshPromise;
        if (this.currentToken && !this.isTokenExpired()) {
          return this.currentToken.token;
        }
      }

      // Mark that we're refreshing
      this.refreshPromise = (async () => {
        const response = await fetch(`${this.apiBaseUrl}/api/v1/auth/csrf-token`, {
          method: 'GET',
          credentials: 'include', // Send cookies with request
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch CSRF token: ${response.statusText}`);
        }

        interface CSRFResponse {
          csrf_token: string;
          expires_at: string;
        }

        const data = (await response.json()) as CSRFResponse;

        if (!data.csrf_token || data.csrf_token.length < CSRF_CONFIG.MIN_TOKEN_LENGTH) {
          throw new Error('Invalid CSRF token received from server');
        }

        // Calculate expiry time
        const expiresAt = new Date(data.expires_at).getTime();
        if (isNaN(expiresAt)) {
          throw new Error('Invalid token expiry format');
        }

        // Store token
        this.currentToken = {
          token: data.csrf_token,
          expiresAt,
          issuedAt: Date.now(),
        };

        this.storeToken(this.currentToken);

        logger.info('CSRF token refreshed successfully', {
          expiresIn: expiresAt - Date.now(),
        });
      })();

      await this.refreshPromise;
      this.refreshPromise = null;

      if (!this.currentToken) {
        throw new Error('Failed to obtain CSRF token');
      }

      return this.currentToken.token;
    } catch (error) {
      this.refreshPromise = null;
      logger.error(
        'Failed to fetch CSRF token',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  /**
   * Get current token, refreshing if necessary
   */
  async getToken(): Promise<string> {
    // If token is missing or expired, refresh it
    if (!this.currentToken || this.isTokenExpired()) {
      return this.fetchToken();
    }

    return this.currentToken.token;
  }

  /**
   * Get token synchronously (for request headers)
   * Returns current token or null if not available
   */
  getTokenSync(): string | null {
    if (!this.currentToken || this.isTokenExpired()) {
      return null;
    }

    return this.currentToken.token;
  }

  /**
   * Check if token is available and valid
   */
  isTokenValid(): boolean {
    return !!this.currentToken && !this.isTokenExpired();
  }

  /**
   * Clear all stored tokens
   */
  clearAll(): void {
    this.currentToken = null;
    this.clearStoredToken();
    this.refreshPromise = null;
    logger.debug('CSRF token service cleared');
  }

  /**
   * Get remaining time until expiry (in milliseconds)
   */
  getTimeUntilExpiry(): number {
    if (!this.currentToken) return -1;

    const remaining = this.currentToken.expiresAt - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Get token header for requests
   * Used when synchronous token is available
   */
  getTokenHeader(): Record<string, string> | null {
    const token = this.getTokenSync();
    if (!token) return null;

    return {
      [CSRF_CONFIG.HEADER_NAME]: token,
    };
  }

  /**
   * Get CSRF header name
   */
  static getHeaderName(): string {
    return CSRF_CONFIG.HEADER_NAME;
  }
}

// Export singleton instance factory
export const createCSRFTokenService = (apiBaseUrl: string) => {
  return CSRFTokenService.getInstance(apiBaseUrl);
};
