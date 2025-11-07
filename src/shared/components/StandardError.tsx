/**
 * Standardized Error Display Component
 * Provides consistent error handling and display across the application
 */

import type { FC } from 'react';
import { APIError } from '../../services/api/common';

interface StandardErrorProps {
  error: unknown;
  retry?: () => void;
  className?: string;
  showDetails?: boolean;
}

export const StandardError: FC<StandardErrorProps> = ({
  error,
  retry,
  className = '',
  showDetails = false,
}) => {
  // Extract error information
  const getErrorInfo = (error: unknown) => {
    if (error instanceof APIError) {
      return {
        message: error.message,
        statusCode: error.statusCode,
        method: error.method,
        url: error.url,
        details: error.responseData,
        isAPIError: true,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        statusCode: undefined,
        method: undefined,
        url: undefined,
        details: undefined,
        isAPIError: false,
      };
    }

    return {
      message: typeof error === 'string' ? error : 'An unexpected error occurred',
      statusCode: undefined,
      method: undefined,
      url: undefined,
      details: undefined,
      isAPIError: false,
    };
  };

  const errorInfo = getErrorInfo(error);

  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {errorInfo.isAPIError ? 'API Error' : 'Error'}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{errorInfo.message}</p>
            {errorInfo.statusCode && (
              <p className="mt-1">
                Status: {errorInfo.statusCode}
                {errorInfo.method && errorInfo.url && (
                  <span className="ml-2">
                    ({errorInfo.method} {errorInfo.url})
                  </span>
                )}
              </p>
            )}
          </div>
          {showDetails && errorInfo.details != null && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                Show Details
              </summary>
              <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                {(() => {
                  try {
                    return typeof errorInfo.details === 'object' && errorInfo.details !== null
                      ? JSON.stringify(errorInfo.details, null, 2)
                      : String(errorInfo.details ?? 'No details available');
                  } catch {
                    return String(errorInfo.details ?? 'Unable to display details');
                  }
                })()}
              </div>
            </details>
          )}
          {retry && (
            <div className="mt-3">
              <button
                onClick={retry}
                className="text-sm font-medium text-red-800 hover:text-red-900 underline"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};