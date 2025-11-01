// ========================================
// Validation Builder
// Fluent interface for chaining validators
// ========================================

import type { IValidator } from './validators/BaseValidator';
import { EmailValidator } from './validators/EmailValidator';
import { PasswordValidator, type PasswordValidatorOptions } from './validators/PasswordValidator';
import { UsernameValidator } from './validators/UsernameValidator';
import { PhoneValidator } from './validators/PhoneValidator';
import { NameValidator } from './validators/NameValidator';
import {
  createSuccessResult,
  createErrorResult,
  mergeValidationResults,
  type FieldValidationResult,
  type ValidationResult,
} from './ValidationResult';

/**
 * Validation Builder
 * Provides fluent interface for building validation chains
 * 
 * @example
 * ```ts
 * // Single field validation
 * const result = new ValidationBuilder()
 *   .required('Email is required')
 *   .email()
 *   .validate('user@example.com', 'email');
 * 
 * // Multiple field validation
 * const formResult = new ValidationBuilder()
 *   .validateField('email', email, builder => builder.required().email())
 *   .validateField('password', password, builder => builder.required().password())
 *   .result();
 * ```
 */
export class ValidationBuilder {
  private validators: IValidator[] = [];
  private requiredMessage?: string;
  private isRequiredField = false;
  private fieldResults: FieldValidationResult[] = [];
  
  /**
   * Mark field as required
   * @param message - Custom error message
   */
  required(message?: string): this {
    this.isRequiredField = true;
    this.requiredMessage = message || 'This field is required';
    return this;
  }
  
  /**
   * Add email validator
   * @param message - Custom error message
   */
  email(message?: string): this {
    this.validators.push(new EmailValidator({ message, allowEmpty: !this.isRequiredField }));
    return this;
  }
  
  /**
   * Add password validator
   * @param options - Password validation options
   */
  password(options?: PasswordValidatorOptions): this {
    this.validators.push(
      new PasswordValidator({
        ...options,
        allowEmpty: !this.isRequiredField,
      })
    );
    return this;
  }
  
  /**
   * Add username validator
   * @param message - Custom error message
   */
  username(message?: string): this {
    this.validators.push(new UsernameValidator({ message, allowEmpty: !this.isRequiredField }));
    return this;
  }
  
  /**
   * Add phone validator
   * @param message - Custom error message
   */
  phone(message?: string): this {
    this.validators.push(new PhoneValidator({ message, allowEmpty: !this.isRequiredField }));
    return this;
  }
  
  /**
   * Add name validator (for first name, last name, etc.)
   * @param message - Custom error message
   * @param fieldName - Field name for error messages (e.g., 'First name')
   */
  name(message?: string, fieldName?: string): this {
    this.validators.push(new NameValidator({ 
      message, 
      fieldName,
      allowEmpty: !this.isRequiredField 
    }));
    return this;
  }
  
  /**
   * Add custom validator
   * @param validator - Validator instance
   */
  custom(validator: IValidator): this {
    this.validators.push(validator);
    return this;
  }
  
  /**
   * Validate a value and return result
   * @param value - Value to validate
   * @param field - Field name (default: 'field')
   * @returns Validation result
   */
  validate(value: unknown, field: string = 'field'): FieldValidationResult {
    // Check required
    if (this.isRequiredField) {
      const isEmpty =
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '');
        
      if (isEmpty) {
        return createErrorResult(field, [this.requiredMessage!]);
      }
    }
    
    // Run all validators
    const errors: string[] = [];
    let metadata: Record<string, unknown> = {};
    
    for (const validator of this.validators) {
      const result = validator.validate(value, field);
      
      if (!result.isValid) {
        errors.push(...result.errors);
      }
      
      if (result.metadata) {
        metadata = { ...metadata, ...result.metadata };
      }
    }
    
    if (errors.length > 0) {
      return createErrorResult(field, errors, metadata);
    }
    
    return createSuccessResult(field, metadata);
  }
  
  /**
   * Validate a field and add to results (for form validation)
   * @param field - Field name
   * @param value - Field value
   * @param configure - Builder configuration function
   * @returns This builder for chaining
   */
  validateField(
    field: string,
    value: unknown,
    configure: (builder: ValidationBuilder) => ValidationBuilder
  ): this {
    const fieldBuilder = new ValidationBuilder();
    configure(fieldBuilder);
    const result = fieldBuilder.validate(value, field);
    this.fieldResults.push(result);
    return this;
  }
  
  /**
   * Get merged validation result for all fields
   * @returns Form validation result
   */
  result(): ValidationResult {
    return mergeValidationResults(this.fieldResults);
  }
  
  /**
   * Reset builder state
   */
  reset(): this {
    this.validators = [];
    this.requiredMessage = undefined;
    this.isRequiredField = false;
    this.fieldResults = [];
    return this;
  }
}

/**
 * Create a new validation builder
 * Convenience function for creating builder instances
 */
export function createValidator(): ValidationBuilder {
  return new ValidationBuilder();
}

/**
 * Quick validation helpers
 */
export const quickValidate = {
  /**
   * Validate email quickly
   */
  email: (email: string): FieldValidationResult => {
    return new ValidationBuilder()
      .required()
      .email()
      .validate(email, 'email');
  },
  
  /**
   * Validate password quickly
   */
  password: (password: string): FieldValidationResult => {
    return new ValidationBuilder()
      .required()
      .password()
      .validate(password, 'password');
  },
  
  /**
   * Validate username quickly
   */
  username: (username: string): FieldValidationResult => {
    return new ValidationBuilder()
      .required()
      .username()
      .validate(username, 'username');
  },
  
  /**
   * Validate phone quickly
   */
  phone: (phone: string): FieldValidationResult => {
    return new ValidationBuilder()
      .required()
      .phone()
      .validate(phone, 'phone');
  },
  
  /**
   * Validate name quickly
   */
  name: (name: string, fieldName: string = 'Name'): FieldValidationResult => {
    return new ValidationBuilder()
      .required()
      .name(undefined, fieldName)
      .validate(name, fieldName.toLowerCase().replace(/\s+/g, '_'));
  },
  
  /**
   * Validate required field quickly
   */
  required: (value: unknown, field: string = 'field'): FieldValidationResult => {
    return new ValidationBuilder()
      .required()
      .validate(value, field);
  },
};
