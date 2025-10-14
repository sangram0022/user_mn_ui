import { logger } from '@shared/utils/logger';

/**
 * Environment variables type definitions
 * Add your environment variables here for better type safety
 */

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;

  // Feature Flags
  readonly VITE_ENABLE_DARK_MODE: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_NOTIFICATIONS: string;
  readonly VITE_ENABLE_EXPERIMENTAL: string;
  readonly VITE_ENABLE_ERROR_REPORTING: string;

  // Authentication
  readonly VITE_AUTH_PROVIDER: string;
  readonly VITE_AUTH_CLIENT_ID: string;

  // Analytics
  readonly VITE_ANALYTICS_ID: string;
  readonly VITE_ANALYTICS_PROVIDER: string;

  // Error Reporting
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_ERROR_REPORTING_URL: string;

  // Development
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: 'development' | 'production' | 'test';
  readonly BASE_URL: string;

  // Build Information
  readonly VITE_APP_VERSION: string;
  readonly VITE_BUILD_TIME: string;
  readonly VITE_GIT_COMMIT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Environment validation helpers
export const validateEnvironment = (): void => {
  const requiredEnvVars = ['VITE_API_BASE_URL'] as const;

  const missingVars = requiredEnvVars.filter((varName) => !import.meta.env[varName]);

  if (missingVars.length > 0) {
    logger.error('Missing required environment variables:', undefined, { missingVars });
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Environment utilities
export const getEnvironment = () => ({
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL,
});

// Type-safe environment getter
export const getEnvVar = <T extends keyof ImportMetaEnv>(
  key: T,
  defaultValue?: ImportMetaEnv[T]
): ImportMetaEnv[T] => {
  const value = import.meta.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value ?? defaultValue!;
};

// Feature flag helpers
export const isFeatureEnabled = (
  feature: keyof Pick<
    ImportMetaEnv,
    | 'VITE_ENABLE_DARK_MODE'
    | 'VITE_ENABLE_ANALYTICS'
    | 'VITE_ENABLE_NOTIFICATIONS'
    | 'VITE_ENABLE_EXPERIMENTAL'
    | 'VITE_ENABLE_ERROR_REPORTING'
  >
): boolean => {
  return import.meta.env[feature] === 'true';
};
