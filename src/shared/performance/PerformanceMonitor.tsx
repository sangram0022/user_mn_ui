/* eslint-disable react-refresh/only-export-components */
/**
 * Advanced Performance Monitoring
 * React 19 performance metrics and monitoring utilities
 */

import React, { ComponentType, forwardRef, Profiler, useCallback, useEffect, useRef } from 'react';
import { logger } from './../utils/logger';

// Performance metrics types
export interface PerformanceMetrics {
  renderTime: number;
  componentMount: number;
  memoryUsage: number;
  interactionDelay: number;
  coreWebVitals: {
    lcp: number | null; // Largest Contentful Paint
    fid: number | null; // First Input Delay
    cls: number | null; // Cumulative Layout Shift
  };
}

export interface PerformanceConfig {
  trackRenders?: boolean;
  trackMemory?: boolean;
  trackInteractions?: boolean;
  trackWebVitals?: boolean;
  reportThreshold?: number;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

// Performance monitoring hook
export function usePerformanceMonitor(config: PerformanceConfig = {}) {
  const {
    trackRenders = true,
    trackMemory = true,
    trackInteractions = true,
    trackWebVitals = true,
    reportThreshold = 1000,
    onMetricsUpdate,
  } = config;

  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    componentMount: 0,
    memoryUsage: 0,
    interactionDelay: 0,
    coreWebVitals: {
      lcp: null,
      fid: null,
      cls: null,
    },
  });

  const renderStartRef = useRef<number>(0);
  const mountStartRef = useRef<number>(0);

  // Track component mount time
  useEffect(() => {
    if (!trackRenders) return;

    mountStartRef.current = performance.now();

    return () => {
      const mountTime = performance.now() - mountStartRef.current;
      // Copy ref to local variable for cleanup
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const currentMetrics = metricsRef.current;
      currentMetrics.componentMount = mountTime;

      if (mountTime > reportThreshold) {
        logger.warn(`Slow component mount detected: ${mountTime.toFixed(2)}ms`);
      }
    };
  }, [trackRenders, reportThreshold]);

  // Track render performance
  const trackRender = useCallback(() => {
    if (!trackRenders) return;

    renderStartRef.current = performance.now();

    // Use React 19's scheduler postTask for accurate measurement
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).scheduler.postTask(
        () => {
          const renderTime = performance.now() - renderStartRef.current;
          metricsRef.current.renderTime = renderTime;

          if (renderTime > reportThreshold / 10) {
            logger.warn(`Slow render detected: ${renderTime.toFixed(2)}ms`);
          }
        },
        { priority: 'background' }
      );
    } else {
      // Fallback for browsers without scheduler
      setTimeout(() => {
        const renderTime = performance.now() - renderStartRef.current;
        metricsRef.current.renderTime = renderTime;
      }, 0);
    }
  }, [trackRenders, reportThreshold]);

  // Track memory usage
  const trackMemoryUsage = useCallback(() => {
    if (!trackMemory || !('memory' in performance)) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const memory = (performance as any).memory;
    if (memory) {
      metricsRef.current.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  }, [trackMemory]);

  // Track Core Web Vitals
  useEffect(() => {
    if (!trackWebVitals) return;

    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lastEntry = entries[entries.length - 1] as any;
      metricsRef.current.coreWebVitals.lcp = lastEntry.startTime;
    });

    // FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: unknown) => {
        metricsRef.current.coreWebVitals.fid = entry.processingStart - entry.startTime;
      });
    });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: unknown) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          metricsRef.current.coreWebVitals.cls = clsValue;
        }
      });
    });

    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      fidObserver.observe({ type: 'first-input', buffered: true });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      logger.warn('Performance Observer not supported:', { error });
    }

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, [trackWebVitals]);

  // Track user interactions
  const trackInteraction = useCallback(
    (eventType: string) => {
      if (!trackInteractions) return;

      const startTime = performance.now();

      // Use React 19's scheduler for accurate measurement
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).scheduler.postTask(
          () => {
            const delay = performance.now() - startTime;
            metricsRef.current.interactionDelay = delay;

            if (delay > 100) {
              // INP threshold
              logger.warn(`Slow interaction (${eventType}): ${delay.toFixed(2)}ms`);
            }
          },
          { priority: 'user-blocking' }
        );
      }
    },
    [trackInteractions]
  );

  // Report metrics periodically
  useEffect(() => {
    if (!onMetricsUpdate) return;

    const interval = setInterval(() => {
      trackMemoryUsage();
      onMetricsUpdate({ ...metricsRef.current });
    }, 5000);

    return () => clearInterval(interval);
  }, [onMetricsUpdate, trackMemoryUsage]);

  return {
    trackRender,
    trackInteraction,
    getMetrics: () => ({ ...metricsRef.current }),
    getCurrentMemoryUsage: trackMemoryUsage,
  };
}

