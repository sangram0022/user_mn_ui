// ========================================
// Secure Authentication Service
// httpOnly cookie-based authentication
// ========================================

import { apiClient } from '../../../services/api/apiClient';
import type {
  LoginRequest,
  SecureLoginResponse,
  SecureLogoutResponse,
  SecureRefreshResponse,
} from '../types/auth.types';

const API_PREFIX = '/api/v1/auth';

/**
 * POST /api/v1/auth/login-secure
 * Secure login with httpOnly cookies
 */
export const loginSecure = async (data: LoginRequest): Promise<SecureLoginResponse> => {
  const response = await apiClient.post<SecureLoginResponse>(`${API_PREFIX}/login-secure`, data, {
    withCredentials: true, // Enable cookies
  });
  return response.data;
};

/**
 * POST /api/v1/auth/logout-secure
 * Secure logout (clears httpOnly cookies)
 */
export const logoutSecure = async (): Promise<SecureLogoutResponse> => {
  const response = await apiClient.post<SecureLogoutResponse>(`${API_PREFIX}/logout-secure`, {}, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * POST /api/v1/auth/refresh-secure
 * Refresh access token using refresh token cookie
 */
export const refreshSecure = async (): Promise<SecureRefreshResponse> => {
  const response = await apiClient.post<SecureRefreshResponse>(`${API_PREFIX}/refresh-secure`, {}, {
    withCredentials: true,
  });
  return response.data;
};

// Export all as default object
const secureAuthService = {
  loginSecure,
  logoutSecure,
  refreshSecure,
};

export default secureAuthService;

