// ========================================
// Authentication Service
// All API calls for authentication domain
// ========================================

import { apiClient } from '../../../services/api/apiClient';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  LogoutResponse,
  PasswordResetRequest,
  PasswordResetResponse,
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
} from '../types/auth.types';

const API_PREFIX = '/api/v1/auth';

/**
 * POST /api/v1/auth/login
 * Authenticate user with email and password
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(`${API_PREFIX}/login`, data);
  // Some backend APIs wrap the useful payload under `data` (e.g. { success, message, data: { ... } }).
  // Unwrap when present so the hook callers receive the expected flat LoginResponse shape.
  // If the API already returns the flat shape, just return it.
  // This makes the service resilient to both backend styles.
  const respData = (response.data as unknown) as Record<string, unknown>;
  if (respData && 'data' in respData && respData['data']) {
    const payload = respData['data'] as Record<string, unknown>;

    // If backend returned user fields at the top-level of payload (legacy style),
    // adapt it into the expected LoginResponse shape with a `user` object.
    if (payload && !('user' in payload) && ('user_id' in payload || 'email' in payload)) {
      const access_token = (payload['access_token'] as string) || '';
      const refresh_token = (payload['refresh_token'] as string) || '';
  const token_type = (payload['token_type'] as string) ?? 'bearer';
      const expires_in = (payload['expires_in'] as number) || 0;

      const user = {
        user_id: (payload['user_id'] as string) || (payload['userId'] as string) || '',
        email: (payload['email'] as string) || '',
        first_name: (payload['first_name'] as string) || '',
        last_name: (payload['last_name'] as string) || '',
        roles: (payload['roles'] as string[]) || [],
        is_active: !!payload['is_active'],
        is_verified: !!payload['is_verified'],
      } as Partial<import('../types/auth.types').User>;

      return {
        access_token,
        refresh_token,
        token_type,
        expires_in,
        user,
      } as LoginResponse;
    }

  return payload as unknown as LoginResponse;
  }

  return response.data as LoginResponse;
};

/**
 * POST /api/v1/auth/register
 * Register a new user account
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>(`${API_PREFIX}/register`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/logout
 * Logout the current user
 */
export const logout = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post<LogoutResponse>(`${API_PREFIX}/logout`);
  return response.data;
};

/**
 * POST /api/v1/auth/password-reset
 * Request a password reset link
 */
export const passwordReset = async (data: PasswordResetRequest): Promise<PasswordResetResponse> => {
  const response = await apiClient.post<PasswordResetResponse>(`${API_PREFIX}/password-reset`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/reset-password
 * Reset password using token from email
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse>(`${API_PREFIX}/reset-password`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/forgot-password
 * Initiate forgot password flow
 */
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse>(`${API_PREFIX}/forgot-password`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/change-password
 * Change password for authenticated user
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  const response = await apiClient.post<ChangePasswordResponse>(`${API_PREFIX}/change-password`, data);
  return response.data;
};

/**
 * POST /api/v1/auth/verify-email
 * Verify email using token from email
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
  passwordReset,
  resetPassword,
  forgotPassword,
  changePassword,
  verifyEmail,
  resendVerification,
};

export default authService;

