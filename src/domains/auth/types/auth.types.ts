// ========================================
// Authentication Types
// ========================================

/**
 * User object returned from authentication endpoints
 */
export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  is_active: boolean;
  is_verified: boolean;
  created_at?: string;
  last_login?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

// ========================================
// Login
// ========================================

/**
 * POST /api/v1/auth/login - Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * POST /api/v1/auth/login - Login response
 */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: User;
}

// ========================================
// Register
// ========================================

/**
 * POST /api/v1/auth/register - Register request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

/**
 * POST /api/v1/auth/register - Register response
 */
export interface RegisterResponse {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  message: string;
  verification_sent: boolean;
  created_at: string;
}

// ========================================
// Logout
// ========================================

/**
 * POST /api/v1/auth/logout - Logout response
 */
export interface LogoutResponse {
  message: string;
  user_id: string;
  logged_out_at: string;
}

// ========================================
// Password Reset
// ========================================

/**
 * POST /api/v1/auth/password-reset - Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * POST /api/v1/auth/password-reset - Password reset response
 */
export interface PasswordResetResponse {
  message: string;
  email: string;
  reset_token_sent: boolean;
}

/**
 * POST /api/v1/auth/reset-password - Reset password with token request
 */
export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

/**
 * POST /api/v1/auth/reset-password - Reset password with token response
 */
export interface ResetPasswordResponse {
  message: string;
  user_id: string;
}

// ========================================
// Forgot Password
// ========================================

/**
 * POST /api/v1/auth/forgot-password - Forgot password request
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * POST /api/v1/auth/forgot-password - Forgot password response
 */
export interface ForgotPasswordResponse {
  message: string;
  email: string;
}

// ========================================
// Change Password
// ========================================

/**
 * POST /api/v1/auth/change-password - Change password request
 */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

/**
 * POST /api/v1/auth/change-password - Change password response
 */
export interface ChangePasswordResponse {
  message: string;
}

// ========================================
// Email Verification
// ========================================

/**
 * POST /api/v1/auth/verify-email - Verify email request
 */
export interface VerifyEmailRequest {
  token: string;
}

/**
 * POST /api/v1/auth/verify-email - Verify email response
 */
export interface VerifyEmailResponse {
  message: string;
  user_id: string;
  email: string;
  verified_at: string;
}

/**
 * POST /api/v1/auth/resend-verification - Resend verification request
 */
export interface ResendVerificationRequest {
  email: string;
}

/**
 * POST /api/v1/auth/resend-verification - Resend verification response
 */
export interface ResendVerificationResponse {
  message: string;
  email: string;
}

// ========================================
// Secure Authentication (httpOnly Cookies)
// ========================================

/**
 * POST /api/v1/auth/login-secure - Secure login response
 */
export interface SecureLoginResponse {
  message: string;
  user: User;
  csrf_token: string;
}

/**
 * POST /api/v1/auth/logout-secure - Secure logout response
 */
export interface SecureLogoutResponse {
  message: string;
  user_id: string;
  logged_out_at: string;
}

/**
 * POST /api/v1/auth/refresh-secure - Secure refresh response
 */
export interface SecureRefreshResponse {
  message: string;
}

