/**
 * Web Vitals Monitoring Configuration
 * Tracks Core Web Vitals and sends data to analytics/monitoring service
 */

// Web vitals monitoring temporarily disabled for build
// import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

interface VitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
  id: string;
  navigationType: string;
}

interface VitalsConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  sampleRate: number;
  debug: boolean;
}

const defaultConfig: VitalsConfig = {
  enabled: import.meta.env.VITE_PERFORMANCE_MONITORING === 'true',
  endpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT,
  apiKey: import.meta.env.VITE_ANALYTICS_API_KEY,
  sampleRate: import.meta.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% sampling in production
  debug: import.meta.env.NODE_ENV === 'development',
};

class WebVitalsMonitor {
  private config: VitalsConfig;
  private metrics: Map<string, VitalsMetric> = new Map();
  private sessionId: string;
  // private readonly startTime: number;

  constructor(config: Partial<VitalsConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();
    // this.startTime = performance.now();
    
    if (this.config.enabled) {
      this.initializeMonitoring();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMonitoring(): void {
    // Only monitor if enabled and sampling allows
    if (!this.shouldSample()) {
      return;
    }

    // Core Web Vitals - temporarily disabled for build
    // getCLS(this.handleMetric.bind(this));
    // getFID(this.handleMetric.bind(this));
    // getFCP(this.handleMetric.bind(this));
    // getLCP(this.handleMetric.bind(this));
    // getTTFB(this.handleMetric.bind(this));

    // Additional performance metrics
    this.measureCustomMetrics();

    // Navigation timing
    this.measureNavigationTiming();

    // Resource timing
    this.measureResourceTiming();

    // Long tasks
    this.observeLongTasks();

    // Layout shifts
    this.observeLayoutShifts();

    // Send metrics on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.sendAllMetrics();
      }
    });

    // Send metrics before page unload
    window.addEventListener('beforeunload', () => {
      this.sendAllMetrics();
    });
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  // Temporarily disabled for build
  /*
  private handleMetric(metric: VitalsMetric): void {
    this.metrics.set(metric.name, metric);
    
    if (this.config.debug) {
      console.log('Web Vital measured:', metric);
    }

    // Send metric immediately for critical metrics
    if (['CLS', 'FID', 'LCP'].includes(metric.name)) {
      this.sendMetric(metric);
    }
  }
  */

