/**
 * Error Reporting Service Configuration
 * 
 * Defines configuration for error reporting, including:
 * - Backend API endpoints
 * - Error batching settings
 * - Retry strategies
 * - Sampling rates
 * - Service integrations (Sentry, Rollbar, etc.)
 */

export interface ErrorReportingConfig {
  // Backend API endpoint for error reporting
  apiEndpoint: string;
  
  // Enable/disable error reporting
  enabled: boolean;
  
  // Only report in production
  productionOnly: boolean;
  
  // Maximum number of errors to batch before sending
  batchSize: number;
  
  // Timeout before sending partial batch (ms)
  batchTimeoutMs: number;
  
  // Maximum queue size (errors will be dropped if exceeded)
  maxQueueSize: number;
  
  // Retry configuration
  retryConfig: {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
  };
  
  // Sampling configuration (only report this percentage of errors)
  sampling: {
    enabled: boolean;
    rate: number; // 0.0 - 1.0 (0% - 100%)
  };
  
  // Error filtering
  filters: {
    // Ignore errors from specific sources
    ignoredPatterns?: RegExp[];
    
    // Ignore specific error types
    ignoredErrorTypes?: string[];
    
    // Only report errors from specific environments
    allowedEnvironments?: string[];
  };
  
  // Service-specific integrations
  integrations: {
    sentry?: {
      enabled: boolean;
      dsn?: string;
      environment?: string;
      tracesSampleRate?: number;
    };
    
    rollbar?: {
      enabled: boolean;
      accessToken?: string;
      environment?: string;
    };
    
    customBackend?: {
      enabled: boolean;
      endpoint?: string;
      apiKey?: string;
    };
  };
  
  // User tracking
  userTracking: {
    enabled: boolean;
    includeUserId: boolean;
    includeUsername: boolean;
    anonymizeIp: boolean;
  };
  
  // Session tracking
  sessionTracking: {
    enabled: boolean;
    sessionIdHeader?: string;
  };
  
  // Performance tracking
  performanceTracking: {
    enabled: boolean;
    captureApiTiming: boolean;
    captureRenderTiming: boolean;
    captureMemoryUsage: boolean;
    thresholdMs: number;
  };
  
  // Breadcrumbs (trail of events before error)
  breadcrumbs: {
    enabled: boolean;
    maxBreadcrumbs: number;
    captureConsole: boolean;
    captureHttp: boolean;
    captureNavigation: boolean;
    captureUserActions: boolean;
  };
}

/**
 * Default configuration for error reporting
 */
export const DEFAULT_ERROR_REPORTING_CONFIG: ErrorReportingConfig = {
  apiEndpoint: '/api/errors',
  enabled: true,
  productionOnly: false,
  batchSize: 10,
  batchTimeoutMs: 30000, // 30 seconds
  maxQueueSize: 100,
  retryConfig: {
    maxRetries: 3,
    initialDelayMs: 1000, // 1 second
    maxDelayMs: 30000, // 30 seconds
    backoffMultiplier: 2,
  },
  sampling: {
    enabled: false,
    rate: 1.0, // Report all errors by default
  },
  filters: {
    ignoredPatterns: [],
    ignoredErrorTypes: [],
    allowedEnvironments: [],
  },
  integrations: {
    sentry: {
      enabled: false,
      dsn: undefined,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
    },
    rollbar: {
      enabled: false,
      accessToken: undefined,
      environment: import.meta.env.MODE,
    },
    customBackend: {
      enabled: false,
      endpoint: undefined,
      apiKey: undefined,
    },
  },
  userTracking: {
    enabled: true,
    includeUserId: true,
    includeUsername: true,
    anonymizeIp: true,
  },
  sessionTracking: {
    enabled: true,
    sessionIdHeader: 'X-Session-Id',
  },
  performanceTracking: {
    enabled: true,
    captureApiTiming: true,
    captureRenderTiming: false,
    captureMemoryUsage: false,
    thresholdMs: 3000,
  },
  breadcrumbs: {
    enabled: true,
    maxBreadcrumbs: 50,
    captureConsole: true,
    captureHttp: true,
    captureNavigation: true,
    captureUserActions: true,
  },
};

/**
 * Production-safe configuration (stricter settings)
 */
export const PRODUCTION_ERROR_REPORTING_CONFIG: Partial<ErrorReportingConfig> = {
  productionOnly: true,
  batchSize: 5,
  batchTimeoutMs: 60000, // 60 seconds in production
  maxQueueSize: 50, // Smaller queue in production
  sampling: {
    enabled: true,
    rate: 0.5, // Report 50% of errors in production
  },
  userTracking: {
    enabled: true,
    includeUserId: true,
    includeUsername: false, // Don't include username in production
    anonymizeIp: true,
  },
};

/**
 * Development configuration (verbose logging)
 */
export const DEVELOPMENT_ERROR_REPORTING_CONFIG: Partial<ErrorReportingConfig> = {
  batchSize: 1, // Send immediately in development
  batchTimeoutMs: 5000,
  sampling: {
    enabled: false,
    rate: 1.0, // Report all errors
  },
  breadcrumbs: {
    enabled: true,
    maxBreadcrumbs: 100,
    captureConsole: true,
    captureHttp: true,
    captureNavigation: true,
    captureUserActions: true,
  },
};

/**
 * Get configuration based on environment
 */
export function getErrorReportingConfig(): ErrorReportingConfig {
  const baseConfig = { ...DEFAULT_ERROR_REPORTING_CONFIG };
  
  const env = import.meta.env.MODE;
  
  if (env === 'production') {
    return {
      ...baseConfig,
      ...PRODUCTION_ERROR_REPORTING_CONFIG,
    } as ErrorReportingConfig;
  }
  
  if (env === 'development') {
    return {
      ...baseConfig,
      ...DEVELOPMENT_ERROR_REPORTING_CONFIG,
    } as ErrorReportingConfig;
  }
  
  return baseConfig;
}

/**
 * Update error reporting configuration at runtime
 */
export function updateErrorReportingConfig(
  updates: Partial<ErrorReportingConfig>
): ErrorReportingConfig {
  const current = getErrorReportingConfig();
  return { ...current, ...updates };
}
