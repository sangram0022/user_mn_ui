// Form validation utilities with React 19 best practices

import { VALIDATION_RULES as BACKEND_VALIDATION_RULES } from '@shared/types';

export type ValidationValue = string | number | boolean | null | undefined;

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: ValidationValue) => string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface FormField {
  value: ValidationValue;
  error?: string;
  touched?: boolean;
  rules?: ValidationRule;
}

export interface FormState {
  [key: string]: FormField;
}

// Email validation regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password validation regex (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Phone number validation regex
export const PHONE_REGEX = /^[+]?[1-9][\d]{0,15}$/;

// URL validation regex
export const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

// ============================================================================
// BACKEND API-SPECIFIC VALIDATION FUNCTIONS ✅ NEW
// Reference: backend_api_details/API_ERROR_CODES.md
// ============================================================================

export interface BackendValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate email format and length (Backend API spec)
 * - Must be valid email format (RFC 5322)
 * - Maximum length: 255 characters
 *
 * @param email Email address to validate
 * @returns Validation result with error message if invalid
 */
export function validateBackendEmail(email: string): BackendValidationResult {
  if (!email || email.trim().length === 0) {
    return {
      valid: false,
      error: 'Email is required',
    };
  }

  if (email.length > BACKEND_VALIDATION_RULES.EMAIL.MAX_LENGTH) {
    return {
      valid: false,
      error: `Email must be at most ${BACKEND_VALIDATION_RULES.EMAIL.MAX_LENGTH} characters`,
    };
  }

  if (!BACKEND_VALIDATION_RULES.EMAIL.PATTERN.test(email)) {
    return {
      valid: false,
      error: 'Invalid email format',
    };
  }

  return { valid: true };
}

/**
 * Validate password strength (Backend API spec)
 * - Minimum length: 8 characters
 * - Must contain at least one uppercase letter
 * - Must contain at least one lowercase letter
 * - Must contain at least one digit
 *
 * @param password Password to validate
 * @returns Validation result with error message if invalid
 */
