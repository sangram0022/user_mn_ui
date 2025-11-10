// ========================================
// Token Service
// Token management and CSRF operations
// 
// Response Format:
// API functions return backend ApiResponse<T> format:
// - Success: { success: true, data: T, message?, timestamp? }
// - Error: { success: false, error: string, field_errors?, message_code?, timestamp? }
// 
// Local storage functions manage token persistence (no API calls).
// 
// @see {ApiResponse} @/core/api/types
// ========================================

import { apiClient } from '../../../services/api/apiClient';
import { API_PREFIXES } from '../../../services/api/common';
import { logger } from '@/core/logging';
import type {
  RefreshTokenResponse,
} from '../types/auth.types';
import type {
  CsrfTokenResponse,
  ValidateCsrfRequest,
  ValidateCsrfResponse,
  TokenStorage,
} from '../types/token.types';

const API_PREFIX = API_PREFIXES.AUTH;
// Storage keys - Single Source of Truth for token storage
const TOKEN_STORAGE_KEY = 'access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expires_at';
const USER_STORAGE_KEY = 'user';
const CSRF_TOKEN_STORAGE_KEY = 'csrf_token';
const REMEMBER_ME_KEY = 'remember_me';
const REMEMBER_ME_EMAIL_KEY = 'remember_me_email';

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 * 
 * @param refreshToken - The refresh token string
 * @returns Full API response with new token data
 * @throws {APIError} On invalid or expired refresh token (401)
 * 
 * Backend returns: ApiResponse<{ access_token, refresh_token, token_type, expires_in }>
 * This function returns: RefreshTokenResponse (full response)
 */
export const refreshToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post<RefreshTokenResponse>(`${API_PREFIX}/refresh`, {
    refresh_token: refreshToken,
  });
  return response.data;
};

/**
 * GET /api/v1/auth/csrf-token
 * Get CSRF token for secure form submissions
 * 
 * @returns Full API response with CSRF token
 * @throws {APIError} On server error
 * 
 * Backend returns: ApiResponse<{ csrf_token: string }>
 * This function returns: CsrfTokenResponse (full response)
 */
export const getCsrfToken = async (): Promise<CsrfTokenResponse> => {
  const response = await apiClient.get<CsrfTokenResponse>(`${API_PREFIX}/csrf-token`);
  return response.data;
};

/**
 * POST /api/v1/auth/validate-csrf
 * Validate CSRF token
 * 
 * @param data - CSRF token to validate
 * @returns Full API response with validation result
 * @throws {APIError} On invalid CSRF token
 * 
 * Backend returns: ApiResponse<{ valid: boolean, message: string }>
 * This function returns: ValidateCsrfResponse (full response)
 */
export const validateCsrfToken = async (data: ValidateCsrfRequest): Promise<ValidateCsrfResponse> => {
  const response = await apiClient.post<ValidateCsrfResponse>(`${API_PREFIX}/validate-csrf`, data);
  return response.data;
};

// ========================================
// Local Storage Token Management
// ========================================

/**
 * Store tokens in localStorage with expiry time and optional remember_me flag
 */
export const storeTokens = (
  tokens: Omit<TokenStorage, 'expires_at'>,
  rememberMe: boolean = false
): void => {
  const expiresIn = Number(tokens.expires_in) || 3600;
  const expiresAt = Date.now() + expiresIn * 1000;
  
  // Debug logging
  if (import.meta.env.DEV) {
    logger().debug('[tokenService] Storing tokens', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      accessTokenLength: tokens.access_token?.length || 0,
      expiresIn: tokens.expires_in,
      expiresAt: new Date(expiresAt).toISOString(),
      rememberMe,
    });
  }
  
  // Avoid storing literal 'undefined' strings or null values
  if (tokens.access_token && tokens.access_token !== 'undefined') {
    localStorage.setItem(TOKEN_STORAGE_KEY, tokens.access_token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  if (tokens.refresh_token && tokens.refresh_token !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refresh_token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
  localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
  
  // Verify storage
  if (import.meta.env.DEV) {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    logger().debug('[tokenService] Token storage verification', {
      stored: !!stored,
      storedLength: stored?.length || 0,
      matches: stored === tokens.access_token,
    });
  }
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  
  if (import.meta.env.DEV) {
    logger().debug('[tokenService] Getting access token', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
    });
  }
  
  return token;
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (): boolean => {
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryTime) return true;
  
  return Date.now() >= parseInt(expiryTime, 10);
};

/**
 * Clear all tokens from localStorage
 */
export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(CSRF_TOKEN_STORAGE_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
  // Note: We keep REMEMBER_ME_EMAIL_KEY so user can see it on login page next time
};

/**
 * Check if remember me is enabled
 */
export const isRememberMeEnabled = (): boolean => {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
};

/**
 * Get remember me email
 */
export const getRememberMeEmail = (): string | null => {
  return localStorage.getItem(REMEMBER_ME_EMAIL_KEY);
};

/**
 * Set remember me email
 */
export const setRememberMeEmail = (email: string): void => {
  localStorage.setItem(REMEMBER_ME_EMAIL_KEY, email);
};

/**
 * Clear remember me data
 */
export const clearRememberMe = (): void => {
  localStorage.removeItem(REMEMBER_ME_EMAIL_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
};

/**
 * Store user data in localStorage
 */
export const storeUser = (user: unknown): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

/**
 * Get user data from localStorage
 */
export const getUser = (): unknown | null => {
  const user = localStorage.getItem(USER_STORAGE_KEY);
  if (!user) return null;
  
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

/**
 * Store CSRF token in localStorage
 */
export const storeCsrfToken = (token: string): void => {
  localStorage.setItem(CSRF_TOKEN_STORAGE_KEY, token);
};

/**
 * Get CSRF token from localStorage
 */
export const getStoredCsrfToken = (): string | null => {
  return localStorage.getItem(CSRF_TOKEN_STORAGE_KEY);
};

/**
 * Remove user data from localStorage
 */
export const removeUser = (): void => {
  localStorage.removeItem(USER_STORAGE_KEY);
};

/**
 * Remove CSRF token from localStorage
 */
export const removeCsrfToken = (): void => {
  localStorage.removeItem(CSRF_TOKEN_STORAGE_KEY);
};

/**
 * Get time until token expires (in seconds)
 */
export const getTokenExpiryTime = (): number | null => {
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryTime) return null;
  
  const timeRemaining = parseInt(expiryTime, 10) - Date.now();
  return Math.max(0, Math.floor(timeRemaining / 1000));
};

// Export all as default object
const tokenService = {
  refreshToken,
  getCsrfToken,
  validateCsrfToken,
  storeTokens,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  clearTokens,
  getTokenExpiryTime,
  storeUser,
  getUser,
  removeUser,
  storeCsrfToken,
  getStoredCsrfToken,
  removeCsrfToken,
  isRememberMeEnabled,
  getRememberMeEmail,
  setRememberMeEmail,
  clearRememberMe,
};

export default tokenService;

