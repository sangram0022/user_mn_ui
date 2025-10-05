/**
 * API Error Response Types
 * Based on the backend error response structure
 */

export interface ApiErrorDetail {
  message: string;
  error_code: string;
  data: unknown[];
  status_code: number;
}

export interface ApiErrorResponse {
  error: {
    type: string;
    message: ApiErrorDetail | string;
    status_code: number;
    path: string;
    timestamp: string;
  };
}

export interface ParsedError {
  code: string;
  message: string;
  statusCode: number;
  path?: string;
  timestamp?: string;
  details?: unknown[];
}

export interface ErrorDisplayProps {
  error: ParsedError | string | null;
  onDismiss?: () => void;
  className?: string;
}
