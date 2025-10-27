import type { ErrorDisplayProps } from '@shared/types/error';
import { getErrorSeverity, parseApiError } from '@shared/utils';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { memo, useEffect, useState } from 'react';

/**
 * 🚀 Modern ErrorAlert Component (2024-2025)
 *
 * Latest Features:
 * ✅ React 19 patterns (memo, modern hooks)
 * ✅ Modern CSS classes (no inline styles)
 * ✅ OKLCH colors via CSS variables
 * ✅ Smooth animations
 * ✅ Accessibility (ARIA, focus management)
 * ✅ Performance optimized (memo, lazy rendering)
 */

// Severity configuration with modern class names
const severityConfig = {
  error: {
    containerClass: 'bg-[var(--color-error-bg)] border-[var(--color-error)]',
    iconClass: 'text-[var(--color-error)]',
    textClass: 'text-[var(--color-error)]',
    Icon: AlertCircle,
  },
  warning: {
    containerClass: 'bg-[var(--color-warning-bg)] border-[var(--color-warning)]',
    iconClass: 'text-[var(--color-warning)]',
    textClass: 'text-[var(--color-warning)]',
    Icon: AlertTriangle,
  },
  info: {
    containerClass: 'bg-[var(--color-info-bg)] border-[var(--color-info)]',
    iconClass: 'text-[var(--color-info)]',
    textClass: 'text-[var(--color-info)]',
    Icon: Info,
  },
} as const;

/**
 * ErrorAlert - Modern, accessible error display
 */
const ErrorAlertComponent: React.FC<ErrorDisplayProps> = ({ error, onDismiss, className = '' }) => {
  if (!error) return null;

  const parsedError =
    typeof error === 'string'
      ? { code: 'UNKNOWN_ERROR', message: error, statusCode: 500 }
      : parseApiError(error);

  const severity = getErrorSeverity(parsedError);
  const config = severityConfig[severity];
  const Icon = config.Icon;

  return (
    <div
      className={`
        ${config.containerClass}
        border
        rounded-lg
        p-4
        animate-fade-in
        backdrop-blur-sm
        ${className}
      `.trim()}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        <Icon className={`icon-md ${config.iconClass} mt-0.5 flex-shrink-0`} aria-hidden="true" />

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${config.textClass}`}>{parsedError.message}</p>

          {parsedError.code && parsedError.code !== 'UNKNOWN_ERROR' && (
            <p className={`text-xs ${config.textClass} opacity-75 mt-1`}>
              Error Code: {parsedError.code}
            </p>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={`
              ${config.iconClass}
              hover:opacity-75
              active:scale-95
              transition-all
              duration-150
              flex-shrink-0
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-[var(--color-primary)]
              rounded
            `.trim()}
            aria-label="Dismiss error"
          >
            <X className="icon-sm" />
          </button>
        )}
      </div>
    </div>
  );
};

ErrorAlertComponent.displayName = 'ErrorAlert';
const ErrorAlert = memo(ErrorAlertComponent);

/**
 * InlineError - Compact inline error display
 */
const InlineErrorComponent: React.FC<{ error: string | null }> = ({ error }) => {
  if (!error) return null;

  return (
    <div
      className="
        flex
        items-center
        gap-2
        mt-1
        text-[var(--color-error)]
        text-sm
        animate-fade-in
      "
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="icon-sm flex-shrink-0" aria-hidden="true" />
      <span>{error}</span>
    </div>
  );
};

InlineErrorComponent.displayName = 'InlineError';
export const InlineError = memo(InlineErrorComponent);

/**
 * ErrorBanner - Full-width page-level error banner
 */
const ErrorBannerComponent: React.FC<ErrorDisplayProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div
      className="
        fixed
        top-0
        left-0
        right-0
        z-50
        animate-slide-in
      "
      role="alert"
      aria-live="assertive"
    >
      <ErrorAlert
        error={error}
        onDismiss={onDismiss}
        className="rounded-none border-x-0 border-t-0 shadow-lg"
      />
    </div>
  );
};

ErrorBannerComponent.displayName = 'ErrorBanner';
export const ErrorBanner = memo(ErrorBannerComponent);

/**
 * ErrorToast - Modern toast notification
 */
const ErrorToastComponent: React.FC<ErrorDisplayProps & { duration?: number }> = ({
  error,
  onDismiss,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration && onDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Allow fade-out animation before removing
        setTimeout(onDismiss, 300);
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [duration, onDismiss]);

  if (!error || !isVisible) return null;

  return (
    <div
      className="
        fixed
        top-4
        right-4
        z-50
        max-w-md
        animate-scale-in
      "
      role="alert"
      aria-live="assertive"
    >
      <ErrorAlert error={error} onDismiss={onDismiss} className="shadow-xl backdrop-blur-lg" />
    </div>
  );
};

ErrorToastComponent.displayName = 'ErrorToast';
export const ErrorToast = memo(ErrorToastComponent);

export default ErrorAlert;
