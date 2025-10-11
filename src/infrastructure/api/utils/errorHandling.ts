/**
 * API Error handling utilities
 */

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

export class ApiError extends Error {
  constructor(
    public errorCode: string,
    message: string,
    public status?: number,
    public details?: ApiErrorDetails[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  // If it's already an ApiError, return it
  if (error instanceof ApiError) {
    return error;
  }

  // Handle fetch/axios response errors
  if (error.response) {
    const { status, data } = error.response;

    if (data && typeof data === 'object') {
      return new ApiError(
        data.error_code || 'API_ERROR',
        data.message || 'An error occurred',
        status,
        data.details?.data
      );
    }

    return new ApiError(
      'HTTP_ERROR',
      `HTTP ${status}: ${error.response.statusText || 'Unknown error'}`,
      status
    );
  }

  // Handle network errors
  if (error.request) {
    return new ApiError('NETWORK_ERROR', 'Network error: Unable to reach the server', 0);
  }

  // Handle other errors
  return new ApiError('UNKNOWN_ERROR', error.message || 'An unknown error occurred');
};

export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};

export const getErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
};

export const getErrorDetails = (error: any): ApiErrorDetails[] => {
  if (isApiError(error) && error.details) {
    return error.details;
  }

  return [];
};

export const isAuthError = (error: any): boolean => {
  if (isApiError(error)) {
    return error.status === 401 || error.errorCode === 'INVALID_CREDENTIALS';
  }

  return false;
};

export const isValidationError = (error: any): boolean => {
  if (isApiError(error)) {
    return error.status === 400 || error.errorCode === 'VALIDATION_ERROR';
  }

  return false;
};

export const isNotFoundError = (error: any): boolean => {
  if (isApiError(error)) {
    return error.status === 404;
  }

  return false;
};

export const isServerError = (error: any): boolean => {
  if (isApiError(error)) {
    return (error.status || 0) >= 500;
  }

  return false;
};

export const formatValidationErrors = (error: any): Record<string, string> => {
  const result: Record<string, string> = {};

  if (isApiError(error) && error.details) {
    error.details.forEach((detail) => {
      if (detail.field) {
        result[detail.field] = detail.message;
      }
    });
  }

  return result;
};
