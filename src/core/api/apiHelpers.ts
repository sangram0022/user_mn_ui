/**
 * API Integration Helpers
 * Common utilities and patterns for service layer implementation
 * Single Source of Truth for API call patterns
 */

import { apiClient } from '@/services/api/apiClient';
import { unwrapResponse } from '@/services/api/common';
import type { AxiosRequestConfig } from 'axios';

// ============================================================================
// Query Parameter Builders
// ============================================================================

/**
 * Builds URL query string from filters object
 * Handles undefined, null, empty values and arrays
 * 
 * @example
 * const filters = { status: 'active', roles: ['admin', 'user'], page: 1 };
 * const queryString = buildQueryString(filters);
 * // Result: "status=active&roles=admin&roles=user&page=1"
 */
export function buildQueryString(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        // Handle array values (e.g., multiple roles, statuses)
        value.forEach(v => params.append(key, String(v)));
      } else {
        params.append(key, String(value));
      }
    }
  });
  
  return params.toString();
}

/**
 * Appends query string to base URL
 * 
 * @example
 * const url = buildUrlWithQuery('/api/v1/users', { page: 1, status: 'active' });
 * // Result: "/api/v1/users?page=1&status=active"
 */
export function buildUrlWithQuery(baseUrl: string, filters?: Record<string, unknown>): string {
  if (!filters || Object.keys(filters).length === 0) {
    return baseUrl;
  }
  
  const queryString = buildQueryString(filters);
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

// ============================================================================
// Standard API Call Patterns
// ============================================================================

/**
 * Standard GET request with optional query parameters
 * Returns raw response.data (for paginated lists)
 * 
 * @example
 * const users = await apiGet<UserListResponse>('/api/v1/admin/users', { status: 'active' });
 */
export async function apiGet<T>(
  endpoint: string,
  filters?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> {
  const url = buildUrlWithQuery(endpoint, filters);
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

/**
 * Standard GET request for single resource with unwrapping
 * Uses unwrapResponse for backend-wrapped responses
 * 
 * @example
 * const user = await apiGetOne<User>('/api/v1/admin/users/123');
 */
export async function apiGetOne<T>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.get<T>(endpoint, config);
  return unwrapResponse<T>(response.data);
}

/**
 * Standard POST request with unwrapping
 * Uses unwrapResponse for backend-wrapped responses
 * 
 * @example
 * const created = await apiPost<CreateUserResponse>('/api/v1/admin/users', userData);
 */
export async function apiPost<T>(
  endpoint: string,
  data: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<T>(endpoint, data, config);
  return unwrapResponse<T>(response.data);
}

/**
 * Standard PUT request with unwrapping
 * Uses unwrapResponse for backend-wrapped responses
 * 
 * @example
 * const updated = await apiPut<UpdateUserResponse>('/api/v1/admin/users/123', userData);
 */
export async function apiPut<T>(
  endpoint: string,
  data: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.put<T>(endpoint, data, config);
  return unwrapResponse<T>(response.data);
}

/**
 * Standard PATCH request with unwrapping
 * Uses unwrapResponse for backend-wrapped responses
 * 
 * @example
 * const patched = await apiPatch<User>('/api/v1/admin/users/123', { status: 'active' });
 */
export async function apiPatch<T>(
  endpoint: string,
  data: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.patch<T>(endpoint, data, config);
  return unwrapResponse<T>(response.data);
}

/**
 * Standard DELETE request with unwrapping
 * Uses unwrapResponse for backend-wrapped responses
 * 
 * @example
 * const result = await apiDelete<DeleteResponse>('/api/v1/admin/users/123');
 */
export async function apiDelete<T>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.delete<T>(endpoint, config);
  return unwrapResponse<T>(response.data);
}

/**
 * Download file (Blob) - for exports
 * Returns raw Blob, no unwrapping
 * 
 * @example
 * const blob = await apiDownload('/api/v1/admin/export/users', { format: 'csv' });
 */
export async function apiDownload(
  endpoint: string,
  filters?: Record<string, unknown>
): Promise<Blob> {
  const url = buildUrlWithQuery(endpoint, filters);
  const response = await apiClient.get(url, {
    responseType: 'blob',
  });
  return response.data;
}

// ============================================================================
// Bulk Operations Helpers
// ============================================================================

/**
 * Standard bulk operation (e.g., bulk delete)
 * POST request with array of IDs
 * 
 * @example
 * const result = await apiBulkOperation<BulkDeleteResponse>(
 *   '/api/v1/admin/users/bulk-delete',
 *   ['id1', 'id2', 'id3']
 * );
 */
export async function apiBulkOperation<T>(
  endpoint: string,
  ids: string[],
  config?: AxiosRequestConfig
): Promise<T> {
  return apiPost<T>(endpoint, { ids }, config);
}

// ============================================================================
// Resource ID Helpers
// ============================================================================

/**
 * Build resource URL with ID
 * 
 * @example
 * const url = buildResourceUrl('/api/v1/admin/users', '123');
 * // Result: "/api/v1/admin/users/123"
 */
export function buildResourceUrl(baseUrl: string, id: string): string {
  return `${baseUrl}/${id}`;
}

/**
 * Build resource action URL
 * 
 * @example
 * const url = buildResourceActionUrl('/api/v1/admin/users', '123', 'approve');
 * // Result: "/api/v1/admin/users/123/approve"
 */
export function buildResourceActionUrl(baseUrl: string, id: string, action: string): string {
  return `${baseUrl}/${id}/${action}`;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if response is paginated list
 */
export function isPaginatedResponse(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    'pagination' in data
  );
}

/**
 * Check if response is wrapped (success/data format)
 */
export function isWrappedResponse(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    'data' in data
  );
}

// ============================================================================
// Error Helpers
// ============================================================================

/**
 * Extract error message from API error response
 * Handles various error formats
 */
export function extractErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error occurred';
  
  if (typeof error === 'string') return error;
  
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    
    // Check common error message fields
    if (typeof err.message === 'string') return err.message;
    if (typeof err.error === 'string') return err.error;
    if (typeof err.detail === 'string') return err.detail;
    
    // Check nested response
    if (err.response && typeof err.response === 'object') {
      const response = err.response as Record<string, unknown>;
      if (response.data && typeof response.data === 'object') {
        const data = response.data as Record<string, unknown>;
        if (typeof data.message === 'string') return data.message;
        if (typeof data.error === 'string') return data.error;
        if (typeof data.detail === 'string') return data.detail;
      }
    }
  }
  
  return 'An unexpected error occurred';
}

// ============================================================================
// Export all utilities
// ============================================================================

export const ApiHelpers = {
  // Query builders
  buildQueryString,
  buildUrlWithQuery,
  
  // Standard API calls
  get: apiGet,
  getOne: apiGetOne,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  download: apiDownload,
  
  // Bulk operations
  bulkOperation: apiBulkOperation,
  
  // Resource URL builders
  buildResourceUrl,
  buildResourceActionUrl,
  
  // Type guards
  isPaginatedResponse,
  isWrappedResponse,
  
  // Error handling
  extractErrorMessage,
} as const;

export default ApiHelpers;
