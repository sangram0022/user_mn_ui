/**
 * Utility adapter for generic requests
 * Provides a general-purpose request handler
 */

import baseApiClient, { type RequestOptions } from '../apiClient';

/**
 * Make a generic API request
 */
export async function makeRequest(
  path: string,
  options?: RequestInit
): Promise<unknown> {
  const normalizedOptions: RequestOptions | undefined = options
    ? {
        ...options,
        method: options.method && ['GET', 'POST', 'PUT', 'DELETE'].includes(options.method.toUpperCase())
          ? (options.method.toUpperCase() as RequestOptions['method'])
          : undefined
      }
    : undefined;

  return await baseApiClient.execute(path, normalizedOptions);
}
