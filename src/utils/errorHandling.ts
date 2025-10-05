/**
 * Enterprise Error Handling System
 * Centralized error messages and handling for user management application
 */

import { useState, useEffect } from 'react';
import { ApiError } from './apiError';

export interface ErrorInfo {
  code: string;
  title: string;
  message: string;
  userMessage: string;
  category: 'network' | 'auth' | 'validation' | 'server' | 'rate_limit' | 'permission' | 'unknown';
  retryable: boolean;
  action?: string;
  icon?: string;
  details?: string[];
  supportText?: string;
  supportUrl?: string;
  retryAfterSeconds?: number;
  correlationId?: string;
}

export interface HttpErrorMapping {
  [statusCode: number]: ErrorInfo;
}

export interface ErrorCategoryConfig {
  category: ErrorInfo['category'];
  defaultTitle: string;
  defaultMessage: string;
  defaultUserMessage: string;
  icon: string;
  color: string;
  retryable: boolean;
}

/**
 * HTTP Status Code to Error Mapping
 * Maps HTTP status codes to user-friendly error information
 */
export const HTTP_ERROR_MAPPING: HttpErrorMapping = {
  // 4xx Client Errors
  400: {
    code: 'BAD_REQUEST',
    title: 'Invalid Request',
    message: 'The request contains invalid data or parameters.',
    userMessage: 'Please check your input and try again. If the problem persists, contact support.',
    category: 'validation',
    retryable: false,
    action: 'Check your input data'
  },
  401: {
    code: 'UNAUTHORIZED',
    title: 'Authentication Required',
    message: 'You need to log in to access this resource.',
    userMessage: 'Please log in to continue.',
    category: 'auth',
    retryable: false,
    action: 'Log in'
  },
  403: {
    code: 'FORBIDDEN',
    title: 'Access Denied',
    message: 'You do not have permission to access this resource.',
    userMessage: 'You do not have permission to perform this action.',
    category: 'permission',
    retryable: false,
    action: 'Contact administrator'
  },
  404: {
    code: 'NOT_FOUND',
    title: 'Resource Not Found',
    message: 'The requested resource could not be found.',
    userMessage: 'The page or resource you are looking for does not exist.',
    category: 'server',
    retryable: false
  },
  409: {
    code: 'CONFLICT',
    title: 'Conflict',
    message: 'The request conflicts with the current state of the resource.',
    userMessage: 'This action cannot be completed due to a conflict. Please try again.',
    category: 'validation',
    retryable: true,
    action: 'Try again'
  },
  422: {
    code: 'VALIDATION_ERROR',
    title: 'Validation Error',
    message: 'The submitted data failed validation.',
    userMessage: 'Please check your information and try again.',
    category: 'validation',
    retryable: false,
    action: 'Check your data'
  },
  429: {
    code: 'RATE_LIMIT_EXCEEDED',
    title: 'We need a quick pause',
    message: 'The platform temporarily throttled this request to keep things stable.',
    userMessage: 'We noticed a burst of activity from your account. Please wait about a minute before trying again so we can protect system stability.',
    category: 'rate_limit',
    retryable: true,
    action: 'Retry in a moment',
    details: [
      'This safeguard helps prevent accidental overloads and keeps everyone online.',
      'If you regularly perform bulk operations, request a higher limit from your administrator.'
    ],
    supportText: 'Need a higher limit or still running into the cap? Share the reference ID below with support and we will help.',
    supportUrl: 'mailto:support@usermgmt.example.com?subject=Rate%20limit%20assistance',
    retryAfterSeconds: 60
  },

  // 5xx Server Errors
  500: {
    code: 'INTERNAL_SERVER_ERROR',
    title: 'Server Error',
    message: 'An internal server error occurred.',
    userMessage: 'Something went wrong on our end. Please try again later.',
    category: 'server',
    retryable: true,
    action: 'Try again later'
  },
  502: {
    code: 'BAD_GATEWAY',
    title: 'Service Unavailable',
    message: 'The server received an invalid response from an upstream server.',
    userMessage: 'The service is temporarily unavailable. Please try again later.',
    category: 'server',
    retryable: true,
    action: 'Try again later'
  },
  503: {
    code: 'SERVICE_UNAVAILABLE',
    title: 'Service Unavailable',
    message: 'The service is temporarily unavailable.',
    userMessage: 'The service is currently unavailable. Please try again later.',
    category: 'server',
    retryable: true,
    action: 'Try again later'
  },
  504: {
    code: 'GATEWAY_TIMEOUT',
    title: 'Gateway Timeout',
    message: 'The server timed out waiting for a response.',
    userMessage: 'The request timed out. Please try again.',
    category: 'network',
    retryable: true,
    action: 'Try again'
  }
};

