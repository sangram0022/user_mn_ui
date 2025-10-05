import React, { createContext } from 'react';
import type { ErrorInfo } from '../utils/errorHandling';

export interface ToastContextType {
  showError: (error: ErrorInfo | unknown) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
  clearToasts: () => void;
}

export interface ToastItem {
  id: string;
  type: 'error' | 'success' | 'info';
  message: string;
  error?: ErrorInfo;
  autoHideDelay?: number;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined); // eslint-disable-line react-refresh/only-export-components

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

/**
 * Toast Notification Provider
 * Manages toast notifications across the application
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children
}) => {
  // Placeholder implementations - toast functionality to be implemented
  const showError = (error: ErrorInfo | unknown) => {
    console.log('Toast error:', error);
  };

  const showSuccess = (message: string) => {
    console.log('Toast success:', message);
  };

  const showInfo = (message: string) => {
    console.log('Toast info:', message);
  };

  const clearToasts = () => {
    console.log('Clearing toasts');
  };

  const value: ToastContextType = {
    showError,
    showSuccess,
    showInfo,
    clearToasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container would go here */}
    </ToastContext.Provider>
  );
};

export default ToastProvider;