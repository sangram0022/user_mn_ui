/**
 * Authentication Domain - Public API
 * @module domains/authentication
 * 
 * This module provides authentication functionality including:
 * - User login/logout
 * - User registration
 * - Password reset
 * - Session management
 * - Token management
 * - MFA (Multi-Factor Authentication)
 * 
 * @example
 * ```typescript
 * import { useLogin, LoginForm, AuthService } from '@domains/authentication';
 * 
 * function MyLoginPage() {
 *   const { login, isLoading, error } = useLogin();
 *   
 *   return <LoginForm onSubmit={login} isLoading={isLoading} error={error} />;
 * }
 * ```
 */

// Components
export { default as LoginForm } from './components/LoginForm';
export { default as RegisterForm } from './components/RegisterForm';
export { default as AuthGuard } from './components/AuthGuard';
export { default as PasswordResetForm } from './components/PasswordResetForm';

// Hooks
export { useLogin } from './hooks/useLogin';
export { useRegister } from './hooks/useRegister';
export { useAuthState } from './hooks/useAuthState';
export { useLogout } from './hooks/useLogout';
export { usePasswordReset } from './hooks/usePasswordReset';
export { useTokenRefresh } from './hooks/useTokenRefresh';

// Services
export { AuthService } from './services/AuthService';
export { TokenService } from './services/TokenService';
export { SessionService } from './services/SessionService';

// Types
export type {
  User,
  UserRole,
  AuthToken,
  UserSession,
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordData,
  AuthState,
  LoginResponse,
  RegisterResponse,
  TokenRefreshResponse,
  MFASetup,
  MFAVerification,
  AuthError,
} from './types';

export { 
  AuthStatus,
  AuthErrorCode,
  AuthEvent,
  AUTH_STORAGE_KEYS,
} from './types';
