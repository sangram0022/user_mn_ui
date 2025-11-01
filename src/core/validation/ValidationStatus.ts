// ========================================
// Validation Status
// Single source of truth for validation states
// ========================================

/**
 * Validation status types
 * Used to indicate the result of validation operations
 */
export const ValidationStatus = {
  /** Validation passed all checks */
  SUCCESS: 'success',
  
  /** Validation failed with errors */
  ERROR: 'error',
  
  /** Validation passed but has warnings */
  WARNING: 'warning',
  
  /** Informational status (e.g., password strength feedback) */
  INFO: 'info',
} as const;

export type ValidationStatusType = typeof ValidationStatus[keyof typeof ValidationStatus];

/**
 * Type guard to check if a value is a valid ValidationStatus
 */
export function isValidationStatus(value: unknown): value is ValidationStatusType {
  return (
    typeof value === 'string' &&
    Object.values(ValidationStatus).includes(value as ValidationStatusType)
  );
}

/**
 * Get validation status from boolean
 */
export function booleanToStatus(isValid: boolean): ValidationStatusType {
  return isValid ? ValidationStatus.SUCCESS : ValidationStatus.ERROR;
}
