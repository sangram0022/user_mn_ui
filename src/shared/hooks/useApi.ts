/**
 * Modern Centralized API Hook System
 * Replaces inconsistent API patterns with unified approach
 * Uses React 19 features: useOptimistic, useActionState
 * Compatible with TanStack Query v5
 */

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from '@tanstack/react-query';
import { useOptimistic, useActionState } from 'react';
import { APIError } from '@/core/error';
import { logger } from '@/core/logging';

// ========================================
// Types for Enhanced API Hooks
// ========================================

export interface ApiHookConfig<TData = unknown, TError = APIError> {
  // Core options
  queryKey?: QueryKey;
  enabled?: boolean;
  
  // Enhanced features
  optimisticUpdate?: (currentData: TData | undefined, variables: unknown) => TData;
  onOptimisticError?: (error: TError) => void;
  
  // Caching strategy
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
}

export interface ApiState<TData = unknown> {
  data: TData | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: APIError | null;
}

export interface OptimisticApiState<TData = unknown> extends ApiState<TData> {
  optimisticData: TData | undefined;
  isOptimistic: boolean;
}

// ========================================
// Enhanced useApiQuery Hook
// Consistent data fetching across the app
// ========================================

export function useApiQuery<TData = unknown, TError = APIError>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> & {
    // Enhanced error handling
    errorToast?: boolean;
    successMessage?: string;
  }
) {
  const {
    errorToast = true,
    successMessage,
    ...queryOptions
  } = options || {};

  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      try {
        logger().debug(`API Query: ${queryKey.join('/')}`, { queryKey });
        const result = await queryFn();
        
        if (successMessage) {
          // TODO: Integrate with toast system
          console.log(successMessage);
        }
        
        return result;
      } catch (error) {
        const apiError = error instanceof APIError ? error : new APIError(
          error instanceof Error ? error.message : 'Unknown error',
          0,
          'GET',
          queryKey.join('/'),
          error && typeof error === 'object' ? error as Record<string, unknown> : undefined
        );
        
        logger().error(`API Query Error: ${queryKey.join('/')}`, apiError);
        
        if (errorToast) {
          // TODO: Integrate with toast system
          console.error(apiError.message);
        }
        
        throw apiError;
      }
    },
    ...queryOptions,
  });
}

// ========================================
// Enhanced useApiMutation Hook with Optimistic Updates
// Uses React 19 useOptimistic for instant UI feedback
// ========================================

export function useApiMutation<TData = unknown, TVariables = unknown, TError = APIError>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables> & {
    // Enhanced features
    optimisticUpdate?: (currentData: unknown, variables: TVariables) => unknown;
    queryKeyToUpdate?: QueryKey;
    errorToast?: boolean;
    successMessage?: string;
  }
) {
  const queryClient = useQueryClient();
  const {
    optimisticUpdate,
    queryKeyToUpdate,
    errorToast = true,
    successMessage,
    onSuccess,
    onError,
    onMutate,
    ...mutationOptions
  } = options || {};

  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      try {
        logger().debug('API Mutation started', { variables });
        const result = await mutationFn(variables);
        
        if (successMessage) {
          // TODO: Integrate with toast system
          console.log(successMessage);
        }
        
        return result;
      } catch (error) {
        const apiError = error instanceof APIError ? error : new APIError(
          error instanceof Error ? error.message : 'Unknown error',
          0,
          'POST',
          'mutation',
          error && typeof error === 'object' ? error as Record<string, unknown> : undefined
        );
        
        logger().error('API Mutation Error', apiError);
        
        if (errorToast) {
          // TODO: Integrate with toast system
          console.error(apiError.message);
        }
        
        throw apiError;
      }
    },
    
    // Enhanced onMutate with optimistic updates
    onMutate: async (variables) => {
      // Call original onMutate if provided
      await onMutate?.(variables);

      // Implement optimistic update
      if (optimisticUpdate && queryKeyToUpdate) {
        await queryClient.cancelQueries({ queryKey: queryKeyToUpdate });
        
        const previousData = queryClient.getQueryData(queryKeyToUpdate);
        
        queryClient.setQueryData(
          queryKeyToUpdate, 
          (old: unknown) => optimisticUpdate(old, variables)
        );
        
        return { previousData };
      }
    },
    
    // Enhanced error handling with rollback
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      const ctx = context as { previousData?: unknown } | undefined;
      if (ctx?.previousData && queryKeyToUpdate) {
        queryClient.setQueryData(queryKeyToUpdate, ctx.previousData);
      }
      
      onError?.(error, variables, context);
    },
    
    // Enhanced success handling
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      if (queryKeyToUpdate) {
        queryClient.invalidateQueries({ queryKey: queryKeyToUpdate });
      }
      
      onSuccess?.(data, variables, context);
    },
    
    ...mutationOptions,
  });
}

// ========================================
// React 19 useActionState Integration
// For form submissions with enhanced state management
// ========================================

type ActionState<TData = unknown> = {
  data: TData | null;
  isLoading: boolean;
  error: APIError | null;
  isSuccess: boolean;
};

export function useApiActionState<TData = unknown, TFormData = FormData>(
  action: (formData: TFormData) => Promise<TData>,
  initialState: ActionState<TData> = {
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false,
  },
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: APIError) => void;
    resetOnSuccess?: boolean;
  }
) {
  const { onSuccess, onError, resetOnSuccess = false } = options || {};

  const [state, formAction, isPending] = useActionState(
    async (_prevState: ActionState<TData>, formData: TFormData): Promise<ActionState<TData>> => {
      try {
        logger().debug('API Action started', { formData });
        
        const data = await action(formData);
        
        const newState = {
          data,
          isLoading: false,
          error: null,
          isSuccess: true,
        };
        
        onSuccess?.(data);
        
        return resetOnSuccess ? initialState : newState;
      } catch (error) {
        const apiError = error instanceof APIError ? error : new APIError(
          error instanceof Error ? error.message : 'Unknown error',
          0,
          'POST',
          'action',
          error && typeof error === 'object' ? error as Record<string, unknown> : undefined
        );
        
        logger().error('API Action Error', apiError);
        onError?.(apiError);
        
        return {
          data: null,
          isLoading: false,
          error: apiError,
          isSuccess: false,
        };
      }
    },
    initialState
  );

  return {
    ...state,
    isLoading: isPending || state.isLoading,
    formAction,
    isPending,
  };
}

// ========================================
// Optimistic Query Hook
// Uses React 19 useOptimistic for instant feedback
// ========================================

export function useOptimisticQuery<TData = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: ApiHookConfig<TData> & {
    enableOptimistic?: boolean;
  }
) {
  const { enableOptimistic = true } = options || {};
  
  // Standard query
  const query = useApiQuery(queryKey, queryFn, options);
  
  // Optimistic state
  const [optimisticData, setOptimisticData] = useOptimistic(
    query.data,
    (currentData: TData | undefined, updateFn: (data: TData | undefined) => TData | undefined) => {
      return updateFn(currentData);
    }
  );

  // Enhanced return with optimistic capabilities
  return {
    ...query,
    data: enableOptimistic ? optimisticData : query.data,
    optimisticData,
    isOptimistic: optimisticData !== query.data,
    
    // Method to apply optimistic update
    optimisticUpdate: (updateFn: (data: TData | undefined) => TData | undefined) => {
      if (enableOptimistic) {
        setOptimisticData(updateFn);
      }
    },
  };
}

// ========================================
// Default Exports
// ========================================

export default {
  useApiQuery,
  useApiMutation,
  useApiActionState,
  useOptimisticQuery,
};