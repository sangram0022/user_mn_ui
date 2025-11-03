// ========================================
// Authentication Types
// Complete type definitions matching backend API v1.0.0
// ========================================

/**
 * Base API Response Wrapper
 * All responses follow this standard format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  message_code: string;
  timestamp: string;
  data?: T;
  errors?: FieldError[];
  field_errors?: Record<string, string[]>;
  request_id: string;
  api_version: string;
}

/**
 * Field Error Structure
 */
export interface FieldError {
  field: string;
  code: string;
  message: string;
}

/**
 * User object returned from authentication endpoints
 * Matches backend User schema exactly
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
  last_login?: string | null;
  updated_at?: string | null;
  status?: 'active' | 'inactive' | 'suspended';
  phone_number?: string | null;
  avatar_url?: string | null;
  username?: string;
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
 * Login Response Data (unwrapped from ApiResponse)
 */
export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
  refresh_expires_in: number;
  user_id: string;
  email: string;
  roles: string[];
  last_login_at: string | null;
}

/**
 * POST /api/v1/auth/login - Complete login response
 */
export interface LoginResponse extends ApiResponse<LoginResponseData> {
  success: true;
  message_code: 'AUTH_LOGIN_SUCCESS';
}

// ========================================
// Register
// ========================================

/**
 * POST /api/v1/auth/register - Register request payload
 * Note: Must provide either (first_name AND last_name) OR full_name
 */
export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  username?: string;
  terms_accepted?: boolean;
}

/**
 * Register Response Data (unwrapped from ApiResponse)
 */
export interface RegisterResponseData {
  user_id: string;
  email: string;
  verification_required: boolean;
  approval_required: boolean;
  created_at: string;
}

/**
 * POST /api/v1/auth/register - Complete register response
 */
export interface RegisterResponse extends ApiResponse<RegisterResponseData> {
  success: true;
  message_code: 'AUTH_REGISTER_SUCCESS';
}

// ========================================
// Logout
// ========================================

/**
 * POST /api/v1/auth/logout - Logout response
 */
export interface LogoutResponse {
  message: string;
}

// ========================================
// Refresh Token
// ========================================

/**
 * Refresh Token Response Data (unwrapped from ApiResponse)
 */
export interface RefreshTokenResponseData {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
  refresh_expires_in: number;
  user_id: string;
  email: string;
  roles: string[];
  last_login_at: string | null;
}

/**
 * POST /api/v1/auth/refresh - Complete refresh token response
 */
export interface RefreshTokenResponse extends ApiResponse<RefreshTokenResponseData> {
  success: true;
  message_code: 'AUTH_TOKEN_REFRESHED';
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
 * Note: Always returns success to prevent email enumeration
 */
export interface ForgotPasswordResponse {
  success: true;
  message: string;
  email: string;
  requested_at: string;
}

// ========================================
// Reset Password
// ========================================

/**
 * POST /api/v1/auth/reset-password - Reset password with token request
 */
export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}

/**
 * POST /api/v1/auth/reset-password - Reset password response
 */
export interface ResetPasswordResponse {
  success: true;
  message: string;
  reset_at: string;
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
  confirm_password: string;
}

/**
 * POST /api/v1/auth/change-password - Change password response
 */
export interface ChangePasswordResponse {
  success: true;
  message: string;
  changed_at: string;
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
  success: true;
  message: string;
  verified_at: string | null;
  approval_required: boolean;
  user_id: string | null;
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
  success: true;
  message: string;
  email: string;
  resent_at: string;
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

// ========================================
// Common Error Message Codes
// For frontend i18n localization
// ========================================

export const AUTH_ERROR_CODES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH_EMAIL_NOT_VERIFIED',
  AUTH_ACCOUNT_INACTIVE: 'AUTH_ACCOUNT_INACTIVE',
  AUTH_EMAIL_ALREADY_EXISTS: 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // System
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export type AuthErrorCode = typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES];

// ========================================
// Validation Rules (matching backend)
// ========================================

export const VALIDATION_RULES = {
  EMAIL: {
    MAX_LENGTH: 255,
    PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}:;"'`~<>,.?/])[A-Za-z\d!@#$%^&*()_+\-={}:;"'`~<>,.?/]{8,128}$/,
    REQUIREMENTS: {
      UPPERCASE: /[A-Z]/,
      LOWERCASE: /[a-z]/,
      DIGIT: /\d/,
      SPECIAL: /[!@#$%^&*()_+\-={}:;"'`~<>,.?/]/,
    },
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]+$/,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    PATTERN: /^\+?[1-9]\d{9,14}$/,
  },
} as const;
