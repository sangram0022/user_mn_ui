/**
 * Environment Configuration and Validation
 *
 * Validates all required environment variables at application startup
 * to prevent runtime errors and provide clear error messages.
 */

export interface EnvironmentConfig {
  // API Configuration
  backendUrl: string;
  apiBaseUrl: string;
  apiVersion: string;

  // Environment
  environment: 'development' | 'staging' | 'production';
  isDevelopment: boolean;
  isProduction: boolean;

  // Feature Flags
  features: {
    enableAnalytics: boolean;
    enableErrorTracking: boolean;
    enablePerformanceMonitoring: boolean;
    enableGDPRCompliance: boolean;
    enableBulkOperations: boolean;
    enableAuditLogs: boolean;
  };

  // Monitoring
  sentryDsn?: string;
  sentryTracesSampleRate?: number;

  // Security
  sessionTimeout: number;
  tokenRefreshInterval: number;
}

/**
 * Validate a required environment variable
 */
function getRequiredEnvVar(key: string, description: string): string {
  const value = import.meta.env[key];

  if (!value || value.trim() === '') {
    throw new Error(
      `❌ Missing required environment variable: ${key}\n` +
        `   Description: ${description}\n` +
        `   Please set this variable in your .env file.`
    );
  }

  return value.trim();
}

/**
 * Validate an optional environment variable with default
 */
function getOptionalEnvVar(key: string, defaultValue: string): string {
  const value = import.meta.env[key];
  return value && value.trim() !== '' ? value.trim() : defaultValue;
}

/**
 * Validate a boolean environment variable
 */
function getBooleanEnvVar(key: string, defaultValue: boolean = false): boolean {
  const value = import.meta.env[key];

  if (!value || value.trim() === '') {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

/**
 * Validate a number environment variable
 */
function getNumberEnvVar(key: string, defaultValue: number): number {
  const value = import.meta.env[key];

  if (!value || value.trim() === '') {
    return defaultValue;
  }

  const num = parseInt(value.trim(), 10);

  if (isNaN(num)) {
    console.warn(`⚠️  Invalid number for ${key}: "${value}". Using default: ${defaultValue}`);
    return defaultValue;
  }

  return num;
}

/**
 * Validate URL format
 */
function validateUrl(url: string, name: string): void {
  try {
    const parsed = new URL(url);

    if (!parsed.protocol.startsWith('http')) {
      throw new Error(`${name} must use http:// or https://`);
    }
  } catch (error) {
    throw new Error(
      `❌ Invalid URL for ${name}: "${url}"\n` +
        `   ${error instanceof Error ? error.message : 'Invalid URL format'}`
    );
  }
}

/**
 * Validate and load environment configuration
 */
function validateEnvironment(): EnvironmentConfig {
  console.warn('🔍 Validating environment configuration...');

  // Required variables
  const backendUrl = getRequiredEnvVar(
    'VITE_BACKEND_URL',
    'Backend API base URL (e.g., http://localhost:8000)'
  );

  const apiBaseUrl = getRequiredEnvVar(
    'VITE_API_BASE_URL',
    'API base URL including version (e.g., http://localhost:8000/api/v1)'
  );

  // Validate URLs
  validateUrl(backendUrl, 'VITE_BACKEND_URL');
  validateUrl(apiBaseUrl, 'VITE_API_BASE_URL');

  // Determine environment
  const mode = import.meta.env.MODE || 'development';
  let environment: 'development' | 'staging' | 'production';

  if (mode === 'production') {
    environment = 'production';
  } else if (mode === 'staging') {
    environment = 'staging';
  } else {
    environment = 'development';
  }

  // Feature flags
  const features = {
    enableAnalytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', false),
    enableErrorTracking: getBooleanEnvVar('VITE_ENABLE_ERROR_TRACKING', true),
    enablePerformanceMonitoring: getBooleanEnvVar('VITE_ENABLE_PERFORMANCE_MONITORING', false),
    enableGDPRCompliance: getBooleanEnvVar('VITE_ENABLE_GDPR_COMPLIANCE', true),
    enableBulkOperations: getBooleanEnvVar('VITE_ENABLE_BULK_OPERATIONS', true),
    enableAuditLogs: getBooleanEnvVar('VITE_ENABLE_AUDIT_LOGS', true),
  };

  // Monitoring configuration
  const sentryDsn = getOptionalEnvVar('VITE_SENTRY_DSN', '');
  const sentryTracesSampleRate = parseFloat(
    getOptionalEnvVar('VITE_SENTRY_TRACES_SAMPLE_RATE', '0.1')
  );

  // Security settings
  const sessionTimeout = getNumberEnvVar('VITE_SESSION_TIMEOUT_MINUTES', 30);
  const tokenRefreshInterval = getNumberEnvVar('VITE_TOKEN_REFRESH_INTERVAL_MINUTES', 25);

  // Validate session timeout is reasonable
  if (sessionTimeout < 5 || sessionTimeout > 1440) {
    console.warn(
      `⚠️  Session timeout (${sessionTimeout} minutes) is outside recommended range (5-1440). ` +
        `Using default: 30 minutes.`
    );
  }

  // Validate token refresh is less than session timeout
  if (tokenRefreshInterval >= sessionTimeout) {
    throw new Error(
      `❌ Token refresh interval (${tokenRefreshInterval} min) must be less than ` +
        `session timeout (${sessionTimeout} min)`
    );
  }

  const config: EnvironmentConfig = {
    backendUrl,
    apiBaseUrl,
    apiVersion: getOptionalEnvVar('VITE_API_VERSION', 'v1'),
    environment,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
    features,
    sentryDsn: sentryDsn || undefined,
    sentryTracesSampleRate: sentryTracesSampleRate || undefined,
    sessionTimeout,
    tokenRefreshInterval,
  };

  // Log configuration in development
  if (config.isDevelopment) {
    console.warn('✅ Environment validated:', {
      environment: config.environment,
      backendUrl: config.backendUrl,
      apiBaseUrl: config.apiBaseUrl,
      features: config.features,
    });
  } else {
    console.warn(`✅ Environment validated: ${config.environment}`);
  }

  return config;
}

// Validate and export configuration
export const config = validateEnvironment();
