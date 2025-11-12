/**
 * Core API Type Definitions
 * SINGLE SOURCE OF TRUTH for all API-related types
 * 
 * This module defines standardized types for:
 * - API responses (success/error)
 * - Pagination
 * - Field validation errors
 * - API error structures
 * 
 * All API services MUST use these types for consistency.
 */

// ========================================
// Standard API Response
// ========================================

/**
 * Standard API response wrapper from backend
 * All API endpoints return data in this format
 * 
 * @template T - The data type returned on success
 */
export interface ApiResponse<T> {
  /** Whether the request was successful */
  success: boolean;
  
  /** The response data (present on success) */
  data: T;
  
  /** Optional success message */
  message?: string;
  
  /** Error message (present on failure) */
  error?: string;
  
  /** Server timestamp for the response */
  timestamp?: string;
}

// ========================================
// Error Types
// ========================================

/**
 * Field-level validation errors from backend
 * Maps field names to arrays of error messages
 * 
 * @example
 * {
 *   email: ['Email is required', 'Email format invalid'],
 *   password: ['Password must be at least 8 characters']
 * }
 */
export type FieldErrors = Record<string, string[]>;

/**
 * Validation error response from backend
 * Returned when request fails validation (422)
 */
export interface ValidationErrorResponse {
  /** Always false for error responses */
  success: false;
  
  /** General error message */
  error: string;
  
  /** Field-specific validation errors */
  field_errors?: FieldErrors;
  
  /** Optional error code for programmatic handling */
  message_code?: string;
  
  /** Server timestamp */
  timestamp?: string;
}

/**
 * Generic error response from backend
 * Used for non-validation errors (500, 404, etc.)
 */
export interface ErrorResponse {
  /** Always false for error responses */
  success: false;
  
  /** Error message */
  error: string;
  
  /** Optional error detail */
  detail?: string;
  
  /** Optional error code */
  message_code?: string;
  
  /** HTTP status code */
  status?: number;
  
  /** Server timestamp */
  timestamp?: string;
}

// ========================================
// Pagination Types
// ========================================

/**
 * Pagination metadata from backend
 */
export interface PaginationMeta {
  /** Current page number (1-indexed) */
  page: number;
  
  /** Items per page */
  page_size: number;
  
  /** Total number of items across all pages */
  total: number;
  
  /** Total number of pages */
  total_pages: number;
  
  /** Whether there is a next page */
  has_next: boolean;
  
  /** Whether there is a previous page */
  has_prev: boolean;
}

/**
 * Paginated response wrapper
 * 
 * @template T - The type of items in the array
 */
export interface PaginatedResponse<T> {
  /** Array of items for current page */
  items: T[];
  
  /** Pagination metadata */
  pagination: PaginationMeta;
}

/**
 * Paginated API response
 * Combines standard response wrapper with pagination
 * 
 * @template T - The type of items in the paginated list
 */
export type PaginatedApiResponse<T> = ApiResponse<PaginatedResponse<T>>;

// ========================================
// Request Parameter Types
// ========================================

/**
 * Standard pagination query parameters
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page?: number;
  
  /** Items per page */
  page_size?: number;
}

/**
 * Standard sorting parameters
 */
export interface SortParams {
  /** Field to sort by */
  sort_by?: string;
  
  /** Sort direction */
  sort_order?: 'asc' | 'desc';
}

/**
 * Standard filtering parameters
 */
export interface FilterParams {
  /** Search query string */
  q?: string;
  
  /** Additional filters (key-value pairs) */
  [key: string]: string | number | boolean | undefined;
}

/**
 * Combined query parameters for list endpoints
 */
export interface ListQueryParams extends PaginationParams, SortParams, FilterParams {}

// ========================================
// Type Guards
// ========================================

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T> | ErrorResponse | ValidationErrorResponse
): response is ApiResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is a validation error
 */
export function isValidationError(
  response: ApiResponse<unknown> | ErrorResponse | ValidationErrorResponse
): response is ValidationErrorResponse {
  return (
    response.success === false &&
    'field_errors' in response &&
    response.field_errors !== undefined
  );
}

/**
 * Type guard to check if response is a generic error
 */
export function isErrorResponse(
  response: ApiResponse<unknown> | ErrorResponse | ValidationErrorResponse
): response is ErrorResponse {
  return response.success === false && !('field_errors' in response);
}

// ========================================
// Utility Types
// ========================================

/**
 * Extract data type from ApiResponse
 * Useful for typing service function returns
 * 
 * @example
 * type User = UnwrapApiResponse<ApiResponse<{ id: string; name: string }>>;
 * // Result: { id: string; name: string }
 */
export type UnwrapApiResponse<T> = T extends ApiResponse<infer U> ? U : never;

/**
 * Make all properties of T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
