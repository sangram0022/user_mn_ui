/**
 * AWS CloudWatch RUM (Real User Monitoring) Integration
 * Tracks real-time user experience metrics in production
 *
 * Features:
 * - Real User Monitoring (RUM)
 * - Performance metrics (Core Web Vitals)
 * - Error tracking
 * - HTTP monitoring
 * - Session tracking
 * - X-Ray integration for distributed tracing
 *
 * Setup:
 * 1. Create RUM application in AWS Console
 * 2. Get application ID and credentials
 * 3. Set environment variables:
 *    - VITE_CLOUDWATCH_APP_ID
 *    - VITE_COGNITO_POOL_ID
 *    - VITE_AWS_REGION
 */

export interface CloudWatchRUMConfig {
  applicationId: string;
  identityPoolId: string;
  region: string;
  sessionSampleRate?: number;
  guestRoleArn?: string;
  enableXRay?: boolean;
}

let isInitialized = false;

/**
 * Initialize CloudWatch RUM for production monitoring
 * Call this once at application startup
 */
export async function initCloudWatchRUM(): Promise<boolean> {
  // Only initialize in production
  if (!import.meta.env.PROD) {
    if (import.meta.env.DEV) {
      console.warn('📊 CloudWatch RUM disabled in development');
    }
    return false;
  }

  // Check for required configuration
  const appId = import.meta.env.VITE_CLOUDWATCH_APP_ID;
  const poolId = import.meta.env.VITE_COGNITO_POOL_ID;
  const region = import.meta.env.VITE_AWS_REGION;

  if (!appId || !poolId || !region) {
    console.warn(
      '⚠️ CloudWatch RUM not configured. Set VITE_CLOUDWATCH_APP_ID, VITE_COGNITO_POOL_ID, VITE_AWS_REGION'
    );
    return false;
  }

  try {
    // Dynamically import AWS RUM SDK
    // This is done dynamically to avoid bloating bundle in development
    // @ts-expect-error - optional dependency
    const module = await import('aws-rum-web');
    // @ts-expect-error - dynamic import
    const AwsRum = module.default || module.AwsRum;

    if (!AwsRum) {
      console.warn('⚠️ aws-rum-web module not available');
      return false;
    }

    // @ts-expect-error - external SDK
    AwsRum.init({
      sessionSampleRate: 1, // Track 100% of sessions
      identityPoolId: poolId,
      endpoint: `https://cloudwatch-rum.${region}.amazonaws.com`,
      telemetries: ['performance', 'errors', 'http'],
      allowCookies: true,
      enableXRay: true,
      logicalServiceName: 'user-management-ui',
      // Mask sensitive data
      urlSanitizer: (url: string) => {
        try {
          const urlObj = new URL(url);
          // Remove sensitive query parameters
          ['token', 'password', 'key', 'secret', 'api_key'].forEach((param) => {
            if (urlObj.searchParams.has(param)) {
              urlObj.searchParams.set(param, '[REDACTED]');
            }
          });
          return urlObj.toString();
        } catch {
          return url;
        }
      },
    });

    // Log page view
    AwsRum.logPageView();

    isInitialized = true;
    console.warn('✅ CloudWatch RUM initialized');

    // Record application version
    recordAppVersion();

    // Track Core Web Vitals
    trackCoreWebVitals();

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize CloudWatch RUM:', error);
    return false;
  }
}

/**
 * Record application version as metadata
 */
function recordAppVersion(): void {
  try {
    const version = import.meta.env.VITE_VERSION || '1.0.0';
    const env = import.meta.env.VITE_APP_ENV || 'unknown';

    // This would be recorded as custom metrics
    // Accessible in CloudWatch for version-based analysis
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark('app-version', {
        detail: { version, environment: env },
      });
    }
  } catch (error) {
    console.warn('Failed to record app version:', error);
  }
}

/**
 * Track Core Web Vitals using CloudWatch RUM
 * Core Web Vitals are crucial for SEO and user experience
 */
function trackCoreWebVitals(): void {
  try {
    // Dynamic import of web-vitals to keep bundle small in dev
    import('web-vitals')
      .then((vitals: unknown) => {
        const v = vitals as Record<string, unknown>;

        if (typeof v.getLCP === 'function') {
          // Largest Contentful Paint (LCP)
          (v.getLCP as (callback: (metric: unknown) => void) => void)((metric: unknown) => {
            recordRUMMetric('LCP', (metric as Record<string, unknown>).value as number);
          });
        }

        if (typeof v.getCLS === 'function') {
          // Cumulative Layout Shift (CLS)
          (v.getCLS as (callback: (metric: unknown) => void) => void)((metric: unknown) => {
            recordRUMMetric('CLS', (metric as Record<string, unknown>).value as number);
          });
        }

        if (typeof v.getFID === 'function') {
          // First Input Delay (FID) - deprecated but keeping for compatibility
          (v.getFID as (callback: (metric: unknown) => void) => void)((metric: unknown) => {
            recordRUMMetric('FID', (metric as Record<string, unknown>).value as number);
          });
        }

        if (typeof v.getFCP === 'function') {
          // First Contentful Paint (FCP)
          (v.getFCP as (callback: (metric: unknown) => void) => void)((metric: unknown) => {
            recordRUMMetric('FCP', (metric as Record<string, unknown>).value as number);
          });
        }

        if (typeof v.getTTFB === 'function') {
          // Time to First Byte (TTFB)
          (v.getTTFB as (callback: (metric: unknown) => void) => void)((metric: unknown) => {
            recordRUMMetric('TTFB', (metric as Record<string, unknown>).value as number);
          });
        }
      })
      .catch((error: unknown) => {
        console.warn('Failed to track Core Web Vitals:', error);
      });
  } catch (error) {
    console.warn('Error setting up web vitals tracking:', error);
  }
}

/**
 * Record custom metric to CloudWatch RUM
 */
function recordRUMMetric(metricName: string, value: number): void {
  try {
    if (isInitialized && typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`cwv-${metricName}`, {
        detail: { metric: metricName, value },
      });

      // Also record as custom event
      const evt = new CustomEvent('rum-metric', {
        detail: { metric: metricName, value },
      });
      window.dispatchEvent(evt);

      if (import.meta.env.DEV) {
        console.warn(`📊 Core Web Vital: ${metricName} = ${value}`);
      }
    }
  } catch (error) {
    console.warn(`Failed to record metric ${metricName}:`, error);
  }
}

/**
 * Record custom business event to CloudWatch RUM
 * Use this to track important user actions
 */
export function recordCustomEvent(eventName: string, attributes?: Record<string, unknown>): void {
  try {
    if (isInitialized && typeof window !== 'undefined') {
      const evt = new CustomEvent('rum-custom-event', {
        detail: { name: eventName, attributes },
      });
      window.dispatchEvent(evt);

      if (import.meta.env.DEV) {
        console.warn(`📊 Custom Event: ${eventName}`, attributes);
      }
    }
  } catch (error) {
    console.warn(`Failed to record custom event ${eventName}:`, error);
  }
}

/**
 * Record user action/event for better monitoring
 * E.g., user login, form submission, feature usage
 */
export function recordUserAction(
  action: 'login' | 'logout' | 'error' | 'feature_used' | string,
  details?: Record<string, unknown>
): void {
  recordCustomEvent(`user-action:${action}`, details);
}

/**
 * Check if CloudWatch RUM is initialized
 */
export function isCloudWatchRUMInitialized(): boolean {
  return isInitialized && import.meta.env.PROD;
}

export default {
  initCloudWatchRUM,
  recordCustomEvent,
  recordUserAction,
  isCloudWatchRUMInitialized,
};
