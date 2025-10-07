/**
 * Custom Hooks Index
 * 
 * Central export point for all custom React hooks.
 * These hooks encapsulate common patterns and reduce boilerplate.
 */

// Async operation management
export { useAsyncOperation } from './useAsyncOperation';
export type {
  AsyncOperationOptions,
  UseAsyncOperationResult
} from './useAsyncOperation';

// Pagination management
export { usePagination } from './usePagination';
export type {
  PaginationState,
  UsePaginationOptions,
  UsePaginationResult
} from './usePagination';

// Form state management
export { useFormState } from './useFormState';
export type {
  UseFormStateOptions,
  UseFormStateResult
} from './useFormState';

// Error handling (existing)
export { useErrorHandler, useErrorMessage } from './errors/useErrorHandler';

// Authentication (existing)
export { useAuth } from './useAuth';

// Session management (existing)
export { useSessionManagement } from './useSessionManagement';
