/**
 * Modern Centralized API Hook System
 * Replaces inconsistent API patterns with unified approach
 * Compatible with TanStack Query v5 and React 19
 */

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { useOptimistic, useActionState } from 'react';
import { apiClient } from '@/services/api/apiClient';
import { APIError } from '@/core/error';
import { logger } from '@/core/logging';
import { useToast } from '@/hooks/useToast';

// ========================================
// Enhanced Query Hook with Error Handling
// ========================================

export function useApiQuery<TData = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    errorToast?: boolean;
    successMessage?: string;
    onSuccess?: (data: TData) => void;
    onError?: (error: APIError) => void;
  }
) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    gcTime = 10 * 60 * 1000, // 10 minutes
    errorToast = true,
    successMessage,
    onSuccess,
    onError,
  } = options || {};

  const toast = useToast();

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        logger().debug(`API Query: ${queryKey.join('/')}`, { queryKey });
        const result = await queryFn();
        
        if (successMessage) {
          toast.success(successMessage);
        }
        
        onSuccess?.(result);
        return result;
      } catch (error) {
        const apiError = error instanceof APIError ? error : new APIError(
          error instanceof Error ? error.message : 'Unknown error',
          0,
          'GET',
          queryKey.join('/'),
          error as Record<string, unknown> || undefined
        );
        
        logger().error(`API Query Error: ${queryKey.join('/')}`, apiError);
        
        if (errorToast) {
          toast.error(apiError.message);
        }
        
        onError?.(apiError);
        throw apiError;
      }
    },
    enabled,
    staleTime,
    gcTime,
  });
}

// ========================================
// Enhanced Mutation Hook with Optimistic Updates
// ========================================

export function useApiMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    // Enhanced features
    optimisticUpdate?: (currentData: unknown, variables: TVariables) => unknown;
    queryKeyToUpdate?: QueryKey;
    errorToast?: boolean;
    successMessage?: string;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: APIError, variables: TVariables) => void;
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
  } = options || {};

  const toast = useToast();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      try {
        logger().debug('API Mutation started', { variables });
        const result = await mutationFn(variables);
        
        if (successMessage) {
          toast.success(successMessage);
        }
        
        return result;
      } catch (error) {
        const apiError = error instanceof APIError ? error : new APIError(
          error instanceof Error ? error.message : 'Unknown error',
          0,
          'POST',
          'mutation',
          error as Record<string, unknown> || undefined
        );
        
        logger().error('API Mutation Error', apiError);
        
        if (errorToast) {
          toast.error(apiError.message);
        }
        
        throw apiError;
      }
    },
    
    // Enhanced onMutate with optimistic updates
    onMutate: async (variables: TVariables) => {
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
    onError: (error: APIError, variables: TVariables, context) => {
      // Rollback optimistic update on error
      if (context?.previousData && queryKeyToUpdate) {
        queryClient.setQueryData(queryKeyToUpdate, context.previousData);
      }
      
      onError?.(error, variables);
    },
    
    // Enhanced success handling
    onSuccess: (data: TData, variables: TVariables) => {
      // Invalidate related queries
      if (queryKeyToUpdate) {
        queryClient.invalidateQueries({ queryKey: queryKeyToUpdate });
      }
      
      onSuccess?.(data, variables);
    },
  });
}

// ========================================
// React 19 useActionState Integration
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
    async (_: ActionState<TData>, formData: TFormData): Promise<ActionState<TData>> => {
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
          error as Record<string, unknown> || undefined
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
// Optimistic Query Hook with React 19
// ========================================

export function useOptimisticQuery<TData = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    enableOptimistic?: boolean;
    onSuccess?: (data: TData) => void;
    onError?: (error: APIError) => void;
  }
) {
  const { enableOptimistic = true, ...queryOptions } = options || {};
  
  // Standard query
  const query = useApiQuery(queryKey, queryFn, queryOptions);
  
  // Optimistic state
  const [optimisticData, setOptimisticData] = useOptimistic(
    query.data as TData | undefined,
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
// Centralized API Endpoints
// Factory functions for common API patterns
// ========================================

export const createApiHooks = (baseUrl: string) => ({
  /**
   * GET request hook factory
   */
  useGet: <TData>(endpoint: string, options?: Parameters<typeof useApiQuery>[2]) =>
    useApiQuery<TData>(['GET', baseUrl, endpoint], () => 
      apiClient.get(`${baseUrl}${endpoint}`).then(res => res.data), options),

  /**
   * POST mutation hook factory
   */
  usePost: <TData, TVariables>(endpoint: string, options?: Parameters<typeof useApiMutation>[1]) =>
    useApiMutation<TData, TVariables>(
      (variables) => apiClient.post(`${baseUrl}${endpoint}`, variables).then(res => res.data),
      options
    ),

  /**
   * PUT mutation hook factory
   */
  usePut: <TData, TVariables>(endpoint: string, options?: Parameters<typeof useApiMutation>[1]) =>
    useApiMutation<TData, TVariables>(
      (variables) => apiClient.put(`${baseUrl}${endpoint}`, variables).then(res => res.data),
      options
    ),

  /**
   * DELETE mutation hook factory
   */
  useDelete: <TData>(endpoint: string, options?: Parameters<typeof useApiMutation>[1]) =>
    useApiMutation<TData, void>(
      () => apiClient.delete(`${baseUrl}${endpoint}`).then(res => res.data),
      options
    ),
});

// ========================================
// Default API hooks for the main API
// ========================================

export const api = createApiHooks('');

export default {
  useApiQuery,
  useApiMutation,
  useApiActionState,
  useOptimisticQuery,
  createApiHooks,
  api,
};