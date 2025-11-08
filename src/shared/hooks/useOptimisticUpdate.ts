/**
 * useOptimisticUpdate Hook
 * Provides optimistic UI updates with automatic rollback on error
 * Uses React 19 useOptimistic hook for instant feedback
 * 
 * Note: Some TypeScript definitions for useOptimistic are still stabilizing.
 * This implementation uses type assertions where needed.
 */

import { useOptimistic, useCallback } from 'react';
import { logger } from '@/core/logging';

/**
 * Generic optimistic update hook
 * @template T - The data type being updated
 * @param currentData - Current server state
 * @param updateFn - Function that performs the actual update (returns Promise)
 */
export function useOptimisticUpdate<T>(
  currentData: T,
  updateFn: (newData: T) => Promise<T>
) {
  const [optimisticData, setOptimisticData] = useOptimistic(
    currentData,
    (_currentState, newData: T) => newData
  );

  const update = useCallback(
    async (newData: T) => {
      // Immediately update UI
      setOptimisticData(newData);

      try {
        // Perform actual update
        const result = await updateFn(newData);
        return { success: true, data: result };
      } catch (error) {
        // Rollback handled automatically by useOptimistic
        logger().error('Optimistic update failed, rolling back', error instanceof Error ? error : new Error(String(error)));
        return { success: false, error };
      }
    },
    [setOptimisticData, updateFn]
  );

  return {
    data: optimisticData,
    update,
  };
}

/**
 * Optimistic toggle hook (for boolean states)
 * @param currentValue - Current boolean value
 * @param toggleFn - Function that performs the toggle on server
 */
export function useOptimisticToggle(
  currentValue: boolean,
  toggleFn: (newValue: boolean) => Promise<void>
) {
  const [optimisticValue, setOptimisticValue] = useOptimistic(
    currentValue,
    (_currentState, newValue: boolean) => newValue
  );

  const toggle = useCallback(async () => {
    const newValue = !optimisticValue;
    setOptimisticValue(newValue);

    try {
      await toggleFn(newValue);
      return { success: true };
    } catch (error) {
      logger().error('Toggle failed, rolling back', error instanceof Error ? error : new Error(String(error)));
      return { success: false, error };
    }
  }, [optimisticValue, setOptimisticValue, toggleFn]);

  return {
    value: optimisticValue,
    toggle,
  };
}

/**
 * Optimistic list operations (add, remove, update)
 * @template T - List item type
 */
export function useOptimisticList<T extends { id: string | number }>(
  currentList: T[],
  {
    onAdd,
    onRemove,
    onUpdate,
  }: {
    onAdd?: (item: T) => Promise<T>;
    onRemove?: (id: string | number) => Promise<void>;
    onUpdate?: (id: string | number, updates: Partial<T>) => Promise<T>;
  }
) {
  const [optimisticList, updateOptimisticList] = useOptimistic(
    currentList,
    (state, action: { type: 'add' | 'remove' | 'update'; payload: unknown }) => {
      switch (action.type) {
        case 'add':
          return [...state, action.payload as T];
        case 'remove':
          return state.filter((item) => item.id !== action.payload);
        case 'update': {
          const { id, updates } = action.payload as { id: string | number; updates: Partial<T> };
          return state.map((item) => (item.id === id ? { ...item, ...updates } : item));
        }
        default:
          return state;
      }
    }
  );

  const add = useCallback(
    async (item: T) => {
      updateOptimisticList({ type: 'add', payload: item });

      try {
        if (onAdd) {
          const result = await onAdd(item);
          return { success: true, data: result };
        }
        return { success: true, data: item };
      } catch (error) {
        logger().error('Failed to add item', error instanceof Error ? error : new Error(String(error)));
        return { success: false, error };
      }
    },
    [updateOptimisticList, onAdd]
  );

  const remove = useCallback(
    async (id: string | number) => {
      updateOptimisticList({ type: 'remove', payload: id });

      try {
        if (onRemove) {
          await onRemove(id);
        }
        return { success: true };
      } catch (error) {
        logger().error('Failed to remove item', error instanceof Error ? error : new Error(String(error)));
        return { success: false, error };
      }
    },
    [updateOptimisticList, onRemove]
  );

  const update = useCallback(
    async (id: string | number, updates: Partial<T>) => {
      updateOptimisticList({ type: 'update', payload: { id, updates } });

      try {
        if (onUpdate) {
          const result = await onUpdate(id, updates);
          return { success: true, data: result };
        }
        return { success: true };
      } catch (error) {
        logger().error('Failed to update item', error instanceof Error ? error : new Error(String(error)));
        return { success: false, error };
      }
    },
    [updateOptimisticList, onUpdate]
  );

  return {
    list: optimisticList,
    add,
    remove,
    update,
  };
}

