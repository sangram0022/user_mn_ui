import { useCallback, useState } from 'react';

/**
 * Custom hook for managing form input changes with error clearing
 * Reduces duplication across form components
 */
export function useFormInput<T extends Record<string, unknown>>(
  initialValues: T,
  clearError?: () => void
) {
  const [formData, setFormData] = useState<T>(initialValues);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = event.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));

      if (clearError) {
        clearError();
      }
    },
    [clearError]
  );

  const resetForm = useCallback(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const updateField = useCallback((name: keyof T, value: T[keyof T]) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  return {
    formData,
    handleChange,
    resetForm,
    updateField,
    setFormData,
  };
}
