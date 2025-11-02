import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { 
  useRbacAnalytics, 
  useRbacPerformance, 
  rbacAnalyticsCollector
} from './performanceMonitor';
import { RbacAnalyticsContext } from './analyticsHooks';
import type { RbacAnalyticsContextValue } from './analyticsHooks';

// ============================================================================
// ANALYTICS PROVIDER
// ============================================================================

interface RbacAnalyticsProviderProps {
  children: ReactNode;
}

export function RbacAnalyticsProvider({ children }: RbacAnalyticsProviderProps) {
  // Analytics hook
  const { metrics, isLoading, track } = useRbacAnalytics();
  
  // Performance hook
  const { 
    operations, 
    slowestOperations, 
    getOperationStats, 
    trackOperation, 
    trackSync 
  } = useRbacPerformance();

  // Clear all analytics data
  const clearAnalytics = useCallback(() => {
    rbacAnalyticsCollector.clear();
  }, []);

  // Export metrics as JSON string
  const exportMetrics = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics,
      operations,
      slowestOperations,
      events: rbacAnalyticsCollector.getEvents()
    };
    
    return JSON.stringify(exportData, null, 2);
  }, [metrics, operations, slowestOperations]);

  const contextValue: RbacAnalyticsContextValue = {
    // Analytics Data
    metrics,
    isLoading,
    
    // Performance Data
    operations,
    slowestOperations,
    
    // Tracking Functions
    track,
    trackOperation,
    trackSync,
    getOperationStats,
    
    // Utility Functions
    clearAnalytics,
    exportMetrics
  };

  return (
    <RbacAnalyticsContext.Provider value={contextValue}>
      {children}
    </RbacAnalyticsContext.Provider>
  );
}

