// ========================================
// Central Configuration Module
// SINGLE SOURCE OF TRUTH for all app configuration
// ========================================
// 
// This module consolidates all environment variables, feature flags,
// and configuration constants into one centralized location.
//
// Benefits:
// - Single source of truth for all config
// - Type-safe access to environment variables
// - Easy to mock in tests
// - Clear documentation of all config options
// - Runtime validation of required variables
// 
// Usage:
//   import { config } from '@/core/config';
//   const apiUrl = config.api.baseUrl;
//   const isProduction = config.app.isProduction;
// ========================================

// ========================================
// Types
// ========================================

export type Environment = 'development' | 'staging' | 'production' | 'test';

export type ErrorReportingService = 'sentry' | 'cloudwatch' | 'custom' | 'none';

export interface AppConfig {
  name: string;
  version: string;
  environment: Environment;
  isProduction: boolean;
  isDevelopment: boolean;
  isStaging: boolean;
  isTest: boolean;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface AuthConfig {
  tokenStorageKey: string;
  refreshTokenStorageKey: string;
  tokenExpiryKey: string;
  csrfTokenKey: string;
  rememberMeKey: string;
  sessionTimeout: number; // in milliseconds
}

export interface FeatureFlagsConfig {
  enableErrorReporting: boolean;
  enablePerformanceTracking: boolean;
  enableDebugLogs: boolean;
  enableStructuredLogging: boolean;
  enablePWA: boolean;
  enableAnalytics: boolean;
}

export interface ErrorReportingConfig {
  enabled: boolean;
  service: ErrorReportingService;
  sentryDsn?: string;
  customEndpoint?: string;
  sampleRate: number;
}

export interface LoggingConfig {
  level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  console: boolean;
  persistence: boolean;
  maxLogs: number;
  performanceTracking: boolean;
  structured: boolean;
}

export interface Config {
  app: AppConfig;
  api: ApiConfig;
  auth: AuthConfig;
  features: FeatureFlagsConfig;
  errorReporting: ErrorReportingConfig;
  logging: LoggingConfig;
}

// ========================================
// Helper Functions
// ========================================

/**
 * Get environment variable with fallback
 */
function getEnv(key: string, defaultValue: string = ''): string {
  return import.meta.env[key] || defaultValue;
}

/**
 * Get boolean environment variable
 */
function getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = import.meta.env[key];
  if (value === undefined || value === null) return defaultValue;
  return value === 'true' || value === '1' || value === true;
}

/**
 * Get number environment variable
 */
