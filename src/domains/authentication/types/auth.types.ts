/**
 * Authentication Domain - Type Definitions
 * @module domains/authentication/types
 */

/**
 * User role enumeration
 */
export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  GUEST = 'guest',
}

/**
 * Authentication status
 */
export enum AuthStatus {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  PENDING = 'pending',
  ERROR = 'error',
}

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  permissions: string[];
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

/**
 * Authentication token
 */
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  expiresAt: Date;
}

/**
 * User session
 */
export interface UserSession {
  user: User;
  token: AuthToken;
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
  deviceInfo?: {
    userAgent: string;
    ip?: string;
    device?: string;
  };
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  acceptTerms: boolean;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Change password data
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  status: AuthStatus;
  user: User | null;
  token: AuthToken | null;
  session: UserSession | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: User;
  token: AuthToken;
  session: UserSession;
}

/**
 * Register response
 */
export interface RegisterResponse {
  user: User;
  requiresVerification: boolean;
  message: string;
}

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
  accessToken: string;
  expiresIn: number;
  expiresAt: Date;
}

/**
 * MFA (Multi-Factor Authentication) setup
 */
export interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

/**
 * MFA verification
 */
export interface MFAVerification {
  code: string;
  trustDevice?: boolean;
}

/**
 * Authentication error codes
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  MFA_REQUIRED = 'MFA_REQUIRED',
  MFA_INVALID = 'MFA_INVALID',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Authentication error
 */
export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Session storage keys
 */
export const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth:token',
  USER: 'auth:user',
  SESSION: 'auth:session',
  REMEMBER_ME: 'auth:remember_me',
  DEVICE_ID: 'auth:device_id',
} as const;

/**
 * Authentication events
 */
export enum AuthEvent {
  LOGIN_SUCCESS = 'auth:login:success',
  LOGIN_FAILURE = 'auth:login:failure',
  LOGOUT = 'auth:logout',
  REGISTER_SUCCESS = 'auth:register:success',
  REGISTER_FAILURE = 'auth:register:failure',
  TOKEN_REFRESHED = 'auth:token:refreshed',
  TOKEN_EXPIRED = 'auth:token:expired',
  SESSION_EXPIRED = 'auth:session:expired',
  PERMISSION_DENIED = 'auth:permission:denied',
}
