// ========================================
// Authentication Hooks
// Production-ready React hooks for all auth operations
// Follows SOLID principles and Clean Code practices
// Migrated to useApiModern for consistency
// ========================================

import { useApiMutation } from '@/shared/hooks/useApiModern';
import { apiClient } from '@/services/api/apiClient';
import { API_PREFIXES } from '@/services/api/common';
import type {
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  RegisterResponseData,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  RefreshTokenResponseData,
  LogoutResponse,
} from '../types/auth.types';

const API_PREFIX = API_PREFIXES.AUTH;

// ========================================
// useLogin Hook
// POST /api/v1/auth/login
// ========================================

export function useLogin() {
  return useApiMutation(
    async (credentials: LoginRequest): Promise<LoginResponseData> => {
      // Backend returns LoginResponse directly (not wrapped in ApiResponse)
      // So we use apiClient.post directly instead of apiPost helper
      const response = await apiClient.post<LoginResponseData>(`${API_PREFIX}/login`, credentials);
      return response.data;
    },
    {
      successMessage: 'Login successful',
      errorToast: true,
    }
  );
}

// ========================================
// useRegister Hook
// POST /api/v1/auth/register
// ========================================

export function useRegister() {
  return useApiMutation(
    async (data: RegisterRequest): Promise<RegisterResponseData> => {
      // Backend returns RegisterResponse directly (not wrapped in ApiResponse)
      // So we use apiClient.post directly instead of apiPost helper
      const response = await apiClient.post<RegisterResponseData>(`${API_PREFIX}/register`, data);
      return response.data;
    },
    {
      successMessage: 'Registration successful! Please check your email.',
      errorToast: true,
    }
  );
}

// ========================================
// useForgotPassword Hook
// POST /api/v1/auth/forgot-password
// ========================================

export function useForgotPassword() {
  return useApiMutation(
    async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
      // Backend returns response directly (not wrapped in ApiResponse)
      const response = await apiClient.post<ForgotPasswordResponse>(
        `${API_PREFIX}/forgot-password`,
        data
      );
      return response.data;
    },
    {
      successMessage: 'Password reset link sent! Check your email.',
      errorToast: true,
    }
  );
}

// ========================================
// useResetPassword Hook
// POST /api/v1/auth/reset-password
// ========================================

export function useResetPassword() {
  return useApiMutation(
    async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
      // Backend returns response directly (not wrapped in ApiResponse)
      const response = await apiClient.post<ResetPasswordResponse>(
        `${API_PREFIX}/reset-password`,
        data
      );
      return response.data;
    },
    {
      successMessage: 'Password reset successful! You can now login.',
      errorToast: true,
    }
  );
}

// ========================================
// useChangePassword Hook
// POST /api/v1/auth/change-password
// ========================================

export function useChangePassword() {
  return useApiMutation(
    async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
      // Backend returns response directly (not wrapped in ApiResponse)
      const response = await apiClient.post<ChangePasswordResponse>(
        `${API_PREFIX}/change-password`,
        data
      );
      return response.data;
    },
    {
      successMessage: 'Password changed successfully!',
      errorToast: true,
    }
  );
}

// ========================================
// useVerifyEmail Hook
// POST /api/v1/auth/verify-email
// ========================================

export function useVerifyEmail() {
  return useApiMutation(
    async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
      // Backend returns response directly (not wrapped in ApiResponse)
      const response = await apiClient.post<VerifyEmailResponse>(
        `${API_PREFIX}/verify-email`,
        data
      );
      return response.data;
    },
    {
      successMessage: 'Email verified successfully!',
      errorToast: true,
    }
  );
}

// ========================================
// useResendVerification Hook
// POST /api/v1/auth/resend-verification
// ========================================

export function useResendVerification() {
  return useApiMutation(
    async (data: ResendVerificationRequest): Promise<ResendVerificationResponse> => {
      // Backend returns response directly (not wrapped in ApiResponse)
      const response = await apiClient.post<ResendVerificationResponse>(
        `${API_PREFIX}/resend-verification`,
        data
      );
      return response.data;
    },
    {
      successMessage: 'Verification email sent! Check your inbox.',
      errorToast: true,
    }
  );
}

// ========================================
// useLogout Hook
// POST /api/v1/auth/logout
// ========================================

export function useLogout() {
  return useApiMutation(
    async (): Promise<LogoutResponse> => {
      // Backend returns response directly (not wrapped in ApiResponse)
      const response = await apiClient.post<LogoutResponse>(`${API_PREFIX}/logout`, null);
      return response.data;
    },
    {
      successMessage: 'Logged out successfully',
      errorToast: false, // Logout errors shouldn't block UI
    }
  );
}

// ========================================
// useRefreshToken Hook
// POST /api/v1/auth/refresh
// ========================================

export function useRefreshToken() {
  return useApiMutation(
    async (refreshTokenValue: string): Promise<RefreshTokenResponseData> => {
      // Backend returns RefreshTokenResponse directly (not wrapped in ApiResponse)
      // So we use apiClient.post directly instead of apiPost helper
      const response = await apiClient.post<RefreshTokenResponseData>(
        `${API_PREFIX}/refresh`,
        { refresh_token: refreshTokenValue }
      );
      return response.data;
    },
    {
      errorToast: false, // Silent refresh failures
    }
  );
}
