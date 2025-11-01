// ========================================
// Validation Result Dataclass
// Type-safe validation results with metadata
// ========================================

import { ValidationStatus, type ValidationStatusType } from './ValidationStatus';

/**
 * Field-level validation result
 * Contains validation outcome for a single field
 */
export interface FieldValidationResult {
  /** Field name that was validated */
  field: string;
  
  /** Validation status */
  status: ValidationStatusType;
  
  /** Is the field value valid */
  isValid: boolean;
  
  /** Error messages (empty if valid) */
  errors: string[];
  
  /** Warning messages (non-blocking issues) */
  warnings: string[];
  
  /** Optional metadata about the validation */
  metadata?: Record<string, unknown>;
}

/**
 * Form-level validation result
 * Contains validation outcomes for multiple fields
 */
export interface ValidationResult {
  /** Overall validation status */
  status: ValidationStatusType;
  
  /** Are all fields valid */
  isValid: boolean;
  
  /** All error messages across all fields */
  errors: string[];
  
  /** All warning messages across all fields */
  warnings: string[];
  
  /** Field-specific validation results */
  fields?: Record<string, FieldValidationResult>;
  
  /** Optional metadata about the validation */
  metadata?: Record<string, unknown>;
}

/**
 * Password strength result (specialized)
 */
export interface PasswordStrengthResult extends FieldValidationResult {
  /** Password strength score (0-100) */
  score: number;
  
  /** Strength level */
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';
  
  /** Improvement suggestions */
  feedback: string[];
}

/**
 * Create a successful field validation result
 */
export function createSuccessResult(field: string, metadata?: Record<string, unknown>): FieldValidationResult {
  return {
    field,
    status: ValidationStatus.SUCCESS,
    isValid: true,
    errors: [],
    warnings: [],
    metadata,
  };
}

/**
 * Create an error field validation result
 */
export function createErrorResult(
  field: string,
  errors: string[],
  metadata?: Record<string, unknown>
): FieldValidationResult {
  return {
    field,
    status: ValidationStatus.ERROR,
    isValid: false,
    errors,
    warnings: [],
    metadata,
  };
}

/**
 * Create a warning field validation result
 */
export function createWarningResult(
  field: string,
  warnings: string[],
  metadata?: Record<string, unknown>
): FieldValidationResult {
  return {
    field,
    status: ValidationStatus.WARNING,
    isValid: true,
    errors: [],
    warnings,
    metadata,
  };
}

/**
 * Merge multiple field results into a form validation result
 */
export function mergeValidationResults(results: FieldValidationResult[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fields: Record<string, FieldValidationResult> = {};
  
  let hasErrors = false;
  
  for (const result of results) {
    fields[result.field] = result;
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    
    if (!result.isValid) {
      hasErrors = true;
    }
  }
  
  return {
    status: hasErrors ? ValidationStatus.ERROR : ValidationStatus.SUCCESS,
    isValid: !hasErrors,
    errors,
    warnings,
    fields,
  };
}

/**
 * Type guard to check if result is PasswordStrengthResult
 */
export function isPasswordStrengthResult(result: FieldValidationResult): result is PasswordStrengthResult {
  return 'score' in result && 'strength' in result && 'feedback' in result;
}
