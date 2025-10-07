import React from 'react';

import { ToastContext, type ToastContextType } from '@contexts/ToastContext';
import type { ErrorInfo } from '@utils/errorHandling';

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

/**
 * Toast Notification Provider
 * Manages toast notifications across the application
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
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
    clearToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container would go here */}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