/**
 * Error Category Configurations
 * Defines default behavior and styling for different error categories
 */
export const ERROR_CATEGORY_CONFIG: Record<ErrorInfo['category'], ErrorCategoryConfig> = {
  network: {
    category: 'network',
    defaultTitle: 'Connection Error',
    defaultMessage: 'A network error occurred.',
    defaultUserMessage: 'Please check your internet connection and try again.',
    icon: 'wifi-off',
    color: 'orange',
    retryable: true
  },
  auth: {
    category: 'auth',
    defaultTitle: 'Authentication Error',
    defaultMessage: 'Authentication failed.',
    defaultUserMessage: 'Please log in to continue.',
    icon: 'lock',
    color: 'red',
    retryable: false
  },
  validation: {
    category: 'validation',
    defaultTitle: 'Validation Error',
    defaultMessage: 'The provided data is invalid.',
    defaultUserMessage: 'Please check your input and try again.',
    icon: 'alert-circle',
    color: 'yellow',
    retryable: false
  },
  server: {
    category: 'server',
    defaultTitle: 'Server Error',
    defaultMessage: 'A server error occurred.',
    defaultUserMessage: 'Something went wrong. Please try again later.',
    icon: 'server',
    color: 'red',
    retryable: true
  },
  rate_limit: {
    category: 'rate_limit',
    defaultTitle: 'Rate Limit Exceeded',
    defaultMessage: 'Too many requests.',
    defaultUserMessage: 'You are making requests too quickly. Please wait a moment before trying again.',
    icon: 'clock',
    color: 'orange',
    retryable: true
  },
  permission: {
    category: 'permission',
    defaultTitle: 'Permission Denied',
    defaultMessage: 'You do not have permission.',
    defaultUserMessage: 'You do not have permission to perform this action.',
    icon: 'shield-x',
    color: 'red',
    retryable: false
  },
  unknown: {
    category: 'unknown',
    defaultTitle: 'Unknown Error',
    defaultMessage: 'An unknown error occurred.',
    defaultUserMessage: 'Something unexpected happened. Please try again.',
    icon: 'alert-triangle',
    color: 'gray',
    retryable: true
  }
};

const formatErrorDetails = (errors?: Record<string, unknown>): string[] => {
  if (!errors) {
    return [];
  }

  const detailSet = new Set<string>();

  Object.entries(errors).forEach(([field, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => {
        if (item != null) {
          detailSet.add(`${field}: ${String(item)}`);
        }
      });
      return;
    }

    if (typeof value === 'object' && value !== null) {
      detailSet.add(`${field}: ${JSON.stringify(value)}`);
      return;
    }

    if (value != null) {
      detailSet.add(`${field}: ${String(value)}`);
    }
  });

  return Array.from(detailSet);
};

/**
 * Application-specific error messages
 * Custom error messages for specific business logic errors
 */
export const APPLICATION_ERRORS = {
  // Registration errors
  REGISTRATION_EMAIL_EXISTS: {
    code: 'REGISTRATION_EMAIL_EXISTS',
    title: 'Email Already Registered',
    message: 'An account with this email already exists.',
    userMessage: 'This email address is already registered. Please use a different email or try logging in.',
    category: 'validation' as const,
    retryable: false,
    action: 'Use different email'
  },
  REGISTRATION_INVALID_DATA: {
    code: 'REGISTRATION_INVALID_DATA',
    title: 'Invalid Registration Data',
    message: 'The registration data provided is invalid.',
    userMessage: 'Please check all required fields and ensure your information is correct.',
    category: 'validation' as const,
    retryable: false,
    action: 'Check your data'
  },

  // Login errors
  LOGIN_INVALID_CREDENTIALS: {
    code: 'LOGIN_INVALID_CREDENTIALS',
    title: 'Invalid Credentials',
    message: 'The email or password is incorrect.',
    userMessage: 'The email or password you entered is incorrect. Please try again.',
    category: 'auth' as const,
    retryable: false,
    action: 'Check credentials'
  },
  LOGIN_ACCOUNT_LOCKED: {
    code: 'LOGIN_ACCOUNT_LOCKED',
    title: 'Account Locked',
    message: 'Your account has been temporarily locked due to too many failed login attempts.',
    userMessage: 'Your account is temporarily locked. Please wait a few minutes before trying again.',
    category: 'auth' as const,
    retryable: true,
    action: 'Wait and retry'
  },

  // Network errors
  NETWORK_OFFLINE: {
    code: 'NETWORK_OFFLINE',
    title: 'Offline',
    message: 'You are currently offline.',
    userMessage: 'You appear to be offline. Please check your internet connection.',
    category: 'network' as const,
    retryable: true,
    action: 'Check connection'
  },
  NETWORK_TIMEOUT: {
    code: 'NETWORK_TIMEOUT',
    title: 'Request Timeout',
    message: 'The request timed out.',
    userMessage: 'The request took too long to complete. Please try again.',
    category: 'network' as const,
    retryable: true,
    action: 'Try again'
  }
};

