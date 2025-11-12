// ========================================
// Name Validator (First/Last Name)
// Matches backend: src/app/core/config/settings.py - ApplicationConfig
// ========================================

import { BaseValidator } from './BaseValidator';
import { createSuccessResult, createErrorResult, type FieldValidationResult } from '../ValidationResult';
import { translateValidation } from '@/core/localization';

/**
 * Name validation pattern
 * 
 * MATCHES BACKEND: src/app/user_core/utils/validation_utils.py
 * Pattern: ^[a-zA-Z\s\-']+$
 * - Letters only (a-z, A-Z)
 * - Spaces allowed
 * - Hyphens allowed (e.g., Jean-Pierre)
 * - Apostrophes allowed (e.g., O'Brien)
 * - Length: 2-50 characters (backend: name_min_length=2, name_max_length=50)
 */
export const NAME_REGEX = /^[a-zA-Z\s\-']+$/;
export const NAME_MIN_LENGTH = 2; // Backend: NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 50; // Backend: NAME_MAX_LENGTH = 50

/**
 * Name validation options
 */
export interface NameValidatorOptions {
  /** Custom error message */
  message?: string;
  
  /** Allow empty values (default: false) */
  allowEmpty?: boolean;
  
  /** Minimum length (default: 2) */
  minLength?: number;
  
  /** Maximum length (default: 50) */
  maxLength?: number;
  
  /** Field name for error messages (e.g., 'First name', 'Last name') */
  fieldName?: string;
  
  /** Auto-capitalize name (default: true) */
  autoCapitalize?: boolean;
}

/**
 * Name Validator
 * Validates person names (first name, last name)
 * 
 * @example
 * ```ts
 * const validator = new NameValidator({ fieldName: 'First name' });
 * const result = validator.validate('John', 'firstName');
 * console.log(result.isValid); // true
 * 
 * const validator2 = new NameValidator({ fieldName: 'Last name' });
 * const result2 = validator2.validate("O'Brien", 'lastName');
 * console.log(result2.isValid); // true
 * ```
 */
export class NameValidator extends BaseValidator {
  readonly name = 'NameValidator';
  
  private options: Required<NameValidatorOptions>;
  
  constructor(options: NameValidatorOptions = {}) {
    super();
    this.options = {
      message: options.message || translateValidation('name', 'pattern'),
      allowEmpty: options.allowEmpty ?? false,
      minLength: options.minLength ?? NAME_MIN_LENGTH,
      maxLength: options.maxLength ?? NAME_MAX_LENGTH,
      fieldName: options.fieldName || 'Name',
      autoCapitalize: options.autoCapitalize ?? true,
    };
  }
  
  validate(value: unknown, field: string = 'name'): FieldValidationResult {
    const name = this.toString(value);
    
    // Check empty
    if (this.isEmpty(value)) {
      if (this.options.allowEmpty) {
        return createSuccessResult(field);
      }
      return createErrorResult(field, [translateValidation(field, 'required')]);
    }
    
    const trimmed = name.trim();
    
    // Check if empty after trim
    if (trimmed.length === 0) {
      return createErrorResult(field, [translateValidation(field, 'required')]);
    }
    
    // Check length
    if (trimmed.length < this.options.minLength) {
      return createErrorResult(field, [
        translateValidation(field, 'minLength', { count: this.options.minLength })
      ]);
    }
    
    if (trimmed.length > this.options.maxLength) {
      return createErrorResult(field, [
        translateValidation(field, 'maxLength', { count: this.options.maxLength })
      ]);
    }
    
    // Check format - must match backend pattern
    if (!NAME_REGEX.test(trimmed)) {
      return createErrorResult(field, [this.options.message]);
    }
    
    // Check for invalid patterns (excessive spaces, leading/trailing special chars)
    if (trimmed.includes('  ') || 
        trimmed.startsWith(' ') || 
        trimmed.startsWith('-') || 
        trimmed.startsWith("'") ||
        trimmed.endsWith(' ') || 
        trimmed.endsWith('-') || 
        trimmed.endsWith("'")) {
      return createErrorResult(field, [translateValidation(field, 'pattern')]);
    }
    
    // Auto-capitalize if enabled (matches backend .title() behavior)
    const normalized = this.options.autoCapitalize 
      ? this.capitalize(trimmed) 
      : trimmed;
    
    return createSuccessResult(field, { name: normalized });
  }
  
  /**
   * Capitalize name properly (each word capitalized)
   * Matches backend .title() behavior
   */
  private capitalize(name: string): string {
    return name
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }
  
  /**
   * Sanitize name (remove extra spaces)
   */
  static sanitize(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/^[\s\-']+|[\s\-']+$/g, ''); // Remove leading/trailing special chars
  }
}

// Singleton instances for common usage
export const firstNameValidator = new NameValidator({ fieldName: 'First name' });
export const lastNameValidator = new NameValidator({ fieldName: 'Last name' });

/**
 * Convenience function for quick name validation
 * @param name - Name to validate
 * @param fieldName - Field name for error messages
 * @returns True if name is valid
 */
export function isValidName(name: string, fieldName: string = 'Name'): boolean {
  const validator = new NameValidator({ fieldName });
  return validator.validate(name).isValid;
}
