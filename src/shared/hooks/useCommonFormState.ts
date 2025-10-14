/**
 * Common form state management hooks
 * Eliminates duplication of form-related useState patterns
 * React 19 Compiler automatically optimizes these functions
 */

import { useState } from 'react';

// Generic loading state hook
export const useLoadingState = (initialLoading = false) => {
  const [isLoading, setIsLoading] = useState(initialLoading);

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    try {
      const result = await fn();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    setIsLoading,
    withLoading,
  };
};

// Form data state with validation
// ✅ React 19: Renamed from useFormState to avoid conflict with React 19's deprecated hook
export const useFormFields = <T extends Record<string, unknown>>(initialData: T) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const updateField = (field: keyof T, value: T[keyof T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const setFieldError = (field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const resetForm = () => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
  };

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

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

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

  const showSuccess = (message: string) => {
    setSuccess(message);
    setError(null);
  };

  const showError = (message: string) => {
    setError(message);
    setSuccess('');
  };

  const clearFeedback = () => {
    setSuccess('');
    setError(null);
  };

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

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const toggleModal = () => setIsOpen((prev) => !prev);

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

  const selectItem = (item: T) => {
    setSelected((prev) => new Set(prev).add(item));
  };

  const unselectItem = (item: T) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      newSet.delete(item);
      return newSet;
    });
  };

  const toggleSelection = (item: T) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelected(new Set());
  };

  const selectAll = (items: T[]) => {
    setSelected(new Set(items));
  };

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

  const setPage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      skip: page * prev.limit,
    }));
  };

  const setLimit = (limit: number) => {
    setPagination((prev) => ({
      ...prev,
      limit,
      skip: 0, // Reset to first page when limit changes
    }));
  };

  const updateTotal = (total: number) => {
    setPagination((prev) => ({
      ...prev,
      total,
      hasMore: prev.skip + prev.limit < total,
    }));
  };

  const nextPage = () => {
    setPagination((prev) => {
      if (!prev.hasMore) return prev;
      return {
        ...prev,
        skip: prev.skip + prev.limit,
      };
    });
  };

  const prevPage = () => {
    setPagination((prev) => {
      if (prev.skip === 0) return prev;
      return {
        ...prev,
        skip: Math.max(0, prev.skip - prev.limit),
      };
    });
  };

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

// Re-export for convenience - ✅ React 19: useFormFields renamed from useFormState
