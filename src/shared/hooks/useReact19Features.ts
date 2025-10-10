/**
 * React 19 advanced hooks for optimistic updates and enhanced UX patterns
 */
import { useCallback, useOptimistic, useTransition, useState } from 'react';
import type { AsyncFunction } from '@shared/types';

// Types for optimistic updates
export interface OptimisticAction<T> { type: string;
  payload?: unknown;
  optimisticData?: T; }

export interface UseOptimisticUpdatesOptions<T> { initialData: T;
  updateFn: (state: T, action: OptimisticAction<T>) => T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error, rollbackData: T) => void; }

/**
 * Advanced hook for optimistic updates using React 19's useOptimistic
 * Provides immediate UI feedback while async operations are pending
 */
export function useOptimisticUpdates<T>({ initialData,
  updateFn,
  onSuccess,
  onError }: UseOptimisticUpdatesOptions<T>) { const [isPending, startTransition] = useTransition();
  const [optimisticData, addOptimistic] = useOptimistic(initialData, updateFn);

  const performOptimisticUpdate = useCallback(
    async (action: OptimisticAction<T>, asyncOperation: AsyncFunction<[OptimisticAction<T>], T>) => {
      const originalData = optimisticData;
      
      // Add optimistic update immediately
      addOptimistic(action);

      try {
        startTransition(async () => {
          const result = await asyncOperation(action);
          onSuccess?.(result);
        });
      } catch (error) { // Rollback optimistic update on error
        addOptimistic({ type: 'ROLLBACK', optimisticData: originalData });
        onError?.(error as Error, originalData);
      }
    },
    [optimisticData, addOptimistic, onSuccess, onError]
  );

  return { data: optimisticData,
    isPending,
    performOptimisticUpdate,
    addOptimistic
  };
}

/**
 * Enhanced form state management using modern React patterns
 */
export interface UseAdvancedFormStateOptions<T, R> { initialState: T;
  action: (prevState: T, formData: FormData) => Promise<R>;
  onSuccess?: (result: R) => void;
  onError?: (error: Error) => void; }

export function useAdvancedFormState<T, R>({ initialState,
  action,
  onSuccess,
  onError }: UseAdvancedFormStateOptions<T, R>) { const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<T>(initialState);
  
  const wrappedAction = useCallback(
    async (formData: FormData) => {
      try {
        const result = await action(state, formData);
        onSuccess?.(result);
        return result;
      } catch (error) { onError?.(error as Error);
        throw error;
      }
    },
    [action, state, onSuccess, onError]
  );

  const handleSubmit = useCallback(
    (formData: FormData) => { startTransition(async () => {
        await wrappedAction(formData);
      });
    },
    [wrappedAction]
  );

  const updateState = useCallback((newState: T) => { setState(newState);
  }, []);

  return { state,
    isPending,
    handleSubmit,
    updateState
  };
}

/**
 * Optimistic list operations (add, remove, update)
 */
export interface OptimisticListItem { id: string | number;
  [key: string]: unknown; }

interface ListOptimisticAction<T extends OptimisticListItem> { type: 'ADD' | 'UPDATE' | 'REMOVE' | 'ROLLBACK';
  payload?: T['id'] | T[];
  optimisticData?: T; }

export function useOptimisticList<T extends OptimisticListItem>(
  initialItems: T[],
  apiOperations: { add: (item: Omit<T, 'id'>) => Promise<T>;
    update: (id: T['id'], updates: Partial<T>) => Promise<T>;
    remove: (id: T['id']) => Promise<void>;
  }
) { const [isPending, startTransition] = useTransition();
  
  const [optimisticItems, addOptimistic] = useOptimistic(
    initialItems,
    (state: T[], action: ListOptimisticAction<T>) => {
      switch (action.type) {
        case 'ADD':
          return action.optimisticData ? [...state, action.optimisticData] : state;
        case 'UPDATE':
          return action.optimisticData
            ? state.map(item => 
                item.id === action.optimisticData!.id 
                  ? { ...item, ...action.optimisticData } 
                  : item
              )
            : state;
        case 'REMOVE':
          return state.filter(item => item.id !== action.payload);
        case 'ROLLBACK':
          return Array.isArray(action.payload) ? action.payload : state;
        default:
          return state;
      }
    }
  );

  const addItem = useCallback(
    async (newItem: Omit<T, 'id'>) => {
      const tempId = `temp_${Date.now()}`;
      const optimisticItem = { ...newItem, id: tempId } as T;
      const originalItems = optimisticItems;

      addOptimistic({ type: 'ADD', optimisticData: optimisticItem });

      try { startTransition(async () => {
          const realItem = await apiOperations.add(newItem);
          // Replace temp item with real item
          addOptimistic({ 
            type: 'UPDATE', 
            optimisticData: realItem 
          });
        });
      } catch (error) { addOptimistic({ type: 'ROLLBACK', payload: originalItems });
        throw error;
      }
    },
    [optimisticItems, addOptimistic, apiOperations]
  );

  const updateItem = useCallback(
    async (id: T['id'], updates: Partial<T>) => { const originalItems = optimisticItems;
      const optimisticUpdate = { id, ...updates } as T;

      addOptimistic({ type: 'UPDATE', optimisticData: optimisticUpdate });

      try { startTransition(async () => {
          const updatedItem = await apiOperations.update(id, updates);
          addOptimistic({ type: 'UPDATE', optimisticData: updatedItem });
        });
      } catch (error) { addOptimistic({ type: 'ROLLBACK', payload: originalItems });
        throw error;
      }
    },
    [optimisticItems, addOptimistic, apiOperations]
  );

  const removeItem = useCallback(
    async (id: T['id']) => { const originalItems = optimisticItems;

      addOptimistic({ type: 'REMOVE', payload: id });

      try { startTransition(async () => {
          await apiOperations.remove(id);
        });
      } catch (error) { addOptimistic({ type: 'ROLLBACK', payload: originalItems });
        throw error;
      }
    },
    [optimisticItems, addOptimistic, apiOperations]
  );

  return { items: optimisticItems,
    isPending,
    addItem,
    updateItem,
    removeItem
  };
}

export default { useOptimisticUpdates,
  useAdvancedFormState,
  useOptimisticList };