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
export { apiClient, useApi } from '@services/apiClient';
export type { RequestOptions } from '@services/apiClient';

// Maintain compatibility for legacy imports by re-exporting the modern client
export { apiClient as legacyApiClient } from '@services/apiClient';

// Default export is the modern client
export { default } from '@services/apiClient';
