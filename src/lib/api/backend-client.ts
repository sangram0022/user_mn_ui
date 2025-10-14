/**
 * Backend API Client - Improved Integration
 *
 * This client provides proper integration with the Python FastAPI backend,
 * handling authentication, error responses, and data transformation correctly.
 */

import { logger } from '../../shared/utils/logger';
import type {
  CreateUserRequest,
  CreateUserResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateUserRequest,
  User,
  UserProfile,
} from '../../types/api.types';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    PASSWORD_RESET: '/auth/password-reset',
    PASSWORD_RESET_REQUEST: '/auth/password-reset-request',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },

  // Profile Management
  PROFILE: {
    GET: '/profile/me',
    UPDATE: '/profile/me',
  },

  // Admin Operations
  ADMIN: {
    USERS: '/admin/users',
    USER_BY_ID: (userId: string) => `/admin/users/${userId}`,
    CREATE_USER: '/admin/users',
    UPDATE_USER: (userId: string) => `/admin/users/${userId}`,
    DELETE_USER: (userId: string) => `/admin/users/${userId}`,
    APPROVE_USER: '/admin/approve-user',
    APPROVE_USER_BY_ID: (userId: string) => `/admin/users/${userId}/approve`,
    REJECT_USER: (userId: string) => `/admin/users/${userId}/reject`,
    ROLES: '/admin/roles',
    ROLE_BY_ID: (roleId: string) => `/admin/roles/${roleId}`,
    CREATE_ROLE: '/admin/roles',
    UPDATE_ROLE: (roleId: string) => `/admin/roles/${roleId}`,
    DELETE_ROLE: (roleId: string) => `/admin/roles/${roleId}`,
    AUDIT_LOGS: '/admin/audit-logs',
    STATS: '/admin/stats',
  },

  // RBAC Admin
  RBAC: {
    ROLES: '/admin/rbac/roles',
    ROLE_BY_ID: (roleId: string) => `/admin/rbac/roles/${roleId}`,
    CREATE_ROLE: '/admin/rbac/roles',
    UPDATE_ROLE: (roleId: string) => `/admin/rbac/roles/${roleId}`,
    DELETE_ROLE: (roleId: string) => `/admin/rbac/roles/${roleId}`,
    PERMISSIONS: '/admin/rbac/permissions',
    USER_ROLES: (userId: string) => `/admin/rbac/users/${userId}/roles`,
    ASSIGN_ROLE: '/admin/rbac/assign',
    REVOKE_ROLE: '/admin/rbac/revoke',
    USER_PERMISSIONS: (userId: string) => `/admin/rbac/users/${userId}/permissions`,
  },

  // Audit
  AUDIT: {
    LOGS: '/audit/logs',
    SUMMARY: '/audit/summary',
  },

  // GDPR
  GDPR: {
    EXPORT_MY_DATA: '/gdpr/export/my-data',
    DELETE_MY_ACCOUNT: '/gdpr/delete/my-account',
    EXPORT_STATUS: (exportId: string) => `/gdpr/export/status/${exportId}`,
  },

  // Bulk Operations
  BULK: {
    CREATE_USERS: '/bulk/users/create',
    VALIDATE_USERS: '/bulk/users/validate',
  },

  // Logs
  LOGS: {
    FRONTEND_ERRORS: '/logs/frontend-errors',
  },

  // Health
  HEALTH: {
    BASIC: '/health/',
    PING: '/health/ping',
    READY: '/health/ready',
    DETAILED: '/health/detailed',
    DB: '/health/db',
    SYSTEM: '/health/system',
  },
} as const;

// ============================================================================
// Types
// ============================================================================

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
}

interface RequestConfig extends RequestInit {
  requireAuth?: boolean;
  timeout?: number;
}

// ============================================================================
// Storage Utilities
// ============================================================================

class TokenStorage {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly USER_KEY = 'user_data';

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static getUser(): User | UserProfile | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static setUser(user: User | UserProfile): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}

// ============================================================================
// Backend API Client
// ============================================================================

