/**
 * Enhanced Error Alert Component
 *
 * Displays errors in a consistent, user-friendly way across the application.
 * Automatically uses centralized error messages.
 *
 * Usage:
 * ```tsx
 * <ApiErrorAlert error={error} onDismiss={clearError} />
 * ```
 */

import type { ApiErrorState } from '@hooks/errors/useApiError';
import { AlertCircle, Info, RefreshCw, X } from 'lucide-react';
import React from 'react';

interface ApiErrorAlertProps {
  /** Error state from useApiError hook */
  error: ApiErrorState;
  /** Callback when user dismisses the error */
  onDismiss?: () => void;
  /** Optional custom class name */
  className?: string;
  /** Show retry button for recoverable errors */
  showRetry?: boolean;
  /** Callback when user clicks retry */
  onRetry?: () => void;
  /** Show detailed description */
  showDescription?: boolean;
  /** Show suggested action */
  showAction?: boolean;
}

export const ApiErrorAlert: React.FC<ApiErrorAlertProps> = ({
  error,
  onDismiss,
  className = '',
  showRetry = false,
  onRetry,
  showDescription = true,
  showAction = true,
}) => {
  if (!error) return null;

  const canRetry = showRetry && error.recoverable && onRetry;

  return (
    <div
      className={className}
      style={{
        padding: '1rem',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '0.5rem',
        display: 'flex',
        gap: '0.75rem',
        position: 'relative',
      }}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      <div style={{ flexShrink: 0, marginTop: '0.125rem' }}>
        <AlertCircle
          style={{
            width: '1.25rem',
            height: '1.25rem',
            color: '#dc2626',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        {/* Title */}
        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#991b1b',
            marginBottom: '0.25rem',
          }}
        >
          {error.message}
        </p>

        {/* Description */}
        {showDescription && error.description && (
          <p
            style={{
              fontSize: '0.875rem',
              color: '#b91c1c',
              marginBottom: '0.5rem',
            }}
          >
            {error.description}
          </p>
        )}

        {/* Suggested Action */}
        {showAction && error.action && (
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              backgroundColor: '#fee2e2',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}
          >
            <Info
              style={{
                width: '1rem',
                height: '1rem',
                color: '#dc2626',
                flexShrink: 0,
                marginTop: '0.125rem',
              }}
              aria-hidden="true"
            />
            <p style={{ fontSize: '0.813rem', color: '#991b1b' }}>{error.action}</p>
          </div>
        )}

        {/* Error Code (for support) */}
        {error.code && (
          <p
            style={{
              fontSize: '0.75rem',
              color: '#dc2626',
              marginTop: '0.5rem',
              fontFamily: 'monospace',
            }}
          >
            Error Code: {error.code}
            {error.statusCode && ` (${error.statusCode})`}
          </p>
        )}

        {/* Retry Button */}
        {canRetry && (
          <button
            onClick={onRetry}
            style={{
              marginTop: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
          >
            <RefreshCw style={{ width: '1rem', height: '1rem' }} />
            Try Again
          </button>
        )}
      </div>

      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            padding: '0.25rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '0.25rem',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          aria-label="Dismiss error"
        >
          <X style={{ width: '1.25rem', height: '1.25rem', color: '#dc2626' }} />
        </button>
      )}
    </div>
  );
};

/**
 * Simplified version for quick inline errors
 */
export const InlineError: React.FC<{ message: string; onDismiss?: () => void }> = ({
  message,
  onDismiss,
}) => {
  return (
    <div
      style={{
        padding: '0.75rem',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '0.375rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
      }}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertCircle style={{ width: '1rem', height: '1rem', color: '#dc2626' }} />
        <span style={{ fontSize: '0.875rem', color: '#991b1b' }}>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            padding: '0.25rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Dismiss"
        >
          <X style={{ width: '1rem', height: '1rem', color: '#dc2626' }} />
        </button>
      )}
    </div>
  );
};
