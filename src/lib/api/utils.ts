// Enhanced API client with comprehensive error handling and types
import { ApiError } from '@shared/errors/ApiError';
import type {
  ApiResponse,
  ChangePasswordRequest,
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
  PaginatedResponse,
  UpdateUserRequest,
  User,
  UserAnalytics,
} from '@shared/types';

import { API_CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from './constants';

/**
 * Request configuration interface
 */
interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

/**
 * Enhanced API client class with retry logic and proper error handling
 */
class APIClient {
  private baseURL: string;
  private defaultTimeout: number;
  private retryAttempts: number;
  private retryDelay: number;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultTimeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    if (this.authToken) return this.authToken;

    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }

    return null;
  }

  /**
   * Build query string from parameters
   */
  private buildQueryString(params: Record<string, string | number | boolean>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Get default headers
   */
  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');

    let data: ApiResponse<T>;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      data = {
        success: response.ok,
        message: text || response.statusText,
        data: undefined as T,
      };
    }

    if (!response.ok) {
      const errorMessage = data.message || this.getErrorMessage(response.status);
      throw new ApiError(errorMessage, response.status, data.error || 'HTTP_ERROR', data.errors);
    }

    return data;
  }

  /**
   * Get error message based on status code
   */
  private getErrorMessage(status: number): string {
    switch (status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 408:
        return ERROR_MESSAGES.TIMEOUT_ERROR;
      case 422:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 500:
      case 502:
      case 503:
      case 504:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: ApiError): boolean {
    // Retry on network errors and 5xx server errors
    return error.status >= 500 || error.status === 0;
  }

  /**
   * Make HTTP request with retry logic
   */
  async request<T>(
    endpoint: string,
    config: RequestConfig = { method: 'GET' }
  ): Promise<ApiResponse<T>> {
    const { method, headers = {}, body, params, timeout = this.defaultTimeout } = config;

    const url = `${this.baseURL}${endpoint}${params ? this.buildQueryString(params) : ''}`;

    const requestHeaders = { ...this.getDefaultHeaders(), ...headers };

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    };

    let lastError: ApiError;

    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...requestConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return await this.handleResponse<T>(response);
      } catch (error) {
        if (error instanceof ApiError) {
          lastError = error;
        } else if (error instanceof Error) {
          if (error.name === 'AbortError') {
            lastError = new ApiError(ERROR_MESSAGES.TIMEOUT_ERROR, 408, 'TIMEOUT_ERROR');
          } else {
            lastError = new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 0, 'NETWORK_ERROR');
          }
        } else {
          lastError = new ApiError(ERROR_MESSAGES.UNKNOWN_ERROR, 0, 'UNKNOWN_ERROR');
        }

        // Don't retry on the last attempt or non-retryable errors
        if (attempt === this.retryAttempts || !this.isRetryableError(lastError)) {
          break;
        }

        // Wait before retrying with exponential backoff
        await this.sleep(this.retryDelay * Math.pow(2, attempt));
      }
    }

    throw lastError!;
  }

  // ============================================================================
  // Authentication API Methods
  // ============================================================================

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: credentials,
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
    });
  }

  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>(API_ENDPOINTS.REFRESH_TOKEN, {
      method: 'POST',
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.FORGOT_PASSWORD, {
      method: 'POST',
      body: { email },
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.RESET_PASSWORD, {
      method: 'POST',
      body: { token, new_password: newPassword },
    });
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.CHANGE_PASSWORD, {
      method: 'POST',
      body: data,
    });
  }

  // ============================================================================
  // User API Methods
  // ============================================================================

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<User>> {
    return this.request<User[]>(API_ENDPOINTS.USERS, {
      method: 'GET',
      params: params || {},
    });
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USER_BY_ID(id), {
      method: 'GET',
    });
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USERS, {
      method: 'POST',
      body: userData,
    });
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USER_BY_ID(id), {
      method: 'PUT',
      body: userData,
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.USER_BY_ID(id), {
      method: 'DELETE',
    });
  }

  async getUserProfile(): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USER_PROFILE, {
      method: 'GET',
    });
  }

  async updateUserProfile(userData: Partial<UpdateUserRequest>): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USER_PROFILE, {
      method: 'PUT',
      body: userData,
    });
  }

  // ============================================================================
  // Analytics API Methods
  // ============================================================================

  async getUserAnalytics(): Promise<ApiResponse<UserAnalytics>> {
    return this.request<UserAnalytics>(API_ENDPOINTS.USER_ANALYTICS, {
      method: 'GET',
    });
  }

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  async bulkDeleteUsers(userIds: string[]): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.USER_BULK_ACTIONS, {
      method: 'DELETE',
      body: { user_ids: userIds },
    });
  }

  async bulkUpdateUsers(
    userIds: string[],
    updates: Partial<UpdateUserRequest>
  ): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.USER_BULK_ACTIONS, {
      method: 'PUT',
      body: {
        user_ids: userIds,
        updates,
      },
    });
  }

  // ============================================================================
  // File Upload Methods
  // ============================================================================

  async uploadAvatar(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<{ url: string }>(API_ENDPOINTS.UPLOAD_AVATAR, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });
  }

  async uploadDocument(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<{ url: string }>(API_ENDPOINTS.UPLOAD_DOCUMENTS, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData
      },
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export class for custom instances if needed
export { APIClient };

// Helper functions for common operations
export const authAPI = {
  login: (credentials: LoginRequest) => apiClient.login(credentials),
  logout: () => apiClient.logout(),
  refreshToken: () => apiClient.refreshToken(),
  forgotPassword: (email: string) => apiClient.forgotPassword(email),
  resetPassword: (token: string, newPassword: string) =>
    apiClient.resetPassword(token, newPassword),
  changePassword: (data: ChangePasswordRequest) => apiClient.changePassword(data),
};

export const userAPI = {
  getAll: (params?: Parameters<typeof apiClient.getUsers>[0]) => apiClient.getUsers(params),
  getById: (id: string) => apiClient.getUserById(id),
  create: (userData: CreateUserRequest) => apiClient.createUser(userData),
  update: (id: string, userData: UpdateUserRequest) => apiClient.updateUser(id, userData),
  delete: (id: string) => apiClient.deleteUser(id),
  getProfile: () => apiClient.getUserProfile(),
  updateProfile: (userData: Partial<UpdateUserRequest>) => apiClient.updateUserProfile(userData),
};

export const analyticsAPI = { getUserAnalytics: () => apiClient.getUserAnalytics() };

export const bulkAPI = {
  deleteUsers: (userIds: string[]) => apiClient.bulkDeleteUsers(userIds),
  updateUsers: (userIds: string[], updates: Partial<UpdateUserRequest>) =>
    apiClient.bulkUpdateUsers(userIds, updates),
};

export const uploadAPI = {
  avatar: (file: File) => apiClient.uploadAvatar(file),
  document: (file: File) => apiClient.uploadDocument(file),
};
