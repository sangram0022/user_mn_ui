/**
 * React 19 Advanced Features
 *
 * Implements useOptimistic, useActionState patterns, and advanced form handling
 * following React 19 best practices for instant UI updates and better UX
 *
 * @module useReact19Features
 */

import { logger } from '@shared/utils/logger';
import { useActionState, useOptimistic, useState } from 'react';

// ==================== useOptimistic Wrappers ====================

export interface OptimisticListItem {
  id: string;
  [key: string]: unknown;
}

export interface OptimisticAction<T extends OptimisticListItem> {
  type: 'add' | 'update' | 'delete';
  item?: T;
  id?: string;
  updates?: Partial<T>;
}

/**
 * useOptimisticList - Optimistic updates for list data
 * Provides instant UI feedback for CRUD operations with automatic rollback
 */
export function useOptimisticList<T extends OptimisticListItem>(initialItems: T[]) {
  const [items, setItems] = useState<T[]>(initialItems);

  const [optimisticItems, addOptimistic] = useOptimistic(
    items,
    (state: T[], action: OptimisticAction<T>): T[] => {
      switch (action.type) {
        case 'add':
          return action.item ? [...state, { ...action.item, isOptimistic: true } as T] : state;

        case 'update':
          return action.id && action.updates
            ? state.map((item) =>
                item.id === action.id
                  ? ({ ...item, ...action.updates, isOptimistic: true } as T)
                  : item
              )
            : state;

        case 'delete':
          return action.id ? state.filter((item) => item.id !== action.id) : state;

        default:
          return state;
      }
    }
  );

  return {
    items: optimisticItems,
    setItems,
    addOptimistic,
  };
}

/**
 * useOptimisticUpdates - Generic optimistic update hook
 * For single item updates with instant feedback
 */
export interface UseOptimisticUpdatesOptions<T> {
  initialData: T;
  updateFn: (currentState: T, update: Partial<T>) => T;
}

export function useOptimisticUpdates<T>({ initialData, updateFn }: UseOptimisticUpdatesOptions<T>) {
  const [data, setData] = useState<T>(initialData);

  const [optimisticData, applyOptimistic] = useOptimistic(
    data,
    (state: T, update: Partial<T>): T => updateFn(state, update)
  );

  return {
    data: optimisticData,
    setData,
    applyOptimistic,
  };
}

// ==================== useActionState Wrappers ====================

export interface FormActionState<TData = unknown> {
  success: boolean;
  error: string | null;
  data?: TData;
  validationErrors?: Record<string, string>;
}

export interface UseAdvancedFormStateOptions<TData> {
  initialState: FormActionState<TData>;
  action: (
    prevState: FormActionState<TData>,
    formData: FormData
  ) => Promise<FormActionState<TData>>;
  onSuccess?: (data: TData) => void;
  onError?: (error: string) => void;
}

/**
 * useAdvancedFormState - Enhanced form handling with React 19's useActionState
 * Provides built-in pending states, error handling, and validation
 */
export function useAdvancedFormState<TData = unknown>({
  initialState,
  action,
  onSuccess,
  onError,
}: UseAdvancedFormStateOptions<TData>) {
  const [state, submitAction, isPending] = useActionState(action, initialState);

  // Auto-trigger callbacks on state changes
  if (state.success && state.data && onSuccess) {
    Promise.resolve().then(() => onSuccess(state.data as TData));
  }

  if (state.error && onError) {
    Promise.resolve().then(() => onError(state.error as string));
  }

  return {
    state,
    submitAction,
    isPending,
    isSuccess: state.success,
    isError: Boolean(state.error),
    data: state.data,
    error: state.error,
    validationErrors: state.validationErrors,
  };
}

// ==================== Optimistic CRUD Helpers ====================

