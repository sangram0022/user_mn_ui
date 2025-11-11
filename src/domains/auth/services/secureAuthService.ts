// ========================================
// Secure Authentication Service
// httpOnly cookie-based authentication
// 
// Response Format:
// All functions return backend ApiResponse<T> format directly:
// - Success: { success: true, data: T, message?, timestamp? }
// - Error: { success: false, error: string, field_errors?, message_code?, timestamp? }
// 
// These endpoints use httpOnly cookies for token storage (more secure than localStorage).
// 
// @see {ApiResponse} @/core/api/types
// ========================================

import { apiPost } from '@/core/api/apiHelpers';
import { API_PREFIXES } from '../../../services/api/common';
import type {
  LoginRequest,
  SecureLoginResponse,
  SecureLogoutResponse,
  SecureRefreshResponse,
} from '../types/auth.types';

const API_PREFIX = API_PREFIXES.AUTH;

/**
 * POST /api/v1/auth/login-secure
 * Secure login with httpOnly cookies
 * Tokens are stored in httpOnly cookies (not accessible via JavaScript)
 * 
 * @param data - Login credentials (email, password)
 * @returns Full API response with user info (tokens in cookies)
 * @throws {APIError} On validation or authentication failure
 * 
 * Backend returns: ApiResponse<{ user: User, message: string }>
 * Tokens stored in httpOnly cookies automatically
 */
export const loginSecure = async (data: LoginRequest): Promise<SecureLoginResponse> => {
  return apiPost<SecureLoginResponse>(`${API_PREFIX}/login-secure`, data, {
    withCredentials: true, // Enable cookies
  });
};

/**
 * POST /api/v1/auth/logout-secure
 * Secure logout (clears httpOnly cookies)
 * 
 * @returns Full API response with logout confirmation
 * @throws {APIError} Rarely - logout typically succeeds
 * 
 * Backend returns: ApiResponse<{ message: string }>
 * Cookies cleared automatically by backend
 */
export const logoutSecure = async (): Promise<SecureLogoutResponse> => {
  return apiPost<SecureLogoutResponse>(`${API_PREFIX}/logout-secure`, {}, {
    withCredentials: true,
  });
};

/**
 * POST /api/v1/auth/refresh-secure
 * Refresh access token using refresh token cookie
 * 
 * @returns Full API response with new token info
 * @throws {APIError} On invalid or expired refresh token (401)
 * 
 * Backend returns: ApiResponse<{ message: string }>
 * New tokens stored in httpOnly cookies automatically
 */
export const refreshSecure = async (): Promise<SecureRefreshResponse> => {
  return apiPost<SecureRefreshResponse>(`${API_PREFIX}/refresh-secure`, {}, {
    withCredentials: true,
  });
};

// Export all as default object
const secureAuthService = {
  loginSecure,
  logoutSecure,
  refreshSecure,
};

export default secureAuthService;

