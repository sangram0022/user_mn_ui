/**
 * Custom Hooks Index
 *
 * Central export point for all custom React hooks.
 * These hooks encapsulate common patterns and reduce boilerplate.
 */

// Form submission management (NEW - Critical Fix)
export { useFormSubmission } from './useFormSubmission';
export type {
  FormSubmissionResult,
  FormSubmissionState,
  UseFormSubmissionOptions,
} from './useFormSubmission';

// Async operation management
export { useAsyncOperation } from './useAsyncOperation';
export type { AsyncOperationOptions, UseAsyncOperationResult } from './useAsyncOperation';

// Pagination management
export { usePagination } from './usePagination';

// Error handling (existing)
export { useErrorHandler, useErrorMessage } from './errors/useErrorHandler';

// Authentication (existing)
export { useAuth } from '@domains/auth/context/AuthContext';

// Session management (existing)
export { useSessionManagement } from './useSessionManagement';

// View Transitions (NEW - Phase 2 Task 8)
export { supportsViewTransitions, useViewTransition } from './useViewTransition';
export type { ViewTransition } from './useViewTransition';

// Enhanced Navigation with View Transitions (NEW - Phase 2 Task 8)
export { useNavigate } from './useNavigate';

// Rate Limit Notifications (NEW - Production Ready)
export { useRateLimitNotification } from './useRateLimitNotification';
