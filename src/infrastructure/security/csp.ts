/**
 * Content Security Policy (CSP) Configuration
 *
 * Implements nonce-based CSP for enhanced security while allowing necessary inline scripts.
 * This provides protection against XSS attacks while maintaining flexibility.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */

/**
 * Generate a cryptographically secure nonce for CSP
 * Uses Web Crypto API for strong randomness
 */
export const generateNonce = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * CSP Directive Configuration
 * Each directive controls what resources can be loaded from where
 */
export interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'frame-src': string[];
  'frame-ancestors': string[];
  'base-uri': string[];
  'form-action': string[];
  'object-src': string[];
  'media-src': string[];
  'worker-src': string[];
  'manifest-src': string[];
}

/**
 * Environment-specific API endpoints
 */
const getAPIEndpoints = (): string[] => {
  const endpoints: string[] = [];

  // Add backend API URL from environment
  if (import.meta.env.VITE_API_BASE_URL) {
    endpoints.push(import.meta.env.VITE_API_BASE_URL);
  }

  // Default endpoints for different environments
  if (import.meta.env.DEV) {
    endpoints.push('http://localhost:*', 'ws://localhost:*');
  }

  if (import.meta.env.PROD) {
    endpoints.push('https://api.yourservice.com', 'https://*.yourservice.com');
  }

  return endpoints;
};

/**
 * Create CSP directives with nonce support
 *
 * @param nonce - Unique nonce for this request/session
 * @param options - Additional options for customization
 */
export const createCSPDirectives = (
  nonce: string,
  options: {
    allowUnsafeEval?: boolean;
    allowInlineStyles?: boolean;
    additionalScriptSrc?: string[];
    additionalConnectSrc?: string[];
  } = {}
): CSPDirectives => {
  const {
    allowUnsafeEval = false,
    allowInlineStyles = true,
    additionalScriptSrc = [],
    additionalConnectSrc = [],
  } = options;

  return {
    // Default fallback for all resource types
    'default-src': ["'self'"],

    // Scripts: self + nonce-based inline scripts + optional unsafe-eval for development
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      ...(allowUnsafeEval ? ["'unsafe-eval'"] : []),
      ...additionalScriptSrc,
    ],

    // Styles: self + inline styles (required for many CSS-in-JS libraries)
    'style-src': [
      "'self'",
      ...(allowInlineStyles ? ["'unsafe-inline'"] : []),
      'https://fonts.googleapis.com',
    ],

    // Images: self + data URIs + HTTPS images
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],

    // Fonts: self + Google Fonts
    'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],

    // AJAX, WebSocket, EventSource
    'connect-src': ["'self'", ...getAPIEndpoints(), ...additionalConnectSrc],

    // Frames/iframes
    'frame-src': ["'self'"],

    // Prevent clickjacking
    'frame-ancestors': ["'none'"],

    // Base tag restrictions
    'base-uri': ["'self'"],

    // Form submission restrictions
    'form-action': ["'self'"],

    // Block plugins
    'object-src': ["'none'"],

    // Media sources
    'media-src': ["'self'", 'https:'],

    // Web Workers
    'worker-src': ["'self'", 'blob:'],

    // Web App Manifest
    'manifest-src': ["'self'"],
  };
};

/**
 * Convert CSP directives object to header string
 */
export const buildCSPHeader = (directives: CSPDirectives): string => {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
};

/**
 * Get complete CSP header value
 */
export const getCSPHeader = (nonce: string, options = {}): string => {
  const directives = createCSPDirectives(nonce, options);
  return buildCSPHeader(directives);
};

/**
 * CSP for report-only mode (testing)
 * Useful for monitoring violations without blocking
 */
export const getCSPReportOnlyHeader = (nonce: string, reportUri?: string): string => {
  const directives = createCSPDirectives(nonce);

  if (reportUri) {
    const directivesWithReport = {
      ...directives,
      'report-uri': [reportUri],
      'report-to': ['csp-endpoint'],
    };
    return buildCSPHeader(directivesWithReport as CSPDirectives);
  }

  return buildCSPHeader(directives);
};

/**
 * Development-friendly CSP (less restrictive)
 */
export const getDevCSPHeader = (nonce: string): string => {
  return getCSPHeader(nonce, {
    allowUnsafeEval: true, // Required for HMR/dev tools
    allowInlineStyles: true,
  });
};

/**
 * Production CSP (strict)
 */
export const getProdCSPHeader = (nonce: string): string => {
  return getCSPHeader(nonce, {
    allowUnsafeEval: false,
    allowInlineStyles: true, // Many CSS-in-JS libs need this
  });
};
