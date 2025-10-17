/**
 * API Error handling utilities
 *
 * Re-exports canonical ApiError and error handlers
 */

import {
  ApiError,
  handleApiError as handleApiErrorUtil,
  isApiError as isApiErrorCheck,
} from '@shared/errors/ApiError';
export type { ApiErrorInit } from '@shared/errors/ApiError';
export { ApiError, handleApiErrorUtil as handleApiError, isApiErrorCheck as isApiError };

export interface ApiErrorDetails {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  error_code: string;
  message: string;
  details?: {
    data?: ApiErrorDetails[];
  };
  status?: number;
}

export const getErrorMessage = (error: unknown): string => {
  if (isApiErrorCheck(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
};

export const getErrorDetails = (error: unknown): unknown => {
  if (isApiErrorCheck(error)) {
    return error.details;
  }

  return undefined;
};

export const isAuthError = (error: unknown): boolean => {
  if (isApiErrorCheck(error)) {
    return error.isAuthError();
  }

  return false;
};

export const isValidationError = (error: unknown): boolean => {
  if (isApiErrorCheck(error)) {
    return error.isValidationError();
  }

  return false;
};

export const isNotFoundError = (error: unknown): boolean => {
  if (isApiErrorCheck(error)) {
    return error.isNotFoundError();
  }

  return false;
};

export const isServerError = (error: unknown): boolean => {
  if (!isApiErrorCheck(error)) {
    return false;
  }
  return error.isServerError();
};

export const formatValidationErrors = (error: unknown): Record<string, string> => {
  const result: Record<string, string> = {};

  if (!isApiErrorCheck(error) || !error.errors) {
    return result;
  }

  Object.entries(error.errors).forEach(([field, messages]) => {
    result[field] = Array.isArray(messages) ? messages.join(', ') : String(messages);
  });

  return result;
};
