// ========================================
// Phone Validator
// Matches backend: src/app/core/validation/patterns.py - PHONE_NUMBER
// ========================================

import { BaseValidator } from './BaseValidator';
import { createSuccessResult, createErrorResult, type FieldValidationResult } from '../ValidationResult';

/**
 * Phone number validation pattern (E.164 format)
 * 
 * MATCHES BACKEND: src/app/core/validation/patterns.py - PHONE_NUMBER
 * Pattern: ^\+?[1-9]\d{1,14}$
 * - Optional + prefix
 * - Starts with 1-9
 * - 1-14 digits after first digit
 * - Total: 10-15 digits (matches backend phone_min_digits and phone_max_digits)
 */
export const PHONE_REGEX = /^\+?[1-9]\d{9,14}$/; // 10-15 total digits
export const PHONE_MIN_DIGITS = 10; // Backend: phone_min_digits
export const PHONE_MAX_DIGITS = 15; // Backend: phone_max_digits

/**
 * Phone validation options
 */
export interface PhoneValidatorOptions {
  /** Custom error message */
  message?: string;
  
  /** Allow empty values (default: true, phone is optional) */
  allowEmpty?: boolean;
  
  /** Minimum digits (default: 10) */
  minDigits?: number;
  
  /** Maximum digits (default: 15) */
  maxDigits?: number;
  
  /** Allow international format with + prefix (default: true) */
  allowInternational?: boolean;
}

/**
 * Phone Validator
 * Validates phone numbers in E.164 format
 * 
 * @example
 * ```ts
 * const validator = new PhoneValidator();
 * const result = validator.validate('+1234567890', 'phone');
 * console.log(result.isValid); // true
 * 
 * const result2 = validator.validate('1234567890', 'phone');
 * console.log(result2.isValid); // true
 * ```
 */
export class PhoneValidator extends BaseValidator {
  readonly name = 'PhoneValidator';
  
  private options: Required<PhoneValidatorOptions>;
  
  constructor(options: PhoneValidatorOptions = {}) {
    super();
    this.options = {
      message: options.message || `Phone number must be ${PHONE_MIN_DIGITS}-${PHONE_MAX_DIGITS} digits`,
      allowEmpty: options.allowEmpty ?? true, // Phone is optional by default
      minDigits: options.minDigits ?? PHONE_MIN_DIGITS,
      maxDigits: options.maxDigits ?? PHONE_MAX_DIGITS,
      allowInternational: options.allowInternational ?? true,
    };
  }
  
  validate(value: unknown, field: string = 'phone'): FieldValidationResult {
    const phone = this.toString(value);
    
    // Check empty - phone is optional by default
    if (this.isEmpty(value)) {
      if (this.options.allowEmpty) {
        return createSuccessResult(field);
      }
      return createErrorResult(field, ['Phone number is required']);
    }
    
    const trimmed = phone.trim();
    
    // Remove all non-digit characters except + at the beginning
    const digitsOnly = trimmed.replace(/\D/g, '');
    
    // Check digit count
    if (digitsOnly.length < this.options.minDigits) {
      return createErrorResult(field, [`Phone number must have at least ${this.options.minDigits} digits`]);
    }
    
    if (digitsOnly.length > this.options.maxDigits) {
      return createErrorResult(field, [`Phone number must not exceed ${this.options.maxDigits} digits`]);
    }
    
    // Check format - must match backend E.164 pattern
    if (!PHONE_REGEX.test(trimmed)) {
      return createErrorResult(field, [this.options.message]);
    }
    
    // If international format is not allowed, check for + prefix
    if (!this.options.allowInternational && trimmed.startsWith('+')) {
      return createErrorResult(field, ['International phone format is not allowed']);
    }
    
    return createSuccessResult(field, { phone: trimmed, digitsOnly });
  }
  
  /**
   * Format phone number for display
   */
  static formatDisplay(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    
    // Format as: +1 (234) 567-8900 (US format example)
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    // For international, just add + if not present
    if (!phone.startsWith('+') && digits.length > 10) {
      return `+${digits}`;
    }
    
    return phone;
  }
  
  /**
   * Normalize phone number (remove formatting)
   */
  static normalize(phone: string): string {
    const trimmed = phone.trim();
    const hasPlus = trimmed.startsWith('+');
    const digits = trimmed.replace(/\D/g, '');
    return hasPlus ? `+${digits}` : digits;
  }
}

// Singleton instance for common usage
export const phoneValidator = new PhoneValidator();

/**
 * Convenience function for quick phone validation
 * @param phone - Phone number to validate
 * @returns True if phone is valid
 */
export function isValidPhone(phone: string): boolean {
  return phoneValidator.validate(phone).isValid;
}
