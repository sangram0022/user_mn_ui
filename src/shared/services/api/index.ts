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
export { apiClient, useApi } from './apiClient';
export type { RequestOptions } from './apiClient';

// Adapter pattern for backward compatibility
export { apiClientAdapter } from '@services/adapters';
export type {
  StandardResponse,
  PageInfo,
  LegacyUser,
  LegacyUsersResponse,
  LegacyRolesResponse,
  ActionResponse,
  ProfileResponse,
  AnalyticsResponse,
  RegisterResponseWrapper
} from '@services/adapters';

// Legacy compatibility layer
export { apiClient as legacyApiClient } from './apiClientLegacy';

// Default export is the modern client
export { default } from './apiClient';
