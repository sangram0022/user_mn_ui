// ========================================
// Password Validator
// Single source of truth for password validation
// Consolidates logic from domains/auth and shared/utils
// ========================================

import { BaseValidator } from './BaseValidator';
import {
  createSuccessResult,
  createErrorResult,
  type FieldValidationResult,
  type PasswordStrengthResult,
} from '../ValidationResult';
import { ValidationStatus } from '../ValidationStatus';

/**
 * Password strength levels
 */
export const PasswordStrength = {
  WEAK: 'weak',
  FAIR: 'fair',
  GOOD: 'good',
  STRONG: 'strong',
  VERY_STRONG: 'very_strong',
} as const;

export type PasswordStrengthType = typeof PasswordStrength[keyof typeof PasswordStrength];

/**
 * Password validation rules
 * Single source of truth for password requirements
 */
export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
} as const;

/**
 * Special characters allowed in passwords
 */
export const PASSWORD_SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

/**
 * Password validator options
 */
export interface PasswordValidatorOptions {
  /** Minimum length (default: 8) */
  minLength?: number;
  
  /** Maximum length (default: 128) */
  maxLength?: number;
  
  /** Require at least one uppercase letter */
  requireUppercase?: boolean;
  
  /** Require at least one lowercase letter */
  requireLowercase?: boolean;
  
  /** Require at least one number */
  requireNumber?: boolean;
  
  /** Require at least one special character */
  requireSpecial?: boolean;
  
  /** Allow empty values (default: false) */
  allowEmpty?: boolean;
  
  /** Custom error message */
  message?: string;
  
  /** Calculate strength score (default: false) */
  calculateStrength?: boolean;
}

/**
 * Password Validator
 * Validates passwords with configurable rules and strength calculation
 * 
 * @example
 * ```ts
 * const validator = new PasswordValidator({ calculateStrength: true });
 * const result = validator.validate('MyPassword123!', 'password') as PasswordStrengthResult;
 * console.log(result.strength); // 'strong'
 * console.log(result.score); // 85
 * ```
 */
export class PasswordValidator extends BaseValidator {
  readonly name = 'PasswordValidator';
  
  private options: Required<PasswordValidatorOptions>;
  
  constructor(options: PasswordValidatorOptions = {}) {
    super();
    this.options = {
      minLength: options.minLength ?? PASSWORD_RULES.MIN_LENGTH,
      maxLength: options.maxLength ?? PASSWORD_RULES.MAX_LENGTH,
      requireUppercase: options.requireUppercase ?? PASSWORD_RULES.REQUIRE_UPPERCASE,
      requireLowercase: options.requireLowercase ?? PASSWORD_RULES.REQUIRE_LOWERCASE,
      requireNumber: options.requireNumber ?? PASSWORD_RULES.REQUIRE_NUMBER,
      requireSpecial: options.requireSpecial ?? PASSWORD_RULES.REQUIRE_SPECIAL,
      allowEmpty: options.allowEmpty ?? false,
      message: options.message || 'Password does not meet requirements',
      calculateStrength: options.calculateStrength ?? false,
    };
  }
  
  validate(value: unknown, field: string = 'password'): FieldValidationResult | PasswordStrengthResult {
    const password = this.toString(value);
    
    // Check empty
    if (this.isEmpty(value)) {
      if (this.options.allowEmpty) {
        return createSuccessResult(field);
      }
      return createErrorResult(field, ['Password is required']);
    }
    
    const errors: string[] = [];
    
    // Length checks
    if (password.length < this.options.minLength) {
      errors.push(`Password must be at least ${this.options.minLength} characters`);
    }
    
    if (password.length > this.options.maxLength) {
      errors.push(`Password must not exceed ${this.options.maxLength} characters`);
    }
    
    // Character requirement checks
    if (this.options.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (this.options.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (this.options.requireNumber && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (this.options.requireSpecial && !/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Return basic result if not calculating strength
    if (!this.options.calculateStrength) {
      if (errors.length > 0) {
        return createErrorResult(field, errors);
      }
      return createSuccessResult(field);
    }
    
    // Calculate password strength
    return this.calculatePasswordStrength(password, field, errors);
  }
  
  /**
   * Calculate password strength with detailed feedback
   */
  private calculatePasswordStrength(
    password: string,
    field: string,
    validationErrors: string[]
  ): PasswordStrengthResult {
    const feedback: string[] = [];
    let score = 0;
    
    // Length scoring
    const length = password.length;
    if (length >= this.options.minLength && length < 12) {
      score += 20;
    } else if (length >= 12 && length < 16) {
      score += 25;
      feedback.push('Good length');
    } else if (length >= 16) {
      score += 30;
      feedback.push('Excellent length');
    }
    
    // Character variety scoring
    if (/[A-Z]/.test(password)) {
      score += 15;
    } else {
      feedback.push('Add uppercase letters');
    }
    
    if (/[a-z]/.test(password)) {
      score += 15;
    } else {
      feedback.push('Add lowercase letters');
    }
    
    if (/[0-9]/.test(password)) {
      score += 15;
    } else {
      feedback.push('Add numbers');
    }
    
    if (/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) {
      score += 15;
    } else {
      feedback.push('Add special characters');
    }
    
    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) {
      score -= 10;
      feedback.push('Avoid repeating characters');
    }
    
    if (/^[0-9]+$/.test(password)) {
      score -= 20;
      feedback.push('Avoid only numbers');
    }
    
    if (/^[a-zA-Z]+$/.test(password)) {
      score -= 15;
      feedback.push('Add numbers and symbols');
    }
    
    // Sequential patterns
    if (/abc|bcd|cde|def|123|234|345|456|789/.test(password.toLowerCase())) {
      score -= 10;
      feedback.push('Avoid sequential patterns');
    }
    
    // Common passwords
    const commonPasswords = [
      'password', 'admin', 'user', '123456', 'qwerty', 
      'letmein', 'welcome', 'monkey', 'dragon', 'master'
    ];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      score -= 20;
      feedback.push('Avoid common words');
    }
    
    // Cap score at 100
    score = Math.max(0, Math.min(100, score));
    
    // Determine strength level
    let strength: PasswordStrengthType;
    if (score < 30) {
      strength = PasswordStrength.WEAK;
    } else if (score < 50) {
      strength = PasswordStrength.FAIR;
    } else if (score < 70) {
      strength = PasswordStrength.GOOD;
    } else if (score < 90) {
      strength = PasswordStrength.STRONG;
    } else {
      strength = PasswordStrength.VERY_STRONG;
    }
    
    // Positive feedback if strong
    if (feedback.length === 0) {
      feedback.push('Password looks great!');
    }
    
    // Create result
    const isValid = validationErrors.length === 0;
    const status = isValid ? ValidationStatus.SUCCESS : ValidationStatus.ERROR;
    
    return {
      field,
      status,
      isValid,
      errors: validationErrors,
      warnings: [],
      score,
      strength,
      feedback,
    };
  }
  
  /**
   * Check if two passwords match
   */
  static passwordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword && password.length > 0;
  }
}

// Singleton instances for common usage
export const passwordValidator = new PasswordValidator();
export const passwordStrengthValidator = new PasswordValidator({ calculateStrength: true });

/**
 * Convenience function for quick password validation
 * @param password - Password to validate
 * @returns True if password is valid
 */
export function isValidPassword(password: string): boolean {
  return passwordValidator.validate(password).isValid;
}

/**
 * Convenience function for password strength calculation
 * @param password - Password to analyze
 * @returns Password strength result
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  return passwordStrengthValidator.validate(password) as PasswordStrengthResult;
}
