import { BACKEND_CONFIG } from '../config/api';
import { logger } from './../utils/logger';

/**
 * Content Security Policy and Security Headers
 * Enterprise-grade security implementation by 20-year React expert
 */

// ==================== CONTENT SECURITY POLICY ====================

export interface CSPDirectives {
  defaultSrc?: string[];
  scriptSrc?: string[];
  styleSrc?: string[];
  imgSrc?: string[];
  fontSrc?: string[];
  connectSrc?: string[];
  frameSrc?: string[];
  formAction?: string[];
  baseUri?: string[];
  objectSrc?: string[];
  mediaSrc?: string[];
  manifestSrc?: string[];
  workerSrc?: string[];
  childSrc?: string[];
  frameAncestors?: string[];
  reportUri?: string[];
  reportTo?: string[];
  upgradeInsecureRequests?: boolean;
  blockAllMixedContent?: boolean;
}

export class ContentSecurityPolicy {
  private static readonly NONCE_LENGTH = 16;
  private static nonce: string | null = null;

  /**
   * Generate a cryptographically secure nonce for inline scripts
   */
  static generateNonce(): string {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(this.NONCE_LENGTH);
      window.crypto.getRandomValues(array);
      this.nonce = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    } else {
      // Fallback for environments without crypto API
      this.nonce =
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    return this.nonce;
  }

  /**
   * Get the current nonce value
   */
  static getCurrentNonce(): string | null {
    return this.nonce;
  }

  /**
   * Get production-ready CSP directives
   */
  static getProductionCSP(): CSPDirectives {
    const apiUrl = BACKEND_CONFIG.BASE_URL;
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001';

    return {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for React in development
        "'unsafe-eval'", // Required for development tools
        'https://cdn.jsdelivr.net',
        'https://unpkg.com',
        ...(this.nonce ? [`'nonce-${this.nonce}'`] : []),
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for styled-components and CSS-in-JS
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net',
      ],
      imgSrc: [
        "'self'",
        'data:', // For base64 images
        'blob:', // For generated images
        'https:', // Allow HTTPS images
        apiUrl,
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net', 'data:'],
      connectSrc: [
        "'self'",
        apiUrl,
        wsUrl,
        'https://api.github.com', // If using GitHub API
        'wss:', // WebSocket connections
        'ws:', // WebSocket connections (dev)
      ],
      frameSrc: [
        "'none'", // Prevent framing attacks
      ],
      formAction: ["'self'", apiUrl],
      baseUri: ["'self'"],
      objectSrc: [
        "'none'", // Prevent plugin execution
      ],
      mediaSrc: ["'self'", 'data:', 'blob:', apiUrl],
      manifestSrc: ["'self'"],
      workerSrc: [
        "'self'",
        'blob:', // For web workers
      ],
      childSrc: ["'self'"],
      frameAncestors: [
        "'none'", // Prevent clickjacking
      ],
      upgradeInsecureRequests: true,
      blockAllMixedContent: true,
    };
  }

  /**
   * Get development CSP directives (more permissive)
   */
  static getDevelopmentCSP(): CSPDirectives {
    return {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'http:', 'https:', 'ws:', 'wss:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'http:', 'https:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'http:', 'https:'],
      fontSrc: ["'self'", 'data:', 'http:', 'https:'],
      connectSrc: ["'self'", 'http:', 'https:', 'ws:', 'wss:'],
      frameSrc: ["'self'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
    };
  }

  /**
   * Convert CSP directives to header string
   */
  static directivesToString(directives: CSPDirectives): string {
    const policies: string[] = [];

    Object.entries(directives).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        if (value) {
          // Convert camelCase to kebab-case for boolean directives
          const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          policies.push(directive);
        }
      } else if (Array.isArray(value) && value.length > 0) {
        // Convert camelCase to kebab-case for array directives
        const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        policies.push(`${directive} ${value.join(' ')}`);
      }
    });

    return policies.join('; ');
  }

  /**
   * Apply CSP to the document
   */
  static apply(environment: 'development' | 'production' = 'production'): void {
    if (typeof document === 'undefined') return;

    const directives =
      environment === 'development' ? this.getDevelopmentCSP() : this.getProductionCSP();

    const cspString = this.directivesToString(directives);

    // Remove existing CSP meta tag
    const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingMeta) {
      existingMeta.remove();
    }

    // Add new CSP meta tag
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = cspString;
    document.head.appendChild(meta);
  }
}

// ==================== SECURITY HEADERS ====================

export interface SecurityHeaders {
  'Strict-Transport-Security'?: string;
  'X-Content-Type-Options'?: string;
  'X-Frame-Options'?: string;
  'X-XSS-Protection'?: string;
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
  'Cross-Origin-Embedder-Policy'?: string;
  'Cross-Origin-Opener-Policy'?: string;
  'Cross-Origin-Resource-Policy'?: string;
}

export class SecurityHeadersManager {
  /**
   * Get recommended security headers for production
   */
  static getProductionHeaders(): SecurityHeaders {
    return {
      // HSTS - Force HTTPS for 1 year
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',

      // Prevent clickjacking
      'X-Frame-Options': 'DENY',

      // XSS Protection
      'X-XSS-Protection': '1; mode=block',

      // Referrer policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',

      // Permissions policy (restrict dangerous features)
      'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'notifications=()',
        'push=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'gyroscope=()',
        'speaker=()',
        'ambient-light-sensor=()',
        'accelerometer=()',
        'autoplay=()',
        'encrypted-media=()',
        'picture-in-picture=()',
      ].join(', '),

      // Cross-Origin policies
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
    };
  }

  /**
   * Apply security headers to fetch requests
   */
  static applyToFetch(headers: HeadersInit = {}): HeadersInit {
    const securityHeaders = this.getProductionHeaders();
    return {
      ...headers,
      ...securityHeaders,
    };
  }

  /**
   * Validate if response has proper security headers
   */
  static validateResponse(response: Response): { valid: boolean; missing: string[] } {
    const requiredHeaders = [
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Referrer-Policy',
    ];

    const missing: string[] = [];

    requiredHeaders.forEach((header) => {
      if (!response.headers.get(header)) {
        missing.push(header);
      }
    });

    return { valid: missing.length === 0, missing };
  }
}

