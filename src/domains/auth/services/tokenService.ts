// ========================================
// Token Service
// Token management and CSRF operations
// ========================================

import { apiClient } from '../../../services/api/apiClient';
import type {
  RefreshTokenResponse,
  CsrfTokenResponse,
  ValidateCsrfRequest,
  ValidateCsrfResponse,
  TokenStorage,
} from '../types/token.types';

const API_PREFIX = '/api/v1/auth';
const TOKEN_STORAGE_KEY = 'auth_token';
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expires_at';
const USER_STORAGE_KEY = 'auth_user';
const CSRF_TOKEN_STORAGE_KEY = 'csrf_token';

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
export const refreshToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post<RefreshTokenResponse>(`${API_PREFIX}/refresh`, {
    refresh_token: refreshToken,
  });
  return response.data;
};

/**
 * GET /api/v1/auth/csrf-token
 * Get CSRF token
 */
export const getCsrfToken = async (): Promise<CsrfTokenResponse> => {
  const response = await apiClient.get<CsrfTokenResponse>(`${API_PREFIX}/csrf-token`);
  return response.data;
};

/**
 * POST /api/v1/auth/validate-csrf
 * Validate CSRF token
 */
export const validateCsrfToken = async (data: ValidateCsrfRequest): Promise<ValidateCsrfResponse> => {
  const response = await apiClient.post<ValidateCsrfResponse>(`${API_PREFIX}/validate-csrf`, data);
  return response.data;
};

// ========================================
// Local Storage Token Management
// ========================================

/**
 * Store tokens in localStorage
 */
export const storeTokens = (tokens: Omit<TokenStorage, 'expires_at'>): void => {
  const expiresAt = Date.now() + tokens.expires_in * 1000;
  
  localStorage.setItem(TOKEN_STORAGE_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refresh_token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
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
};

export default tokenService;

