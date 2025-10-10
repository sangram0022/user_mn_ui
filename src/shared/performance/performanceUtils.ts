import { logger } from './../utils/logger';

/**
 * Performance Monitoring Utilities
 * Utility functions for performance analysis
 */

// Performance metrics types
export interface PerformanceMetrics { renderTime: number;
  componentMount: number;
  memoryUsage: number;
  interactionDelay: number;
  coreWebVitals: {
    lcp: number | null; // Largest Contentful Paint
    fid: number | null; // First Input Delay
    cls: number | null; // Cumulative Layout Shift
  };
}

export interface PerformanceConfig { trackRenders?: boolean;
  trackMemory?: boolean;
  trackInteractions?: boolean;
  trackWebVitals?: boolean;
  reportThreshold?: number;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void; }

export interface PerformanceBudget { renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  lcp: number;
  fid: number;
  cls: number; }

// Bundle size analyzer
export function analyzeBundleSize() { if (typeof window === 'undefined') return [];
  
  const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const jsResources = resourceEntries.filter(entry => 
    entry.name.includes('.js') || entry.name.includes('.mjs')
  );
  
  const bundleInfo = jsResources.map(resource => ({
    name: resource.name.split('/').pop() || 'unknown',
    size: resource.transferSize || 0,
    loadTime: resource.duration,
    compressed: resource.transferSize !== resource.decodedBodySize
  }));
  
  console.table(bundleInfo);
  
  const totalSize = bundleInfo.reduce((sum, bundle) => sum + bundle.size, 0);
  logger.info(`Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
  
  return bundleInfo;
}

// Performance budget checker
export function checkPerformanceBudget(
  metrics: PerformanceMetrics,
  budget: PerformanceBudget
) {
  const violations: string[] = [];
  
  if (metrics.renderTime > budget.renderTime) {
    violations.push(`Render time exceeded: ${metrics.renderTime.toFixed(2)}ms > ${budget.renderTime}ms`);
  }
  
  if (metrics.memoryUsage > budget.memoryUsage) {
    violations.push(`Memory usage exceeded: ${metrics.memoryUsage.toFixed(2)}MB > ${budget.memoryUsage}MB`);
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
  
  if (violations.length > 0) { logger.warn('Performance budget violations:', { violations  });
  }
  
  return { passed: violations.length === 0,
    violations
  };
}