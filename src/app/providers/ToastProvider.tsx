import { logger } from './../../shared/utils/logger';
import React from 'react';

import { ToastContext, type ToastContextType } from '@contexts/ToastContext';
import type { ErrorInfo } from '@shared/utils/error';

interface ToastProviderProps { children: React.ReactNode;
  maxToasts?: number; }

/**
 * Toast Notification Provider
 * Manages toast notifications across the application
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => { const showError = (error: ErrorInfo | unknown) => {
    logger.info('Toast error:', { error  });
  };

  const showSuccess = (message: string) => { logger.info('Toast success:', { message  });
  };

  const showInfo = (message: string) => { logger.info('Toast info:', { message  });
  };

  const clearToasts = () => { logger.info('Clearing toasts');
  };

  const value: ToastContextType = { showError,
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