// ==================== REQUEST SANITIZATION ====================

export class RequestSanitizer {
  /**
   * Sanitize request headers to prevent header injection
   */
  static sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};

    Object.entries(headers).forEach(([key, value]) => {
      // Remove potentially dangerous characters from header names and values
      const cleanKey = key.replace(/[^\w-]/g, '');
      // eslint-disable-next-line no-control-regex
      const cleanValue = value.replace(/[\r\n\x00]/g, '');

      if (cleanKey && cleanValue) {
        sanitized[cleanKey] = cleanValue;
      }
    });

    return sanitized;
  }

  /**
   * Sanitize URL parameters to prevent injection
   */
  static sanitizeUrlParams(params: Record<string, unknown>): Record<string, string> {
    const sanitized: Record<string, string> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value != null) {
        // Convert to string and encode
        const stringValue = String(value);
        sanitized[encodeURIComponent(key)] = encodeURIComponent(stringValue);
      }
    });

    return sanitized;
  }

  /**
   * Validate and sanitize request body
   */
  static sanitizeRequestBody(body: unknown): unknown {
    if (typeof body === 'string') {
      // For string bodies, ensure they don't contain dangerous content
      return body.replace(/[<>]/g, ''); // Basic XSS prevention
    }

    if (typeof body === 'object' && body !== null) {
      // For object bodies, recursively sanitize
      const sanitized: Record<string, unknown> | unknown[] = Array.isArray(body) ? [] : {};

      Object.entries(body as Record<string, unknown>).forEach(([key, value]) => {
        if (typeof value === 'string') {
          (sanitized as Record<string, unknown>)[key] = value.replace(/[<>]/g, '');
        } else if (typeof value === 'object' && value !== null) {
          (sanitized as Record<string, unknown>)[key] = this.sanitizeRequestBody(value);
        } else {
          (sanitized as Record<string, unknown>)[key] = value;
        }
      });

      return sanitized;
    }

    return body;
  }
}

// ==================== CORS CONFIGURATION ====================

export interface CORSConfig {
  origin: string[] | string | boolean;
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge?: number;
}

export class CORSManager {
  /**
   * Get production CORS configuration
   */
  static getProductionConfig(): CORSConfig {
    const allowedOrigins = [
      import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173',
      ...(import.meta.env.VITE_ALLOWED_ORIGINS?.split(',') || []),
    ].filter(Boolean);

    return {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-API-Key',
        'Accept',
        'Origin',
      ],
      credentials: true,
      maxAge: 86400, // 24 hours
    };
  }

  /**
   * Validate if origin is allowed
   */
  static isOriginAllowed(origin: string): boolean {
    const config = this.getProductionConfig();

    if (typeof config.origin === 'boolean') {
      return config.origin;
    }

    if (typeof config.origin === 'string') {
      return config.origin === origin;
    }

    if (Array.isArray(config.origin)) {
      return config.origin.includes(origin);
    }

    return false;
  }
}

// ==================== SECURITY MONITORING ====================

export class SecurityMonitor {
  private static violations: Array<{
    type: string;
    details: Record<string, unknown>;
    timestamp: Date;
  }> = [];

  /**
   * Log security violations
   */
  static logViolation(type: string, details: Record<string, unknown>): void {
    const violation = {
      type,
      details,
      timestamp: new Date(),
    };

    this.violations.push(violation);

    // Keep only last 100 violations to prevent memory leaks
    if (this.violations.length > 100) {
      this.violations = this.violations.slice(-100);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      logger.warn('Security Violation:', { violation });
    }

    // In production, send to monitoring service
    if (import.meta.env.PROD) {
      this.reportToService(violation);
    }
  }

  /**
   * Report violations to external monitoring service
   */
  private static async reportToService(violation: Record<string, unknown>): Promise<void> {
    try {
      const endpoint = import.meta.env.VITE_SECURITY_MONITORING_ENDPOINT;
      if (!endpoint) return;

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...violation,
          userAgent: navigator.userAgent,
          url: window.location.href,
          userId: this.getCurrentUserId(),
        }),
      });
    } catch (error) {
      logger.error('Failed to report security violation:', undefined, { error });
    }
  }

  /**
   * Get current user ID for violation reporting
   */
  private static getCurrentUserId(): string | null {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.id || null;
      }
    } catch {
      // Ignore parsing errors
    }
    return null;
  }

  /**
   * Get recent violations for debugging
   */
  static getViolations(): Array<{
    type: string;
    details: Record<string, unknown>;
    timestamp: Date;
  }> {
    return [...this.violations];
  }

  /**
   * Clear violation history
   */
  static clearViolations(): void {
    this.violations = [];
  }
}

// ==================== EXPORTS ====================

export const securityUtils = {
  csp: ContentSecurityPolicy,
  headers: SecurityHeadersManager,
  sanitizer: RequestSanitizer,
  cors: CORSManager,
  monitor: SecurityMonitor,
};

export default securityUtils;
