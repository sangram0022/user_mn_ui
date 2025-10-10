/**
 * Advanced form handling hook with validation and React 19 features
 */
import { useState, useCallback, useRef, useMemo } from 'react';

export interface FormField<T = unknown> {
  value: T;
  error?: string;
  touched: boolean;
  valid: boolean;
}

export interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: Record<string, (value: unknown) => string | undefined>;
  onSubmit?: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

export function useForm<T extends Record<string, unknown>>(options: UseFormOptions<T>) {
  const {
    initialValues,
    validationSchema = {},
    onSubmit,
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false,
    isDirty: false,
  });

  const initialValuesRef = useRef(initialValues);

  // Validate single field
  const validateField = useCallback(
    (name: keyof T, value: unknown): string | undefined => {
      const validator = validationSchema[name as string];
      return validator ? validator(value) : undefined;
    },
    [validationSchema]
  );

  // Validate all fields
  const validateForm = useCallback(
    (values: T): Partial<Record<keyof T, string>> => {
      const errors: Partial<Record<keyof T, string>> = {};
      
      Object.keys(validationSchema).forEach((key) => {
        const fieldKey = key as keyof T;
        const error = validateField(fieldKey, values[fieldKey]);
        if (error) {
          errors[fieldKey] = error;
        }
      });

      return errors;
    },
    [validateField, validationSchema]
  );

  // Set field value
  const setFieldValue = useCallback(
    (name: keyof T, value: unknown) => {
      setState(prev => {
        const newValues = { ...prev.values, [name]: value };
        const errors = validateOnChange ? validateForm(newValues) : prev.errors;
        const isValid = Object.keys(errors).length === 0;
        const isDirty = JSON.stringify(newValues) !== JSON.stringify(initialValuesRef.current);

        return {
          ...prev,
          values: newValues,
          errors,
          isValid,
          isDirty,
        };
      });
    },
    [validateOnChange, validateForm]
  );

  // Set field touched
  const setFieldTouched = useCallback(
    (name: keyof T, isTouched = true) => {
      setState(prev => {
        const touched = { ...prev.touched, [name]: isTouched };
        const errors = validateOnBlur && isTouched 
          ? { ...prev.errors, [name]: validateField(name, prev.values[name]) }
          : prev.errors;
        
        const isValid = Object.keys(errors).filter(key => errors[key as keyof T]).length === 0;

        return {
          ...prev,
          touched,
          errors,
          isValid,
        };
      });
    },
    [validateOnBlur, validateField]
  );

  // Set field error
  const setFieldError = useCallback(
    (name: keyof T, error: string) => {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [name]: error },
        isValid: false,
      }));
    },
    []
  );

  // Reset form
  const resetForm = useCallback(
    (newValues?: T) => {
      const resetValues = newValues || initialValues;
      setState({
        values: resetValues,
        errors: {},
        touched: {},
        isValid: true,
        isSubmitting: false,
        isDirty: false,
      });
    },
    [initialValues]
  );

  // Handle submit
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      const errors = validateForm(state.values);
      const isValid = Object.keys(errors).length === 0;

      setState(prev => ({
        ...prev,
        errors,
        isValid,
        touched: Object.keys(prev.values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        ) as Partial<Record<keyof T, boolean>>,
      }));

      if (isValid && onSubmit) {
        setState(prev => ({ ...prev, isSubmitting: true }));
        try {
          await onSubmit(state.values);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setState(prev => ({ ...prev, isSubmitting: false }));
        }
      }
    },
    [state.values, validateForm, onSubmit]
  );

  // Get field props for easy integration with form inputs
  const getFieldProps = useCallback(
    (name: keyof T) => ({
      value: state.values[name] ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFieldValue(name, e.target.value);
      },
      onBlur: () => setFieldTouched(name, true),
      error: state.touched[name] ? state.errors[name] : undefined,
      'aria-invalid': Boolean(state.touched[name] && state.errors[name]),
    }),
    [state.values, state.touched, state.errors, setFieldValue, setFieldTouched]
  );

  // Memoized form helpers
  const formHelpers = useMemo(
    () => ({
      setFieldValue,
      setFieldTouched,
      setFieldError,
      resetForm,
      validateField,
      validateForm,
      getFieldProps,
    }),
    [setFieldValue, setFieldTouched, setFieldError, resetForm, validateField, validateForm, getFieldProps]
  );

  return {
    ...state,
    ...formHelpers,
    handleSubmit,
  };
}