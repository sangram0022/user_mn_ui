import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ErrorInfo } from '../utils/errorHandling';

interface ToastContextType {
  showError: (error: ErrorInfo | unknown) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
  clearToasts: () => void;
}

interface ToastItem {
  id: string;
  type: 'error' | 'success' | 'info';
  message: string;
  error?: ErrorInfo;
  autoHideDelay?: number;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

/**
 * Toast Notification Provider
 * Manages toast notifications across the application
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastItem = { id, ...toast };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      // Keep only the most recent maxToasts
      return updated.slice(0, maxToasts);
    });

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showError = useCallback((error: ErrorInfo | unknown) => {
    if (typeof error === 'object' && error !== null && 'userMessage' in error) {
      // It's already an ErrorInfo
      addToast({
        type: 'error',
        message: (error as ErrorInfo).userMessage,
        error: error as ErrorInfo,
        autoHideDelay: (error as ErrorInfo).category === 'rate_limit' ? 10000 : 5000
      });
    } else {
      // Parse the error
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'An error occurred',
        autoHideDelay: 5000
      });
    }
  }, [addToast]);

  const showSuccess = useCallback((message: string) => {
    addToast({
      type: 'success',
      message,
      autoHideDelay: 3000
    });
  }, [addToast]);

  const showInfo = useCallback((message: string) => {
    addToast({
      type: 'info',
      message,
      autoHideDelay: 4000
    });
  }, [addToast]);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextType = {
    showError,
    showSuccess,
    showInfo,
    clearToasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <ToastItemComponent
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * Individual Toast Component
 */
interface ToastItemComponentProps {
  toast: ToastItem;
  onRemove: () => void;
}

const ToastItemComponent: React.FC<ToastItemComponentProps> = ({ toast, onRemove }) => {
  const getToastStyles = () => {
    switch (toast.type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-500',
          progress: 'bg-red-500'
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: 'text-green-500',
          progress: 'bg-green-500'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'text-blue-500',
          progress: 'bg-blue-500'
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: 'text-gray-500',
          progress: 'bg-gray-500'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className={`max-w-sm w-full bg-white shadow-lg rounded-lg border p-4 animate-in slide-in-from-right-2 fade-in duration-300 ${styles.container}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          {toast.type === 'error' && <AlertCircle className={`w-5 h-5 ${styles.icon}`} />}
          {toast.type === 'success' && <CheckCircle className={`w-5 h-5 ${styles.icon}`} />}
          {toast.type === 'info' && <Info className={`w-5 h-5 ${styles.icon}`} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{toast.message}</p>
          {toast.error?.action && (
            <p className="text-xs mt-1 opacity-75">{toast.error.action}</p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onRemove}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors duration-200"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Auto-hide Progress Bar */}
      {toast.autoHideDelay && toast.autoHideDelay > 0 && (
        <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${styles.progress} transition-all duration-100 ease-linear`}
            style={{
              animation: `shrink ${toast.autoHideDelay}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
};

// Import icons at the end to avoid circular dependencies
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

/**
 * Hook to use toast notifications
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Higher-order component to add toast functionality to any component
 */
export const withToast = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => (
    <ToastProvider>
      <Component {...props} />
    </ToastProvider>
  );

  WrappedComponent.displayName = `withToast(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default ToastProvider;