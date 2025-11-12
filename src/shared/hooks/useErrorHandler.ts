/**
 * Error Handler Hook
 * Manual error reporting utility
 */

import { logger } from '@/core/logging';

// ========================================
// Hook for Manual Error Reporting
// ========================================

export function useErrorHandler() {
  return (error: Error, context?: string) => {
    logger().error(`Manual Error Report${context ? ` (${context})` : ''}`, error);
    
    // Report to error tracking service
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      (window as { Sentry: { captureException: (error: Error, options?: Record<string, unknown>) => void } }).Sentry.captureException(error, {
        tags: { source: 'manual', context },
      });
    }
  };
}