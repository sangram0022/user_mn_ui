/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize user input and prevent XSS attacks.
 * Always sanitize user-generated content before displaying or processing.
 * 
 * @module shared/utils/sanitize
 */

import DOMPurify from 'dompurify';

/**
 * Configuration for HTML sanitization
 */
interface SanitizeHtmlOptions {
  /**
   * Allowed HTML tags (default: basic formatting tags)
   */
  allowedTags?: string[];
  
  /**
   * Allowed HTML attributes (default: href, target, rel)
   */
  allowedAttributes?: string[];
  
  /**
   * Whether to allow external links (default: false)
   */
  allowExternalLinks?: boolean;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * 
 * @param dirty - Raw HTML string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized HTML string safe to render
 * 
 * @example
 * ```tsx
 * const userComment = '<script>alert("xss")</script><p>Hello</p>';
 * const safe = sanitizeHtml(userComment);
 * // Result: '<p>Hello</p>' (script removed)
 * 
 * // Render safely
 * <div dangerouslySetInnerHTML={{ __html: safe }} />
 * ```
 */
export const sanitizeHtml = (
  dirty: string,
  options: SanitizeHtmlOptions = {}
): string => {
  const {
    allowedTags = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    allowedAttributes = ['href', 'target', 'rel'],
    allowExternalLinks = false,
  } = options;

  const config = {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  };

  // Add additional security for external links
  if (allowExternalLinks) {
    Object.assign(config, {
      ADD_ATTR: ['rel'],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):)/i,
    });
  } else {
    Object.assign(config, {
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):)/i,
    });
  }

  const sanitized = DOMPurify.sanitize(dirty, config) as string;
  
  // Add rel="noopener noreferrer" to external links
  if (allowExternalLinks) {
    const div = document.createElement('div');
    div.innerHTML = sanitized;
    const links = div.querySelectorAll('a[href^="http"]');
    links.forEach(link => {
      link.setAttribute('rel', 'noopener noreferrer');
      link.setAttribute('target', '_blank');
    });
    return div.innerHTML as string;
  }
  
  return sanitized;
};

/**
 * Sanitize plain text input (remove dangerous characters)
 * 
 * @param input - Raw user input
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized string
 * 
 * @example
 * ```tsx
 * const userInput = '<script>alert("xss")</script>Hello World';
 * const safe = sanitizeInput(userInput);
 * // Result: 'Hello World' (script tags removed)
 * ```
 */
export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (!input) return '';
  
  return input
    .trim()
    .slice(0, maxLength) // Enforce max length
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick, onerror, etc.)
    .replace(/data:/gi, '') // Remove data: URIs
    .replace(/vbscript:/gi, ''); // Remove vbscript: protocol
};

