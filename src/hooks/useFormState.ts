/**
 * Custom React Hook: useFormState
 * 
 * Manages form state with validation and error handling.
 * Provides a unified interface for form operations.
 * 
 * @example
 * ```tsx
 * const form = useFormState({
 *   initialValues: { email: '', password: '' },
 *   validate: (values) => {
 *     const errors = {};
 *     if (!values.email) errors.email = 'Required';
 *     return errors;
 *   }
 * });
 * 
 * <input
 *   value={form.values.email}
 *   onChange={(e) => form.setFieldValue('email', e.target.value)}
 *   onBlur={() => form.setFieldTouched('email')}
 * />
 * {form.touched.email && form.errors.email && (
 *   <span>{form.errors.email}</span>
 * )}
 * ```
 */

import { useState, useCallback, useMemo } from 'react';

export interface FormErrors {
  [key: string]: string;
}

export interface FormTouched {
  [key: string]: boolean;
}

export interface UseFormStateOptions<T> {
  initialValues: T;
  validate?: (values: T) => FormErrors;
  onSubmit?: (values: T) => void | Promise<void>;
}

export interface UseFormStateResult<T> {
  values: T;
  errors: FormErrors;
  touched: FormTouched;
  isValid: boolean;
  isDirty: boolean;
  setFieldValue: (field: keyof T, value: unknown) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: FormErrors) => void;
  resetForm: () => void;
  validateForm: () => FormErrors;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
}

/**
 * Hook for managing form state
 */
export function useFormState<T extends Record<string, unknown>>(
  options: UseFormStateOptions<T>
): UseFormStateResult<T> {
  const { initialValues, validate, onSubmit } = options;

  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<FormErrors>({});
  const [touched, setTouchedState] = useState<FormTouched>({});

  // Check if form is dirty (values changed from initial)
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  // Check if form is valid (no errors)
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Validate form
  const validateForm = useCallback((): FormErrors => {
    if (!validate) return {};
    const validationErrors = validate(values);
    setErrorsState(validationErrors);
    return validationErrors;
  }, [validate, values]);

  // Set field value
  const setFieldValue = useCallback((field: keyof T, value: unknown) => {
    setValuesState(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Set field touched
  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouchedState(prev => ({
      ...prev,
      [field]: isTouched
    }));
  }, []);

  // Set field error
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrorsState(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  // Set multiple values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  // Set all errors
  const setErrors = useCallback((newErrors: FormErrors) => {
    setErrorsState(newErrors);
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setTouchedState({});
  }, [initialValues]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as FormTouched);
      setTouchedState(allTouched);

      // Validate
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      // Submit
      if (onSubmit) {
        await onSubmit(values);
      }
    },
    [values, validateForm, onSubmit]
  );

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    setValues,
    setErrors,
    resetForm,
    validateForm,
    handleSubmit
  };
}

export default useFormState;