/**
 * Optimistic user status toggle (common pattern)
 */
export function useOptimisticUserStatus(
  userId: string,
  currentStatus: 'active' | 'inactive' | 'pending' | 'suspended',
  updateStatusFn: (userId: string, status: string) => Promise<void>
) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    currentStatus,
    (_currentState, newStatus: typeof currentStatus) => newStatus
  );

  const updateStatus = useCallback(
    async (newStatus: typeof currentStatus) => {
      setOptimisticStatus(newStatus);

      try {
        await updateStatusFn(userId, newStatus);
        logger().info('User status updated', { userId, status: newStatus });
        return { success: true };
      } catch (error) {
        logger().error('Failed to update user status', error instanceof Error ? error : new Error(String(error)), { userId });
        return { success: false, error };
      }
    },
    [userId, setOptimisticStatus, updateStatusFn]
  );

  return {
    status: optimisticStatus,
    updateStatus,
  };
}

/**
 * Optimistic form submission
 * Shows success state immediately while server processes
 */
export function useOptimisticFormSubmission<T>(
  submitFn: (data: T) => Promise<void>
) {
  type SubmissionState = { status: 'idle' | 'submitting' | 'success' | 'error'; error?: unknown };
  
  // Type assertion needed - React 19 useOptimistic types still stabilizing
  const [submissionState, setSubmissionState] = useOptimistic(
    { status: 'idle' } as SubmissionState,
    (_currentState: SubmissionState, newState: SubmissionState) => newState
  ) as [SubmissionState, (action: SubmissionState) => void];

  const submit = useCallback(
    async (data: T) => {
      setSubmissionState({ status: 'submitting' });

      // Show success immediately for better UX
      setSubmissionState({ status: 'success' });

      try {
        await submitFn(data);
        return { success: true };
      } catch (error) {
        setSubmissionState({ status: 'error', error });
        logger().error('Form submission failed', error instanceof Error ? error : new Error(String(error)));
        return { success: false, error };
      }
    },
    [setSubmissionState, submitFn]
  );

  const reset = useCallback(() => {
    setSubmissionState({ status: 'idle' });
  }, [setSubmissionState]);

  return {
    state: submissionState,
    submit,
    reset,
  };
}

/**
 * Optimistic comment/message submission
 * Shows new comment immediately in list
 */
export function useOptimisticComment<T extends { id: string; content: string; timestamp: Date }>(
  currentComments: T[],
  submitCommentFn: (content: string) => Promise<T>
) {
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    currentComments,
    (state, newComment: T) => [...state, newComment]
  );

  const addComment = useCallback(
    async (content: string) => {
      // Create optimistic comment
      const tempComment = {
        id: `temp-${Date.now()}`,
        content,
        timestamp: new Date(),
      } as T;

      addOptimisticComment(tempComment);

      try {
        const result = await submitCommentFn(content);
        return { success: true, data: result };
      } catch (error) {
        logger().error('Failed to submit comment', error instanceof Error ? error : new Error(String(error)));
        return { success: false, error };
      }
    },
    [addOptimisticComment, submitCommentFn]
  );

  return {
    comments: optimisticComments,
    addComment,
  };
}

export default useOptimisticUpdate;
