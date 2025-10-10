/**
 * Advanced performance monitoring and optimization utilities
 */
import { logger } from './logger';
import { useCallback, useRef } from 'react';

// Performance metrics interfaces
export interface PerformanceMetric { name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>; }

export interface RenderMetrics { componentName: string;
  renderTime: number;
  renderCount: number;
  propsChanges: number;
  memoryUsage?: number; }

export interface ApiMetrics { endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: number;
  success: boolean; }

// Performance monitoring class
export class AdvancedPerformanceMonitor { private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private renderMetrics: Map<string, RenderMetrics> = new Map();
  
  constructor() {
    this.initializeObservers();
  }

  private initializeObservers(): void {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.addMetric({
              name: `navigation.${entry.name}`,
              value: entry.duration,
              timestamp: Date.now(),
              tags: { type: 'navigation' }
            });
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navigationObserver);
      } catch (error) { logger.warn('Navigation observer not supported:', { error  });
      }

      // Observe paint timing
      try { const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.addMetric({
              name: entry.name,
              value: entry.startTime,
              timestamp: Date.now(),
              tags: { type: 'paint' }
            });
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('paint', paintObserver);
      } catch (error) { logger.warn('Paint observer not supported:', { error  });
      }

      // Observe largest contentful paint
      try { const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.addMetric({
              name: 'largest-contentful-paint',
              value: lastEntry.startTime,
              timestamp: Date.now(),
              tags: { type: 'lcp' }
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) { logger.warn('LCP observer not supported:', { error  });
      }
    }
  }

  addMetric(metric: PerformanceMetric): void { this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  addRenderMetric(metric: RenderMetrics): void { this.renderMetrics.set(metric.componentName, metric);
  }

  getMetrics(name?: string, timeRange?: { start: number; end: number }): PerformanceMetric[] { let filtered = this.metrics;

    if (name) {
      filtered = filtered.filter(m => m.name.includes(name));
    }

    if (timeRange) { filtered = filtered.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    return filtered;
  }

  getRenderMetrics(): RenderMetrics[] { return Array.from(this.renderMetrics.values());
  }

  clearMetrics(): void { this.metrics = [];
    this.renderMetrics.clear();
  }

  getAverageMetric(name: string): number { const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  disconnect(): void { this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Global performance monitor instance
export const advancedPerformanceMonitor = new AdvancedPerformanceMonitor();

/**
 * Hook for monitoring component render performance
 */
export function useAdvancedRenderPerformance(componentName: string) { const renderCountRef = useRef(0);
  const propsChangesRef = useRef(0);
  const lastPropsRef = useRef<Record<string, unknown> | undefined>(undefined);
  const renderStartRef = useRef<number>(0);

  const startRender = useCallback(() => {
    renderStartRef.current = performance.now();
    renderCountRef.current += 1;
  }, []);

  const endRender = useCallback((props?: Record<string, unknown>) => { const renderTime = performance.now() - renderStartRef.current;
    
    // Check for props changes
    if (props && lastPropsRef.current) {
      const hasChanged = Object.keys(props).some(key => 
        props[key] !== lastPropsRef.current![key]
      );
      if (hasChanged) {
        propsChangesRef.current += 1;
      }
    }
    lastPropsRef.current = props;

    // Get memory usage if available
    let memoryUsage: number | undefined;
    if ('memory' in performance) { const perfWithMemory = performance as Performance & { memory?: { usedJSHeapSize: number } };
      memoryUsage = perfWithMemory.memory?.usedJSHeapSize;
    }

    const metric: RenderMetrics = { componentName,
      renderTime,
      renderCount: renderCountRef.current,
      propsChanges: propsChangesRef.current,
      memoryUsage
    };

    advancedPerformanceMonitor.addRenderMetric(metric);
  }, [componentName]);

  return { startRender, endRender };
}

/**
 * Hook for monitoring API performance
 */
export function useAdvancedApiPerformance() { const trackApiCall = useCallback(
    async <T>(
      endpoint: string,
      method: string,
      apiCall: () => Promise<T>
    ): Promise<T> => {
      const startTime = performance.now();
      let statusCode = 0;
      let success = false;

      try {
        const result = await apiCall();
        success = true;
        statusCode = 200; // Assume success if no error
        return result;
      } catch (error: unknown) { success = false;
        if (error && typeof error === 'object') {
          const errorWithStatus = error as { status?: number; response?: { status?: number } };
          statusCode = errorWithStatus.status || errorWithStatus.response?.status || 500;
        } else { statusCode = 500;
        }
        throw error;
      } finally {
        const responseTime = performance.now() - startTime;
        
        advancedPerformanceMonitor.addMetric({
          name: `api.${method.toLowerCase()}.${endpoint}`,
          value: responseTime,
          timestamp: Date.now(),
          tags: { type: 'api',
            method,
            endpoint,
            status: statusCode.toString(),
            success: success.toString()
          }
        });
      }
    },
    []
  );

  return { trackApiCall };
}

export default { AdvancedPerformanceMonitor,
  advancedPerformanceMonitor,
  useAdvancedRenderPerformance,
  useAdvancedApiPerformance };