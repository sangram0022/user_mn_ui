/**
 * Form Accessibility Helper
 * WCAG 2.1 AA: Error Identification (3.3.1), Labels or Instructions (3.3.2)
 */

/**
 * Generates accessible error IDs for form fields
 */
export function getErrorId(fieldId: string): string {
  return `${fieldId}-error`;
}

/**
 * Generates accessible helper text IDs
 */
export function getHelperId(fieldId: string): string {
  return `${fieldId}-helper`;
}

/**
 * Get aria-describedby value for a field
 */
export function getAriaDescribedBy(
  fieldId: string,
  hasError: boolean,
  hasHelper: boolean
): string | undefined {
  const ids: string[] = [];
  
  if (hasError) {
    ids.push(getErrorId(fieldId));
  }
  
  if (hasHelper && !hasError) {
    ids.push(getHelperId(fieldId));
  }
  
  return ids.length > 0 ? ids.join(' ') : undefined;
}

/**
 * Generate accessible form field props
 */
export function getAccessibleFieldProps(
  fieldId: string,
  error?: string,
  helperText?: string
) {
  const hasError = Boolean(error);
  const hasHelper = Boolean(helperText);

  return {
    id: fieldId,
    'aria-invalid': hasError,
    'aria-describedby': getAriaDescribedBy(fieldId, hasError, hasHelper),
    'aria-required': true,
  };
}

/**
 * Announce form errors to screen readers
 */
export function announceFormError(fieldName: string, error: string): string {
  return `${fieldName}: ${error}`;
}

/**
 * Announce form success to screen readers
 */
export function announceFormSuccess(message: string): string {
  return `Success: ${message}`;
}
