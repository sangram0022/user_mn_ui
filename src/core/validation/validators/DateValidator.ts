/**
 * Date Validator
 * Validates date values, formats, ranges, and relative constraints
 * 
 * Features:
 * - Date format validation (ISO 8601, custom formats)
 * - Past/future date validation
 * - Date range validation (min/max)
 * - Age calculation and validation
 * - Business day validation
 * - Leap year handling
 * 
 * @example
 * const validator = new DateValidator({ minDate: '2000-01-01', maxDate: '2024-12-31' });
 * const result = validator.validate('2023-06-15', 'birthDate');
 */

import { BaseValidator } from './BaseValidator';
import type { FieldValidationResult } from '../ValidationResult';
import { ValidationStatus } from '../ValidationStatus';

export interface DateValidatorOptions {
  /** Minimum allowed date (ISO 8601 string or Date) */
  minDate?: string | Date;
  
  /** Maximum allowed date (ISO 8601 string or Date) */
  maxDate?: string | Date;
  
  /** Must be a date in the past */
  mustBePast?: boolean;
  
  /** Must be a date in the future */
  mustBeFuture?: boolean;
  
  /** Minimum age (for birthdate validation) */
  minAge?: number;
  
  /** Maximum age (for birthdate validation) */
  maxAge?: number;
  
  /** Allow weekends */
  allowWeekends?: boolean;
  
  /** Allowed date formats (default: ISO 8601) */
  formats?: string[];
  
  /** Custom error messages */
  messages?: {
    invalid?: string;
    past?: string;
    future?: string;
    minDate?: string;
    maxDate?: string;
    minAge?: string;
    maxAge?: string;
    weekend?: string;
  };
}

export class DateValidator extends BaseValidator {
  readonly name = 'DateValidator';
  
  private options: {
    minDate?: string | Date;
    maxDate?: string | Date;
    mustBePast: boolean;
    mustBeFuture: boolean;
    minAge: number;
    maxAge: number;
    allowWeekends: boolean;
    formats: string[];
    messages: DateValidatorOptions['messages'];
  };
  
  constructor(options: DateValidatorOptions = {}) {
    super();
    this.options = {
      minDate: options.minDate,
      maxDate: options.maxDate,
      mustBePast: options.mustBePast ?? false,
      mustBeFuture: options.mustBeFuture ?? false,
      minAge: options.minAge ?? 0,
      maxAge: options.maxAge ?? 150,
      allowWeekends: options.allowWeekends ?? true,
      formats: options.formats ?? ['ISO8601'],
      messages: options.messages,
    };
  }
  
  validate(value: unknown, field = 'date'): FieldValidationResult {
    // Check if empty
    if (this.isEmpty(value)) {
      return {
        status: ValidationStatus.ERROR,
        isValid: false,
        field,
        errors: [this.options.messages?.invalid ?? 'Date is required'],
        warnings: [],
        metadata: { validator: this.name },
      };
    }
    
    const dateStr = this.toString(value);
    
    // Parse date
    const parsedDate = this.parseDate(dateStr);
    if (!parsedDate) {
      return {
        status: ValidationStatus.ERROR,
        isValid: false,
        field,
        errors: [this.options.messages?.invalid ?? `Invalid date format. Expected: ${this.options.formats.join(', ')}`],
        warnings: [],
        metadata: { validator: this.name },
      };
    }
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check if date is in the past
    if (this.options.mustBePast && parsedDate >= new Date()) {
      errors.push(this.options.messages?.past ?? 'Date must be in the past');
    }
    
    // Check if date is in the future
    if (this.options.mustBeFuture && parsedDate <= new Date()) {
      errors.push(this.options.messages?.future ?? 'Date must be in the future');
    }
    
    // Check minimum date
    if (this.options.minDate) {
      const minDate = typeof this.options.minDate === 'string' 
        ? new Date(this.options.minDate) 
        : this.options.minDate;
      if (parsedDate < minDate) {
        errors.push(
          this.options.messages?.minDate ?? 
          `Date must be on or after ${this.formatDate(minDate)}`
        );
      }
    }
    
    // Check maximum date
    if (this.options.maxDate) {
      const maxDate = typeof this.options.maxDate === 'string' 
        ? new Date(this.options.maxDate) 
        : this.options.maxDate;
      if (parsedDate > maxDate) {
        errors.push(
          this.options.messages?.maxDate ?? 
          `Date must be on or before ${this.formatDate(maxDate)}`
        );
      }
    }
    
    // Check age constraints
    const age = this.calculateAge(parsedDate);
    if (this.options.minAge > 0 && age < this.options.minAge) {
      errors.push(
        this.options.messages?.minAge ?? 
        `You must be at least ${this.options.minAge} years old`
      );
    }
    if (age > this.options.maxAge) {
      errors.push(
        this.options.messages?.maxAge ?? 
        `Age cannot exceed ${this.options.maxAge} years`
      );
    }
    
    // Check weekends
    if (!this.options.allowWeekends && this.isWeekend(parsedDate)) {
      errors.push(this.options.messages?.weekend ?? 'Weekends are not allowed');
    }
    
    // Warnings
    if (this.isLeapYear(parsedDate.getFullYear()) && parsedDate.getMonth() === 1 && parsedDate.getDate() === 29) {
      warnings.push('This is a leap year date (February 29)');
    }
    
    const isValid = errors.length === 0;
    
    return {
      status: isValid ? ValidationStatus.SUCCESS : ValidationStatus.ERROR,
      isValid,
      field,
      errors,
      warnings,
      metadata: {
        validator: this.name,
        parsedDate: parsedDate.toISOString(),
        age: age,
      },
    };
  }
  
  // ============================================================================
  // Helper Methods
  // ============================================================================
  
  /**
   * Parse date string to Date object
   */
  private parseDate(dateStr: string): Date | null {
    // Try ISO 8601 format first
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
    
    // Try other formats if specified
    // For simplicity, we only support ISO 8601 in this implementation
    // Add custom format parsers here if needed
    
    return null;
  }
  
  /**
   * Format date for error messages
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Calculate age from birthdate
   */
  private calculateAge(birthdate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }
    
    return age;
  }
  
  /**
   * Check if date is a weekend
   */
  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  }
  
  /**
   * Check if year is a leap year
   */
  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }
}

/**
 * Quick validation functions
 */

export function validateDate(
  value: unknown,
  options?: DateValidatorOptions,
  field?: string
): FieldValidationResult {
  const validator = new DateValidator(options);
  return validator.validate(value, field);
}

export function isValidDate(value: unknown): boolean {
  const result = validateDate(value);
  return result.isValid;
}

export function isPastDate(value: unknown): boolean {
  const result = validateDate(value, { mustBePast: true });
  return result.isValid;
}

export function isFutureDate(value: unknown): boolean {
  const result = validateDate(value, { mustBeFuture: true });
  return result.isValid;
}

export function isValidAge(value: unknown, minAge: number, maxAge: number): boolean {
  const result = validateDate(value, { minAge, maxAge, mustBePast: true });
  return result.isValid;
}

