import { useState } from 'react';
import { logger } from './logger';

import { ApiError } from '@lib/api/error';
import type { ApiErrorResponse, ParsedError } from '@shared/types/error';
import errorMessagesFile from '../../locales/en/errors.json';
export type { ApiErrorResponse, ParsedError } from '@shared/types/error';

// Extract error messages from JSON structure
const errorMessages = errorMessagesFile.errors as Record<string, string>;

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

export const HTTP_ERROR_MAPPING: HttpErrorMapping = {
  400: {
    code: 'BAD_REQUEST',
    title: 'Invalid Request',
    message: 'The request contains invalid data or parameters.',
    userMessage: 'Please check your input and try again. If the problem persists, contact support.',
    category: 'validation',
    retryable: false,
    action: 'Check your input data',
  },
  401: {
    code: 'UNAUTHORIZED',
    title: 'Authentication Required',
    message: 'You need to log in to access this resource.',
    userMessage: 'Please log in to continue.',
    category: 'auth',
    retryable: false,
    action: 'Log in',
  },
  403: {
    code: 'FORBIDDEN',
    title: 'Access Denied',
    message: 'You do not have permission to access this resource.',
    userMessage: 'You do not have permission to perform this action.',
    category: 'permission',
    retryable: false,
    action: 'Contact administrator',
  },
  404: {
    code: 'NOT_FOUND',
    title: 'Resource Not Found',
    message: 'The requested resource could not be found.',
    userMessage: 'The page or resource you are looking for does not exist.',
    category: 'server',
    retryable: false,
  },
  409: {
    code: 'CONFLICT',
    title: 'Conflict',
    message: 'The request conflicts with the current state of the resource.',
    userMessage: 'This action cannot be completed due to a conflict. Please try again.',
    category: 'validation',
    retryable: true,
    action: 'Try again',
  },
  422: {
    code: 'VALIDATION_ERROR',
    title: 'Validation Error',
    message: 'The submitted data failed validation.',
    userMessage: 'Please check your information and try again.',
    category: 'validation',
    retryable: false,
    action: 'Check your data',
  },
  429: {
    code: 'RATE_LIMIT_EXCEEDED',
    title: 'We need a quick pause',
    message: 'The platform temporarily throttled this request to keep things stable.',
    userMessage:
      'We noticed a burst of activity from your account. Please wait about a minute before trying again so we can protect system stability.',
    category: 'rate_limit',
    retryable: true,
    action: 'Retry in a moment',
    details: [
      'This safeguard helps prevent accidental overloads and keeps everyone online.',
      'If you regularly perform bulk operations, request a higher limit from your administrator.',
    ],
    supportText:
      'Need a higher limit or still running into the cap? Share the reference ID below with support and we will help.',
    supportUrl: 'mailto:support@usermgmt.example.com?subject=Rate%20limit%20assistance',
    retryAfterSeconds: 60,
  },
  500: {
    code: 'INTERNAL_SERVER_ERROR',
    title: 'Server Error',
    message: 'An internal server error occurred.',
    userMessage: 'Something went wrong on our end. Please try again later.',
    category: 'server',
    retryable: true,
    action: 'Try again later',
  },
  502: {
    code: 'BAD_GATEWAY',
    title: 'Service Unavailable',
    message: 'The server received an invalid response from an upstream server.',
    userMessage: 'The service is temporarily unavailable. Please try again later.',
    category: 'server',
    retryable: true,
    action: 'Try again later',
  },
  503: {
    code: 'SERVICE_UNAVAILABLE',
    title: 'Service Unavailable',
    message: 'The service is temporarily unavailable.',
    userMessage: 'The service is currently unavailable. Please try again later.',
    category: 'server',
    retryable: true,
    action: 'Try again later',
  },
  504: {
    code: 'GATEWAY_TIMEOUT',
    title: 'Gateway Timeout',
    message: 'The server timed out waiting for a response.',
    userMessage: 'The request timed out. Please try again.',
    category: 'network',
    retryable: true,
    action: 'Try again',
  },
};

