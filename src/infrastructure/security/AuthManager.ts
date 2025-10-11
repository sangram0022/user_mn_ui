/**
 * Authentication manager for handling user authentication and authorization
 */

import { errorTracker } from '../monitoring/ErrorTracker';
import { logger } from '../monitoring/logger';

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export class AuthManager {
  private static instance: AuthManager;
  private authState: AuthState = {
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
  private listeners: Array<(state: AuthState) => void> = [];
  private refreshTimeout: NodeJS.Timeout | null = null;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  constructor() {
    this.loadAuthState();
    this.setupTokenRefresh();
  }

  private loadAuthState(): void {
    try {
      const storedUser = localStorage.getItem('auth_user');
      const storedTokens = localStorage.getItem('auth_tokens');

      if (storedUser && storedTokens) {
        const user = JSON.parse(storedUser);
        const tokens = JSON.parse(storedTokens);

        // Check if tokens are still valid
        if (new Date(tokens.expiresAt) > new Date()) {
          this.authState = {
            ...this.authState,
            user,
            tokens: {
              ...tokens,
              expiresAt: new Date(tokens.expiresAt),
            },
            isAuthenticated: true,
          };

          logger.info('Authentication state restored from storage');
        } else {
          this.clearAuthState();
          logger.info('Stored tokens expired, cleared auth state');
        }
      }
    } catch (error) {
      errorTracker.trackError(
        error as Error,
        { component: 'AuthManager', action: 'load_auth_state' },
        'medium'
      );
      this.clearAuthState();
    }
  }

  private saveAuthState(): void {
    try {
      if (this.authState.user && this.authState.tokens) {
        localStorage.setItem('auth_user', JSON.stringify(this.authState.user));
        localStorage.setItem(
          'auth_tokens',
          JSON.stringify({
            ...this.authState.tokens,
            expiresAt: this.authState.tokens.expiresAt.toISOString(),
          })
        );
      } else {
        this.clearStoredAuthState();
      }
    } catch (error) {
      errorTracker.trackError(
        error as Error,
        { component: 'AuthManager', action: 'save_auth_state' },
        'medium'
      );
    }
  }

  private clearStoredAuthState(): void {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_tokens');
  }

  private clearAuthState(): void {
    this.authState = {
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
    this.clearStoredAuthState();
    this.clearTokenRefresh();
  }

  private setupTokenRefresh(): void {
    if (this.authState.tokens && this.authState.tokens.expiresAt) {
      const timeUntilExpiry = this.authState.tokens.expiresAt.getTime() - Date.now();
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60 * 1000); // 5 minutes before expiry, but at least 1 minute

      this.refreshTimeout = setTimeout(() => {
        this.refreshTokens();
      }, refreshTime);
    }
  }

  private clearTokenRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  private async refreshTokens(): Promise<void> {
    if (!this.authState.tokens?.refreshToken) {
      this.logout();
      return;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.authState.tokens.refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newTokens: AuthTokens = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: new Date(data.expiresAt),
          tokenType: data.tokenType || 'Bearer',
        };

        this.updateAuthState({
          tokens: newTokens,
        });

        this.setupTokenRefresh();
        logger.info('Tokens refreshed successfully');
      } else {
        logger.warn('Token refresh failed, logging out user');
        this.logout();
      }
    } catch (error) {
      errorTracker.trackError(
        error as Error,
        { component: 'AuthManager', action: 'refresh_tokens' },
        'high'
      );
      this.logout();
    }
  }

  private updateAuthState(updates: Partial<AuthState>): void {
    this.authState = { ...this.authState, ...updates };
    this.saveAuthState();
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.authState);
      } catch (error) {
        errorTracker.trackError(
          error as Error,
          { component: 'AuthManager', action: 'notify_listeners' },
          'low'
        );
      }
    });
  }

  // Public API methods

  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    this.updateAuthState({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          roles: data.user.roles || [],
          permissions: data.user.permissions || [],
          isActive: data.user.isActive !== false,
          lastLoginAt: data.user.lastLoginAt ? new Date(data.user.lastLoginAt) : undefined,
          createdAt: new Date(data.user.createdAt),
          updatedAt: new Date(data.user.updatedAt),
        };

        const tokens: AuthTokens = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: new Date(data.expiresAt),
          tokenType: data.tokenType || 'Bearer',
        };

        this.updateAuthState({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        this.setupTokenRefresh();
        logger.info(`User ${user.email} logged in successfully`);

        return { success: true };
      } else {
        const errorMessage = data.message || 'Login failed';
        this.updateAuthState({
          isLoading: false,
          error: errorMessage,
        });

        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Network error during login';
      errorTracker.trackError(
        error as Error,
        { component: 'AuthManager', action: 'login' },
        'high'
      );

      this.updateAuthState({
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }

  async register(registerData: RegisterData): Promise<{ success: boolean; error?: string }> {
    this.updateAuthState({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok) {
        this.updateAuthState({ isLoading: false, error: null });
        logger.info(`User ${registerData.email} registered successfully`);
        return { success: true };
      } else {
        const errorMessage = data.message || 'Registration failed';
        this.updateAuthState({
          isLoading: false,
          error: errorMessage,
        });

        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Network error during registration';
      errorTracker.trackError(
        error as Error,
        { component: 'AuthManager', action: 'register' },
        'high'
      );

      this.updateAuthState({
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }

  logout(): void {
    try {
      // Call logout endpoint to invalidate tokens on server
      if (this.authState.tokens?.accessToken) {
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.authState.tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          // Silent fail for logout endpoint
        });
      }
    } catch (error) {
      // Silent fail
    }

    logger.info('User logged out');
    this.clearAuthState();
    this.notifyListeners();
  }

  async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        logger.info(`Password reset requested for ${email}`);
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Failed to send reset email' };
      }
    } catch (error) {
      errorTracker.trackError(
        error as Error,
        { component: 'AuthManager', action: 'forgot_password' },
        'medium'
      );

      return { success: false, error: 'Network error during password reset request' };
    }
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        logger.info('Password reset successfully');
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Failed to reset password' };
      }
    } catch (error) {
      errorTracker.trackError(
        error as Error,
        { component: 'AuthManager', action: 'reset_password' },
        'medium'
      );

      return { success: false, error: 'Network error during password reset' };
    }
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  getUser(): AuthUser | null {
    return this.authState.user;
  }

  getTokens(): AuthTokens | null {
    return this.authState.tokens;
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  hasRole(role: string): boolean {
    return this.authState.user?.roles.includes(role) || false;
  }

  hasPermission(permission: string): boolean {
    return this.authState.user?.permissions.includes(permission) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  destroy(): void {
    this.clearTokenRefresh();
    this.listeners = [];
    this.clearAuthState();
  }
}

// Create singleton instance
export const authManager = AuthManager.getInstance();

export default authManager;
