// ========================================
// Email Validator
// Single source of truth for email validation
// ========================================

import { BaseValidator } from './BaseValidator';
import { createSuccessResult, createErrorResult, type FieldValidationResult } from '../ValidationResult';

/**
 * Email validation regex - RFC 5322 compliant (simplified)
 * Validates: user@domain.tld
 * 
 * Pattern explanation:
 * - Local part: alphanumeric, dots, underscores, percent, plus, hyphen
 * - Domain: alphanumeric with dots and hyphens
 * - TLD: 2+ letters
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Email validation options
 */
export interface EmailValidatorOptions {
  /** Custom error message */
  message?: string;
  
  /** Allow empty values (default: false) */
  allowEmpty?: boolean;
  
  /** Maximum email length (default: 254 per RFC 5321) */
  maxLength?: number;
  
  /** Blocked domains (e.g., ['tempmail.com', 'throwaway.email']) */
  blockedDomains?: string[];
}

/**
 * Email Validator
 * Validates email addresses with RFC 5322 compliance
 * 
 * @example
 * ```ts
 * const validator = new EmailValidator();
 * const result = validator.validate('user@example.com', 'email');
 * console.log(result.isValid); // true
 * ```
 */
export class EmailValidator extends BaseValidator {
  readonly name = 'EmailValidator';
  
  private options: Required<EmailValidatorOptions>;
  
  constructor(options: EmailValidatorOptions = {}) {
    super();
    this.options = {
      message: options.message || 'Please enter a valid email address',
      allowEmpty: options.allowEmpty ?? false,
      maxLength: options.maxLength ?? 254,
      blockedDomains: options.blockedDomains ?? [],
    };
  }
  
  validate(value: unknown, field: string = 'email'): FieldValidationResult {
    const email = this.toString(value);
    
    // Check empty
    if (this.isEmpty(value)) {
      if (this.options.allowEmpty) {
        return createSuccessResult(field);
      }
      return createErrorResult(field, ['Email is required']);
    }
    
    // Check length
    if (email.length > this.options.maxLength) {
      return createErrorResult(field, [`Email must not exceed ${this.options.maxLength} characters`]);
    }
    
    // Check format
    if (!EMAIL_REGEX.test(email)) {
      return createErrorResult(field, [this.options.message]);
    }
    
    // Check blocked domains
    if (this.options.blockedDomains.length > 0) {
      const domain = email.split('@')[1]?.toLowerCase();
      if (domain && this.options.blockedDomains.includes(domain)) {
        return createErrorResult(field, ['This email domain is not allowed']);
      }
    }
    
    return createSuccessResult(field, { email });
  }
  
  /**
   * Extract domain from email
   */
  static extractDomain(email: string): string | null {
    const match = email.match(/@([a-zA-Z0-9.-]+)$/);
    return match ? match[1] : null;
  }
  
  /**
   * Normalize email (lowercase, trim)
   */
  static normalize(email: string): string {
    return email.trim().toLowerCase();
  }
  
  /**
   * Check if email is from a specific domain
   */
  static isFromDomain(email: string, domain: string): boolean {
    const emailDomain = this.extractDomain(email);
    return emailDomain?.toLowerCase() === domain.toLowerCase();
  }
}

// Singleton instance for common usage
export const emailValidator = new EmailValidator();

/**
 * Convenience function for quick email validation
 * @param email - Email to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  return emailValidator.validate(email).isValid;
}
