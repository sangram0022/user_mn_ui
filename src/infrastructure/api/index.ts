/**
 * Infrastructure - API Layer
 * Handles all external API communication
 *
 * @module infrastructure/api
 */

// API Client - Base HTTP client with interceptors
export { ApiClient, apiClient, useApi } from '@lib/api';
export type { ApiErrorInit, RequestOptions } from '@lib/api';

// API Utilities
export { createApiEndpoint } from './utils/endpoints';
export { handleApiError } from './utils/errorHandling';
export { transformApiResponse } from './utils/transformers';

// API Types
export type { ApiEndpoint, HttpMethod, QueryParams, RequestBody } from './types';
