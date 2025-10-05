// Complete API client for FastAPI backend integration
// Based on the official API documentation

import type {
  RegisterRequest,
  RegisterResponse,
  LoginResponse,
  UserProfile,
  CreateUserRequest,
  UpdateUserRequest,
  AuditLog,
  AuditSummary,
  AuditLogsQuery,
  AdminUsersQuery,
  UserSummary,
  UserAnalytics,
  PendingWorkflow
} from '../types';
import { ApiError } from '../utils/apiError';
import { normalizeApiError } from '../utils/apiErrorNormalizer';

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
    ADMIN_ANALYTICS: '/admin/analytics',
    
    // Audit Endpoints (/audit)
    AUDIT_LOGS: '/audit/logs',
    AUDIT_SUMMARY: '/audit/summary',

    // Workflow Endpoints
    PENDING_APPROVALS: '/workflows/pending'
  }
};

// HTTP client utility for API calls
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    // Try both possible token storage keys for backward compatibility
    this.token = this.getFromStorage('access_token') || this.getFromStorage('token');
  }

  setToken(token: string) {
    this.token = token;
    this.setInStorage('access_token', token);
    this.setInStorage('token', token); // Also store as 'token' for compatibility
  }

  clearToken() {
    this.token = null;
    this.removeFromStorage('access_token');
    this.removeFromStorage('token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private getLocalStorage(): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      return window.localStorage;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Unable to access localStorage:', error);
      }
      return null;
    }
  }

  private getFromStorage(key: string): string | null {
    const storage = this.getLocalStorage();
    return storage?.getItem(key) ?? null;
  }

  private setInStorage(key: string, value: string): void {
    const storage = this.getLocalStorage();
    storage?.setItem(key, value);
  }

  private removeFromStorage(key: string): void {
    const storage = this.getLocalStorage();
    storage?.removeItem(key);
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

        const errorPayload = await this.parseJson(response);
        const normalized = normalizeApiError(response.status, response.statusText, errorPayload);

        throw new ApiError({
          status: normalized.status,
          message: normalized.message,
          code: normalized.code,
          detail: normalized.detail,
          errors: normalized.errors,
          headers: response.headers,
          payload: errorPayload
        });
      }

      const responseBody = await this.parseJson<T>(response);
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

  private async parseJson<T>(response: Response): Promise<T | undefined> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      try {
        return (await response.json()) as T;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Failed to parse JSON response:', error);
        }
        return undefined;
      }
    }

    if (response.status === 204 || response.status === 205) {
      return undefined;
    }

    try {
      const text = await response.text();
      return text ? (text as unknown as T) : undefined;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to read response text:', error);
      }
      return undefined;
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

  // ============================================================================
  // Analytics & Workflow Methods
  // ============================================================================

  async getUserAnalytics(): Promise<UserAnalytics> {
    const response = await this.request<UserAnalytics | { analytics?: UserAnalytics }>(
      API_CONFIG.ENDPOINTS.ADMIN_ANALYTICS
    );

    if (response && typeof response === 'object' && 'analytics' in response && response.analytics) {
      return response.analytics;
    }

    return response as UserAnalytics;
  }

  async getPendingApprovals(): Promise<PendingWorkflow[]> {
    const response = await this.request<
      PendingWorkflow[] | { pending?: PendingWorkflow[]; workflows?: PendingWorkflow[] }
    >(API_CONFIG.ENDPOINTS.PENDING_APPROVALS);

    if (Array.isArray(response)) {
      return response;
    }

    if (response && typeof response === 'object') {
      if (Array.isArray(response.pending)) {
        return response.pending;
      }

      if (Array.isArray(response.workflows)) {
        return response.workflows;
      }
    }

    return [];
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
    getUserAnalytics: apiClient.getUserAnalytics.bind(apiClient),
    getPendingApprovals: apiClient.getPendingApprovals.bind(apiClient),

    // Utility
    isAuthenticated: apiClient.isAuthenticated.bind(apiClient)
  };
};

export default apiClient;