class BackendApiClient {
  private readonly baseUrl: string;
  private readonly defaultTimeout: number;

  constructor(baseUrl: string = API_BASE_URL, timeout: number = 30000) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.defaultTimeout = timeout;
  }

  /**
   * Make HTTP request with proper error handling and authentication
   */
  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { requireAuth = false, timeout = this.defaultTimeout, ...requestInit } = config;

    const url = `${this.baseUrl}${endpoint}`;

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((requestInit.headers as Record<string, string>) || {}),
    };

    // Add authorization if required
    if (requireAuth) {
      const token = TokenStorage.getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        throw new Error('Authentication required but no token available');
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      logger.debug(`[API] ${requestInit.method || 'GET'} ${url}`, {
        headers: { ...headers, Authorization: headers.Authorization ? '[REDACTED]' : undefined },
        body: requestInit.body ? JSON.parse(requestInit.body as string) : undefined,
      });

      const response = await fetch(url, {
        ...requestInit,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle response
      const responseData = await this.parseResponse(response);

      if (!response.ok) {
        const errorMessage = this.extractErrorMessage(responseData, response.statusText);
        const errorCode = this.extractErrorCode(responseData);
        throw new ApiError(errorMessage, response.status, errorCode, responseData);
      }

      logger.debug(`[API] Response ${response.status}`, { responseData });

      return {
        data: responseData as T,
        status: response.status,
        message: this.extractMessage(responseData),
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 0, 'TIMEOUT');
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Extract error message from response data
   */
  private extractErrorMessage(data: unknown, fallback: string): string {
    if (data && typeof data === 'object' && 'message' in data) {
      return String(data.message);
    }
    return fallback;
  }

  /**
   * Extract error code from response data
   */
  private extractErrorCode(data: unknown): string | undefined {
    if (data && typeof data === 'object' && 'code' in data) {
      return String(data.code);
    }
    return undefined;
  }

  /**
   * Extract message from response data
   */
  private extractMessage(data: unknown): string | undefined {
    if (data && typeof data === 'object' && 'message' in data) {
      return String(data.message);
    }
    return undefined;
  }

  /**
   * Parse response with proper JSON handling
   */
  private async parseResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return await response.json();
    }

    const text = await response.text();
    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  // ========================================================================
  // Authentication Methods
  // ========================================================================

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>(ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store tokens and user data
    if (response.data.access_token) {
      TokenStorage.setAccessToken(response.data.access_token);
    }
    if (response.data.refresh_token) {
      TokenStorage.setRefreshToken(response.data.refresh_token);
    }

    // Store user data if available - we'll get full user data from profile endpoint later
    if (response.data.user_id && response.data.email) {
      try {
        const profile = await this.getProfile();
        TokenStorage.setUser(profile);
      } catch (error) {
        // If profile fetch fails, store minimal user data
        logger.warn('Failed to fetch user profile after login', { error });
      }
    }

    return response.data;
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.request<RegisterResponse>(ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.request(ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        requireAuth: true,
      });
    } finally {
      // Always clear tokens, even if the request fails
      TokenStorage.clearTokens();
    }
  }

  // ========================================================================
  // Profile Methods
  // ========================================================================

  async getProfile(): Promise<UserProfile> {
    const response = await this.request<UserProfile>(ENDPOINTS.PROFILE.GET, {
      requireAuth: true,
    });

    return response.data;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const response = await this.request<UserProfile>(ENDPOINTS.PROFILE.UPDATE, {
      method: 'PUT',
      requireAuth: true,
      body: JSON.stringify(updates),
    });

    return response.data;
  }

  // ========================================================================
  // Admin Methods
  // ========================================================================

  async getUsers(
    params: {
      page?: number;
      page_size?: number;
      role?: string;
      is_active?: boolean;
      search?: string;
    } = {}
  ): Promise<User[]> {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const endpoint = queryString
      ? `${ENDPOINTS.ADMIN.USERS}?${queryString}`
      : ENDPOINTS.ADMIN.USERS;

    const response = await this.request<User[]>(endpoint, {
      requireAuth: true,
    });

    return response.data;
  }

  async getUserById(userId: string): Promise<User> {
    const response = await this.request<User>(ENDPOINTS.ADMIN.USER_BY_ID(userId), {
      requireAuth: true,
    });

    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await this.request<CreateUserResponse>(ENDPOINTS.ADMIN.USERS, {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(userData),
    });

    return response.data;
  }

  async updateUser(userId: string, updates: UpdateUserRequest): Promise<User> {
    const response = await this.request<User>(ENDPOINTS.ADMIN.USER_BY_ID(userId), {
      method: 'PUT',
      requireAuth: true,
      body: JSON.stringify(updates),
    });

    return response.data;
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(ENDPOINTS.ADMIN.USER_BY_ID(userId), {
      method: 'DELETE',
      requireAuth: true,
    });

    return response.data;
  }

  // ========================================================================
  // Authentication Extended Methods
  // ========================================================================

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({
        token,
        new_password: newPassword,
      }),
    });

    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    return response.data;
  }

  async verifyEmail(token: string): Promise<{ message: string; verified_at: string }> {
    const response = await this.request<{ message: string; verified_at: string }>(
      ENDPOINTS.AUTH.VERIFY_EMAIL,
      {
        method: 'POST',
        body: JSON.stringify({ token }),
      }
    );

    return response.data;
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(ENDPOINTS.AUTH.RESEND_VERIFICATION, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return response.data;
  }

  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = TokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<LoginResponse>(ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    // Update stored tokens
    if (response.data.access_token) {
      TokenStorage.setAccessToken(response.data.access_token);
    }
    if (response.data.refresh_token) {
      TokenStorage.setRefreshToken(response.data.refresh_token);
    }

    return response.data;
  }

  // ========================================================================
  // Admin Extended Methods
  // ========================================================================

  async approveUser(userId: string): Promise<{ message: string; user_id: string }> {
    const response = await this.request<{ message: string; user_id: string }>(
      ENDPOINTS.ADMIN.APPROVE_USER_BY_ID(userId),
      {
        method: 'POST',
        requireAuth: true,
      }
    );

    return response.data;
  }

  async rejectUser(userId: string, reason?: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(ENDPOINTS.ADMIN.REJECT_USER(userId), {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({ reason }),
    });

    return response.data;
  }

  async getAdminStats(): Promise<{
    total_users: number;
    active_users: number;
    pending_approvals: number;
  }> {
    const response = await this.request<{
      total_users: number;
      active_users: number;
      pending_approvals: number;
    }>(ENDPOINTS.ADMIN.STATS, {
      requireAuth: true,
    });

    return response.data;
  }

  // ========================================================================
  // Role Management Methods
  // ========================================================================

  async getRoles(): Promise<
    Array<{
      role_id: string;
      role_name: string;
      description: string;
      permissions: string[];
    }>
  > {
    const response = await this.request<
      Array<{
        role_id: string;
        role_name: string;
        description: string;
        permissions: string[];
      }>
    >(ENDPOINTS.ADMIN.ROLES, {
      requireAuth: true,
    });

    return response.data;
  }

  async createRole(roleData: {
    role_name: string;
    description: string;
    permissions?: string[];
  }): Promise<{ role_id: string; message: string }> {
    const response = await this.request<{ role_id: string; message: string }>(
      ENDPOINTS.ADMIN.CREATE_ROLE,
      {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify(roleData),
      }
    );

    return response.data;
  }

  async updateRole(
    roleId: string,
    updates: {
      role_name?: string;
      description?: string;
      permissions?: string[];
    }
  ): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(ENDPOINTS.ADMIN.UPDATE_ROLE(roleId), {
      method: 'PUT',
      requireAuth: true,
      body: JSON.stringify(updates),
    });

    return response.data;
  }

  async deleteRole(roleId: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(ENDPOINTS.ADMIN.DELETE_ROLE(roleId), {
      method: 'DELETE',
      requireAuth: true,
    });

    return response.data;
  }

  // ========================================================================
  // RBAC Methods
  // ========================================================================

  async getRBACRoles(): Promise<
    Array<{
      role_id: string;
      role_name: string;
      description: string;
      permissions: string[];
      priority: number;
      is_system_role: boolean;
      inherits_from: string[];
    }>
  > {
    const response = await this.request<
      Array<{
        role_id: string;
        role_name: string;
        description: string;
        permissions: string[];
        priority: number;
        is_system_role: boolean;
        inherits_from: string[];
      }>
    >(ENDPOINTS.RBAC.ROLES, {
      requireAuth: true,
    });

    return response.data;
  }

  async getRBACPermissions(): Promise<
    Array<{
      permission_id: string;
      category: string;
      action: string;
      resource: string;
      description?: string;
    }>
  > {
    const response = await this.request<
      Array<{
        permission_id: string;
        category: string;
        action: string;
        resource: string;
        description?: string;
      }>
    >(ENDPOINTS.RBAC.PERMISSIONS, {
      requireAuth: true,
    });

    return response.data;
  }

  async assignRole(
    userId: string,
    roleId: string,
    expiresAt?: string
  ): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(ENDPOINTS.RBAC.ASSIGN_ROLE, {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({
        user_id: userId,
        role_id: roleId,
        expires_at: expiresAt,
      }),
    });

    return response.data;
  }

  async revokeRole(userId: string, roleId: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(ENDPOINTS.RBAC.REVOKE_ROLE, {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({
        user_id: userId,
        role_id: roleId,
      }),
    });

    return response.data;
  }

  async getUserRoles(userId: string): Promise<{
    user_id: string;
    roles: string[];
    permissions: string[];
  }> {
    const response = await this.request<{
      user_id: string;
      roles: string[];
      permissions: string[];
    }>(ENDPOINTS.RBAC.USER_ROLES(userId), {
      requireAuth: true,
    });

    return response.data;
  }

  // ========================================================================
  // Audit Methods
  // ========================================================================

  async getAuditLogs(
    params: {
      action?: string;
      resource?: string;
      user_id?: string;
      start_date?: string;
      end_date?: string;
      severity?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    logs: Array<{
      log_id: string;
      action: string;
      resource: string;
      user_id?: string;
      timestamp: string;
      severity: string;
      details?: Record<string, unknown>;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const endpoint = queryString ? `${ENDPOINTS.AUDIT.LOGS}?${queryString}` : ENDPOINTS.AUDIT.LOGS;

    const response = await this.request<{
      logs: Array<{
        log_id: string;
        action: string;
        resource: string;
        user_id?: string;
        timestamp: string;
        severity: string;
        details?: Record<string, unknown>;
      }>;
      total: number;
      page: number;
      limit: number;
    }>(endpoint, {
      requireAuth: true,
    });

    return response.data;
  }

  async getAuditSummary(): Promise<{
    total_events: number;
    events_by_severity: { [key: string]: number };
    events_by_action: { [key: string]: number };
    recent_activity: Array<{
      action: string;
      timestamp: string;
      user_id?: string;
    }>;
  }> {
    const response = await this.request<{
      total_events: number;
      events_by_severity: { [key: string]: number };
      events_by_action: { [key: string]: number };
      recent_activity: Array<{
        action: string;
        timestamp: string;
        user_id?: string;
      }>;
    }>(ENDPOINTS.AUDIT.SUMMARY, {
      requireAuth: true,
    });

    return response.data;
  }

  // ========================================================================
  // GDPR Methods
  // ========================================================================

  async exportMyData(format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}${ENDPOINTS.GDPR.EXPORT_MY_DATA}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TokenStorage.getAccessToken()}`,
      },
      body: JSON.stringify({ format }),
    });

    if (!response.ok) {
      throw new Error('Failed to export data');
    }

    return await response.blob();
  }

  async deleteMyAccount(): Promise<{ message: string; deleted_at: string }> {
    const response = await this.request<{ message: string; deleted_at: string }>(
      ENDPOINTS.GDPR.DELETE_MY_ACCOUNT,
      {
        method: 'DELETE',
        requireAuth: true,
      }
    );

    // Clear tokens after account deletion
    TokenStorage.clearTokens();

    return response.data;
  }

  async getExportStatus(exportId: string): Promise<{
    status: string;
    created_at: string;
    completed_at?: string;
    download_url?: string;
  }> {
    const response = await this.request<{
      status: string;
      created_at: string;
      completed_at?: string;
      download_url?: string;
    }>(ENDPOINTS.GDPR.EXPORT_STATUS(exportId), {
      requireAuth: true,
    });

    return response.data;
  }

  // ========================================================================
  // Bulk Operations Methods
  // ========================================================================

  async bulkCreateUsers(
    users: Array<{
      email: string;
      first_name: string;
      last_name: string;
      password?: string;
      role?: string;
    }>
  ): Promise<{
    success_count: number;
    error_count: number;
    results: Array<{
      email: string;
      success: boolean;
      user_id?: string;
      error?: string;
    }>;
  }> {
    const response = await this.request<{
      success_count: number;
      error_count: number;
      results: Array<{
        email: string;
        success: boolean;
        user_id?: string;
        error?: string;
      }>;
    }>(ENDPOINTS.BULK.CREATE_USERS, {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({
        operation: 'create_users',
        items: users,
      }),
    });

    return response.data;
  }

  async validateBulkUsers(
    users: Array<{
      email: string;
      first_name: string;
      last_name: string;
    }>
  ): Promise<{
    valid_count: number;
    invalid_count: number;
    results: Array<{
      email: string;
      valid: boolean;
      errors?: string[];
    }>;
  }> {
    const response = await this.request<{
      valid_count: number;
      invalid_count: number;
      results: Array<{
        email: string;
        valid: boolean;
        errors?: string[];
      }>;
    }>(ENDPOINTS.BULK.VALIDATE_USERS, {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({
        operation: 'validate_users',
        items: users,
      }),
    });

    return response.data;
  }

  // ========================================================================
  // Logging Methods
  // ========================================================================

  async logFrontendError(error: {
    message: string;
    stack?: string;
    url: string;
    timestamp: string;
    user_agent?: string;
    level?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(ENDPOINTS.LOGS.FRONTEND_ERRORS, {
      method: 'POST',
      body: JSON.stringify(error),
    });

    return response.data;
  }

  // ========================================================================
  // Health Check Methods
  // ========================================================================

  async healthCheck(): Promise<{ status: string }> {
    const response = await this.request<{ status: string }>(ENDPOINTS.HEALTH.BASIC);
    return response.data;
  }

  async healthPing(): Promise<{ pong: string }> {
    const response = await this.request<{ pong: string }>(ENDPOINTS.HEALTH.PING);
    return response.data;
  }

  async healthReady(): Promise<{ status: string; timestamp: string }> {
    const response = await this.request<{ status: string; timestamp: string }>(
      ENDPOINTS.HEALTH.READY
    );
    return response.data;
  }

  async healthDetailed(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    version: string;
    checks: { [key: string]: { status: string; timestamp: string } };
  }> {
    const response = await this.request<{
      status: string;
      timestamp: string;
      uptime: number;
      version: string;
      checks: { [key: string]: { status: string; timestamp: string } };
    }>(ENDPOINTS.HEALTH.DETAILED);
    return response.data;
  }

  async healthDatabase(): Promise<{
    status: string;
    timestamp: string;
    connection_count: number;
    response_time: number;
  }> {
    const response = await this.request<{
      status: string;
      timestamp: string;
      connection_count: number;
      response_time: number;
    }>(ENDPOINTS.HEALTH.DB);
    return response.data;
  }

  async healthSystem(): Promise<{
    status: string;
    timestamp: string;
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
  }> {
    const response = await this.request<{
      status: string;
      timestamp: string;
      cpu_usage: number;
      memory_usage: number;
      disk_usage: number;
    }>(ENDPOINTS.HEALTH.SYSTEM);
    return response.data;
  }
}

// ============================================================================
// Create and export client instance
// ============================================================================

class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const backendApiClient = new BackendApiClient();
export { ApiError, TokenStorage };
export type { ApiResponse, RequestConfig };