export interface CRUDOperations<T extends OptimisticListItem> {
  items: T[];
  setItems: (items: T[] | ((prev: T[]) => T[])) => void;
  create: (item: T, serverFn: () => Promise<T>) => Promise<void>;
  update: (id: string, updates: Partial<T>, serverFn: () => Promise<T>) => Promise<void>;
  delete: (id: string, serverFn: () => Promise<void>) => Promise<void>;
  isOptimistic: (item: T) => boolean;
}

/**
 * useOptimisticCRUD - Complete CRUD operations with optimistic updates
 * Handles create, update, delete with instant UI feedback and error rollback
 */
export function useOptimisticCRUD<T extends OptimisticListItem>(
  initialItems: T[]
): CRUDOperations<T> {
  const { items, setItems, addOptimistic } = useOptimisticList<T>(initialItems);

  // React 19 Compiler handles memoization
  const create = async (item: T, serverFn: () => Promise<T>) => {
    // Optimistic add
    addOptimistic({ type: 'add', item });

    try {
      const createdItem = await serverFn();
      // Confirm with real data
      setItems((prev) => [...prev, createdItem]);
    } catch (error) {
      // Automatic rollback - optimistic state reverts
      logger.error('Create failed', error as Error);
      throw error;
    }
  };

  const update = async (id: string, updates: Partial<T>, serverFn: () => Promise<T>) => {
    // Optimistic update
    addOptimistic({ type: 'update', id, updates });

    try {
      const updatedItem = await serverFn();
      // Confirm with real data
      setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
    } catch (error) {
      // Automatic rollback
      logger.error('Update failed', error as Error);
      throw error;
    }
  };

  const deleteItem = async (id: string, serverFn: () => Promise<void>) => {
    // Optimistic delete
    addOptimistic({ type: 'delete', id });

    try {
      await serverFn();
      // Confirm deletion
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      // Automatic rollback
      logger.error('Delete failed', error as Error);
      throw error;
    }
  };

  const isOptimistic = (item: T) => 'isOptimistic' in item && item.isOptimistic === true;

  return {
    items,
    setItems,
    create,
    update,
    delete: deleteItem,
    isOptimistic,
  };
}

// ==================== Form Action Helpers ====================

/**
 * createFormAction - Helper to create type-safe form actions for useActionState
 */
export function createFormAction<TData, TInput = Record<string, unknown>>(
  handler: (input: TInput) => Promise<TData>,
  options?: {
    validate?: (input: TInput) => Record<string, string> | null;
    transformFormData?: (formData: FormData) => TInput;
  }
) {
  return async (
    prevState: FormActionState<TData>,
    formData: FormData
  ): Promise<FormActionState<TData>> => {
    try {
      // Transform FormData to input
      const input = options?.transformFormData
        ? options.transformFormData(formData)
        : (Object.fromEntries(formData) as TInput);

      // Validate if validator provided
      if (options?.validate) {
        const validationErrors = options.validate(input);
        if (validationErrors) {
          return {
            success: false,
            error: 'Validation failed',
            validationErrors,
          };
        }
      }

      // Execute handler
      const data = await handler(input);

      return {
        success: true,
        error: null,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        data: prevState.data,
      };
    }
  };
}

// ==================== Optimistic Toggle Hook ====================

/**
 * useOptimisticToggle - For instant boolean state toggles (theme, status, etc.)
 */
export function useOptimisticToggle(
  initialValue: boolean,
  serverFn: (newValue: boolean) => Promise<void>
) {
  const [value, setValue] = useState(initialValue);
  const [optimisticValue, setOptimistic] = useOptimistic(
    value,
    (_state: boolean, newValue: boolean) => newValue
  );

  // React 19 Compiler handles memoization
  const toggle = async () => {
    const newValue = !optimisticValue;

    // Optimistic update
    setOptimistic(newValue);

    try {
      await serverFn(newValue);
      // Confirm
      setValue(newValue);
    } catch (error) {
      // Automatic rollback
      console.error('Toggle failed:', error);
      throw error;
    }
  };

  return {
    value: optimisticValue,
    toggle,
    setValue,
  };
}
