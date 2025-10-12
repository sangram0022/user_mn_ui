/**
 * Enhanced ErrorAlert Component
 *
 * Displays error messages with proper styling and user-friendly messages.
 * Handles ApiError instances and provides dismissible alerts.
 *
 * @author Senior UI/UX Architect
 * @created October 12, 2025
 */

import { ApiError } from '@lib/api/error';
import { getErrorConfig } from '@shared/config/errorMessages';
import { AlertCircle, X } from 'lucide-react';
import React from 'react';

interface ErrorAlertProps {
  error: ApiError | Error | string | null;
  onDismiss?: () => void;
  className?: string;
  showDetails?: boolean;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onDismiss,
  className = '',
  showDetails = false,
}) => {
  if (!error) return null;

  // Extract error information
  let errorCode = 'UNKNOWN_ERROR';
  let statusCode = 500;
  let originalMessage = '';

  if (error instanceof ApiError) {
    errorCode = error.code || 'UNKNOWN_ERROR';
    statusCode = error.status || 500;
    originalMessage = error.message;
  } else if (error instanceof Error) {
    originalMessage = error.message;
  } else {
    originalMessage = String(error);
  }

  // Get user-friendly error configuration
  const errorConfig = getErrorConfig(errorCode);

  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-4"
      style={{ marginBottom: className ? undefined : '1rem' }}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{errorConfig.message}</h3>
          {errorConfig.description && (
            <div className="mt-2 text-sm text-red-700">{errorConfig.description}</div>
          )}
          {errorConfig.action && (
            <div className="mt-2 text-sm text-red-700 font-medium">{errorConfig.action}</div>
          )}
          {showDetails && import.meta.env.DEV && (
            <details className="mt-3">
              <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                Technical Details (Dev Only)
              </summary>
              <div className="mt-2 text-xs text-red-600 font-mono bg-red-100 p-2 rounded">
                <div>Error Code: {errorCode}</div>
                <div>Status: {statusCode}</div>
                <div>Message: {originalMessage}</div>
              </div>
            </details>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50 transition-colors"
              aria-label="Dismiss error"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
