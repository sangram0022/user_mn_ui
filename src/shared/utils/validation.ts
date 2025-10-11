// Form validation utilities with React 19 best practices

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
export const hasFormErrors = (formState: FormState): boolean => {
  return Object.values(validateForm(formState)).some((error) => error !== null);
};

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
 */
import { useCallback, useMemo, useState } from 'react';
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
  const formState = useMemo(() => {
    const state: FormState = {};
    Object.keys(values).forEach((key) => {
      state[key] = {
        value: values[key],
        error: errors[key],
        touched: touched[key],
        rules: validationRules[key],
      };
    });
    return state;
  }, [values, errors, touched, validationRules]);

  // Validate single field
  const validateSingleField = useCallback(
    (name: string, value: ValidationValue) => {
      const rules = validationRules[name];
      if (rules) {
        return validateField(value, rules);
      }
      return null;
    },
    [validationRules]
  );

  // Handle field change
  const handleChange = useCallback(
    (name: string, value: ValidationValue) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    },
    [errors]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (name: string) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      const error = validateSingleField(name, values[name]);
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validateSingleField, values]
  );

  // Validate entire form
  const validate = useCallback(() => {
    const formErrors = validateForm(formState);
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  }, [formState]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
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
    },
    [values, validate, onSubmit]
  );

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return isFormValid(formState);
  }, [formState]);

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
