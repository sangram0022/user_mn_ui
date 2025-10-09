/**
 * Services Module Index
 *
 * Central export point for all API-related services and utilities.
 * This provides a clean, organized interface for consuming components.
 *
 * Recommended usage:
 *   // For new code, use the modern client directly:
 *   import { apiClient } from '@shared/services/api';
 *
 *   // For backward compatibility during migration:
 *   import { legacyApiClient } from '@shared/services/api';
 */

// Modern API client (recommended)
export { ApiClient, apiClient, useApi } from '@lib/api';
export type { RequestOptions } from '@lib/api';

// Maintain compatibility for legacy imports by re-exporting the modern client
export { apiClient as legacyApiClient } from '@lib/api';

// Default export is the modern client
export { apiClient as default } from '@lib/api';
