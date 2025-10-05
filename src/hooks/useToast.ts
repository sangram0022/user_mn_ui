import { useContext } from 'react';
import { ToastContext } from '../components/ToastProvider';
import type { ToastContextType } from '../components/ToastProvider';

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