function getEnvNumber(key: string, defaultValue: number): number {
  const value = import.meta.env[key];
  if (value === undefined || value === null) return defaultValue;
  const parsed = parseFloat(value as string);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Determine current environment
 */
function getEnvironment(): Environment {
  const mode = import.meta.env.MODE;
  if (mode === 'production') return 'production';
  if (mode === 'staging') return 'staging';
  if (mode === 'test') return 'test';
  return 'development';
}

// ========================================
// Configuration Object
// ========================================

const environment = getEnvironment();

export const config: Config = {
  // ========================================
  // App Configuration
  // ========================================
  app: {
    name: getEnv('VITE_APP_NAME', 'UserMN'),
    version: getEnv('VITE_APP_VERSION', '1.0.0'),
    environment,
    isProduction: environment === 'production',
    isDevelopment: environment === 'development',
    isStaging: environment === 'staging',
    isTest: environment === 'test',
  },

  // ========================================
  // API Configuration
  // ========================================
  api: {
    baseUrl: getEnv('VITE_API_BASE_URL', 'http://localhost:8000'),
    timeout: getEnvNumber('VITE_API_TIMEOUT', 30000),
    retryAttempts: getEnvNumber('VITE_API_RETRY_ATTEMPTS', 3),
    retryDelay: getEnvNumber('VITE_API_RETRY_DELAY', 1000),
  },

  // ========================================
  // Auth Configuration
  // ========================================
  auth: {
    tokenStorageKey: 'access_token',
    refreshTokenStorageKey: 'refresh_token',
    tokenExpiryKey: 'token_expires_at',
    csrfTokenKey: 'csrf_token',
    rememberMeKey: 'remember_me',
    sessionTimeout: getEnvNumber('VITE_SESSION_TIMEOUT', 900000), // 15 minutes default
  },

  // ========================================
  // Feature Flags
  // ========================================
  features: {
    enableErrorReporting: environment === 'production' || environment === 'staging',
    enablePerformanceTracking: environment === 'development',
    enableDebugLogs: environment === 'development',
    enableStructuredLogging: environment === 'production' || environment === 'staging',
    enablePWA: getEnvBoolean('VITE_ENABLE_PWA', true),
    enableAnalytics: environment === 'production',
  },

  // ========================================
  // Error Reporting Configuration
  // ========================================
  errorReporting: {
    enabled: environment === 'production' || environment === 'staging',
    service: (getEnv('VITE_ERROR_REPORTING_SERVICE', 'none') as ErrorReportingService),
    sentryDsn: getEnv('VITE_SENTRY_DSN'),
    customEndpoint: getEnv('VITE_ERROR_REPORTING_ENDPOINT'),
    sampleRate: getEnvNumber('VITE_ERROR_SAMPLE_RATE', 1.0),
  },

  // ========================================
  // Logging Configuration
  // ========================================
  logging: {
    level: environment === 'production' 
      ? 'error' 
      : environment === 'staging' 
        ? 'warn' 
        : 'debug',
    console: true,
    persistence: true,
    maxLogs: getEnvNumber('VITE_MAX_LOGS', 1000),
    performanceTracking: environment === 'development',
    structured: environment === 'production' || environment === 'staging',
  },
};

// ========================================
// Validation
// ========================================

/**
 * Validate required configuration
 * Throws error if critical config is missing
 */
function validateConfig(): void {
  const errors: string[] = [];

  // Validate required app config
  if (!config.app.name) {
    errors.push('App name is required (VITE_APP_NAME)');
  }

  // Validate API config
  if (!config.api.baseUrl) {
    errors.push('API base URL is required (VITE_API_BASE_URL)');
  }

  // Validate error reporting in production
  if (config.app.isProduction && config.errorReporting.enabled) {
    if (config.errorReporting.service === 'sentry' && !config.errorReporting.sentryDsn) {
      errors.push('Sentry DSN is required when error reporting is enabled (VITE_SENTRY_DSN)');
    }
    if (config.errorReporting.service === 'custom' && !config.errorReporting.customEndpoint) {
      errors.push('Custom endpoint is required when using custom error reporting (VITE_ERROR_REPORTING_ENDPOINT)');
    }
  }

  if (errors.length > 0) {
    const errorMessage = `Configuration validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`;
    
    // In production, throw error (fail fast)
    if (config.app.isProduction) {
      throw new Error(errorMessage);
    }
    
    // In development, warn only
    console.warn(`⚠️  Configuration warnings:\n${errors.map(e => `  - ${e}`).join('\n')}`);
  }
}

// Run validation on import
validateConfig();

// ========================================
// Exports
// ========================================

export default config;

// Export individual sections for convenience
export const appConfig = config.app;
export const apiConfig = config.api;
export const authConfig = config.auth;
export const featureFlags = config.features;
export const errorReportingConfig = config.errorReporting;
export const loggingConfig = config.logging;

// ========================================
// Type Guards
// ========================================

export function isProduction(): boolean {
  return config.app.isProduction;
}

export function isDevelopment(): boolean {
  return config.app.isDevelopment;
}

export function isStaging(): boolean {
  return config.app.isStaging;
}

export function isTest(): boolean {
  return config.app.isTest;
}

// ========================================
// Feature Flag Helpers
// ========================================

export function isFeatureEnabled(feature: keyof FeatureFlagsConfig): boolean {
  return config.features[feature];
}

// ========================================
// Debug Helper
// ========================================

/**
 * Log current configuration (development only)
 * Useful for debugging configuration issues
 */
export function logConfig(): void {
  if (config.app.isDevelopment) {
    // Use logger in development for config debugging
    import('@/core/logging').then(({ logger }) => {
      logger().info('📋 Application Configuration', {
        app: config.app,
        api: { ...config.api, baseUrl: config.api.baseUrl },
        auth: { tokenStorageKey: config.auth.tokenStorageKey, sessionTimeout: config.auth.sessionTimeout },
        features: config.features,
        errorReporting: { ...config.errorReporting, sentryDsn: config.errorReporting.sentryDsn ? '[REDACTED]' : undefined },
        logging: config.logging,
        context: 'config.logConfig',
      });
    }).catch(() => {
      // Fallback if logger not available
      // Allow console in this specific debug function
      /* eslint-disable no-console */
      console.info('📋 Configuration:', { app: config.app, api: config.api });
      /* eslint-enable no-console */
    });
  }
}
