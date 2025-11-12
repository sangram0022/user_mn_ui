// ========================================
// Username Validator
// Matches backend: src/app/core/validation/patterns.py - USERNAME_SAFE
// ========================================

import { BaseValidator } from './BaseValidator';
import { createSuccessResult, createErrorResult, type FieldValidationResult } from '../ValidationResult';
import { translateValidation } from '@/core/localization';

/**
 * Username validation pattern
 * 
 * MATCHES BACKEND: src/app/user_core/utils/validation_utils.py
 * Pattern: ^[a-zA-Z0-9_]{3,30}$
 * - Alphanumeric and underscores only
 * - 3-30 characters
 */
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

/**
 * Username validation options
 */
export interface UsernameValidatorOptions {
  /** Custom error message */
  message?: string;
  
  /** Allow empty values (default: false) */
  allowEmpty?: boolean;
  
  /** Minimum length (default: 3) */
  minLength?: number;
  
  /** Maximum length (default: 30) */
  maxLength?: number;
}

/**
 * Username Validator
 * Validates usernames with alphanumeric and underscore characters
 * 
 * @example
 * ```ts
 * const validator = new UsernameValidator();
 * const result = validator.validate('john_doe123', 'username');
 * console.log(result.isValid); // true
 * ```
 */
export class UsernameValidator extends BaseValidator {
  readonly name = 'UsernameValidator';
  
  private options: Required<UsernameValidatorOptions>;
  
  constructor(options: UsernameValidatorOptions = {}) {
    super();
    this.options = {
      message: options.message || translateValidation('username', 'pattern'),
      allowEmpty: options.allowEmpty ?? false,
      minLength: options.minLength ?? USERNAME_MIN_LENGTH,
      maxLength: options.maxLength ?? USERNAME_MAX_LENGTH,
    };
  }
  
  validate(value: unknown, field: string = 'username'): FieldValidationResult {
    const username = this.toString(value);
    
    // Check empty
    if (this.isEmpty(value)) {
      if (this.options.allowEmpty) {
        return createSuccessResult(field);
      }
      return createErrorResult(field, [translateValidation(field, 'required')]);
    }
    
    const trimmed = username.trim();
    
    // Check length
    if (trimmed.length < this.options.minLength) {
      return createErrorResult(field, [translateValidation(field, 'minLength', { count: this.options.minLength })]);
    }
    
    if (trimmed.length > this.options.maxLength) {
      return createErrorResult(field, [translateValidation(field, 'maxLength', { count: this.options.maxLength })]);
    }
    
    // Check format - must match backend pattern
    if (!USERNAME_REGEX.test(trimmed)) {
      return createErrorResult(field, [this.options.message]);
    }
    
    return createSuccessResult(field, { username: trimmed });
  }
}

// Singleton instance for common usage
export const usernameValidator = new UsernameValidator();

/**
 * Convenience function for quick username validation
 * @param username - Username to validate
 * @returns True if username is valid
 */
export function isValidUsername(username: string): boolean {
  return usernameValidator.validate(username).isValid;
}
