/**
 * Production Environment Validation
 *
 * Validates all required environment variables at build time to prevent
 * runtime crashes in production. Ensures proper configuration before deployment.
 *
 * Features:
 * - Required variable validation
 * - URL format validation
 * - Production-specific checks
 * - Localhost detection
 * - Clear error messages
 *
 * @module env.validation
 */

interface RequiredEnvVars {
  VITE_BACKEND_URL: string;
  VITE_API_BASE_URL: string;
  VITE_APP_ENV: 'development' | 'staging' | 'production';
  VITE_APP_NAME: string;
}

interface OptionalEnvVars {
  VITE_SENTRY_DSN?: string;
  VITE_ANALYTICS_ID?: string;
  VITE_CDN_URL?: string;
  VITE_ENCRYPTION_KEY?: string;
}

const requiredEnvVars: (keyof RequiredEnvVars)[] = [
  'VITE_BACKEND_URL',
  'VITE_API_BASE_URL',
  'VITE_APP_ENV',
  'VITE_APP_NAME',
];

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Check if URL contains localhost or 127.0.0.1
 */
function isLocalhost(url: string): boolean {
  return url.includes('localhost') || url.includes('127.0.0.1');
}

/**
 * Validate environment variables
 */
export function validateEnvironment(): void {
  const missing: string[] = [];
  const invalid: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const key of requiredEnvVars) {
    const value = import.meta.env[key];

    if (!value || value === undefined) {
      missing.push(key);
      continue;
    }

    // Validate URL format for URL variables
    if (key.includes('URL') && !isValidUrl(value)) {
      invalid.push(`${key} must be a valid URL starting with http:// or https:// (got: ${value})`);
    }

    // Check for placeholder values
    if (value.includes('yourdomain.com') || value.includes('example.com')) {
      warnings.push(`${key} contains placeholder domain: ${value}`);
    }
  }

  // Production-specific validation
  if (import.meta.env.PROD || import.meta.env.VITE_APP_ENV === 'production') {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // Prevent localhost in production
    if (backendUrl && isLocalhost(backendUrl)) {
      invalid.push('VITE_BACKEND_URL cannot use localhost or 127.0.0.1 in production');
    }

    if (apiUrl && isLocalhost(apiUrl)) {
      invalid.push('VITE_API_BASE_URL cannot use localhost or 127.0.0.1 in production');
    }

    // Check for encryption key in production
    if (!import.meta.env.VITE_ENCRYPTION_KEY) {
      warnings.push('VITE_ENCRYPTION_KEY is not set. Token encryption will use default key.');
    }

    // Check for monitoring in production
    if (!import.meta.env.VITE_SENTRY_DSN) {
      warnings.push('VITE_SENTRY_DSN is not set. Error monitoring will not be available.');
    }

    // Check for analytics
    if (!import.meta.env.VITE_ANALYTICS_ID) {
      warnings.push('VITE_ANALYTICS_ID is not set. Analytics tracking will not be available.');
    }

    // Ensure source maps are disabled in production
    if (import.meta.env.VITE_ENABLE_SOURCEMAPS === 'true') {
      warnings.push(
        'VITE_ENABLE_SOURCEMAPS is enabled in production. Consider disabling for security.'
      );
    }

    // Check debug mode
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      warnings.push('VITE_ENABLE_DEBUG is enabled in production. This should be disabled.');
    }
  }

  // Build error message if there are issues
  const hasErrors = missing.length > 0 || invalid.length > 0;
  const hasWarnings = warnings.length > 0;

  if (hasErrors || (hasWarnings && import.meta.env.PROD)) {
    const errorMessages: string[] = [];

    if (missing.length > 0) {
      errorMessages.push('❌ Missing required environment variables:');
      missing.forEach((key) => {
        errorMessages.push(`   - ${key}`);
      });
      errorMessages.push('');
    }

    if (invalid.length > 0) {
      errorMessages.push('❌ Invalid environment variables:');
      invalid.forEach((msg) => {
        errorMessages.push(`   - ${msg}`);
      });
      errorMessages.push('');
    }

    if (warnings.length > 0 && import.meta.env.PROD) {
      errorMessages.push('⚠️  Environment warnings:');
      warnings.forEach((msg) => {
        errorMessages.push(`   - ${msg}`);
      });
      errorMessages.push('');
    }

    errorMessages.push(`Please check your .env.${import.meta.env.MODE} file.`);
    errorMessages.push('');
    errorMessages.push('Example .env.production:');
    errorMessages.push('  VITE_BACKEND_URL=https://api.yourdomain.com');
    errorMessages.push('  VITE_API_BASE_URL=https://api.yourdomain.com/api/v1');
    errorMessages.push('  VITE_APP_ENV=production');
    errorMessages.push('  VITE_APP_NAME=User Management System');
    errorMessages.push('  VITE_ENCRYPTION_KEY=your-secure-encryption-key');
    errorMessages.push('  VITE_SENTRY_DSN=https://your-sentry-dsn');

    const fullMessage = '\n' + errorMessages.join('\n') + '\n';

    if (hasErrors) {
      // Throw error for missing or invalid variables
      throw new Error(`Environment validation failed:${fullMessage}`);
    } else if (hasWarnings && import.meta.env.PROD) {
      // Only log warnings in production
      console.warn(`Environment validation warnings:${fullMessage}`);
    }
  }

  // Log success in development
  if (import.meta.env.DEV) {
    console.warn('✅ Environment validation passed');
    console.warn('Environment:', import.meta.env.VITE_APP_ENV || import.meta.env.MODE);
    console.warn('Backend URL:', import.meta.env.VITE_BACKEND_URL);
    console.warn('API URL:', import.meta.env.VITE_API_BASE_URL);
  }
}

/**
 * Get validated environment variables
 * Use this instead of directly accessing import.meta.env
 */
export function getEnv(): RequiredEnvVars & OptionalEnvVars {
  return {
    VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL as string,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
    VITE_APP_ENV: (import.meta.env.VITE_APP_ENV || import.meta.env.MODE) as
      | 'development'
      | 'staging'
      | 'production',
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME as string,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    VITE_ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID,
    VITE_CDN_URL: import.meta.env.VITE_CDN_URL,
    VITE_ENCRYPTION_KEY: import.meta.env.VITE_ENCRYPTION_KEY,
  };
}

// Auto-run validation in production builds
if (import.meta.env.PROD) {
  validateEnvironment();
}

export default validateEnvironment;
