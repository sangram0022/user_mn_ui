/**
 * Common form state management hooks
 * Eliminates duplication of form-related useState patterns
 */

import { useCallback, useState } from 'react';

// Generic loading state hook
export const useLoadingState = (initialLoading = false) => {
  const [isLoading, setIsLoading] = useState(initialLoading);

  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    try {
      const result = await fn();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    setIsLoading,
    withLoading,
  };
};

// Form data state with validation
export const useFormState = <T extends Record<string, unknown>>(initialData: T) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const updateField = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => ({ ...prev, [field]: true }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  return {
    formData,
    setFormData,
    updateField,
    errors,
    setFieldError,
    clearErrors,
    touched,
    resetForm,
    hasErrors: Object.keys(errors).length > 0,
  };
};

// Password visibility state hook
export const usePasswordVisibility = (initialState = false) => {
  const [showPassword, setShowPassword] = useState(initialState);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  return {
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
  };
};

// Success/error feedback state
export const useFeedbackState = () => {
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const showSuccess = useCallback((message: string) => {
    setSuccess(message);
    setError(null);
  }, []);

  const showError = useCallback((message: string) => {
    setError(message);
    setSuccess('');
  }, []);

  const clearFeedback = useCallback(() => {
    setSuccess('');
    setError(null);
  }, []);

  return {
    success,
    error,
    showSuccess,
    showError,
    clearFeedback,
    hasSuccess: Boolean(success),
    hasError: Boolean(error),
  };
};

// Modal/dialog state hook
export const useModalState = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    setIsOpen,
  };
};

// Selection state hook for checkboxes/multi-select
export const useSelectionState = <T>(initialSelection: Set<T> = new Set()) => {
  const [selected, setSelected] = useState<Set<T>>(initialSelection);

  const selectItem = useCallback((item: T) => {
    setSelected((prev) => new Set(prev).add(item));
  }, []);

  const unselectItem = useCallback((item: T) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      newSet.delete(item);
      return newSet;
    });
  }, []);

  const toggleSelection = useCallback((item: T) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const selectAll = useCallback((items: T[]) => {
    setSelected(new Set(items));
  }, []);

  return {
    selected,
    selectItem,
    unselectItem,
    toggleSelection,
    clearSelection,
    selectAll,
    isSelected: (item: T) => selected.has(item),
    selectedCount: selected.size,
    hasSelection: selected.size > 0,
  };
};

// Pagination state hook
export const usePaginationState = (initialPage = 0, initialLimit = 20) => {
  const [pagination, setPagination] = useState({
    skip: initialPage * initialLimit,
    limit: initialLimit,
    total: 0,
    hasMore: false,
  });

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({
      ...prev,
      skip: page * prev.limit,
    }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({
      ...prev,
      limit,
      skip: 0, // Reset to first page when limit changes
    }));
  }, []);

  const updateTotal = useCallback((total: number) => {
    setPagination((prev) => ({
      ...prev,
      total,
      hasMore: prev.skip + prev.limit < total,
    }));
  }, []);

  const nextPage = useCallback(() => {
    setPagination((prev) => {
      if (!prev.hasMore) return prev;
      return {
        ...prev,
        skip: prev.skip + prev.limit,
      };
    });
  }, []);

  const prevPage = useCallback(() => {
    setPagination((prev) => {
      if (prev.skip === 0) return prev;
      return {
        ...prev,
        skip: Math.max(0, prev.skip - prev.limit),
      };
    });
  }, []);

  return {
    pagination,
    setPagination,
    setPage,
    setLimit,
    updateTotal,
    nextPage,
    prevPage,
    currentPage: Math.floor(pagination.skip / pagination.limit),
    totalPages: Math.ceil(pagination.total / pagination.limit),
    canGoNext: pagination.hasMore,
    canGoPrev: pagination.skip > 0,
  };
};

export default {
  useLoadingState,
  useFormState,
  usePasswordVisibility,
  useFeedbackState,
  useModalState,
  useSelectionState,
  usePaginationState,
};