/**
 * Get error information from HTTP status code
 */
export function getErrorFromStatusCode(statusCode: number): ErrorInfo {
  return HTTP_ERROR_MAPPING[statusCode] || {
    ...ERROR_CATEGORY_CONFIG.unknown,
    code: `HTTP_${statusCode}`,
    title: `Error ${statusCode}`,
    message: `HTTP ${statusCode} error occurred.`,
    userMessage: 'An error occurred. Please try again.',
    retryable: statusCode >= 500 // Server errors are generally retryable
  };
}

/**
 * Get error information from error message
 */
export function getErrorFromMessage(errorMessage: string): ErrorInfo {
  // Check for HTTP status codes in the message
  const httpMatch = errorMessage.match(/HTTP error! status: (\d+)/);
  if (httpMatch) {
    const statusCode = parseInt(httpMatch[1], 10);
    return getErrorFromStatusCode(statusCode);
  }

  // Check for specific error patterns
  if (errorMessage.includes('email already exists') || errorMessage.includes('already registered')) {
    return APPLICATION_ERRORS.REGISTRATION_EMAIL_EXISTS;
  }

  if (errorMessage.includes('invalid credentials') || errorMessage.includes('wrong password')) {
    return APPLICATION_ERRORS.LOGIN_INVALID_CREDENTIALS;
  }

  if (errorMessage.includes('account locked') || errorMessage.includes('too many attempts')) {
    return APPLICATION_ERRORS.LOGIN_ACCOUNT_LOCKED;
  }

  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return APPLICATION_ERRORS.NETWORK_OFFLINE;
  }

  if (errorMessage.includes('timeout')) {
    return APPLICATION_ERRORS.NETWORK_TIMEOUT;
  }

  // Default to unknown error
  return {
    ...ERROR_CATEGORY_CONFIG.unknown,
    code: 'UNKNOWN_ERROR',
    title: 'Something went wrong',
    message: errorMessage,
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: true
  };
}

/**
 * Parse error from various sources (Error object, string, API response)
 */
