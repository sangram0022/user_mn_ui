// ========================================
// Authentication Debugger
// Diagnostic tool to troubleshoot authentication issues
// ========================================

import { logger } from '@/core/logging';
import tokenService from '../services/tokenService';

/**
 * Check if authentication is properly set up
 * Returns diagnostic information about auth state
 */
export function diagnoseAuthState(): {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  tokenExpiry: string | null;
  isExpired: boolean;
  rememberMe: boolean;
  rememberEmail: string | null;
  accessTokenPreview: string | null;
  storageKeys: string[];
} {
  const accessToken = tokenService.getAccessToken();
  const refreshToken = tokenService.getRefreshToken();
  const expiryTime = tokenService.getTokenExpiryTime();
  const isExpired = tokenService.isTokenExpired();
  const rememberMe = tokenService.isRememberMeEnabled();
  const rememberEmail = tokenService.getRememberMeEmail();

  // Get all keys from localStorage that contain "token" or "auth"
  const storageKeys = Object.keys(localStorage).filter(key =>
    key.includes('token') || key.includes('auth') || key.includes('user')
  );

  const diagnosis = {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    tokenExpiry: expiryTime ? new Date(Date.now() + expiryTime * 1000).toISOString() : null,
    isExpired,
    rememberMe,
    rememberEmail,
    accessTokenPreview: accessToken ? `${accessToken.substring(0, 30)}...` : null,
    storageKeys,
  };

  // Log diagnosis
  logger().info('🔍 Auth State Diagnosis', diagnosis);

  return diagnosis;
}

/**
 * Check if request will have authorization header
 * This simulates what the axios interceptor will do
 */
export function diagnoseRequestAuth(url: string): {
  willHaveAuthHeader: boolean;
  tokenFound: boolean;
  tokenPreview: string | null;
  isPublicEndpoint: boolean;
} {
  const accessToken = tokenService.getAccessToken();
  
  // Public endpoints (from apiClient.ts)
  const publicEndpoints = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/forgot-password',
    '/api/v1/auth/reset-password',
    '/api/v1/auth/verify-email',
    '/api/v1/health',
  ];

  const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint));
  const willHaveAuthHeader = !!accessToken && !isPublicEndpoint;

  const diagnosis = {
    willHaveAuthHeader,
    tokenFound: !!accessToken,
    tokenPreview: accessToken ? `${accessToken.substring(0, 30)}...` : null,
    isPublicEndpoint,
  };

  logger().info(`🔍 Request Auth Diagnosis for ${url}`, diagnosis);

  return diagnosis;
}

/**
 * Clear all auth state and log actions
 */
export function clearAuthStateWithLogging(): void {
  logger().warn('🧹 Clearing all auth state');
  
  const beforeState = diagnoseAuthState();
  logger().info('Before clear:', beforeState);
  
  tokenService.clearTokens();
  
  const afterState = diagnoseAuthState();
  logger().info('After clear:', afterState);
}

/**
 * Monitor localStorage changes in real-time
 * Useful for debugging why tokens might be getting cleared
 */
export function startStorageMonitoring(): () => void {
  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;
  const originalClear = localStorage.clear;

  // Override setItem
  localStorage.setItem = function(key: string, value: string) {
    if (key.includes('token') || key.includes('auth') || key.includes('user')) {
      logger().info(`📝 localStorage.setItem called`, {
        key,
        valueLength: value.length,
        valuePreview: value.substring(0, 50) + '...',
        stack: new Error().stack,
      });
    }
    return originalSetItem.apply(this, [key, value]);
  };

  // Override removeItem
  localStorage.removeItem = function(key: string) {
    if (key.includes('token') || key.includes('auth') || key.includes('user')) {
      logger().warn(`🗑️ localStorage.removeItem called`, {
        key,
        stack: new Error().stack,
      });
    }
    return originalRemoveItem.apply(this, [key]);
  };

  // Override clear
  localStorage.clear = function() {
    const error = new Error('localStorage.clear called');
    logger().error(`🧨 localStorage.clear called`, error, {
      stack: error.stack,
    });
    return originalClear.apply(this);
  };

  logger().info('👀 Storage monitoring started');

  // Return cleanup function
  return () => {
    localStorage.setItem = originalSetItem;
    localStorage.removeItem = originalRemoveItem;
    localStorage.clear = originalClear;
    logger().info('👀 Storage monitoring stopped');
  };
}

// Make available in window for easy console debugging
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).authDebug = {
    diagnoseAuthState,
    diagnoseRequestAuth,
    clearAuthStateWithLogging,
    startStorageMonitoring,
  };
  
  console.log('🔧 Auth debugger available:');
  console.log('  - window.authDebug.diagnoseAuthState()');
  console.log('  - window.authDebug.diagnoseRequestAuth(url)');
  console.log('  - window.authDebug.clearAuthStateWithLogging()');
  console.log('  - window.authDebug.startStorageMonitoring()');
}
