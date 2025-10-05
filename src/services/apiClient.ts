// Complete API client for FastAPI backend integration
// Based on the official API documentation

import type { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  UserProfile, 
  CreateUserRequest,
  UpdateUserRequest,
  PasswordResetRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  AuditLog,
  AuditSummary,
  AuditLogsQuery,
  AdminUsersQuery,
  UserSummary
} from '../types';
import { ApiError } from '../utils/apiError';

export const API_CONFIG = {
  BASE_URL: import.meta.env.PROD 
    ? 'https://api.usermanagement.com'
    : 'http://localhost:8000/api/v1', // Direct backend URL with /api/v1 prefix
  
  ENDPOINTS: {
    // Authentication Endpoints (/auth)
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PASSWORD_RESET_REQUEST: '/auth/password-reset-request',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    REFRESH: '/auth/refresh',
    
    // Profile Endpoints (/profile)
    PROFILE_ME: '/profile/me',
    
    // Admin Endpoints (/admin)
    ADMIN_USERS: '/admin/users',
    ADMIN_USER_BY_ID: (userId: string) => `/admin/users/${userId}`,
    ADMIN_STATS: '/admin/stats',
    
    // Audit Endpoints (/audit)
    AUDIT_LOGS: '/audit/logs',
    AUDIT_SUMMARY: '/audit/summary'
  }
};

// HTTP client utility for API calls
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    // Try both possible token storage keys for backward compatibility
    this.token = localStorage.getItem('access_token') || localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
    localStorage.setItem('token', token); // Also store as 'token' for compatibility
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Ensure endpoint doesn't have double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseURL}${cleanEndpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
        }

        const errorPayload = await response.json().catch(() => undefined);
        const message = (errorPayload && typeof errorPayload.message === 'string' && errorPayload.message.trim().length > 0)
          ? errorPayload.message
          : (errorPayload && typeof errorPayload.detail === 'string'
            ? errorPayload.detail
            : `HTTP ${response.status}: ${response.statusText}`);

        throw new ApiError({
          status: response.status,
          message,
          code: typeof errorPayload?.code === 'string' ? errorPayload.code : undefined,
          detail: typeof errorPayload?.detail === 'string' ? errorPayload.detail : undefined,
          errors: errorPayload && typeof errorPayload.errors === 'object' ? errorPayload.errors as Record<string, unknown> : undefined,
          headers: response.headers,
          payload: errorPayload
        });
      }

      const responseBody = await response.json().catch(() => undefined);
      return responseBody as T;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('API Request failed with structured error:', error);
        throw error;
      }

      console.error('API Request failed:', error);

      if (error instanceof Error) {
        throw new ApiError({
          status: 0,
          message: error.message,
          code: 'NETWORK_ERROR'
        });
      }

      throw new ApiError({
        status: 0,
        message: 'Network request failed',
        code: 'NETWORK_ERROR'
      });
    }
  }

  // ============================================================================
  // Authentication Methods
  // ============================================================================

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    this.setToken(response.access_token);
    return response;
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return await this.request<RegisterResponse>(API_CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async logout(): Promise<{ message: string }> {
    try {
      const response = await this.request<{ message: string }>(API_CONFIG.ENDPOINTS.LOGOUT, {
        method: 'POST'
      });
      this.clearToken();
      return response;
    } catch (error) {
      // Even if logout fails on server, clear local token
      this.clearToken();
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return await this.request<{ message: string }>(API_CONFIG.ENDPOINTS.PASSWORD_RESET_REQUEST, {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return await this.request<{ message: string }>(API_CONFIG.ENDPOINTS.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword })
    });
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return await this.request<{ message: string }>(API_CONFIG.ENDPOINTS.VERIFY_EMAIL, {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  // ============================================================================
  // Profile Methods
  // ============================================================================

  async getUserProfile(): Promise<UserProfile> {
    return await this.request<UserProfile>(API_CONFIG.ENDPOINTS.PROFILE_ME);
  }

  async updateUserProfile(userData: UpdateUserRequest): Promise<UserProfile> {
    return await this.request<UserProfile>(API_CONFIG.ENDPOINTS.PROFILE_ME, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // ============================================================================
  // Admin Methods
  // ============================================================================

  async getUsers(params?: AdminUsersQuery): Promise<UserSummary[]> {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString() : '';

    return await this.request<UserSummary[]>(`${API_CONFIG.ENDPOINTS.ADMIN_USERS}${queryString}`);
  }

  async createUser(userData: CreateUserRequest): Promise<UserSummary> {
    return await this.request<UserSummary>(API_CONFIG.ENDPOINTS.ADMIN_USERS, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(userId: string, userData: Partial<CreateUserRequest>): Promise<UserSummary> {
    return await this.request<UserSummary>(API_CONFIG.ENDPOINTS.ADMIN_USER_BY_ID(userId), {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    return await this.request<{ message: string }>(API_CONFIG.ENDPOINTS.ADMIN_USER_BY_ID(userId), {
      method: 'DELETE'
    });
  }

  // ============================================================================
  // Audit Methods
  // ============================================================================

  async getAuditLogs(params?: AuditLogsQuery): Promise<AuditLog[]> {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString() : '';

    return await this.request<AuditLog[]>(`${API_CONFIG.ENDPOINTS.AUDIT_LOGS}${queryString}`);
  }

  async getAuditSummary(): Promise<AuditSummary> {
    return await this.request<AuditSummary>(API_CONFIG.ENDPOINTS.AUDIT_SUMMARY);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// React hook for easy API access
export const useApi = () => {
  return {
    // Authentication
    login: apiClient.login.bind(apiClient),
    register: apiClient.register.bind(apiClient),
    logout: apiClient.logout.bind(apiClient),
    requestPasswordReset: apiClient.requestPasswordReset.bind(apiClient),
    resetPassword: apiClient.resetPassword.bind(apiClient),
    verifyEmail: apiClient.verifyEmail.bind(apiClient),

    // Profile management
    getUserProfile: apiClient.getUserProfile.bind(apiClient),
    updateUserProfile: apiClient.updateUserProfile.bind(apiClient),

    // Admin operations
    getUsers: apiClient.getUsers.bind(apiClient),
    createUser: apiClient.createUser.bind(apiClient),
    updateUser: apiClient.updateUser.bind(apiClient),
    deleteUser: apiClient.deleteUser.bind(apiClient),

    // Audit operations
    getAuditLogs: apiClient.getAuditLogs.bind(apiClient),
    getAuditSummary: apiClient.getAuditSummary.bind(apiClient),

    // Utility
    isAuthenticated: apiClient.isAuthenticated.bind(apiClient)
  };
};

export default apiClient;
