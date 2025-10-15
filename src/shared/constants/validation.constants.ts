/**
 * Validation Constants
 *
 * Constants for form validation rules, limits, and patterns
 * @module constants/validation
 */

// ============================================================================
// String Length Limits
// ============================================================================

export const LENGTH_LIMITS = {
  /** Username constraints */
  USERNAME: {
    MIN: 3,
    MAX: 30,
  } as const,

  /** Password constraints */
  PASSWORD: {
    MIN: 8,
    MAX: 128,
  } as const,

  /** Email constraints */
  EMAIL: {
    MIN: 5,
    MAX: 254,
  } as const,

  /** Name constraints */
  NAME: {
    MIN: 1,
    MAX: 100,
  } as const,

  /** Bio constraints */
  BIO: {
    MIN: 0,
    MAX: 500,
  } as const,

  /** Description constraints */
  DESCRIPTION: {
    MIN: 0,
    MAX: 1_000,
  } as const,
} as const;

// ============================================================================
// Regex Patterns
// ============================================================================

export const PATTERNS = {
  /** Email validation pattern */
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  /** Username validation pattern (alphanumeric + underscore/hyphen) */
  USERNAME: /^[a-zA-Z0-9_-]+$/,

  /** Strong password pattern (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special) */
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  /** URL validation pattern */
  URL: /^https?:\/\/.+/,

  /** Phone number pattern (international) */
  PHONE: /^\+?[1-9]\d{1,14}$/,
} as const;

// ============================================================================
// File Upload Limits
// ============================================================================

export const FILE_UPLOAD = {
  /** Maximum file size in bytes (10 MB) */
  MAX_FILE_SIZE: 10 * 1024 * 1024,

  /** Maximum image size in bytes (5 MB) */
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,

  /** Allowed image MIME types */
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const,

  /** Allowed document MIME types */
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ] as const,
} as const;
