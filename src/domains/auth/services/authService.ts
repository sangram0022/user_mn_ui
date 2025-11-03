// ========================================
// Authentication Service
// All API calls for authentication domain
// Implements SOLID principles with response adapters
// ========================================

import { apiClient } from '../../../services/api/apiClient';
import type {
  LoginRequest,
  LoginResponse,
  LoginResponseData,
  RegisterRequest,
  RegisterResponse,
  LogoutResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  RefreshTokenResponse,
  RefreshTokenResponseData,
} from '../types/auth.types';

const API_PREFIX = '/api/v1/auth';

// ========================================
// Response Adapters (DRY Principle)
// Handle both wrapped and unwrapped responses
// ========================================

/**
 * Unwrap ApiResponse<T> format to just T
 * Backend may return { success, message, data: {...} } or just {...}
 */
function unwrapResponse<T>(response: unknown): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

/**
 * POST /api/v1/auth/login
 * Authenticate user with email and password
 */
export const login = async (data: LoginRequest): Promise<LoginResponseData> => {
  const response = await apiClient.post<LoginResponse>(`${API_PREFIX}/login`, data);
  return unwrapResponse<LoginResponseData>(response.data);
};

/**
 * POST /api/v1/auth/register
 * Register a new user account
 * 
 * @param data - Must include email, password, and either (first_name + last_name) OR full_name
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse['data']> => {
  const response = await apiClient.post<RegisterResponse>(`${API_PREFIX}/register`, data);
  return unwrapResponse(response.data);
};

/**
 * POST /api/v1/auth/logout
 * Logout the current user
 * Works with or without auth token
 */
export const logout = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post<LogoutResponse>(`${API_PREFIX}/logout`);
  return response.data;
};

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 * Must include refresh token in Authorization header
 */
export const refreshToken = async (refreshTokenValue: string): Promise<RefreshTokenResponseData> => {
  const response = await apiClient.post<RefreshTokenResponse>(
    `${API_PREFIX}/refresh`,
    null,
    {
      headers: {
        Authorization: `Bearer ${refreshTokenValue}`,
      },
    }
  );
  return unwrapResponse<RefreshTokenResponseData>(response.data);
};

/**
 * POST /api/v1/auth/forgot-password
 * Request password reset link
 * Always returns success to prevent email enumeration
 */
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse>(`${API_PREFIX}/forgot-password`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/reset-password
 * Reset password using token from email
 * 
 * @param data - Includes token, new_password, and confirm_password
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse>(`${API_PREFIX}/reset-password`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/change-password
 * Change password for authenticated user
 * Requires current password for security
 * 
 * @param data - Includes current_password, new_password, and confirm_password
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  const response = await apiClient.post<ChangePasswordResponse>(`${API_PREFIX}/change-password`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/verify-email
 * Verify email using token from email
 * Token expires in 24 hours
 */
export const verifyEmail = async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
  const response = await apiClient.post<VerifyEmailResponse>(`${API_PREFIX}/verify-email`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/resend-verification
 * Resend email verification link
 */
export const resendVerification = async (data: ResendVerificationRequest): Promise<ResendVerificationResponse> => {
  const response = await apiClient.post<ResendVerificationResponse>(`${API_PREFIX}/resend-verification`, data);
  return response.data;
};

// Export all as default object
const authService = {
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerification,
};

export default authService;
