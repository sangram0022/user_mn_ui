/**
 * Common form validation utilities
 * Extracted from auth pages for reusability
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      error: 'Email address is required',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  return { isValid: true };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string, minLength = 8): ValidationResult => {
  if (!password) {
    return {
      isValid: false,
      error: 'Password is required',
    };
  }

  if (password.length < minLength) {
    return {
      isValid: false,
      error: `Password must be at least ${minLength} characters long`,
    };
  }

  return { isValid: true };
};

/**
 * Validate password confirmation
 */
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'Passwords do not match',
    };
  }

  return { isValid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || !value.trim()) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  return { isValid: true };
};

/**
 * Validate multiple fields are filled
 */
export const validateAllFieldsFilled = (
  fields: Record<string, string>,
  fieldNames?: string[]
): ValidationResult => {
  const fieldsToCheck = fieldNames || Object.keys(fields);

  for (const fieldName of fieldsToCheck) {
    if (!fields[fieldName] || !fields[fieldName].trim()) {
      return {
        isValid: false,
        error: 'Please fill in all required fields',
      };
    }
  }

  return { isValid: true };
};
