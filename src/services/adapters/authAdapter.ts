/**
 * Authentication adapter functions
 * Provides backward-compatible API wrappers for authentication operations
 */

import baseApiClient from '../apiClient';
import type {
  RegisterRequest,
  ResetPasswordRequest,
  ResendVerificationRequest,
  ChangePasswordRequest
} from '../../types';
import type {
  StandardResponse,
  RegisterResponseWrapper,
  ActionResponse
} from './types';
import { createSuccessResponse } from './types';

/**
 * Registration payload with optional fields
 */
export interface RegisterPayload {
  email: string;
  password: string;
  confirm_password?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  terms_accepted?: boolean;
}

/**
 * Register a new user
 */
export async function register(payload: RegisterPayload): Promise<RegisterResponseWrapper> {
  const request: RegisterRequest = {
    email: payload.email,
    password: payload.password,
    confirm_password: payload.confirm_password ?? payload.password,
    first_name: payload.first_name ?? '',
    last_name: payload.last_name ?? '',
    username: payload.username
  };

  const response = await baseApiClient.register(request);
  
  return {
    success: true,
    data: response,
    message: response.message
  };
}

/**
 * Request password reset
 */
export async function forgotPassword(
  input: { email: string } | string
): Promise<StandardResponse> {
  const email = typeof input === 'string' ? input : input.email;
  const response = await baseApiClient.forgotPassword(email);
  
  return {
    success: response.success ?? true,
    message: response.message ?? 'Password reset link sent if the email exists.'
  };
}

/**
 * Reset password with token
 */
export async function resetPassword(
  payload: ResetPasswordRequest
): Promise<StandardResponse> {
  const response = await baseApiClient.resetPassword(payload);
  
  return {
    success: true,
    message: response.message
  };
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string): Promise<ActionResponse> {
  const response = await baseApiClient.resendVerification(
    { email } satisfies ResendVerificationRequest
  );
  
  return {
    success: true,
    message: response.message,
    data: response
  };
}

/**
 * Verify email with token
 */
export async function verifyEmail(payload: { token: string }): Promise<ActionResponse> {
  const response = await baseApiClient.verifyEmail(payload.token);
  
  return {
    success: true,
    message: response.message,
    data: response
  };
}

/**
 * Change user password
 */
export async function changePassword(
  payload: ChangePasswordRequest
): Promise<ActionResponse> {
  const response = await baseApiClient.changePassword(payload);
  
  return createSuccessResponse(
    response,
    response.message ?? 'Password changed successfully.'
  );
}