export function validateBackendPassword(password: string): BackendValidationResult {
  if (!password || password.trim().length === 0) {
    return {
      valid: false,
      error: 'Password is required',
    };
  }

  if (password.length < BACKEND_VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${BACKEND_VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters long`,
    };
  }

  // Check for uppercase, lowercase, and digit (Backend spec)
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);

  if (!hasUppercase || !hasLowercase || !hasDigit) {
    return {
      valid: false,
      error:
        'Password must contain at least one uppercase letter, one lowercase letter, and one digit',
    };
  }

  return { valid: true };
}

/**
 * Validate name (first name or last name) (Backend API spec)
 * - Length: 1-100 characters
 * - Must contain only letters, spaces, hyphens, and apostrophes
 *
 * @param name Name to validate
 * @param fieldName Field name for error message (e.g., 'First name', 'Last name')
 * @returns Validation result with error message if invalid
 */
export function validateBackendName(name: string, fieldName = 'Name'): BackendValidationResult {
  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }

  if (
    name.length < BACKEND_VALIDATION_RULES.NAME.MIN_LENGTH ||
    name.length > BACKEND_VALIDATION_RULES.NAME.MAX_LENGTH
  ) {
    return {
      valid: false,
      error: `${fieldName} must be between ${BACKEND_VALIDATION_RULES.NAME.MIN_LENGTH} and ${BACKEND_VALIDATION_RULES.NAME.MAX_LENGTH} characters`,
    };
  }

  if (!BACKEND_VALIDATION_RULES.NAME.PATTERN.test(name)) {
    return {
      valid: false,
      error: `${fieldName} can only contain letters and spaces`,
    };
  }

  return { valid: true };
}

/**
 * Validate GDPR delete confirmation (Backend API spec)
 *
 * @param confirmation Confirmation string from user
 * @returns Validation result with error message if confirmation is invalid
 */
export function validateGDPRConfirmation(confirmation: string): BackendValidationResult {
  if (confirmation !== 'DELETE_MY_ACCOUNT') {
    return {
      valid: false,
      error: 'Please type DELETE_MY_ACCOUNT to confirm account deletion',
    };
  }

  return { valid: true };
}

/**
 * Validate all fields in a registration form (Backend API spec)
 *
 * @param data Registration form data
 * @returns Object with validation results for each field
 */
export function validateBackendRegistrationForm(data: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}): {
  valid: boolean;
  errors: {
    email?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
  };
} {
  const emailResult = validateBackendEmail(data.email);
  const passwordResult = validateBackendPassword(data.password);
  const firstNameResult = validateBackendName(data.first_name, 'First name');
  const lastNameResult = validateBackendName(data.last_name, 'Last name');

  const errors: {
    email?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
  } = {};

  if (!emailResult.valid) errors.email = emailResult.error;
  if (!passwordResult.valid) errors.password = passwordResult.error;
  if (!firstNameResult.valid) errors.first_name = firstNameResult.error;
  if (!lastNameResult.valid) errors.last_name = lastNameResult.error;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// ORIGINAL VALIDATION FUNCTIONS (EXISTING)
// ============================================================================

/**
 * Validate a single field based on its rules
 */
export const validateField = (value: ValidationValue, rules: ValidationRule): string | null => {
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return 'This field is required';
  }

  if (value && typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Must be no more than ${rules.maxLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Invalid format';
    }
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

/**
 * Validate entire form state
 */
export const validateForm = (formState: FormState): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(formState).forEach((fieldName) => {
    const field = formState[fieldName];
    if (field?.rules) {
      const error = validateField(field.value, field.rules);
      if (error) {
        errors[fieldName] = error;
      }
    }
  });

  return errors;
};

/**
 * Check if form has any errors
 */
export const hasFormErrors = (formState: FormState): boolean =>
  Object.values(validateForm(formState)).some((error) => error !== null);

/**
 * Check if form is valid and ready to submit
 */
export const isFormValid = (formState: FormState): boolean => {
  const errors = validateForm(formState);
  const hasRequiredFields = Object.keys(formState).every((fieldName) => {
    const field = formState[fieldName];
    if (field?.rules?.required) {
      return field.value && field.value.toString().trim() !== '';
    }
    return true;
  });

  return Object.keys(errors).length === 0 && hasRequiredFields;
};

/**
 * Common validation rules
 */
export const ValidationRules = {
  email: {
    required: true,
    pattern: EMAIL_REGEX,
    custom: (value: string) => {
      if (value && !EMAIL_REGEX.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    },
  },

  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (value && value.length < 8) {
        return 'Password must be at least 8 characters long';
      }
      return null;
    },
  },

  strongPassword: {
    required: true,
    minLength: 8,
    pattern: STRONG_PASSWORD_REGEX,
    custom: (value: string) => {
      if (value && !STRONG_PASSWORD_REGEX.test(value)) {
        return 'Password must contain at least 8 characters, including uppercase, lowercase, and number';
      }
      return null;
    },
  },

  required: { required: true },

  phone: {
    pattern: PHONE_REGEX,
    custom: (value: string) => {
      if (value && !PHONE_REGEX.test(value)) {
        return 'Please enter a valid phone number';
      }
      return null;
    },
  },

  url: {
    pattern: URL_REGEX,
    custom: (value: string) => {
      if (value && !URL_REGEX.test(value)) {
        return 'Please enter a valid URL (e.g., https://example.com)';
      }
      return null;
    },
  },

  username: {
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
    custom: (value: string) => {
      if (value && !/^[a-zA-Z0-9_-]+$/.test(value)) {
        return 'Username can only contain letters, numbers, hyphens, and underscores';
      }
      return null;
    },
  },
};

/**
 * Password confirmation validation
 */
export const passwordConfirmation = (password: string) => ({
  required: true,
  custom: (value: string) => {
    if (value !== password) {
      return 'Passwords do not match';
    }
    return null;
  },
});

/**
 * Custom hook for form validation with React 19 features
 * React Compiler automatically optimizes these functions
 */
import { useState } from 'react';
import { logger } from './logger';

export interface UseFormValidationProps {
  initialValues: Record<string, ValidationValue>;
  validationRules: Record<string, ValidationRule>;
  onSubmit?: (values: Record<string, ValidationValue>) => void | Promise<void>;
}

export const useFormValidation = ({
  initialValues,
  validationRules,
  onSubmit,
}: UseFormValidationProps) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form state from current values
  const formState: FormState = {};
  Object.keys(values).forEach((key) => {
    formState[key] = {
      value: values[key],
      error: errors[key],
      touched: touched[key],
      rules: validationRules[key],
    };
  });

  // Validate single field
  const validateSingleField = (name: string, value: ValidationValue) => {
    const rules = validationRules[name];
    if (rules) {
      return validateField(value, rules);
    }
    return null;
  };

  // Handle field change
  const handleChange = (name: string, value: ValidationValue) => {
    setValues((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle field blur
  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateSingleField(name, values[name]);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Validate entire form
  const validate = () => {
    const formErrors = validateForm(formState);
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(values).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form
    const isValid = validate();

    if (isValid && onSubmit) {
      try {
        await onSubmit(values);
      } catch (error) {
        logger.error(
          'Form submission error',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }

    setIsSubmitting(false);
    return isValid;
  };

  // Reset form
  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  // Check if form is valid
  const isValid = isFormValid(formState);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    formState,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    reset,
    setFieldValue: (name: string, value: ValidationValue) => handleChange(name, value),
    setFieldError: (name: string, error: string) =>
      setErrors((prev) => ({ ...prev, [name]: error })),
  };
};
