/**
 * Monitoring hooks for React components
 *
 * React 19: No memoization needed - React Compiler handles optimization
 */

import { useEffect, useRef, useState } from 'react';
import { analyticsTracker } from '../AnalyticsTracker';
import { errorTracker } from '../ErrorTracker';
import { logger } from '../logger';
import { performanceMonitor } from '../PerformanceMonitor';

export interface UsePerformanceOptions {
  trackRender?: boolean;
  trackMount?: boolean;
  trackUnmount?: boolean;
  componentName?: string;
}

export const usePerformance = (componentName: string, options: UsePerformanceOptions = {}) => {
  const { trackRender = true, trackMount = true, trackUnmount = true } = options;

  // React 19 best practice: Initialize refs without impure functions
  const mountTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const lastRenderTime = useRef<number>(0);

  // Initialize mount time once in useEffect
  useEffect(() => {
    if (mountTime.current === 0) {
      mountTime.current = Date.now();
      lastRenderTime.current = Date.now();
    }
  }, []);

  useEffect(() => {
    const startTime = mountTime.current;
    const currentRenderCount = renderCount.current;

    if (trackMount) {
      const mountDuration = Date.now() - startTime;
      performanceMonitor.recordCustomMetric(
        `component.mount.${componentName}`,
        mountDuration,
        'ms',
        { component: componentName }
      );

      logger.debug(`Component ${componentName} mounted in ${mountDuration}ms`);
    }

    return () => {
      if (trackUnmount) {
        const totalTime = Date.now() - startTime;
        performanceMonitor.recordCustomMetric(
          `component.lifetime.${componentName}`,
          totalTime,
          'ms',
          {
            component: componentName,
            renderCount: currentRenderCount,
          }
        );

        logger.debug(`Component ${componentName} unmounted after ${totalTime}ms`);
      }
    };
  }, [componentName, trackMount, trackUnmount]);

  useEffect(() => {
    if (trackRender) {
      const renderTime = Date.now();
      const timeSinceLastRender = renderTime - lastRenderTime.current;
      renderCount.current++;

      performanceMonitor.recordCustomMetric(
        `component.render.${componentName}`,
        timeSinceLastRender,
        'ms',
        {
          component: componentName,
          renderCount: renderCount.current,
        }
      );

      lastRenderTime.current = renderTime;
    }
  });

  const startTimer = (operationName: string) => {
    const timerName = `${componentName}.${operationName}`;
    performanceMonitor.startTimer(timerName);
    return timerName;
  };

  const endTimer = (timerName: string) => {
    return performanceMonitor.endTimer(timerName);
  };

  // React 19: Store renderCount in state to avoid ref access during render
  const [currentRenderCount, setCurrentRenderCount] = useState(0);

  useEffect(() => {
    setCurrentRenderCount(renderCount.current);
  }, [renderCount]);

  return {
    startTimer,
    endTimer,
    renderCount: currentRenderCount,
  };
};

export interface UseAnalyticsOptions {
  trackPageView?: boolean;
  trackInteractions?: boolean;
}

export const useAnalytics = (pageName?: string, options: UseAnalyticsOptions = {}) => {
  const { trackPageView = true } = options;

  useEffect(() => {
    if (trackPageView && pageName) {
      analyticsTracker.trackPageView(window.location.pathname, pageName);
    }
  }, [pageName, trackPageView]);

  const trackEvent = (
    name: string,
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: Record<string, unknown>
  ) => {
    analyticsTracker.track(name, category, action, label, value, properties);
  };

  const trackUserAction = (action: string, properties?: Record<string, unknown>) => {
    analyticsTracker.trackUserAction(action, 'user_interaction', properties);
  };

  const trackError = (error: Error, context?: Record<string, unknown>) => {
    analyticsTracker.trackError(error, context);
  };

  return {
    trackEvent,
    trackUserAction,
    trackError,
  };
};

export interface UseErrorBoundaryOptions {
  componentName?: string;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  onError?: (error: Error, errorInfo: unknown) => void;
}

export const useErrorBoundary = (options: UseErrorBoundaryOptions = {}) => {
  const { componentName = 'UnknownComponent', onError } = options;

  const captureError = (error: Error, errorInfo?: unknown) => {
    // Track the error
    errorTracker.trackError(
      error,
      {
        component: componentName,
        action: 'component_error',
        additionalData: errorInfo as Record<string, unknown>,
      },
      'high',
      true
    );

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    logger.error(`Error in component ${componentName}: ${error.message}`, error);
  };

  const resetError = () => {
    logger.info(`Error boundary reset for component ${componentName}`);
  };

  return {
    captureError,
    resetError,
  };
};

export interface UseWebVitalsOptions {
  trackAutomatically?: boolean;
  onVitalChange?: (vital: unknown) => void;
}