export const ERROR_CATEGORY_CONFIG: Record<ErrorInfo['category'], ErrorCategoryConfig> = {
  network: {
    category: 'network',
    defaultTitle: 'Connection Error',
    defaultMessage: 'A network error occurred.',
    defaultUserMessage: 'Please check your internet connection and try again.',
    icon: 'wifi-off',
    color: 'orange',
    retryable: true,
  },
  auth: {
    category: 'auth',
    defaultTitle: 'Authentication Error',
    defaultMessage: 'Authentication failed.',
    defaultUserMessage: 'Please log in to continue.',
    icon: 'lock',
    color: 'red',
    retryable: false,
  },
  validation: {
    category: 'validation',
    defaultTitle: 'Validation Error',
    defaultMessage: 'The provided data is invalid.',
    defaultUserMessage: 'Please check your input and try again.',
    icon: 'alert-circle',
    color: 'yellow',
    retryable: false,
  },
  server: {
    category: 'server',
    defaultTitle: 'Server Error',
    defaultMessage: 'A server error occurred.',
    defaultUserMessage: 'Something went wrong. Please try again later.',
    icon: 'server',
    color: 'red',
    retryable: true,
  },
  rate_limit: {
    category: 'rate_limit',
    defaultTitle: 'Rate Limit Exceeded',
    defaultMessage: 'Too many requests.',
    defaultUserMessage:
      'You are making requests too quickly. Please wait a moment before trying again.',
    icon: 'clock',
    color: 'orange',
    retryable: true,
  },
  permission: {
    category: 'permission',
    defaultTitle: 'Permission Denied',
    defaultMessage: 'You do not have permission.',
    defaultUserMessage: 'You do not have permission to perform this action.',
    icon: 'shield-x',
    color: 'red',
    retryable: false,
  },
  unknown: {
    category: 'unknown',
    defaultTitle: 'Unknown Error',
    defaultMessage: 'An unknown error occurred.',
    defaultUserMessage: 'Something unexpected happened. Please try again.',
    icon: 'alert-triangle',
    color: 'gray',
    retryable: true,
  },
};

