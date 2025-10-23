/**
 * Environment Detection Utilities
 *
 * Provides utilities for detecting runtime environment (browser vs SSR)
 * and safely executing browser-only code.
 *
 * @example
 * ```ts
 * import { isBrowser, isSSR, browserOnly } from '@shared/utils/env';
 *
 * // Check if running in browser
 * if (isBrowser()) {
 *   window.localStorage.setItem('key', 'value');
 * }
 *
 * // Check if running in SSR
 * if (isSSR()) {
 *   return null; // Don't render browser-only content
 * }
 *
 * // Execute browser-only code with fallback
 * const token = browserOnly(
 *   () => window.sessionStorage.getItem('token'),
 *   null
 * );
 * ```
 */

/**
 * Check if code is running in browser environment
 *
 * @returns True if in browser, false if SSR/Node.js
 *
 * @example
 * if (isBrowser()) {
 *   // Safe to use window, document, localStorage, etc.
 *   window.gtag('event', 'page_view');
 * }
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if code is running in SSR (Server-Side Rendering) environment
 *
 * @returns True if SSR/Node.js, false if browser
 *
 * @example
 * if (isSSR()) {
 *   // Render server-side compatible content
 *   return <div>Loading...</div>;
 * }
 */
export function isSSR(): boolean {
  return typeof window === 'undefined';
}

/**
 * Safely execute browser-only code with optional fallback
 *
 * @param callback - Function to execute in browser environment
 * @param fallback - Optional fallback value for SSR (default: undefined)
 * @returns Result of callback if in browser, otherwise fallback value
 *
 * @example
 * // Get sessionStorage value safely
 * const token = browserOnly(
 *   () => window.sessionStorage.getItem('token'),
 *   null
 * );
 *
 * // Execute side effect only in browser
 * browserOnly(() => {
 *   console.log('User agent:', navigator.userAgent);
 * });
 *
 * // With complex logic
 * const userPreferences = browserOnly(
 *   () => {
 *     const stored = localStorage.getItem('prefs');
 *     return stored ? JSON.parse(stored) : {};
 *   },
 *   {} // Fallback to empty object in SSR
 * );
 */
export function browserOnly<T>(callback: () => T, fallback?: T): T | undefined {
  if (isBrowser()) {
    try {
      return callback();
    } catch (error) {
      console.warn('[browserOnly] Error executing browser-only code:', error);
      return fallback;
    }
  }
  return fallback;
}

/**
 * Check if code is running in development environment
 *
 * @returns True if in development mode
 *
 * @example
 * if (isDevelopment()) {
 *   console.log('Debug info:', debugData);
 * }
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

/**
 * Check if code is running in production environment
 *
 * @returns True if in production mode
 *
 * @example
 * if (isProduction()) {
 *   // Send analytics
 *   trackPageView();
 * }
 */
export function isProduction(): boolean {
  return import.meta.env.PROD;
}

/**
 * Check if code is running in test environment
 *
 * @returns True if in test mode
 *
 * @example
 * if (isTest()) {
 *   // Mock API calls
 *   return mockData;
 * }
 */
export function isTest(): boolean {
  return import.meta.env.MODE === 'test' || import.meta.env.VITEST === true;
}

/**
 * Get the current environment name
 *
 * @returns Environment name ('development', 'production', 'test', or custom)
 *
 * @example
 * const env = getEnvironment();
 * console.log(`Running in ${env} mode`);
 */
export function getEnvironment(): string {
  return import.meta.env.MODE || 'unknown';
}

/**
 * Check if a specific feature is enabled
 * Useful for feature flags and conditional rendering
 *
 * @param feature - Feature name to check
 * @returns True if feature is enabled
 *
 * @example
 * if (isFeatureEnabled('NEW_UI')) {
 *   return <NewDesign />;
 * }
 */
export function isFeatureEnabled(feature: string): boolean {
  // Check environment variables for feature flags
  const envVar = `VITE_FEATURE_${feature.toUpperCase()}`;
  return import.meta.env[envVar] === 'true' || import.meta.env[envVar] === '1';
}