// Performance monitoring HOC
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: ComponentType<P>,
  config: PerformanceConfig = {}
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PerformanceMonitoredComponent = forwardRef<any, P>((props, ref) => {
    const { trackRender, trackInteraction } = usePerformanceMonitor(config);

    useEffect(() => {
      trackRender();
    });

    const enhancedProps = { ...props, onPerformanceTrack: trackInteraction } as P;

    return <WrappedComponent ref={ref} {...enhancedProps} />;
  });

  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${WrappedComponent.displayName || WrappedComponent.name})`;

  return PerformanceMonitoredComponent;
}

// Bundle size analyzer
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return;

  const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const jsResources = resourceEntries.filter(
    (entry) => entry.name.includes('.js') || entry.name.includes('.mjs')
  );

  const bundleInfo = jsResources.map((resource) => ({
    name: resource.name.split('/').pop() || 'unknown',
    size: resource.transferSize || 0,
    loadTime: resource.duration,
    compressed: resource.transferSize !== resource.decodedBodySize,
  }));

  console.table(bundleInfo);

  const totalSize = bundleInfo.reduce((sum, bundle) => sum + bundle.size, 0);
  logger.info(`Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);

  return bundleInfo;
}

// React DevTools Profiler wrapper
export interface ProfilerProps {
  id: string;
  children: React.ReactNode;
  onRender?: (
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => void;
}

export const PerformanceProfiler: React.FC<ProfilerProps> = ({ id, children, onRender }) => {
  const handleRender = useCallback(
    (
      profileId: string,
      phase: 'mount' | 'update' | 'nested-update',
      actualDuration: number,
      baseDuration: number,
      startTime: number,
      commitTime: number
    ) => {
      // Log slow renders
      if (actualDuration > 16) {
        // 60fps threshold
        logger.warn(`Slow ${phase} in ${profileId}: ${actualDuration.toFixed(2)}ms`);
      }

      onRender?.(
        profileId,
        phase as 'mount' | 'update',
        actualDuration,
        baseDuration,
        startTime,
        commitTime
      );
    },
    [onRender]
  );

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
};

// Performance budget checker
export interface PerformanceBudget {
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  lcp: number;
  fid: number;
  cls: number;
}

export function checkPerformanceBudget(metrics: PerformanceMetrics, budget: PerformanceBudget) {
  const violations: string[] = [];

  if (metrics.renderTime > budget.renderTime) {
    violations.push(
      `Render time exceeded: ${metrics.renderTime.toFixed(2)}ms > ${budget.renderTime}ms`
    );
  }

  if (metrics.memoryUsage > budget.memoryUsage) {
    violations.push(
      `Memory usage exceeded: ${metrics.memoryUsage.toFixed(2)}MB > ${budget.memoryUsage}MB`
    );
  }

  if (metrics.coreWebVitals.lcp && metrics.coreWebVitals.lcp > budget.lcp) {
    violations.push(`LCP exceeded: ${metrics.coreWebVitals.lcp.toFixed(2)}ms > ${budget.lcp}ms`);
  }

  if (metrics.coreWebVitals.fid && metrics.coreWebVitals.fid > budget.fid) {
    violations.push(`FID exceeded: ${metrics.coreWebVitals.fid.toFixed(2)}ms > ${budget.fid}ms`);
  }

  if (metrics.coreWebVitals.cls && metrics.coreWebVitals.cls > budget.cls) {
    violations.push(`CLS exceeded: ${metrics.coreWebVitals.cls.toFixed(3)} > ${budget.cls}`);
  }

  if (violations.length > 0) {
    logger.warn('Performance budget violations:', { violations });
  }

  return { passed: violations.length === 0, violations };
}

export default {
  usePerformanceMonitor,
  withPerformanceMonitoring,
  PerformanceProfiler,
  analyzeBundleSize,
  checkPerformanceBudget,
};
