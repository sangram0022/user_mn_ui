/**
 * Infrastructure - API Layer
 * Handles all external API communication
 * 
 * @module infrastructure/api
 */

// API Client - Base HTTP client with interceptors
export { apiClient } from './apiClient';
export type { 
  ApiClientConfig, 
  ApiResponse, 
  ApiError,
  RequestInterceptor,
  ResponseInterceptor 
} from './apiClient';

// API Services - Domain-specific API integrations
export { authApiService } from './services/authApiService';
export { usersApiService } from './services/usersApiService';
export { workflowsApiService } from './services/workflowsApiService';
export { analyticsApiService } from './services/analyticsApiService';

// API Utilities
export { createApiEndpoint } from './utils/endpoints';
export { handleApiError } from './utils/errorHandling';
export { transformApiResponse } from './utils/transformers';

// API Types
export type { 
  ApiEndpoint,
  HttpMethod,
  QueryParams,
  RequestBody 
} from './types';
