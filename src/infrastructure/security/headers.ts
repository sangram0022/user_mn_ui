/**
 * Security Headers Configuration
 *
 * Comprehensive security headers implementation following OWASP best practices.
 * These headers protect against common web vulnerabilities.
 *
 * @see https://owasp.org/www-project-secure-headers/
 */

/**
 * Security Headers Interface
 */
export interface SecurityHeaders {
  'Strict-Transport-Security': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Cross-Origin-Embedder-Policy': string;
  'Cross-Origin-Opener-Policy': string;
  'Cross-Origin-Resource-Policy': string;
}

/**
 * HSTS (HTTP Strict Transport Security) Configuration
 * Forces HTTPS connections for enhanced security
 */
export const hstsHeader = {
  // 1 year + include subdomains + preload
  strict: 'max-age=31536000; includeSubDomains; preload',
  // 1 year + include subdomains
  standard: 'max-age=31536000; includeSubDomains',
  // 6 months for testing
  testing: 'max-age=15768000; includeSubDomains',
};

/**
 * X-Frame-Options Configuration
 * Prevents clickjacking attacks
 */
export const xFrameOptionsHeader = {
  // Never allow framing (most secure)
  deny: 'DENY',
  // Only allow same-origin framing
  sameOrigin: 'SAMEORIGIN',
  // Allow specific origin (use CSP frame-ancestors instead)
  allowFrom: (origin: string) => `ALLOW-FROM ${origin}`,
};

/**
 * Referrer-Policy Configuration
 * Controls referrer information sent with requests
 */
export const referrerPolicyHeader = {
  // No referrer information
  noReferrer: 'no-referrer',
  // Only send origin, not full URL
  originOnly: 'origin',
  // Send full URL for same-origin, origin for cross-origin
  strictOriginWhenCrossOrigin: 'strict-origin-when-cross-origin',
  // Send full URL for same-origin only
  sameOrigin: 'same-origin',
};

/**
 * Permissions-Policy Configuration
 * Controls browser features and APIs
 */
export interface PermissionsPolicyConfig {
  geolocation?: string[];
  microphone?: string[];
  camera?: string[];
  payment?: string[];
  usb?: string[];
  magnetometer?: string[];
  gyroscope?: string[];
  accelerometer?: string[];
  fullscreen?: string[];
  'picture-in-picture'?: string[];
}

/**
 * Build Permissions-Policy header string
 */
export const buildPermissionsPolicy = (config: PermissionsPolicyConfig): string =>
  Object.entries(config)
    .map(([feature, allowlist]) => {
      if (allowlist.length === 0) {
        return `${feature}=()`;
      }
      return `${feature}=(${allowlist.join(' ')})`;
    })
    .join(', ');

/**
 * Default Permissions-Policy (restrictive)
 */
export const defaultPermissionsPolicy: PermissionsPolicyConfig = {
  geolocation: [], // Block geolocation
  microphone: [], // Block microphone
  camera: [], // Block camera
  payment: [], // Block payment API
  usb: [], // Block USB
  magnetometer: [], // Block magnetometer
  gyroscope: [], // Block gyroscope
  accelerometer: [], // Block accelerometer
  fullscreen: ['self'], // Allow fullscreen only from same origin
  'picture-in-picture': ['self'], // Allow PiP only from same origin
};

/**
 * Get all security headers for production
 */
export const getSecurityHeaders = (
  options: {
    hstsMode?: 'strict' | 'standard' | 'testing';
    frameOptions?: 'deny' | 'sameOrigin';
    referrerPolicy?: keyof typeof referrerPolicyHeader;
    permissionsPolicy?: PermissionsPolicyConfig;
  } = {}
): SecurityHeaders => {
  const {
    hstsMode = 'standard',
    frameOptions = 'deny',
    referrerPolicy = 'strictOriginWhenCrossOrigin',
    permissionsPolicy = defaultPermissionsPolicy,
  } = options;

  return {
    // Force HTTPS
    'Strict-Transport-Security': hstsHeader[hstsMode],

    // Prevent clickjacking
    'X-Frame-Options': xFrameOptionsHeader[frameOptions],

    // Prevent MIME-type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Enable XSS filter (legacy, CSP is preferred)
    'X-XSS-Protection': '1; mode=block',

    // Control referrer information
    'Referrer-Policy': referrerPolicyHeader[referrerPolicy],

    // Control browser features
    'Permissions-Policy': buildPermissionsPolicy(permissionsPolicy),

    // Cross-Origin policies for enhanced isolation
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };
};

/**
 * Get security headers for development (less restrictive)
 */
export const getDevSecurityHeaders = (): Partial<SecurityHeaders> => ({
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
});

/**
 * Apply security headers to Response object (for modern frameworks)
 */
export const applySecurityHeaders = (
  headers: Headers,
  securityHeaders: Partial<SecurityHeaders>
): void => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
};

/**
 * Create headers object for fetch requests
 */
export const createSecureHeaders = (
  additionalHeaders: Record<string, string> = {}
): Record<string, string> => {
  const securityHeaders = import.meta.env.PROD ? getSecurityHeaders() : getDevSecurityHeaders();

  return {
    ...securityHeaders,
    ...additionalHeaders,
  };
};

/**
 * Security headers as meta tags (fallback for static hosting)
 * Note: Not all headers work as meta tags, prefer server-side headers
 */
export const getSecurityMetaTags = (): Array<{ httpEquiv: string; content: string }> => [
  {
    httpEquiv: 'X-Content-Type-Options',
    content: 'nosniff',
  },
  {
    httpEquiv: 'X-XSS-Protection',
    content: '1; mode=block',
  },
  {
    httpEquiv: 'Referrer-Policy',
    content: 'strict-origin-when-cross-origin',
  },
];

/**
 * Validate security headers in response (for testing)
 */
export const validateSecurityHeaders = (
  headers: Headers
): {
  isValid: boolean;
  missing: string[];
  warnings: string[];
} => {
  const requiredHeaders = ['X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy'];

  const recommendedHeaders = [
    'Strict-Transport-Security',
    'Permissions-Policy',
    'Content-Security-Policy',
  ];

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required headers
  requiredHeaders.forEach((header) => {
    if (!headers.has(header)) {
      missing.push(header);
    }
  });

  // Check recommended headers
  recommendedHeaders.forEach((header) => {
    if (!headers.has(header)) {
      warnings.push(`Recommended header missing: ${header}`);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
};
