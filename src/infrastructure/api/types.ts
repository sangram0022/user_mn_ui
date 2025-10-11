/**
 * API Types
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiEndpoint {
  url: string;
  method: HttpMethod;
  requiresAuth?: boolean;
}

export type QueryParams = Record<string, string | number | boolean | undefined>;
export type RequestBody = Record<string, unknown> | FormData;

export interface PaginationParams {
  page?: number;
  limit?: number;
  skip?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: unknown;
}

export interface ApiRequestOptions {
  params?: QueryParams;
  body?: RequestBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}
