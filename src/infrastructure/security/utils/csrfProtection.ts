/**
 * CSRF Protection Utilities
 * Provides Cross-Site Request Forgery protection mechanisms
 */

interface CSRFToken {
  token: string;
  timestamp: number;
  expiry: number;
}

interface CSRFConfig {
  tokenLength: number;
  expiryMinutes: number;
  headerName: string;
  cookieName: string;
}

const DEFAULT_CONFIG: CSRFConfig = {
  tokenLength: 32,
  expiryMinutes: 60,
  headerName: 'X-CSRF-Token',
  cookieName: 'csrf-token',
};

class CSRFProtection {
  private config: CSRFConfig;
  private tokens: Map<string, CSRFToken> = new Map();

  constructor(config?: Partial<CSRFConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a new CSRF token
   */
  generateToken(sessionId?: string): string {
    const tokenBytes = new Uint8Array(this.config.tokenLength);
    crypto.getRandomValues(tokenBytes);

    const token = Array.from(tokenBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const now = Date.now();
    const csrfToken: CSRFToken = {
      token,
      timestamp: now,
      expiry: now + this.config.expiryMinutes * 60 * 1000,
    };

    // Store token with session ID or use the token itself as key
    const key = sessionId || token;
    this.tokens.set(key, csrfToken);

    // Clean up expired tokens
    this.cleanupExpiredTokens();

    return token;
  }

  /**
   * Validate a CSRF token
   */
  validateToken(token: string, sessionId?: string): boolean {
    if (!token) {
      return false;
    }

    const key = sessionId || token;
    const storedToken = this.tokens.get(key);

    if (!storedToken) {
      return false;
    }

    // Check if token has expired
    if (Date.now() > storedToken.expiry) {
      this.tokens.delete(key);
      return false;
    }

    // Validate token matches
    return this.constantTimeCompare(token, storedToken.token);
  }

  /**
   * Invalidate a CSRF token
   */
  invalidateToken(sessionId: string): void {
    this.tokens.delete(sessionId);
  }

  /**
   * Get token from request headers
   */
  getTokenFromHeaders(headers: Headers): string | null {
    return headers.get(this.config.headerName);
  }

  /**
   * Get token from cookie string
   */
  getTokenFromCookies(cookieString: string): string | null {
    const cookies = this.parseCookies(cookieString);
    return cookies[this.config.cookieName] || null;
  }

  /**
   * Create CSRF cookie header value
   */
  createCookieHeader(
    token: string,
    options: {
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: 'Strict' | 'Lax' | 'None';
      maxAge?: number;
    } = {}
  ): string {
    const {
      httpOnly = true,
      secure = true,
      sameSite = 'Strict',
      maxAge = this.config.expiryMinutes * 60,
    } = options;

    let cookie = `${this.config.cookieName}=${token}`;

    if (maxAge) {
      cookie += `; Max-Age=${maxAge}`;
    }

    if (httpOnly) {
      cookie += '; HttpOnly';
    }

    if (secure) {
      cookie += '; Secure';
    }

    cookie += `; SameSite=${sameSite}`;
    cookie += '; Path=/';

    return cookie;
  }

  /**
   * Middleware function for CSRF protection
   */
  middleware() {
    return (request: Request): boolean => {
      // Skip CSRF for safe methods
      if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        return true;
      }

      const token = this.getTokenFromHeaders(request.headers);
      if (!token) {
        return false;
      }

      return this.validateToken(token);
    };
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [key, token] of this.tokens.entries()) {
      if (now > token.expiry) {
        this.tokens.delete(key);
      }
    }
  }

  /**
   * Parse cookies from cookie string
   */
  private parseCookies(cookieString: string): Record<string, string> {
    const cookies: Record<string, string> = {};

    if (!cookieString) {
      return cookies;
    }

    cookieString.split(';').forEach((cookie) => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name && rest.length > 0) {
        cookies[name] = rest.join('=');
      }
    });

    return cookies;
  }

  /**
   * Constant-time string comparison
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}

// Export singleton instance and utilities
export const csrfProtection = new CSRFProtection();

/**
 * Prevent CSRF attacks by validating tokens
 */
export function preventCSRF(config?: Partial<CSRFConfig>): CSRFProtection {
  return new CSRFProtection(config);
}

/**
 * Generate CSRF token for client-side use
 */
export function generateCSRFToken(): string {
  return csrfProtection.generateToken();
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, sessionId?: string): boolean {
  return csrfProtection.validateToken(token, sessionId);
}
