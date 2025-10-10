import { useState, useEffect } from 'react';
import { AlertCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { ErrorDisplayProps } from '@shared/types/error';
import { parseApiError, getErrorSeverity } from '@shared/utils/error';

/**
 * ErrorAlert Component
 * Displays error messages with appropriate styling and icons
 */
const ErrorAlert: React.FC<ErrorDisplayProps> = ({ error, onDismiss, className = '' }) => { if (!error) return null;

  const parsedError =
    typeof error === 'string'
      ? { code: 'UNKNOWN_ERROR', message: error, statusCode: 500 }
      : parseApiError(error);

  const severity = getErrorSeverity(parsedError);

  const severityConfig = { error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      Icon: XCircle,
    },
    warning: { bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      iconColor: 'text-amber-600',
      Icon: AlertTriangle,
    },
    info: { bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      Icon: Info,
    },
  } as const;

  const config = severityConfig[severity];
  const Icon = config.Icon;

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} aria-hidden="true" />

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${config.textColor}`}>{parsedError.message}</p>

          {parsedError.code && parsedError.code !== 'UNKNOWN_ERROR' && (
            <p className={`text-xs ${config.textColor} opacity-75 mt-1`}>
              Error Code: {parsedError.code}
            </p>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`${config.iconColor} hover:opacity-75 transition-opacity flex-shrink-0`}
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * InlineError Component
 * Compact error display for form fields
 */
export const InlineError: React.FC<{ error: string | null }> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
      <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      <span>{error}</span>
    </div>
  );
};

/**
 * ErrorBanner Component
 * Full-width error banner for page-level errors
 */
export const ErrorBanner: React.FC<ErrorDisplayProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top">
      <ErrorAlert error={error} onDismiss={onDismiss} className="rounded-none border-x-0 border-t-0" />
    </div>
  );
};

/**
 * ErrorToast Component
 * Toast-style error notification
 */
export const ErrorToast: React.FC<ErrorDisplayProps & { duration?: number }> = ({ error,
  onDismiss,
  duration = 5000, }) => { const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration && onDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Allow fade-out animation
      }, duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [duration, onDismiss]);

  if (!error || !isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right">
      <ErrorAlert error={error} onDismiss={onDismiss} className="shadow-lg" />
    </div>
  );
};

export default ErrorAlert;
