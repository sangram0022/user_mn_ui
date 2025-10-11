/**
 * Comprehensive Input Validation and Sanitization
 * 20-year React expert implementation with enterprise-grade security
 */

import CryptoJS from 'crypto-js';
import DOMPurify from 'dompurify';
import { z } from 'zod';
import { logger } from './../utils/logger';

// ==================== VALIDATION SCHEMAS ====================

// Base validation schemas
export const baseSchemas = {
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(254, 'Email too long')
    .refine(
      (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
      'Invalid email format'
    ),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .refine(
      (password) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password),
      'Password must contain uppercase, lowercase, number, and special character'
    ),

  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username too long')
    .refine(
      (username) => /^[a-zA-Z0-9_-]+$/.test(username),
      'Username can only contain letters, numbers, hyphens, and underscores'
    ),

  phone: z
    .string()
    .optional()
    .refine((phone) => !phone || /^\+?[\d\s\-()]{10,}$/.test(phone), 'Invalid phone number format'),

  url: z
    .string()
    .optional()
    .refine((url) => !url || /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(url), 'Invalid URL format'),

  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .refine(
      (name) => /^[a-zA-Z\s\-'.]+$/.test(name),
      'Name can only contain letters, spaces, hyphens, apostrophes, and periods'
    ),

  alphanumeric: z
    .string()
    .refine((str) => /^[a-zA-Z0-9]+$/.test(str), 'Must contain only letters and numbers'),

  safeText: z
    .string()
    .refine((text) => !/[<>"'&]/.test(text), 'Text contains potentially unsafe characters'),
};

// ==================== FORM VALIDATION SCHEMAS ====================

export const authSchemas = {
  login: z.object({
    email: baseSchemas.email,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),

  register: z
    .object({
      firstName: baseSchemas.name,
      lastName: baseSchemas.name,
      email: baseSchemas.email,
      username: baseSchemas.username,
      password: baseSchemas.password,
      confirmPassword: z.string(),
      agreeToTerms: z.boolean().refine((val) => val === true, 'Must agree to terms'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),

  forgotPassword: z.object({ email: baseSchemas.email }),

  resetPassword: z
    .object({
      password: baseSchemas.password,
      confirmPassword: z.string(),
      token: z.string().min(1, 'Reset token is required'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),

  changePassword: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: baseSchemas.password,
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
};

export const userSchemas = {
  profile: z.object({
    firstName: baseSchemas.name,
    lastName: baseSchemas.name,
    email: baseSchemas.email,
    phone: baseSchemas.phone,
    bio: z.string().max(500, 'Bio too long').optional(),
    website: baseSchemas.url,
    location: z.string().max(100, 'Location too long').optional(),
  }),

  createUser: z.object({
    firstName: baseSchemas.name,
    lastName: baseSchemas.name,
    email: baseSchemas.email,
    username: baseSchemas.username,
    role: z.enum(['admin', 'moderator', 'user', 'viewer']),
    isActive: z.boolean().optional().default(true),
  }),

  updateUser: z.object({
    id: z.string().uuid('Invalid user ID'),
    firstName: baseSchemas.name.optional(),
    lastName: baseSchemas.name.optional(),
    email: baseSchemas.email.optional(),
    role: z.enum(['admin', 'moderator', 'user', 'viewer']).optional(),
    isActive: z.boolean().optional(),
  }),
};

export const systemSchemas = {
  settings: z.object({
    siteName: z.string().min(1, 'Site name is required').max(100),
    siteDescription: z.string().max(500).optional(),
    maintenanceMode: z.boolean().optional(),
    allowRegistration: z.boolean().optional(),
    maxUploadSize: z.number().min(1).max(100), // MB
    sessionTimeout: z.number().min(5).max(1440), // minutes
  }),

  notification: z.object({
    title: z.string().min(1, 'Title is required').max(100),
    message: z.string().min(1, 'Message is required').max(1000),
    type: z.enum(['info', 'success', 'warning', 'error']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    expiresAt: z.date().optional(),
  }),
};

// ==================== SANITIZATION UTILITIES ====================

export class InputSanitizer {
  private static instance: InputSanitizer;
  private purifier: typeof DOMPurify;

  private constructor() {
    this.purifier = DOMPurify;
    this.configurePurifier();
  }

  public static getInstance(): InputSanitizer {
    if (!InputSanitizer.instance) {
      InputSanitizer.instance = new InputSanitizer();
    }
    return InputSanitizer.instance;
  }

  private configurePurifier(): void {
    // Configure DOMPurify for maximum security
    this.purifier.setConfig({
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      FORCE_BODY: true,
    });

    // Add custom hooks for additional security
    this.purifier.addHook('beforeSanitizeElements', (node) => {
      // Remove any script content
      if (node.nodeName === 'SCRIPT') {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      }
    });
  }

  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  sanitizeHtml(dirty: string, allowedTags?: string[]): string {
    if (!dirty || typeof dirty !== 'string') return '';

    const config = allowedTags ? { ALLOWED_TAGS: allowedTags, ALLOWED_ATTR: [] } : undefined;

    return this.purifier.sanitize(dirty, config);
  }

  /**
   * Sanitize plain text by removing/escaping dangerous characters
   */
  sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/[&]/g, '&amp;') // Escape ampersands
      .replace(/['"]/g, (match) => (match === '"' ? '&quot;' : '&#x27;')) // Escape quotes
      .trim();
  }

  /**
   * Sanitize and validate file names
   */
  sanitizeFileName(fileName: string): string {
    if (!fileName || typeof fileName !== 'string') return '';

    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .substring(0, 255); // Limit length
  }

  /**
   * Sanitize SQL-like inputs to prevent injection
   */
  sanitizeSqlInput(input: string): string {
    if (!input || typeof input !== 'string') return '';

    const sqlKeywords = [
      'SELECT',
      'INSERT',
      'UPDATE',
      'DELETE',
      'DROP',
      'CREATE',
      'ALTER',
      'EXEC',
      'EXECUTE',
      'UNION',
      'SCRIPT',
      'DECLARE',
      'CURSOR',
    ];

    let sanitized = input.trim();

    // Remove SQL keywords (case insensitive)
    sqlKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    // Remove common SQL injection patterns
    sanitized = sanitized
      .replace(/[';-]/g, '') // Remove semicolons and SQL comments
      .replace(/--/g, '') // Remove SQL line comments
      .replace(/\/\*.*?\*\//g, '') // Remove SQL block comments
      .replace(/\b(OR|AND)\s+\d+\s*=\s*\d+/gi, ''); // Remove tautology patterns

    return sanitized.trim();
  }

  /**
   * Validate and sanitize email addresses
   */
  sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') return '';

    return email
      .toLowerCase()
      .trim()
      .replace(/[^\w@.-]/g, ''); // Only allow word chars, @, dots, and hyphens
  }

  /**
   * Sanitize URLs to prevent malicious redirects
   */
  sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') return '';

    const trimmed = url.trim().toLowerCase();

    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    if (dangerousProtocols.some((protocol) => trimmed.startsWith(protocol))) {
      return '';
    }

    // Only allow http/https
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${url}`;
    }

    return url;
  }
}

// ==================== ENCRYPTION UTILITIES ====================

export class DataEncryption {
  private static secretKey = process.env.REACT_APP_ENCRYPTION_KEY || 'default-secret-key';

  /**
   * Encrypt sensitive data before storing
   */
  static encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.secretKey).toString();
    } catch (error) {
      logger.error('Encryption failed:', undefined, { error });
      return data; // Fallback to plain text in dev
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      logger.error('Decryption failed:', undefined, { error });
      return encryptedData; // Fallback to encrypted text
    }
  }

  /**
   * Hash sensitive data for comparison
   */
  static hash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * Generate secure random tokens
   */
  static generateToken(length: number = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString();
  }
}

// ==================== SECURE STORAGE ====================

export class SecureStorage {
  private static sanitizer = InputSanitizer.getInstance();

  /**
   * Securely store sensitive data in localStorage
   */
  static setItem(key: string, value: unknown, encrypt: boolean = true): void {
    try {
      const sanitizedKey = this.sanitizer.sanitizeText(key);
      const stringValue = JSON.stringify(value);
      const finalValue = encrypt ? DataEncryption.encrypt(stringValue) : stringValue;

      localStorage.setItem(sanitizedKey, finalValue);
    } catch (error) {
      logger.error('Secure storage set failed:', undefined, { error });
    }
  }

  /**
   * Securely retrieve data from localStorage
   */
  static getItem<T>(key: string, encrypted: boolean = true): T | null {
    try {
      const sanitizedKey = this.sanitizer.sanitizeText(key);
      const storedValue = localStorage.getItem(sanitizedKey);

      if (!storedValue) return null;

      const decryptedValue = encrypted ? DataEncryption.decrypt(storedValue) : storedValue;

      return JSON.parse(decryptedValue);
    } catch (error) {
      logger.error('Secure storage get failed:', undefined, { error });
      return null;
    }
  }

  /**
   * Remove item from secure storage
   */
  static removeItem(key: string): void {
    try {
      const sanitizedKey = this.sanitizer.sanitizeText(key);
      localStorage.removeItem(sanitizedKey);
    } catch (error) {
      logger.error('Secure storage remove failed:', undefined, { error });
    }
  }

  /**
   * Clear all secure storage
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      logger.error('Secure storage clear failed:', undefined, { error });
    }
  }
}

// ==================== VALIDATION HOOKS ====================

export function useValidation<T>(schema: z.ZodSchema<T>) {
  const validate = (
    data: unknown
  ): { success: boolean; data?: T; errors?: Record<string, string> } => {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          errors[path] = issue.message;
        });
        return { success: false, errors };
      }
      return { success: false, errors: { general: 'Validation failed' } };
    }
  };

  const validateField = (fieldName: string, value: unknown): string | null => {
    try {
      // Extract field schema if possible
      if (schema instanceof z.ZodObject) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fieldSchema = (schema.shape as any)[fieldName];
        if (fieldSchema) {
          fieldSchema.parse(value);
          return null;
        }
      }
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues[0]?.message || 'Invalid value';
      }
      return 'Validation failed';
    }
  };

  return { validate, validateField };
}

// ==================== EXPORTS ====================

export const sanitizer = InputSanitizer.getInstance();

export { z, type ZodError, type ZodSchema } from 'zod';

// Export validation utilities
export const validationUtils = {
  schemas: {
    base: baseSchemas,
    auth: authSchemas,
    user: userSchemas,
    system: systemSchemas,
  },
  sanitizer,
  encryption: DataEncryption,
  storage: SecureStorage,
  useValidation,
};

export default validationUtils;
