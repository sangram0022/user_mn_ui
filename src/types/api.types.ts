/**
 * Global TypeScript types for API responses
 * 
 * @deprecated This file is deprecated. Import types from '@/core/api' instead.
 * 
 * @example
 * ```typescript
 * // Old (deprecated):
 * import type { ApiResponse } from '@/types/api.types';
 * 
 * // New (preferred):
 * import type { ApiResponse } from '@/core/api';
 * ```
 */

// Re-export all types from core API module
export type {
  ApiResponse,
  ValidationErrorResponse,
  ErrorResponse,
  FieldErrors,
  PaginatedResponse,
  PaginationMeta,
  PaginatedApiResponse,
  PaginationParams,
  SortParams,
  FilterParams,
  ListQueryParams,
  UnwrapApiResponse,
  DeepPartial,
} from '@/core/api';

export {
  isSuccessResponse,
  isValidationError,
  isErrorResponse,
  APIError,
  API_PREFIXES,
  type ApiPrefixKey,
} from '@/core/api';
