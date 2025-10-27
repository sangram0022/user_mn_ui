import type { Config } from 'dompurify';
import DOMPurify from 'dompurify';
import React from 'react';
import { EMAIL_REGEX } from './validation';

/**
 * Input Sanitization Utilities
 *
 * Provides XSS protection through HTML sanitization and input validation.
 * All user-generated content should pass through these utilities before rendering.
 *
 * Security Features:
 * - HTML sanitization with DOMPurify
 * - Input length limiting
 * - Dangerous character filtering
 * - Whitelist-based tag filtering
 *
 * @example
 * // Sanitize HTML content
 * const safe = sanitizeHTML(userInput);
 *
 * // Sanitize plain text input
 * const safeText = sanitizeInput(userInput);
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * Uses DOMPurify to remove dangerous HTML/JavaScript while preserving safe formatting.
 *
 * @param dirty - Raw HTML string from user input
 * @param options - Customization options
 * @returns Sanitized HTML string safe for rendering
 *
 * @example
 * const userComment = '<script>alert("xss")</script><p>Hello</p>';
 * const safe = sanitizeHTML(userComment);
 * // Result: '<p>Hello</p>'
 */
export function sanitizeHTML(
  dirty: string,
  options?: {
    allowedTags?: string[];
    allowedAttributes?: string[];
  }
): string {
  const config: Config = {
    ALLOWED_TAGS: options?.allowedTags || ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: options?.allowedAttributes || [],
    KEEP_CONTENT: true,
    RETURN_TRUSTED_TYPE: false,
  };

  const sanitized = DOMPurify.sanitize(dirty, config);
  return typeof sanitized === 'string' ? sanitized : '';
}

/**
 * Sanitize plain text input
 *
 * Removes HTML tags and dangerous characters from user input.
 * Suitable for plain text fields like names, emails, etc.
 *
 * @param input - Raw text input
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized text string
 *
 * @example
 * const username = sanitizeInput('<script>alert(1)</script>John Doe');
 * // Result: 'John Doe'
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input) return '';

  return (
    input
      .trim()
      // Remove script tags AND their content (security-critical)
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove style tags AND their content
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove any remaining HTML tags (but keep their content)
      .replace(/<[^>]*>/g, '')
      // Remove null bytes
      .replace(/\0/g, '')
      // Limit length
      .slice(0, maxLength)
  );
}

/**
 * Sanitize email input
 *
 * Validates and sanitizes email addresses.
 *
 * @param email - Email address to sanitize
 * @returns Sanitized email or empty string if invalid
 *
 * @example
 * const email = sanitizeEmail('user@example.com<script>');
 * // Result: 'user@example.com'
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeInput(email, 254); // RFC 5321 max length
  // ✅ Use centralized EMAIL_REGEX from validation.ts (single source of truth)
  return EMAIL_REGEX.test(sanitized) ? sanitized.toLowerCase() : '';
}

/**
 * Sanitize URL input
 *
 * Validates URLs and ensures they use safe protocols.
 *
 * @param url - URL to sanitize
 * @param allowedProtocols - Allowed URL protocols (default: ['http', 'https'])
 * @returns Sanitized URL or empty string if invalid
 *
 * @example
 * const url = sanitizeURL('javascript:alert(1)');
 * // Result: '' (blocked dangerous protocol)
 *
 * const safeUrl = sanitizeURL('https://example.com');
 * // Result: 'https://example.com'
 */
export function sanitizeURL(url: string, allowedProtocols: string[] = ['http', 'https']): string {
  try {
    const sanitized = sanitizeInput(url, 2048); // Common max URL length
    const parsed = new URL(sanitized);

    // Check if protocol is allowed
    const protocol = parsed.protocol.replace(':', '');
    if (!allowedProtocols.includes(protocol)) {
      return '';
    }

    return parsed.href;
  } catch {
    // Invalid URL
    return '';
  }
}

function stripControlCharacters(value: string): string {
  let result = '';

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const code = char.charCodeAt(0);

    if (code > 31 && code !== 127) {
      result += char;
    }
  }

  return result;
}

/**
 * Sanitize filename
 *
 * Removes dangerous characters from filenames.
 *
 * @param filename - Filename to sanitize
 * @returns Safe filename
 *
 * @example
 * const filename = sanitizeFilename('../../../etc/passwd');
 * // Result: 'etcpasswd'
 */
export function sanitizeFilename(filename: string): string {
  const cleaned = filename
    // Remove path traversal attempts
    .replace(/\.\./g, '')
    // Remove path separators
    .replace(/[/\\]/g, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Trim and limit length
    .trim()
    .slice(0, 255);

  return stripControlCharacters(cleaned);
}

/**
 * Sanitize JSON string
 *
 * Safely parses JSON and prevents prototype pollution.
 *
 * @param jsonString - JSON string to parse
 * @returns Parsed object or null if invalid
 *
 * @example
 * const data = sanitizeJSON('{"__proto__": {"admin": true}}');
 * // Prototype pollution prevented
 */
export function sanitizeJSON<T = unknown>(jsonString: string): T | null {
  try {
    const parsed = JSON.parse(jsonString);

    // Remove __proto__ and constructor to prevent prototype pollution
    if (parsed && typeof parsed === 'object') {
      delete parsed.__proto__;
      delete parsed.constructor;
    }

    return parsed as T;
  } catch {
    return null;
  }
}

/**
 * React component for rendering sanitized HTML
 *
 * Use this component when you need to render user-generated HTML content.
 *
 * @example
 * <SanitizedHTML content={userGeneratedHTML} />
 */
export interface SanitizedHTMLProps {
  content: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
  className?: string;
}

export function SanitizedHTML({
  content,
  allowedTags,
  allowedAttributes,
  className = '',
}: SanitizedHTMLProps) {
  const sanitized = sanitizeHTML(content, { allowedTags, allowedAttributes });

  return React.createElement('div', {
    className,
    dangerouslySetInnerHTML: { __html: sanitized },
  });
}

/**
 * React hook for automatic input sanitization
 * React 19: Removed useMemo - compiler handles memoization automatically
 *
 * @param initialValue - Initial input value
 * @param sanitizer - Sanitization function to use
 * @returns [value, setValue, sanitizedValue]
 *
 * @example
 * const [email, setEmail, sanitizedEmail] = useSanitizedInput('', sanitizeEmail);
 */
export function useSanitizedInput(
  initialValue: string = '',
  sanitizer: (input: string) => string = sanitizeInput
): [string, (value: string) => void, string] {
  const [value, setValue] = React.useState(initialValue);
  // React 19 Compiler handles memoization automatically
  const sanitized = sanitizer(value);

  return [value, setValue, sanitized];
}