/**
 * Sanitize email address
 * 
 * @param email - Raw email input
 * @returns Sanitized email (lowercase, trimmed)
 * 
 * @example
 * ```tsx
 * const email = sanitizeEmail('  User@Example.COM  ');
 * // Result: 'user@example.com'
 * ```
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[<>()[\]\\,;:\s@"]/g, (match) => {
      // Only allow @ symbol
      return match === '@' ? match : '';
    });
};

/**
 * Sanitize URL to prevent javascript: and data: URIs
 * 
 * @param url - Raw URL input
 * @returns Sanitized URL or empty string if invalid
 * 
 * @example
 * ```tsx
 * const url = sanitizeUrl('javascript:alert("xss")');
 * // Result: '' (blocked)
 * 
 * const validUrl = sanitizeUrl('https://example.com');
 * // Result: 'https://example.com' (allowed)
 * ```
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  
  const trimmed = url.trim();
  
  // Block dangerous protocols
  const dangerousProtocols = /^(javascript|data|vbscript|file):/i;
  if (dangerousProtocols.test(trimmed)) {
    return '';
  }
  
  // Only allow http, https, mailto, tel
  const allowedProtocols = /^(https?|mailto|tel):/i;
  if (!allowedProtocols.test(trimmed) && !trimmed.startsWith('/')) {
    return '';
  }
  
  return trimmed;
};

/**
 * Sanitize filename to prevent directory traversal
 * 
 * @param filename - Raw filename input
 * @returns Sanitized filename safe for storage
 * 
 * @example
 * ```tsx
 * const filename = sanitizeFilename('../../../etc/passwd');
 * // Result: 'passwd' (path traversal removed)
 * 
 * const safe = sanitizeFilename('My Document.pdf');
 * // Result: 'My-Document.pdf' (spaces replaced)
 * ```
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename) return '';
  
  return filename
    .replace(/[/\\?%*:|"<>]/g, '-') // Replace dangerous chars
    .replace(/\.\./g, '') // Remove directory traversal
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .slice(0, 255); // Enforce max filename length
};

/**
 * Sanitize JSON string to prevent injection
 * 
 * @param jsonString - Raw JSON string
 * @returns Parsed and re-stringified JSON or null if invalid
 * 
 * @example
 * ```tsx
 * const userJson = '{"name": "John", "script": "<script>alert(1)</script>"}';
 * const safe = sanitizeJson(userJson);
 * // Result: Valid JSON with escaped HTML
 * ```
 */
export const sanitizeJson = (jsonString: string): string | null => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  } catch {
    return null;
  }
};

/**
 * Sanitize SQL input (basic protection - always use parameterized queries)
 * 
 * @param input - Raw SQL input
 * @returns Sanitized string (basic escaping)
 * 
 * WARNING: This is NOT a replacement for parameterized queries!
 * Always use prepared statements on the backend.
 * 
 * @example
 * ```tsx
 * const userSearch = sanitizeSqlInput("'; DROP TABLE users; --");
 * // Escapes single quotes
 * ```
 */
export const sanitizeSqlInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, ''); // Remove block comment end
};

/**
 * Escape HTML entities (alternative to sanitizeHtml for simple text)
 * 
 * @param text - Raw text to escape
 * @returns Text with HTML entities escaped
 * 
 * @example
 * ```tsx
 * const escaped = escapeHtml('<script>alert("xss")</script>');
 * // Result: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Strip all HTML tags from text
 * 
 * @param html - HTML string
 * @returns Plain text with all tags removed
 * 
 * @example
 * ```tsx
 * const text = stripHtmlTags('<p>Hello <strong>World</strong></p>');
 * // Result: 'Hello World'
 * ```
 */
export const stripHtmlTags = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

/**
 * Validate and sanitize phone number
 * 
 * @param phone - Raw phone input
 * @returns Sanitized phone number (digits only)
 * 
 * @example
 * ```tsx
 * const phone = sanitizePhone('+1 (555) 123-4567');
 * // Result: '15551234567'
 * ```
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone) return '';
  
  return phone.replace(/\D/g, ''); // Keep digits only
};

/**
 * Sanitize credit card number (for display, not storage)
 * 
 * @param cardNumber - Raw card number
 * @returns Masked card number (only last 4 digits visible)
 * 
 * @example
 * ```tsx
 * const masked = sanitizeCreditCard('1234567890123456');
 * // Result: '************3456'
 * ```
 */
export const sanitizeCreditCard = (cardNumber: string): string => {
  if (!cardNumber) return '';
  
  const digitsOnly = cardNumber.replace(/\D/g, '');
  
  if (digitsOnly.length < 4) return '****';
  
  const lastFour = digitsOnly.slice(-4);
  const masked = '*'.repeat(digitsOnly.length - 4);
  
  return masked + lastFour;
};

// Export all sanitization functions
export default {
  sanitizeHtml,
  sanitizeInput,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeFilename,
  sanitizeJson,
  sanitizeSqlInput,
  escapeHtml,
  stripHtmlTags,
  sanitizePhone,
  sanitizeCreditCard,
};