export const useWebVitals = (options: UseWebVitalsOptions = {}) => {
  const { onVitalChange } = options;

  useEffect(() => {
    if (onVitalChange) {
      // Set up listener for web vitals changes
      // Note: This would need to be implemented in WebVitalsTracker
      // webVitalsTracker.addListener(handleVitalChange);

      return () => {
        // webVitalsTracker.removeListener(handleVitalChange);
      };
    }
    return undefined;
  }, [onVitalChange]);

  const getVitals = () => {
    // This would need to be imported from WebVitalsTracker
    // return webVitalsTracker.getAllVitals();
    return {};
  };

  return {
    getVitals,
  };
};

export interface UseNetworkMonitoringOptions {
  trackRequests?: boolean;
  trackResponses?: boolean;
  trackErrors?: boolean;
}

export const useNetworkMonitoring = (options: UseNetworkMonitoringOptions = {}) => {
  const { trackRequests = true, trackResponses = true, trackErrors = true } = options;

  const trackRequest = (url: string, method: string, startTime: number, requestSize?: number) => {
    if (trackRequests) {
      performanceMonitor.recordCustomMetric('network.request.start', Date.now() - startTime, 'ms', {
        url,
        method,
        requestSize,
      });
    }
  };

  const trackResponse = (
    url: string,
    method: string,
    status: number,
    duration: number,
    responseSize?: number
  ) => {
    if (trackResponses) {
      performanceMonitor.recordNetworkMetric(
        url,
        method,
        status,
        duration,
        undefined,
        responseSize
      );
    }
  };

  const trackNetworkError = (url: string, method: string, error: Error) => {
    if (trackErrors) {
      errorTracker.trackApiError(error, url, method);
    }
  };

  return {
    trackRequest,
    trackResponse,
    trackNetworkError,
  };
};

export interface UseUserSessionOptions {
  trackActions?: boolean;
  trackPageViews?: boolean;
  sessionTimeout?: number;
}

export const useUserSession = (options: UseUserSessionOptions = {}) => {
  const {
    trackActions = true,
    sessionTimeout = 30 * 60 * 1000, // 30 minutes
  } = options;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        analyticsTracker.endSession();
      }, sessionTimeout);
    };

    const handleUserActivity = () => {
      resetTimeout();
    };

    if (trackActions) {
      document.addEventListener('click', handleUserActivity);
      document.addEventListener('keydown', handleUserActivity);
      document.addEventListener('scroll', handleUserActivity);
    }

    resetTimeout();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (trackActions) {
        document.removeEventListener('click', handleUserActivity);
        document.removeEventListener('keydown', handleUserActivity);
        document.removeEventListener('scroll', handleUserActivity);
      }
    };
  }, [trackActions, sessionTimeout]);

  const getCurrentSession = () => {
    return analyticsTracker.getCurrentSession();
  };

  const endSession = () => {
    analyticsTracker.endSession();
  };

  return {
    getCurrentSession,
    endSession,
  };
};

export interface UseComponentMetricsOptions {
  trackProps?: boolean;
  trackState?: boolean;
  trackEffects?: boolean;
}

export const useComponentMetrics = (
  componentName: string,
  options: UseComponentMetricsOptions = {}
) => {
  const { trackProps = false, trackState = false, trackEffects = false } = options;

  const metricsRef = useRef({
    renderCount: 0,
    effectCount: 0,
    propsChanges: 0,
    stateChanges: 0,
  });

  useEffect(() => {
    metricsRef.current.renderCount++;

    if (trackEffects) {
      metricsRef.current.effectCount++;

      performanceMonitor.recordCustomMetric(`component.effect.${componentName}`, 1, 'count', {
        component: componentName,
        totalEffects: metricsRef.current.effectCount,
      });
    }
  });

  const trackPropChange = (propName: string, oldValue: unknown, newValue: unknown) => {
    if (trackProps) {
      metricsRef.current.propsChanges++;

      performanceMonitor.recordCustomMetric(`component.prop.change.${componentName}`, 1, 'count', {
        component: componentName,
        propName,
        hadValue: oldValue !== undefined,
        hasValue: newValue !== undefined,
      });
    }
  };

  const trackStateChange = (stateName: string, oldValue: unknown, newValue: unknown) => {
    if (trackState) {
      metricsRef.current.stateChanges++;

      performanceMonitor.recordCustomMetric(`component.state.change.${componentName}`, 1, 'count', {
        component: componentName,
        stateName,
        hadValue: oldValue !== undefined,
        hasValue: newValue !== undefined,
      });
    }
  };

  const getMetrics = () => {
    return { ...metricsRef.current };
  };

  return {
    trackPropChange,
    trackStateChange,
    getMetrics,
  };
};
