/**
 * Advanced Custom Hooks for Expert-Level React Patterns
 * Comprehensive reusable logic with React 19 features
 */

import { logger } from './../utils/logger';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Enhanced Authentication Hook
export interface UseAuthOptions { redirectTo?: string;
  requireAuth?: boolean;
  requireRoles?: string[];
  onAuthStateChange?: (isAuthenticated: boolean) => void; }

export function useEnhancedAuth(options: UseAuthOptions = {}) { const navigate = useNavigate();
  const { redirectTo = '/login', requireAuth = false, requireRoles = [], onAuthStateChange } = options;
  
  // Mock auth context - in real app, this would come from AuthContext
  const [authState, setAuthState] = useState<{ isAuthenticated: boolean;
    user: Record<string, unknown> | null;
    loading: boolean;
    roles: string[];
  }>({ isAuthenticated: false,
    user: null,
    loading: true,
    roles: []
  });

  useEffect(() => { // Simulate auth check
    const checkAuth = async () => {
      try {
        // In real app, check token/session
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          const userData = JSON.parse(user);
          setAuthState({
            isAuthenticated: true,
            user: userData,
            loading: false,
            roles: userData.roles || []
          });
        } else { setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) { setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    checkAuth();
  }, []);

  useEffect(() => { onAuthStateChange?.(authState.isAuthenticated);
  }, [authState.isAuthenticated, onAuthStateChange]);

  useEffect(() => { if (!authState.loading && requireAuth && !authState.isAuthenticated) {
      navigate(redirectTo);
    }
  }, [authState.isAuthenticated, authState.loading, requireAuth, redirectTo, navigate]);

  const hasRequiredRoles = useMemo(() => { if (requireRoles.length === 0) return true;
    return requireRoles.every(role => authState.roles.includes(role));
  }, [authState.roles, requireRoles]);

  const login = useCallback(async (credentials: { email: string; password: string }) => { setAuthState(prev => ({ ...prev, loading: true }));
    try { // Mock login - replace with actual API call
      const response = await new Promise<{ token: string; user: Record<string, unknown> }>((resolve) => 
        setTimeout(() => resolve({ token: 'mock-token', 
          user: { id: 1, email: credentials.email, roles: ['user'] } 
        }), 1000)
      );
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setAuthState({ isAuthenticated: true,
        user: response.user,
        loading: false,
        roles: (response.user.roles as string[]) || []
      });
      
      return { success: true };
    } catch (error) { setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => { localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      roles: []
    });
    navigate('/login');
  }, [navigate]);

  return { ...authState,
    hasRequiredRoles,
    login,
    logout
  };
}

// Advanced API Hook with React 19 optimistic updates
export interface UseApiOptions<T> { initialData?: T;
  dependencies?: React.DependencyList;
  enabled?: boolean;
  retryCount?: number;
  retryDelay?: number;
  cacheKey?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  optimistic?: boolean; }

export function useAdvancedApi<T>(
  apiFunction: (...args: unknown[]) => Promise<T>,
  options: UseApiOptions<T> = {}
) { const {
    initialData,
    dependencies = [],
    enabled = true,
    retryCount = 3,
    retryDelay = 1000,
    cacheKey,
    onSuccess,
    onError,
    optimistic = false
  } = options;

  const [state, setState] = useState<{ data: T | undefined;
    loading: boolean;
    error: Error | null;
    retries: number;
  }>({ data: initialData,
    loading: false,
    error: null,
    retries: 0
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const cache = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const execute = useCallback(async (...args: unknown[]) => { // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache if key provided
    if (cacheKey) { const cached = cache.current.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 min cache
        setState(prev => ({ ...prev, data: cached.data, loading: false }));
        return cached.data;
      }
    }

    abortControllerRef.current = new AbortController();
    setState(prev => ({ ...prev, loading: true, error: null }));

    const attemptRequest = async (attempt: number = 0): Promise<T> => { try {
        const result = await apiFunction(...args);
        
        // Cache result
        if (cacheKey) {
          cache.current.set(cacheKey, { data: result, timestamp: Date.now() });
        }

        setState({ data: result,
          loading: false,
          error: null,
          retries: 0
        });

        onSuccess?.(result);
        return result;
      } catch (error) { if (attempt < retryCount) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          return attemptRequest(attempt + 1);
        }

        const apiError = error as Error;
        setState({ data: initialData,
          loading: false,
          error: apiError,
          retries: attempt
        });

        onError?.(apiError);
        throw apiError;
      }
    };

    return attemptRequest();
  }, [apiFunction, retryCount, retryDelay, cacheKey, initialData, onSuccess, onError]);

  useEffect(() => { if (enabled) {
      execute();
    }

    return () => { if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, ...dependencies]);

  const mutate = useCallback(async (newData: T, shouldRevalidate = true) => { if (optimistic) {
      // Optimistic update
      setState(prev => ({ ...prev, data: newData }));
    }

    if (shouldRevalidate) { try {
        await execute();
      } catch (error) { // Revert optimistic update on error
        if (optimistic) {
          setState(prev => ({ ...prev, data: state.data }));
        }
        throw error;
      }
    }
  }, [execute, optimistic, state.data]);

  return { ...state,
    execute,
    mutate,
    invalidate: () => {
      if (cacheKey) {
        cache.current.delete(cacheKey);
      }
      execute();
    }
  };
}

// Enhanced Form Hook with validation
export interface UseFormOptions<T> { initialValues: T;
  validationSchema?: (values: T) => Record<keyof T, string | undefined>;
  onSubmit: (values: T) => Promise<void> | void;
  enableReinitialize?: boolean; }

export function useEnhancedForm<T extends Record<string, unknown>>(options: UseFormOptions<T>) { const { initialValues, validationSchema, onSubmit, enableReinitialize = false } = options;
  
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  // Reinitialize form when initial values change
  useEffect(() => {
    if (enableReinitialize) {
      setValues(initialValues);
      setErrors({});
      setTouched({});
    }
  }, [initialValues, enableReinitialize]);

  const validate = useCallback((formValues: T = values) => {
    if (!validationSchema) return {};
    
    const validationErrors = validationSchema(formValues);
    setErrors(validationErrors);
    return validationErrors;
  }, [validationSchema, values]);

  const setFieldValue = useCallback((field: keyof T, value: unknown) => { setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) { setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => { setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => { e?.preventDefault();
    
    setSubmitCount(prev => prev + 1);
    setIsSubmitting(true);

    try {
      const validationErrors = validate();
      const hasErrors = Object.values(validationErrors).some(error => error);

      if (hasErrors) {
        // Mark all fields as touched to show errors
        const allTouched = Object.keys(values).reduce((acc, key) => {
          acc[key as keyof T] = true;
          return acc;
        }, {} as Record<keyof T, boolean>);
        setTouched(allTouched);
        return;
      }

      await onSubmit(values);
    } catch (error) { logger.error('Form submission error:', undefined, { error  });
    } finally { setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitCount(0);
  }, [initialValues]);

  const isValid = useMemo(() => {
    const validationErrors = validationSchema ? validationSchema(values) : {};
    return !Object.values(validationErrors).some(error => error);
  }, [values, validationSchema]);

  return { values,
    errors,
    touched,
    isSubmitting,
    submitCount,
    isValid,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    resetForm,
    validate
  };
}

// Pagination Hook
export interface UsePaginationOptions { initialPage?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void; }

export function usePagination(options: UsePaginationOptions = {}) { const { 
    initialPage = 1, 
    pageSize = 10, 
    totalItems = 0, 
    onPageChange 
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const goToPage = useCallback((page: number) => { const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    onPageChange?.(validPage);
  }, [totalPages, onPageChange]);

  const nextPage = useCallback(() => { goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => { goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const canGoNext = currentPage < totalPages;
  const canGoPrev = currentPage > 1;

  return { currentPage,
    totalPages,
    pageSize,
    startIndex,
    endIndex,
    canGoNext,
    canGoPrev,
    goToPage,
    nextPage,
    prevPage
  };
}

// Local Storage Hook with type safety
export function useLocalStorage<T>(key: string, initialValue: T) { const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => { try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      logger.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => { try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      logger.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

// Debounce Hook
export function useDebounce<T>(value: T, delay: number): T { const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => { clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Previous Value Hook
export function usePrevious<T>(value: T): T | undefined { const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default { useEnhancedAuth,
  useAdvancedApi,
  useEnhancedForm,
  usePagination,
  useLocalStorage,
  useDebounce,
  usePrevious };