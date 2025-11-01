// ========================================
// Base Validator Interface
// Contract for all validators
// ========================================

import type { FieldValidationResult } from '../ValidationResult';

/**
 * Base validator interface
 * All validators must implement this interface
 */
export interface IValidator {
  /**
   * Validate a value and return result
   * @param value - Value to validate
   * @param field - Optional field name for result
   * @returns Validation result with status and messages
   */
  validate(value: unknown, field?: string): FieldValidationResult;
  
  /**
   * Validator name (for debugging and error messages)
   */
  readonly name: string;
}

/**
 * Base abstract validator class
 * Provides common functionality for all validators
 */
export abstract class BaseValidator implements IValidator {
  abstract readonly name: string;
  
  abstract validate(value: unknown, field?: string): FieldValidationResult;
  
  /**
   * Check if value is empty (null, undefined, empty string)
   */
  protected isEmpty(value: unknown): boolean {
    return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
  }
  
  /**
   * Convert value to string safely
   */
  protected toString(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value).trim();
  }
}
