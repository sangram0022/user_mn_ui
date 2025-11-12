/**
 * Common API utilities and constants
 * Response unwrapping and helper functions
 * 
 * @deprecated Import from '@/core/api' instead for types and constants
 * This file will be removed in future cleanup
 */

import { logger } from '@/core/logging';
import type { ApiResponse } from '@/core/api';
import { isDevelopment } from '@/core/config';

// Re-export from core API module for backward compatibility
export { APIError, API_PREFIXES, type ApiPrefixKey, type ApiResponse } from '@/core/api';

/**
 * Unwraps the standard API response format
 * Single Source of Truth for response unwrapping logic
 * 
 * @template T - The expected data type
 * @param response - The API response to unwrap
 * @returns The unwrapped data
 * @throws {APIError} If response is invalid or contains error
 * 
 * @example
 * ```typescript
 * const response = await apiClient.get('/api/v1/users');
 * const users = unwrapResponse<User[]>(response.data);
 * ```
 */
export function unwrapResponse<T>(response: unknown): T {
  // Debug logging in development
  if (isDevelopment()) {
    logger().debug('[unwrapResponse] Processing response', {
      hasResponse: !!response,
      responseType: typeof response,
      keys: response && typeof response === 'object' ? Object.keys(response) : [],
    });
  }

  if (!response || typeof response !== 'object') {
    logger().error('[unwrapResponse] Invalid response format', new Error('Invalid response'), { response });
    throw new Error('Invalid response format');
  }

  const apiResponse = response as ApiResponse<T>;

  // Check success field explicitly
  if (apiResponse.success === false || apiResponse.error) {
    logger().error('[unwrapResponse] API returned error', new Error(apiResponse.error || 'Request failed'), { apiResponse });
    throw new Error(apiResponse.error || 'Request failed');
  }

  // If success is true or undefined, check if data exists
  if (!apiResponse.data) {
    logger().error('[unwrapResponse] Response missing data field', new Error('No data field'), { apiResponse });
    throw new Error('Response missing data field');
  }

  if (isDevelopment()) {
    logger().debug('[unwrapResponse] Successfully unwrapped response', {
      hasData: !!apiResponse.data,
      dataType: typeof apiResponse.data,
    });
  }

  return apiResponse.data;
}