const formatErrorDetails = (errors?: Record<string, unknown>): string[] => {
  if (!errors) {
    return [];
  }

  const detailSet = new Set<string>();

  Object.entries(errors).forEach(([field, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
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

export const APPLICATION_ERRORS = {
  REGISTRATION_EMAIL_EXISTS: {
    code: 'REGISTRATION_EMAIL_EXISTS',
    title: 'Email Already Registered',
    message: 'An account with this email already exists.',
    userMessage:
      'This email address is already registered. Please use a different email or try logging in.',
    category: 'validation' as const,
    retryable: false,
    action: 'Use different email',
  },
  REGISTRATION_INVALID_DATA: {
    code: 'REGISTRATION_INVALID_DATA',
    title: 'Invalid Registration Data',
    message: 'The registration data provided is invalid.',
    userMessage: 'Please check all required fields and ensure your information is correct.',
    category: 'validation' as const,
    retryable: false,
    action: 'Check your data',
  },
  LOGIN_INVALID_CREDENTIALS: {
    code: 'LOGIN_INVALID_CREDENTIALS',
    title: 'Invalid Credentials',
    message: 'The email or password is incorrect.',
    userMessage: 'The email or password you entered is incorrect. Please try again.',
    category: 'auth' as const,
    retryable: false,
    action: 'Check credentials',
  },
  LOGIN_ACCOUNT_LOCKED: {
    code: 'LOGIN_ACCOUNT_LOCKED',
    title: 'Account Locked',
    message: 'Your account has been temporarily locked due to too many failed login attempts.',
    userMessage:
      'Your account is temporarily locked. Please wait a few minutes before trying again.',
    category: 'auth' as const,
    retryable: true,
    action: 'Wait and retry',
  },
  NETWORK_OFFLINE: {
    code: 'NETWORK_OFFLINE',
    title: 'Offline',
    message: 'You are currently offline.',
    userMessage: 'You appear to be offline. Please check your internet connection.',
    category: 'network' as const,
    retryable: true,
    action: 'Check connection',
  },
  NETWORK_TIMEOUT: {
    code: 'NETWORK_TIMEOUT',
    title: 'Request Timeout',
    message: 'The request timed out.',
    userMessage: 'The request took too long to complete. Please try again.',
    category: 'network' as const,
    retryable: true,
    action: 'Try again',
  },
};

export function getErrorFromStatusCode(statusCode: number): ErrorInfo {
  const mapped = HTTP_ERROR_MAPPING[statusCode];
  if (mapped) return mapped;

  // For unmapped or invalid status codes, return UNKNOWN category as tests expect
  return {
    ...ERROR_CATEGORY_CONFIG.unknown,
    code: 'UNKNOWN_ERROR',
    title: 'Unknown Error',
    message: 'An unknown error occurred.',
    userMessage: 'Something unexpected happened. Please try again.',
    retryable: false,
  };
}

export function getErrorFromMessage(errorMessage: string): ErrorInfo {
  const httpMatch = errorMessage.match(/HTTP error! status: (\d+)/);
  if (httpMatch?.[1]) {
    const statusCode = Number.parseInt(httpMatch[1], 10);
    return getErrorFromStatusCode(statusCode);
  }

  if (
    errorMessage.includes('email already exists') ||
    errorMessage.includes('already registered')
  ) {
    return APPLICATION_ERRORS.REGISTRATION_EMAIL_EXISTS;
  }

  if (errorMessage.includes('invalid credentials') || errorMessage.includes('wrong password')) {
    return APPLICATION_ERRORS.LOGIN_INVALID_CREDENTIALS;
  }

  if (errorMessage.includes('account locked') || errorMessage.includes('too many attempts')) {
    return APPLICATION_ERRORS.LOGIN_ACCOUNT_LOCKED;
  }

  // Network detections expected by tests
  const lower = errorMessage.toLowerCase();
  if (
    lower.includes('network') ||
    lower.includes('connection') ||
    lower.includes('fetch failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('econn') ||
    lower.includes('enotfound')
  ) {
    return APPLICATION_ERRORS.NETWORK_OFFLINE;
  }

  if (errorMessage.includes('timeout')) {
    return APPLICATION_ERRORS.NETWORK_TIMEOUT;
  }

  return {
    ...ERROR_CATEGORY_CONFIG.unknown,
    code: 'UNKNOWN_ERROR',
    title: 'Something went wrong',
    message: errorMessage,
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: true,
  };
}

export function parseError(error: unknown): ErrorInfo {
  if (error instanceof ApiError) {
    const baseInfo = getErrorFromStatusCode(error.status);
    const detailSet = new Set<string>(baseInfo.details ?? []);

    if (error.detail && error.detail !== baseInfo.message) {
      detailSet.add(error.detail);
    }

    if (error.errors) {
      formatErrorDetails(error.errors).forEach((detail) => detailSet.add(detail));
    }

    if (typeof error.payload === 'object' && error.payload !== null) {
      const payload = error.payload as Record<string, unknown>;

      if (typeof payload.detail === 'string' && payload.detail !== baseInfo.message) {
        detailSet.add(payload.detail);
      }

      if (payload.errors && typeof payload.errors === 'object') {
        formatErrorDetails(payload.errors as Record<string, unknown>).forEach((detail) =>
          detailSet.add(detail)
        );
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
      icon: baseInfo.icon,
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
        formatErrorDetails(apiError.errors as Record<string, unknown>).forEach((detail) =>
          detailSet.add(detail)
        );
      }

      const message = typeof apiError.message === 'string' ? apiError.message : baseInfo.message;
      const userMessage =
        typeof apiError.userMessage === 'string'
          ? apiError.userMessage
          : typeof apiError.message === 'string'
            ? apiError.message
            : baseInfo.userMessage;

      return {
        ...baseInfo,
        message,
        userMessage,
        details: detailSet.size ? Array.from(detailSet) : baseInfo.details,
      };
    }

    if (apiError.success === false) {
      const status = typeof apiError.status === 'number' ? apiError.status : 400;
      const baseInfo = getErrorFromStatusCode(status);
      const detailSet = new Set<string>(baseInfo.details ?? []);

      if (apiError.errors && typeof apiError.errors === 'object') {
        formatErrorDetails(apiError.errors as Record<string, unknown>).forEach((detail) =>
          detailSet.add(detail)
        );
      }

      const message =
        typeof apiError.error === 'string' && apiError.error.length > 0
          ? apiError.error
          : typeof apiError.message === 'string'
            ? apiError.message
            : baseInfo.message;

      const userMessage =
        typeof apiError.message === 'string' ? apiError.message : baseInfo.userMessage;

      return {
        ...baseInfo,
        message,
        userMessage,
        details: detailSet.size ? Array.from(detailSet) : baseInfo.details,
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
    retryable: true,
  };
}

const isParsedError = (error: unknown): error is ParsedError => {
  // Be strict here to avoid treating ApiError instances as already-parsed errors.
  // ParsedError should include richer fields not present on ApiError like category and retryable.
  if (typeof error !== 'object' || error === null) return false;
  const obj = error as Record<string, unknown>;
  return (
    typeof obj.code === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.timestamp === 'string' &&
    typeof obj.userMessage === 'string' &&
    typeof obj.retryable === 'boolean' &&
    typeof obj.category === 'string'
  );
};

export const isApiErrorResponse = (error: unknown): error is ApiErrorResponse => {
  // Tests expect ALL of: error (string), message (string), statusCode (number)
  if (typeof error !== 'object' || error === null) return false;
  const obj = error as Record<string, unknown>;
  return (
    typeof obj.error === 'string' &&
    typeof obj.message === 'string' &&
    typeof (obj.statusCode ?? obj.status) === 'number'
  );
};

const extractErrorCode = (error: unknown): string => {
  if (isApiErrorResponse(error)) {
    const { code, message } = error;

    if (code && typeof code === 'string') {
      return code;
    }

    if (typeof message === 'string') {
      return 'UNKNOWN_ERROR';
    }
  }

  if (typeof error === 'object' && error !== null) {
    if ('status' in error) {
      const status = (error as { status: number }).status;
      return mapStatusCodeToError(status);
    }
    if ('code' in error && typeof (error as { code: string }).code === 'string') {
      return (error as { code: string }).code;
    }
  }

  return 'UNKNOWN_ERROR';
};

const mapStatusCodeToError = (statusCode: number): string => {
  const statusMap: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'RESOURCE_NOT_FOUND',
    422: 'VALIDATION_ERROR',
    429: 'RATE_LIMIT_EXCEEDED',
    500: 'INTERNAL_ERROR',
    502: 'SERVICE_UNAVAILABLE',
    503: 'SERVICE_UNAVAILABLE',
    504: 'TIMEOUT',
  };

  return statusMap[statusCode] || 'UNKNOWN_ERROR';
};

export const getErrorMessage = (errorCode: string): string => {
  if (!errorCode) {
    return errorMessages.UNKNOWN_ERROR || 'An unexpected error occurred. Please try again.';
  }

  const message = errorMessages[errorCode as keyof typeof errorMessages];
  return (
    message || errorMessages.UNKNOWN_ERROR || 'An unexpected error occurred. Please try again.'
  );
};

const determineErrorSeverity = (
  code: string,
  statusCode: number
): 'low' | 'medium' | 'high' | 'critical' => {
  if (code === 'MAINTENANCE_MODE' || code === 'RATE_LIMIT_EXCEEDED') {
    return 'low';
  }

  if (code === 'EMAIL_NOT_VERIFIED' || code === 'ACCOUNT_LOCKED' || code === 'TOKEN_EXPIRED') {
    return 'medium';
  }

  const criticalCodes = ['ACCOUNT_DISABLED', 'PERMISSION_DENIED', 'FORBIDDEN'];
  if (criticalCodes.includes(code)) {
    return 'critical';
  }

  if (statusCode >= 500) return 'critical';
  if (statusCode >= 400 && statusCode < 500) return 'high';

  return 'medium';
};

export const parseApiError = (error: unknown): ParsedError => {
  if (isParsedError(error)) {
    return error;
  }

  // Handle nested API error shapes like { error: { message: { error_code, message }, status_code } }
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const inner = (error as Record<string, unknown>).error as unknown;
    if (typeof inner === 'object' && inner !== null) {
      const innerObj = inner as Record<string, unknown>;
      const statusCode = (innerObj.status_code ?? innerObj.statusCode) as number | undefined;
      const msgField = innerObj.message as unknown;
      const nestedMessage =
        typeof msgField === 'string'
          ? msgField
          : typeof msgField === 'object' &&
              msgField !== null &&
              'message' in (msgField as Record<string, unknown>) &&
              typeof (msgField as Record<string, unknown>).message === 'string'
            ? (msgField as Record<string, string>).message
            : '';
      const nestedCode =
        typeof msgField === 'object' &&
        msgField !== null &&
        'error_code' in (msgField as Record<string, unknown>) &&
        typeof (msgField as Record<string, unknown>).error_code === 'string'
          ? (msgField as Record<string, string>).error_code
          : undefined;

      const code =
        nestedCode ??
        (typeof statusCode === 'number'
          ? extractErrorCode({ status: statusCode })
          : 'UNKNOWN_ERROR');
      const timestamp = new Date().toISOString();
      return {
        code,
        message: nestedMessage || getErrorMessage(code),
        details: [],
        category: 'unknown',
        severity: determineErrorSeverity(code, typeof statusCode === 'number' ? statusCode : 500),
        userMessage: nestedMessage || getErrorMessage(code),
        retryable: false,
        timestamp,
      };
    }
  }

  if (isApiErrorResponse(error)) {
    const { message, detail, status, code } = error;
    const httpStatus = (error as unknown as { statusCode?: number }).statusCode ?? status ?? 500;

    const errorCode = code || extractErrorCode({ status: httpStatus });
    let errorMessage = '';
    let details: string[] = [];

    if (typeof message === 'string') {
      errorMessage = message;
    } else if (typeof detail === 'string') {
      errorMessage = detail;
    }

    if (
      (error as ApiErrorResponse).errors &&
      typeof (error as ApiErrorResponse).errors === 'object'
    ) {
      details = formatErrorDetails((error as ApiErrorResponse).errors as Record<string, unknown>);
    }

    const timestamp = new Date().toISOString();
    const localizedMessage = getErrorMessage(errorCode);

    return {
      code: errorCode,
      message: errorMessage || localizedMessage,
      details,
      category: 'unknown' as const,
      timestamp,
      severity: determineErrorSeverity(errorCode, httpStatus),
      userMessage: errorMessage || localizedMessage,
      retryable: false,
    };
  }

  if (error instanceof ApiError) {
    const status = (error as ApiError).status ?? 500;
    const code = (error as ApiError).code || extractErrorCode({ status });
    const timestamp = new Date().toISOString();
    const localized = getErrorMessage(code);
    const message = error.message || localized;
    return {
      code,
      message,
      details: error.message ? [error.message] : [],
      category:
        status === 401
          ? 'authentication'
          : status === 403
            ? 'authorization'
            : status >= 500
              ? 'server'
              : 'unknown',
      severity: determineErrorSeverity(code, status),
      userMessage: message,
      retryable: status >= 500,
      timestamp,
    };
  }

  if (error instanceof Error) {
    const status = (error as unknown as { status?: number }).status ?? 500;
    const errorCode = extractErrorCode({ status });
    const timestamp = new Date().toISOString();
    return {
      code: errorCode,
      message: error.message,
      details: [error.message],
      category: error.message.toLowerCase().includes('network') ? 'network' : 'unknown',
      severity: determineErrorSeverity(errorCode, status),
      userMessage: error.message,
      retryable: false,
      timestamp,
    };
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const errorMessage = (error as { message: string }).message;
    const timestamp = new Date().toISOString();
    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      return {
        code: 'NETWORK_ERROR',
        message: errorMessage || getErrorMessage('NETWORK_ERROR'),
        details: [errorMessage],
        category: 'network' as const,
        severity: 'medium' as const,
        userMessage:
          errorMessage || 'Network connection error. Please check your internet connection.',
        retryable: true,
        timestamp,
      };
    }
  }

  if (typeof error === 'string') {
    const timestamp = new Date().toISOString();
    return {
      code: 'UNKNOWN_ERROR',
      message: error || getErrorMessage('UNKNOWN_ERROR'),
      details: [error],
      category: 'unknown' as const,
      severity: 'medium' as const,
      userMessage: error || getErrorMessage('UNKNOWN_ERROR'),
      retryable: false,
      timestamp,
    };
  }

  const timestamp = new Date().toISOString();
  return {
    code: 'UNKNOWN_ERROR',
    message: getErrorMessage('UNKNOWN_ERROR'),
    details: ['Unknown error occurred'],
    category: 'unknown' as const,
    severity: 'medium' as const,
    userMessage: getErrorMessage('UNKNOWN_ERROR'),
    retryable: false,
    timestamp,
  };
};

export const formatErrorForDisplay = (error: unknown): string => {
  const parsed = parseApiError(error);
  return parsed.message;
};

export const isAuthError = (error: unknown): boolean => {
  // Prefer HTTP status when available, falling back to code mapping
  if (error instanceof ApiError) {
    return error.status === 401 || error.status === 403;
  }
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const s = (error as { status?: number }).status;
    if (s === 401 || s === 403) return true;
  }
  const parsed = parseApiError(error);
  const authCodes = [
    'INVALID_CREDENTIALS',
    'UNAUTHORIZED',
    'TOKEN_EXPIRED',
    'INVALID_TOKEN',
    'EMAIL_NOT_VERIFIED',
    'FORBIDDEN',
  ];
  return authCodes.includes(parsed.code);
};

export const requiresUserAction = (error: unknown): boolean => {
  // Validation-related HTTP statuses require user action
  if (error instanceof ApiError) {
    return error.status === 400 || error.status === 422;
  }
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const s = (error as { status?: number }).status;
    if (s === 400 || s === 422) return true;
  }
  const parsed = parseApiError(error);
  const actionCodes = [
    'VALIDATION_ERROR',
    'INVALID_INPUT',
    'EMAIL_NOT_VERIFIED',
    'WEAK_PASSWORD',
    'BAD_REQUEST',
  ];
  return actionCodes.includes(parsed.code);
};

export const getErrorSeverity = (error: unknown): 'error' | 'warning' | 'info' => {
  const parsed = parseApiError(error);
  // Map new severity values to legacy values
  switch (parsed.severity) {
    case 'low':
      return 'info';
    case 'medium':
      return 'warning';
    case 'high':
      return 'error';
    case 'critical':
      return 'error';
    default:
      return 'error';
  }
};

export interface NormalizedApiError {
  status: number;
  message: string;
  code?: string;
  detail?: string;
  errors?: Record<string, unknown>;
  timestamp?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const normalizeNewErrorFormat = (
  payload: ApiErrorResponse,
  fallbackMessage: string,
  status: number
): NormalizedApiError => {
  // Handle nested error structure from backend
  let actualPayload = payload;
  let originalPayload: Record<string, unknown> | undefined;

  if (payload && typeof payload === 'object' && 'error' in payload) {
    originalPayload = payload as unknown as Record<string, unknown>;
    actualPayload =
      ((originalPayload as Record<string, unknown>).error as ApiErrorResponse) || payload;
  }

  const { status: apiStatus, message, detail } = actualPayload;

  let normalizedMessage = fallbackMessage;
  let code: string | undefined = actualPayload.code;
  const errors: Record<string, unknown> | undefined = actualPayload.errors;

  // Try to extract message from various locations
  if (typeof message === 'string') {
    normalizedMessage = message.trim() || fallbackMessage;
  } else if (typeof detail === 'string') {
    normalizedMessage = detail.trim() || fallbackMessage;
  } else if (actualPayload.detail && typeof actualPayload.detail === 'object') {
    // Handle nested detail object with message
    const detailObj = actualPayload.detail as Record<string, unknown>;
    if (typeof detailObj.message === 'string') {
      normalizedMessage = detailObj.message.trim() || fallbackMessage;
    }
    if (typeof detailObj.error_code === 'string') {
      code = detailObj.error_code;
    }
  }

  // Also check original payload's detail for error_code (in case of nested structure)
  if (!code && originalPayload && 'detail' in originalPayload) {
    const originalDetail = originalPayload.detail;
    if (originalDetail && typeof originalDetail === 'object') {
      const detailObj = originalDetail as Record<string, unknown>;
      if (typeof detailObj.error_code === 'string') {
        code = detailObj.error_code;
      }
    }
  }

  return {
    status: typeof apiStatus === 'number' ? apiStatus : status,
    message: normalizedMessage,
    code,
    detail: actualPayload.detail,
    errors,
    timestamp: new Date().toISOString(),
  };
};

// Overloaded function to support both (status,statusText,payload) and (errorLike)
export function normalizeApiError(
  status: number,
  statusText: string,
  payload: unknown
): NormalizedApiError;
export function normalizeApiError(errorLike: unknown): NormalizedApiError;
export function normalizeApiError(a: unknown, b?: unknown, c?: unknown): NormalizedApiError {
  // Signature: (status, statusText, payload)
  if (typeof a === 'number') {
    const status = a;
    const statusText = (b as string) ?? '';
    const payload = c;
    const fallbackMessage = statusText ? `HTTP ${status}: ${statusText}` : `HTTP ${status}`;

    if (!isRecord(payload)) {
      return { status, message: fallbackMessage };
    }
    return normalizeNewErrorFormat(payload as ApiErrorResponse, fallbackMessage, status);
  }

  // Signature: (errorLike)
  const error = a;
  if (error instanceof ApiError) {
    return {
      status: error.status ?? 500,
      message: error.message,
      code: error.code,
      detail: error.detail,
      errors: error.errors,
      timestamp: new Date().toISOString(),
    };
  }
  if (error instanceof Error) {
    const status = (error as unknown as { status?: number }).status ?? 500;
    return {
      status,
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }
  if (typeof error === 'string') {
    return { status: 500, message: error, timestamp: new Date().toISOString() };
  }
  if (isRecord(error)) {
    const obj = error as Record<string, unknown>;
    const status = (obj.statusCode ?? obj.status) as number | undefined;
    const message = (obj.message ?? obj.detail) as string | undefined;
    if (typeof status === 'number') {
      return {
        status,
        message: message ?? `HTTP ${status}`,
        timestamp: new Date().toISOString(),
      };
    }
  }
  return {
    status: 500,
    message: getErrorMessage('UNKNOWN_ERROR'),
    timestamp: new Date().toISOString(),
  };
}

export interface ErrorLogEntry {
  timestamp: string;
  error: ParsedError;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  additionalContext?: Record<string, unknown>;
  performance?: {
    memoryUsage?: number;
    timestamp: number;
  };
}

class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private readonly maxLogs = 100;
  private readonly apiEndpoint = '/api/v1/logs/frontend-errors';
  private retryQueue: ErrorLogEntry[] = [];
  private isProcessingQueue = false;

  // Accept unknown inputs and normalize internally for resilience
  log(error: unknown, context?: Record<string, unknown>): void {
    const parsed = parseApiError(error);
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      error: parsed,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      additionalContext: context,
      performance: this.getPerformanceData(),
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (import.meta.env.DEV) {
      this.logToConsole(entry);
    }

    void this.sendToBackend(entry);
  }

  private logToConsole(entry: ErrorLogEntry): void {
    const style = 'color: #ef4444; font-weight: bold;';
    console.group(`%c[Error Logger] ${entry.error.code}`, style);
    logger.error('Message', undefined, { message: entry.error.message });
    logger.error('Severity', undefined, { severity: entry.error.severity });
    logger.error('Timestamp', undefined, { timestamp: entry.timestamp });
    logger.error('URL', undefined, { url: entry.url });
    if (entry.error.details) {
      logger.error('Details', undefined, { details: entry.error.details });
    }
    if (entry.additionalContext) {
      logger.error('Context', undefined, { context: entry.additionalContext });
    }
    console.groupEnd();
  }

  private async sendToBackend(entry: ErrorLogEntry): Promise<void> {
    try {
      if (typeof fetch !== 'function') {
        return;
      }

      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 5000) : undefined;

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
        signal: controller?.signal,
      });

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        throw new Error(`Failed to log error: ${response.status}`);
      }

      if (this.retryQueue.length > 0) {
        void this.processRetryQueue();
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        logger.warn('[Error Logger] Failed to send error log to backend:', { err });
      }

      this.retryQueue.push(entry);

      if (this.retryQueue.length > 50) {
        this.retryQueue.shift();
      }
    }
  }

  private async processRetryQueue(): Promise<void> {
    if (this.isProcessingQueue || this.retryQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.retryQueue.length > 0) {
      const entry = this.retryQueue.shift();
      if (entry) {
        try {
          await this.sendToBackend(entry);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch {
          this.retryQueue.push(entry);
          break;
        }
      }
    }

    this.isProcessingQueue = false;
  }

  private getUserId(): string | undefined {
    try {
      const authData = typeof localStorage !== 'undefined' ? localStorage.getItem('auth') : null;
      if (authData) {
        const parsed = JSON.parse(authData) as { user?: { id?: string | number } };
        const id = parsed.user?.id;
        return typeof id === 'number' ? id.toString() : id;
      }
    } catch {
      // ignore
    }
    return undefined;
  }

  private getSessionId(): string | undefined {
    try {
      return typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem('sessionId') || undefined
        : undefined;
    } catch {
      return undefined;
    }
  }

  private getPerformanceData(): ErrorLogEntry['performance'] {
    try {
      if (typeof window === 'undefined' || typeof window.performance === 'undefined') {
        return {
          timestamp: Date.now(),
        };
      }

      const performance = window.performance as Performance & {
        memory?: { usedJSHeapSize: number };
      };
      const memory = performance.memory;

      return {
        memoryUsage: memory ? memory.usedJSHeapSize : undefined,
        timestamp: performance.now(),
      };
    } catch {
      return {
        timestamp: Date.now(),
      };
    }
  }

  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  getLogsByCode(code: string): ErrorLogEntry[] {
    return this.logs.filter((log) => log.error.code === code);
  }

  getLogsBySeverity(severity: 'error' | 'warning' | 'info'): ErrorLogEntry[] {
    // Map legacy severity to new severity values
    const mappedSeverities: ('low' | 'medium' | 'high' | 'critical')[] = [];
    switch (severity) {
      case 'info':
        mappedSeverities.push('low');
        break;
      case 'warning':
        mappedSeverities.push('medium');
        break;
      case 'error':
        mappedSeverities.push('high', 'critical');
        break;
    }
    return this.logs.filter((log) => mappedSeverities.includes(log.error.severity));
  }

  getRecentLogs(count: number = 10): ErrorLogEntry[] {
    return this.logs.slice(-count);
  }

  // Aliases expected by tests
  getRecentErrors(count: number = 10): ErrorLogEntry[] {
    return this.getRecentLogs(count);
  }

  clearLogs(): void {
    this.logs = [];
    if (import.meta.env.DEV) {
      logger.info('[Error Logger] Logs cleared');
    }
  }

  clear(): void {
    this.clearLogs();
  }

  getStatistics(): {
    total: number;
    byCode: Record<string, number>;
    bySeverity: Record<string, number>;
    recentErrors: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    const byCode: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let recentErrors = 0;

    this.logs.forEach((log) => {
      byCode[log.error.code] = (byCode[log.error.code] || 0) + 1;

      const severity = log.error.severity || 'error';
      bySeverity[severity] = (bySeverity[severity] || 0) + 1;

      const logTime = new Date(log.timestamp).getTime();
      if (logTime > oneHourAgo) {
        recentErrors++;
      }
    });

    return { total: this.logs.length, byCode, bySeverity, recentErrors };
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  downloadLogs(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const dataStr = this.exportLogs();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const errorLogger = new ErrorLogger();

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { errorLogger: ErrorLogger }).errorLogger = errorLogger;
  logger.info('[Error Logger] Debug interface available at window.errorLogger');
}

interface UseErrorBoundaryOptions {
  onError?: (error: Error | null) => void;
  onReset?: () => void;
  resetOnPropsChange?: boolean;
}

export const useErrorBoundary = (options: UseErrorBoundaryOptions = {}) => {
  const [error, setError] = useState<Error | null>(null);

  const showBoundary = (err: Error | null) => {
    // allow null to represent generic boundary trigger
    const normalized = err ?? new Error('Unknown error');
    setError(normalized);
    options.onError?.(err ?? null);
  };

  const resetBoundary = () => {
    setError(null);
    options.onReset?.();
  };

  // React 19 best practice: Handle reset via key or resetBoundary instead of useEffect
  // Remove automatic reset in useEffect to avoid setState in effect
  // Users should call resetBoundary explicitly when needed

  return { error, hasError: error !== null, showBoundary, resetBoundary };
};

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
  };

  const clearError = () => {
    setError(null);
    setIsVisible(false);
  };

  const retry = () => {
    if (error?.retryable) {
      hideError();
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
    canRetry: error?.retryable ?? false,
  };
};
