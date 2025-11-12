/**
 * Auth Data Transformers
 * Transforms authentication API responses to frontend models
 * Handles token parsing, session transformation, and auth state management
 * 
 * Purpose: Decouple auth API responses from UI auth state
 */

import type { 
  LoginResponseData as ApiLoginResponse,
  RefreshTokenResponseData as ApiRefreshTokenResponse,
  RegisterResponseData as ApiRegisterResponse 
} from '@/domains/auth/types/auth.types';

// ============================================================================
// Frontend Auth Models
// ============================================================================

export interface AuthTokensUI {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
  expiresAt: Date;
  refreshExpiresAt: Date;
  
  // Computed properties
  isExpired: () => boolean;
  isRefreshExpired: () => boolean;
  willExpireSoon: (thresholdSeconds?: number) => boolean;
  timeUntilExpiry: () => number;
  formattedExpiryTime: () => string;
}

export interface AuthSessionUI {
  userId: string;
  email: string;
  roles: string[];
  lastLoginAt: string | null;
  tokens: AuthTokensUI;
  
  // Computed properties
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  canAccess: (requiredRoles: string[]) => boolean;
}

export interface RegistrationResultUI {
  userId: string;
  email: string;
  verificationRequired: boolean;
  approvalRequired: boolean;
  createdAt: Date;
  
  // Computed properties
  needsAction: boolean;
  nextStep: string;
  statusMessage: string;
}

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transform API login/refresh response to UI auth session
 * Parses tokens and adds computed properties
 * 
 * @param apiResponse - Login or refresh token response from API
 * @returns UI-friendly auth session with token utilities
 */
export function transformAuthSession(
  apiResponse: ApiLoginResponse | ApiRefreshTokenResponse
): AuthSessionUI {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + apiResponse.expires_in * 1000);
  const refreshExpiresAt = new Date(now.getTime() + apiResponse.refresh_expires_in * 1000);
  
  const tokens: AuthTokensUI = {
    accessToken: apiResponse.access_token,
    refreshToken: apiResponse.refresh_token,
    tokenType: apiResponse.token_type,
    expiresIn: apiResponse.expires_in,
    refreshExpiresIn: apiResponse.refresh_expires_in,
    expiresAt,
    refreshExpiresAt,
    
    // Token utility functions
    isExpired: () => new Date() >= expiresAt,
    isRefreshExpired: () => new Date() >= refreshExpiresAt,
    willExpireSoon: (thresholdSeconds = 300) => {
      const timeLeft = expiresAt.getTime() - new Date().getTime();
      return timeLeft < thresholdSeconds * 1000;
    },
    timeUntilExpiry: () => {
      const timeLeft = expiresAt.getTime() - new Date().getTime();
      return Math.max(0, Math.floor(timeLeft / 1000));
    },
    formattedExpiryTime: () => {
      const seconds = Math.floor((expiresAt.getTime() - new Date().getTime()) / 1000);
      if (seconds < 60) return `${seconds}s`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      return `${hours}h ${minutes % 60}m`;
    },
  };
  
  const roles = apiResponse.roles || [];
  
  return {
    userId: apiResponse.user_id,
    email: apiResponse.email,
    roles,
    lastLoginAt: apiResponse.last_login_at,
    tokens,
    
    // Session utility functions
    isAuthenticated: true,
    hasRole: (role: string) => roles.includes(role),
    hasAnyRole: (checkRoles: string[]) => checkRoles.some(role => roles.includes(role)),
    hasAllRoles: (checkRoles: string[]) => checkRoles.every(role => roles.includes(role)),
    canAccess: (requiredRoles: string[]) => {
      if (requiredRoles.length === 0) return true;
      return requiredRoles.some(role => roles.includes(role));
    },
  };
}

/**
 * Transform API registration response to UI registration result
 * Adds computed properties for next steps and status
 * 
 * @param apiResponse - Registration response from API
 * @returns UI-friendly registration result with next steps
 */
export function transformRegistrationResult(
  apiResponse: ApiRegisterResponse
): RegistrationResultUI {
  const createdAt = new Date(apiResponse.created_at);
  const needsAction = apiResponse.verification_required || apiResponse.approval_required;
  
  let nextStep = 'Complete';
  let statusMessage = 'Your account has been created successfully.';
  
  if (apiResponse.verification_required && apiResponse.approval_required) {
    nextStep = 'Verify Email & Wait for Approval';
    statusMessage = 'Please verify your email and wait for admin approval to access your account.';
  } else if (apiResponse.verification_required) {
    nextStep = 'Verify Email';
    statusMessage = 'Please check your email and click the verification link to activate your account.';
  } else if (apiResponse.approval_required) {
    nextStep = 'Wait for Approval';
    statusMessage = 'Your account is pending admin approval. You will be notified via email once approved.';
  }
  
  return {
    userId: apiResponse.user_id,
    email: apiResponse.email,
    verificationRequired: apiResponse.verification_required,
    approvalRequired: apiResponse.approval_required,
    createdAt,
    
    // Computed properties
    needsAction,
    nextStep,
    statusMessage,
  };
}

/**
 * Parse JWT token payload (without verification)
 * Note: This is for client-side inspection only, NOT for security validation
 * 
 * @param token - JWT access or refresh token
 * @returns Decoded token payload
 */
export function parseJwtToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Extract user info from JWT token
 * 
 * @param token - JWT access token
 * @returns User info extracted from token claims
 */
export function extractUserInfoFromToken(token: string): {
  userId?: string;
  email?: string;
  roles?: string[];
  exp?: number;
  iat?: number;
} {
  const payload = parseJwtToken(token);
  if (!payload) return {};
  
  return {
    userId: payload.sub as string | undefined,
    email: payload.email as string | undefined,
    roles: payload.roles as string[] | undefined,
    exp: payload.exp as number | undefined,
    iat: payload.iat as number | undefined,
  };
}

/**
 * Check if token is expired (from JWT payload)
 * 
 * @param token - JWT token to check
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const info = extractUserInfoFromToken(token);
  if (!info.exp) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return now >= info.exp;
}

/**
 * Get token expiry time in seconds
 * 
 * @param token - JWT token
 * @returns Seconds until expiry (0 if expired or invalid)
 */
export function getTokenExpiryTime(token: string): number {
  const info = extractUserInfoFromToken(token);
  if (!info.exp) return 0;
  
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, info.exp - now);
}

// ============================================================================
// Reverse Transformers (UI to API)
// ============================================================================

/**
 * Transform UI login data to API login request
 * Currently a pass-through since both use the same format
 * Included for consistency and future extensibility
 * 
 * @param email - User email
 * @param password - User password
 * @returns API-compatible login request
 */
export function transformLoginToApi(email: string, password: string): {
  email: string;
  password: string;
} {
  return { email, password };
}

/**
 * Transform UI registration data to API registration request
 * Handles name field mapping (first_name/last_name or full_name)
 * 
 * @param data - Registration form data from UI
 * @returns API-compatible registration request
 */
export function transformRegistrationToApi(data: {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  termsAccepted?: boolean;
}): Record<string, unknown> {
  const apiData: Record<string, unknown> = {
    email: data.email,
    password: data.password,
  };
  
  if (data.confirmPassword) apiData.confirm_password = data.confirmPassword;
  if (data.firstName) apiData.first_name = data.firstName;
  if (data.lastName) apiData.last_name = data.lastName;
  if (data.fullName) apiData.full_name = data.fullName;
  if (data.username) apiData.username = data.username;
  if (data.termsAccepted !== undefined) apiData.terms_accepted = data.termsAccepted;
  
  return apiData;
}

