/**
 * Shared API Type Definitions
 * RE-EXPORTS from core/api/types.ts for convenience
 * 
 * This module provides commonly used types for domain services.
 * All types are sourced from src/core/api/types.ts (SSOT).
 * 
 * DO NOT define new types here - add them to core/api/types.ts instead.
 */

// Re-export core API types
export type {
  ApiResponse,
  FieldErrors,
  ValidationErrorResponse,
  ErrorResponse,
  PaginationMeta,
  PaginatedResponse,
  PaginatedApiResponse,
  PaginationParams,
  SortParams,
  FilterParams,
  ListQueryParams,
  UnwrapApiResponse,
  DeepPartial,
} from '@/core/api/types';

// Re-export type guards
export {
  isSuccessResponse,
  isValidationError,
  isErrorResponse,
} from '@/core/api/types';
