import type { ApiErrorResponse } from '../types/error';

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
  payload: ApiErrorResponse['error'],
  fallbackMessage: string,
  status: number
): NormalizedApiError => {
  const { status_code: apiStatus, message, path, timestamp } = payload;

  let normalizedMessage = fallbackMessage;
  let code: string | undefined;
  let errors: Record<string, unknown> | undefined;

  if (typeof message === 'string') {
    normalizedMessage = message.trim() || fallbackMessage;
  } else if (isRecord(message)) {
    const detailMessage = typeof message.message === 'string' ? message.message.trim() : '';
    normalizedMessage = detailMessage || fallbackMessage;

    if (typeof message.error_code === 'string' && message.error_code.trim()) {
      code = message.error_code.trim();
    }

    if (Array.isArray(message.data) && message.data.length > 0) {
      errors = {
        data: message.data,
      };
    }
  }

  return {
    status: typeof apiStatus === 'number' ? apiStatus : status,
    message: normalizedMessage,
    code,
    detail: typeof path === 'string' ? path : undefined,
    errors,
    timestamp,
  };
};

export const normalizeApiError = (
  status: number,
  statusText: string,
  payload: unknown
): NormalizedApiError => {
  const fallbackMessage = statusText ? `HTTP ${status}: ${statusText}` : `HTTP ${status}`;

  if (!isRecord(payload)) {
    return {
      status,
      message: fallbackMessage,
    };
  }

  if ('error' in payload && isRecord(payload.error)) {
    return normalizeNewErrorFormat(payload.error as ApiErrorResponse['error'], fallbackMessage, status);
  }

  const message = typeof payload.message === 'string' && payload.message.trim()
    ? payload.message.trim()
    : undefined;

  const detail = typeof payload.detail === 'string' && payload.detail.trim()
    ? payload.detail.trim()
    : undefined;

  const code = typeof payload.code === 'string' && payload.code.trim()
    ? payload.code.trim()
    : undefined;

  const errors = isRecord(payload.errors)
    ? (payload.errors as Record<string, unknown>)
    : undefined;

  return {
    status,
    message: message || detail || fallbackMessage,
    code,
    detail,
    errors,
  };
};