export function parseError(error: unknown): ErrorInfo {
  if (error instanceof ApiError) {
    const baseInfo = getErrorFromStatusCode(error.status);
    const detailSet = new Set<string>(baseInfo.details ?? []);

    if (error.detail && error.detail !== baseInfo.message) {
      detailSet.add(error.detail);
    }

    if (error.errors) {
      formatErrorDetails(error.errors).forEach(detail => detailSet.add(detail));
    }

    if (typeof error.payload === 'object' && error.payload !== null) {
      const payload = error.payload as Record<string, unknown>;

      if (typeof payload.detail === 'string' && payload.detail !== baseInfo.message) {
        detailSet.add(payload.detail);
      }

      if (payload.errors && typeof payload.errors === 'object') {
        formatErrorDetails(payload.errors as Record<string, unknown>).forEach(detail => detailSet.add(detail));
      }
    }

    const normalized: ErrorInfo = {
      ...baseInfo,
      code: error.code || baseInfo.code,
      message: error.detail || error.message || baseInfo.message,
      userMessage: baseInfo.userMessage,
      retryable: error.status >= 500 ? true : baseInfo.retryable,
      details: detailSet.size ? Array.from(detailSet) : baseInfo.details,
      supportText: baseInfo.supportText,
      supportUrl: baseInfo.supportUrl,
      retryAfterSeconds: error.retryAfterSeconds ?? baseInfo.retryAfterSeconds,
      correlationId: error.requestId ?? baseInfo.correlationId,
      action: baseInfo.action,
      icon: baseInfo.icon
    };

    if (error.message && error.message !== baseInfo.message) {
      normalized.userMessage = error.message;
    }

    if (normalized.category === 'rate_limit' && normalized.retryAfterSeconds !== undefined) {
      const seconds = Math.max(0, normalized.retryAfterSeconds);
      normalized.userMessage = `We noticed a burst of requests. Please wait about ${seconds} second${seconds === 1 ? '' : 's'} before trying again.`;
      normalized.action = `Retry in ~${seconds}s`;
    }

    return normalized;
  }

  if (typeof error === 'string') {
    return getErrorFromMessage(error);
  }

  if (error instanceof Error) {
    return getErrorFromMessage(error.message);
  }

  if (typeof error === 'object' && error !== null) {
    const apiError = error as Record<string, unknown>;

    if (typeof apiError.status === 'number') {
      const baseInfo = getErrorFromStatusCode(apiError.status);
      const detailSet = new Set<string>(baseInfo.details ?? []);

      if (typeof apiError.detail === 'string') {
        detailSet.add(apiError.detail);
      }

      if (apiError.errors && typeof apiError.errors === 'object') {
        formatErrorDetails(apiError.errors as Record<string, unknown>).forEach(detail => detailSet.add(detail));
      }

      const message = typeof apiError.message === 'string' ? apiError.message : baseInfo.message;
      const userMessage = typeof apiError.userMessage === 'string'
        ? apiError.userMessage
        : (typeof apiError.message === 'string' ? apiError.message : baseInfo.userMessage);

      return {
        ...baseInfo,
        message,
        userMessage,
        details: detailSet.size ? Array.from(detailSet) : baseInfo.details
      };
    }

    if (apiError.success === false) {
      const status = typeof apiError.status === 'number' ? apiError.status : 400;
      const baseInfo = getErrorFromStatusCode(status);
      const detailSet = new Set<string>(baseInfo.details ?? []);

      if (apiError.errors && typeof apiError.errors === 'object') {
        formatErrorDetails(apiError.errors as Record<string, unknown>).forEach(detail => detailSet.add(detail));
      }

      const message = typeof apiError.error === 'string' && apiError.error.length > 0
        ? apiError.error
        : (typeof apiError.message === 'string' ? apiError.message : baseInfo.message);

      const userMessage = typeof apiError.message === 'string' ? apiError.message : baseInfo.userMessage;

      return {
        ...baseInfo,
        message,
        userMessage,
        details: detailSet.size ? Array.from(detailSet) : baseInfo.details
      };
    }

    if (typeof apiError.message === 'string') {
      return getErrorFromMessage(apiError.message);
    }

    if (typeof apiError.detail === 'string') {
      return getErrorFromMessage(apiError.detail);
    }
  }

  return {
    ...ERROR_CATEGORY_CONFIG.unknown,
    code: 'UNKNOWN_ERROR',
    title: 'Unknown Error',
    message: 'An unknown error occurred.',
    userMessage: 'Something unexpected happened. Please try again.',
    retryable: true
  };
}

/**
 * React hook for error boundary functionality
 */
interface UseErrorBoundaryOptions {
  onError?: (error: Error) => void;
  resetOnPropsChange?: boolean;
}

export const useErrorBoundary = (options: UseErrorBoundaryOptions = {}) => {
  const [error, setError] = useState<Error | null>(null);

  const resetError = () => setError(null);

  const captureError = (error: Error) => {
    setError(error);
    if (options.onError) {
      options.onError(error);
    }
  };

  useEffect(() => {
    if (options.resetOnPropsChange) {
      setError(null);
    }
  }, [options.resetOnPropsChange]);

  if (error) {
    throw error;
  }

  return {
    captureError,
    resetError
  };
};

/**
 * React hook for managing application errors with user-friendly messages
 */
export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showError = (errorInput: unknown) => {
    const parsedError = parseError(errorInput);
    setError(parsedError);
    setIsVisible(true);
  };

  const hideError = () => {
    setIsVisible(false);
    // Keep error state for potential retry
  };

  const clearError = () => {
    setError(null);
    setIsVisible(false);
  };

  const retry = () => {
    if (error?.retryable) {
      hideError();
      // The parent component should handle the actual retry logic
      return true;
    }
    return false;
  };

  return {
    error,
    isVisible,
    showError,
    hideError,
    clearError,
    retry,
    canRetry: error?.retryable || false
  };
};