  private measureCustomMetrics(): void {
    // React hydration time
    if (window.performance && typeof window.performance.mark === 'function') {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'react-hydration-complete') {
            const hydrationTime = entry.startTime;
            this.handleCustomMetric('react-hydration-time', hydrationTime);
          }
        });
      });
      observer.observe({ entryTypes: ['mark'] });
    }

    // Time to interactive (custom calculation)
    setTimeout(() => {
      const tti = this.calculateTimeToInteractive();
      if (tti) {
        this.handleCustomMetric('time-to-interactive', tti);
      }
    }, 1000);

    // Bundle size metrics
    this.measureBundleSize();
  }

  private measureNavigationTiming(): void {
    if ('navigation' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        'dns-lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
        'tcp-connection': navigation.connectEnd - navigation.connectStart,
        'ssl-negotiation': navigation.connectEnd - navigation.secureConnectionStart,
        'request-response': navigation.responseEnd - navigation.requestStart,
        'dom-parsing': navigation.domContentLoadedEventStart - navigation.responseEnd,
        'resource-loading': navigation.loadEventStart - navigation.domContentLoadedEventEnd,
      };

      Object.entries(metrics).forEach(([name, value]) => {
        if (value > 0) {
          this.handleCustomMetric(name, value);
        }
      });
    }
  }

  private measureResourceTiming(): void {
    if ('getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const resourceTypes = new Map<string, { count: number; totalSize: number; totalTime: number }>();
      
      resources.forEach((resource) => {
        const type = this.getResourceType(resource.name);
        const size = resource.transferSize || 0;
        const time = resource.responseEnd - resource.requestStart;
        
        const current = resourceTypes.get(type) || { count: 0, totalSize: 0, totalTime: 0 };
        resourceTypes.set(type, {
          count: current.count + 1,
          totalSize: current.totalSize + size,
          totalTime: current.totalTime + time,
        });
      });

      resourceTypes.forEach((stats, type) => {
        this.handleCustomMetric(`resource-${type}-count`, stats.count);
        this.handleCustomMetric(`resource-${type}-size`, stats.totalSize);
        this.handleCustomMetric(`resource-${type}-time`, stats.totalTime);
      });
    }
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(js|mjs)$/)) return 'script';
    if (url.match(/\.(css)$/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    if (url.match(/\.(mp4|webm|ogg)$/)) return 'media';
    return 'other';
  }

  private observeLongTasks(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.handleCustomMetric('long-task', entry.duration);
          });
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch {
        // Long task observer not supported
      }
    }
  }

  private observeLayoutShifts(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
            if (layoutShiftEntry.hadRecentInput) return; // Ignore user-initiated shifts
            this.handleCustomMetric('layout-shift', layoutShiftEntry.value || 0);
          });
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch {
        // Layout shift observer not supported
      }
    }
  }

  private calculateTimeToInteractive(): number | null {
    if (!('navigation' in performance)) return null;
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadComplete = navigation.loadEventEnd;
    const now = performance.now();
    
    // Simple heuristic: TTI is when the page has loaded and been idle for 5 seconds
    if (now - loadComplete > 5000) {
      return loadComplete;
    }
    
    return null;
  }

  private measureBundleSize(): void {
    // Estimate bundle size by measuring script resources
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const scripts = resources
      .filter((resource) => resource.name.includes('.js'))
      .reduce((total, resource) => total + (resource.transferSize || 0), 0);
    
    this.handleCustomMetric('bundle-size', scripts);
  }

  private handleCustomMetric(name: string, value: number): void {
    const metric: VitalsMetric = {
      name,
      value,
      rating: this.getRating(name, value),
      delta: value,
      entries: [],
      id: this.generateSessionId(),
      navigationType: 'navigate',
    };

    this.metrics.set(name, metric);
    
    if (this.config.debug) {
      // TODO: Replace with proper logging service
      // console.log('Custom metric measured:', metric);
    }
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    // Define thresholds for different metrics
    const thresholds: Record<string, [number, number]> = {
      'CLS': [0.1, 0.25],
      'FID': [100, 300],
      'FCP': [1800, 3000],
      'LCP': [2500, 4000],
      'TTFB': [800, 1800],
      'long-task': [50, 100],
      'bundle-size': [244000, 488000], // 244KB, 488KB
    };

    const [good, poor] = thresholds[name] || [1000, 2000];
    
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  private async sendMetric(metric: VitalsMetric): Promise<void> {
    if (!this.config.endpoint) {
      return;
    }

    const payload = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType(),
      metric,
      metadata: {
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio,
        language: navigator.language,
        platform: navigator.platform,
      },
    };

    try {
      if ('sendBeacon' in navigator) {
        navigator.sendBeacon(this.config.endpoint, JSON.stringify(payload));
      } else {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
          },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('Failed to send metric:', error);
      }
    }
  }

  private getConnectionType(): string {
    if ('connection' in navigator) {
      const nav = navigator as Navigator & { connection?: { effectiveType?: string; type?: string } };
      const connection = nav.connection;
      return connection?.effectiveType || connection?.type || 'unknown';
    }
    return 'unknown';
  }

  private sendAllMetrics(): void {
    this.metrics.forEach((metric) => {
      this.sendMetric(metric);
    });
  }

  // Public API
  public getMetrics(): Map<string, VitalsMetric> {
    return new Map(this.metrics);
  }

  public getMetric(name: string): VitalsMetric | undefined {
    return this.metrics.get(name);
  }

  public clearMetrics(): void {
    this.metrics.clear();
  }
}

// Initialize global Web Vitals monitor
export const webVitalsMonitor = new WebVitalsMonitor();

// Export for manual initialization with custom config
export { WebVitalsMonitor, type VitalsMetric, type VitalsConfig };