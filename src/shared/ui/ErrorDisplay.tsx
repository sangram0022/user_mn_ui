import React from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Info,
  Server,
  ShieldX,
  WifiOff,
  X,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import type { ErrorInfo } from '@shared/utils/error';
import { ERROR_CATEGORY_CONFIG } from '@shared/utils/error';

interface ErrorDisplayProps {
  error: ErrorInfo;
  onClose?: () => void;
  onRetry?: () => void;
  className?: string;
  showIcon?: boolean;
  showAction?: boolean;
  variant?: 'inline' | 'toast' | 'banner' | 'modal';
}

/**
 * Icon mapping for error categories
 */
const ERROR_ICONS = {
  'alert-circle': AlertCircle,
  'check-circle': CheckCircle,
  clock: Clock,
  info: Info,
  server: Server,
  'shield-x': ShieldX,
  'wifi-off': WifiOff,
  'alert-triangle': AlertTriangle,
} as const;

/**
 * Color scheme mapping for error categories
 */
const ERROR_COLORS = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    title: 'text-red-800',
    icon: 'text-red-500',
    button: 'text-red-600 hover:text-red-800',
    buttonSecondary: 'bg-red-100 hover:bg-red-200 text-red-800',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    title: 'text-orange-800',
    icon: 'text-orange-500',
    button: 'text-orange-600 hover:text-orange-800',
    buttonSecondary: 'bg-orange-100 hover:bg-orange-200 text-orange-800',
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    title: 'text-yellow-800',
    icon: 'text-yellow-500',
    button: 'text-yellow-600 hover:text-yellow-800',
    buttonSecondary: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
  },
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-800',
    title: 'text-gray-800',
    icon: 'text-gray-500',
    button: 'text-gray-600 hover:text-gray-800',
    buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    title: 'text-blue-800',
    icon: 'text-blue-500',
    button: 'text-blue-600 hover:text-blue-800',
    buttonSecondary: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
  },
} as const;

/**
 * Enterprise Error Display Component
 * Displays errors with appropriate styling, icons, and actions based on error category
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onClose,
  onRetry,
  className = '',
  showIcon = true,
  showAction = true,
  variant = 'inline',
}) => {
  const categoryConfig = ERROR_CATEGORY_CONFIG[error.category];
  const colors = ERROR_COLORS[categoryConfig.color as keyof typeof ERROR_COLORS] || ERROR_COLORS.gray;
  const IconComponent = ERROR_ICONS[categoryConfig.icon as keyof typeof ERROR_ICONS] || AlertCircle;

  const baseClasses = {
    inline: `${colors.bg} border ${colors.border} rounded-lg p-4 flex items-start gap-3`,
    toast: `${colors.bg} border ${colors.border} rounded-lg p-4 shadow-lg flex items-start gap-3 max-w-md`,
    banner: `${colors.bg} border-b ${colors.border} px-4 py-3 flex items-center justify-between`,
    modal: `${colors.bg} border ${colors.border} rounded-lg p-6 max-w-md mx-auto`,
  } as const;

  const titleClasses = {
    inline: `text-sm font-medium ${colors.title}`,
    toast: `text-sm font-medium ${colors.title}`,
    banner: `text-sm font-medium ${colors.title}`,
    modal: `text-lg font-semibold ${colors.title} mb-2`,
  } as const;

  const messageClasses = {
    inline: `text-sm ${colors.text} mt-1`,
    toast: `text-sm ${colors.text} mt-1`,
    banner: `text-sm ${colors.text}`,
    modal: `text-sm ${colors.text} mb-4`,
  } as const;

  return (
    <div className={`${baseClasses[variant]} ${className}`}>
      {/* Icon */}
      {showIcon && (
        <div className="flex-shrink-0">
          <IconComponent className={`w-5 h-5 ${colors.icon}`} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={titleClasses[variant]}>{error.title}</div>
        <div className={messageClasses[variant]}>{error.userMessage}</div>

        {error.details && error.details.length > 0 && (
          <ul className={`mt-3 space-y-1 text-sm ${colors.text}`}>
            {error.details.map((detail, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className={`mt-1 h-2 w-2 rounded-full ${colors.icon} opacity-70`} aria-hidden />
                <span className="flex-1 leading-relaxed">{detail}</span>
              </li>
            ))}
          </ul>
        )}

        {(error.supportText || error.supportUrl || error.correlationId) && (
          <div className={`mt-4 text-xs ${colors.text} opacity-80 space-y-1`}>
            {error.supportText && <p>{error.supportText}</p>}
            {error.supportUrl && (
              <a href={error.supportUrl} className="underline font-medium" target="_blank" rel="noreferrer">
                Contact support
              </a>
            )}
            {error.correlationId && (
              <p>
                Reference ID: <code className="font-mono tracking-tight">{error.correlationId}</code>
              </p>
            )}
          </div>
        )}

        {/* Action Button */}
        {showAction && (error.action || error.retryable) && (
          <div className="mt-3 flex gap-2">
            {error.retryable && onRetry && (
              <button
                onClick={onRetry}
                className={`inline-flex items-center gap-1 text-sm font-medium ${colors.button} transition-colors duration-200`}
              >
                <RefreshCw className="w-4 h-4" />
                {error.action || 'Try Again'}
              </button>
            )}
            {error.action && !error.retryable && <span className={`text-sm ${colors.text}`}>{error.action}</span>}
          </div>
        )}
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className={`ml-4 rounded-full p-1 transition-colors duration-200 ${colors.buttonSecondary}`}
          aria-label="Close error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

interface RateLimitErrorProps extends Omit<ErrorDisplayProps, 'error'> {
  retryAfter?: number;
  onCountdownComplete?: () => void;
}

export const RateLimitError: React.FC<RateLimitErrorProps> = ({
  retryAfter = 60,
  onCountdownComplete,
  onRetry,
  ...props
}) => {
  const [countdown, setCountdown] = React.useState(retryAfter);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    onCountdownComplete?.();
    return undefined;
  }, [countdown, onCountdownComplete]);

  const rateLimitError: ErrorInfo = {
    code: 'RATE_LIMIT_EXCEEDED',
    title: 'Too Many Requests',
    message: 'You have exceeded the rate limit for this operation.',
    userMessage:
      countdown > 0
        ? `You've made too many requests. Please wait ${countdown} second${countdown !== 1 ? 's' : ''} before trying again.`
        : 'You can now try again.',
    category: 'rate_limit',
    retryable: countdown === 0,
    action: countdown === 0 ? 'Try Again' : `Wait ${countdown}s`,
  };

  return <ErrorDisplay error={rateLimitError} onRetry={countdown === 0 ? onRetry : undefined} {...props} />;
};

interface ErrorToastProps extends ErrorDisplayProps {
  autoHideDelay?: number;
  onAutoHide?: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  autoHideDelay = 5000,
  onAutoHide,
  onClose,
  ...props
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoHideDelay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onAutoHide?.();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoHideDelay, onAutoHide]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <ErrorDisplay
      variant="toast"
      onClose={handleClose}
      className="animate-in slide-in-from-right-2 fade-in duration-300"
      {...props}
    />
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <ErrorDisplay
            error={{
              code: 'REACT_ERROR',
              title: 'Something went wrong',
              message: this.state.error.message,
              userMessage: 'An unexpected error occurred. Please refresh the page.',
              category: 'unknown',
              retryable: true,
              action: 'Refresh Page',
            }}
            onRetry={() => window.location.reload()}
            variant="modal"
            className="w-full max-w-md"
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorDisplay;
