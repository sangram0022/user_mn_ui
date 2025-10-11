import { AuthToken, LoginCredentials, RegisterData, User } from '../types/auth.types';

const API_BASE = 'http://localhost:8000/api/v1';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<{ user: User; token: AuthToken }> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();

    // Transform API response to match our types
    return {
      user: {
        id: data.user_id,
        email: data.email,
        username: data.username || data.email.split('@')[0],
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        permissions: data.permissions || [],
        isActive: data.is_active ?? true,
        isVerified: data.is_verified ?? true,
        createdAt: new Date(data.created_at || Date.now()),
        updatedAt: new Date(data.updated_at || Date.now()),
        lastLoginAt: data.last_login_at ? new Date(data.last_login_at) : undefined,
      },
      token: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenType: 'Bearer',
        expiresIn: data.expires_in || 3600,
        expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
      },
    };
  }

  static async register(data: RegisterData): Promise<ApiResponse<{ user_id: string }>> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
        first_name: data.firstName,
        last_name: data.lastName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  static async refreshToken(refreshToken: string): Promise<{ token: AuthToken }> {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Token refresh failed');
    }

    const data = await response.json();

    return {
      token: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenType: 'Bearer',
        expiresIn: data.expires_in || 3600,
        expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
      },
    };
  }

  static async logout(token: string): Promise<void> {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Logout failed');
    }
  }

  static async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${API_BASE}/profile/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user');
    }

    const data = await response.json();

    return {
      id: data.user_id,
      email: data.email,
      username: data.username || data.email.split('@')[0],
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
      permissions: data.permissions || [],
      isActive: data.is_active ?? true,
      isVerified: data.is_verified ?? true,
      createdAt: new Date(data.created_at || Date.now()),
      updatedAt: new Date(data.updated_at || Date.now()),
      lastLoginAt: data.last_login_at ? new Date(data.last_login_at) : undefined,
    };
  }
}
