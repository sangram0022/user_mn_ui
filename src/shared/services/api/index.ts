/**
 * Services Module Index
 *
 * Central export point for all API-related services and utilities.
 * This provides a clean, organized interface for consuming components.
 */

// Modern API client
export { ApiClient, apiClient } from '@lib/api/client';
export type { RequestOptions } from '@lib/api/client';

// Default export is the modern client
export { apiClient as default } from '@lib/api/client';
