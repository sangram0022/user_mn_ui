import { tokenService } from '@shared/services/auth/tokenService';
import type {
  AdminUsersQuery,
  AuditLog,
  AuditLogsQuery,
  AuditSummary,
  ChangePasswordRequest,
  CreateUserRequest,
  LoginResponse,
  PendingWorkflow,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  ResetPasswordRequest,
  UpdateUserRequest,
  UserAnalytics,
  UserProfile,
  UserRole,
  UserSummary,
} from '@shared/types';
import { normalizeApiError } from '@shared/utils/error';
import { BACKEND_CONFIG } from '../../shared/config/api';
import { logger } from './../../shared/utils/logger';

import { ApiError } from './error';

const DEFAULT_BASE_URL = BACKEND_CONFIG.API_BASE_URL;

const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    passwordReset: '/auth/password-reset',
    resetPassword: '/auth/reset-password',
    forgotPassword: '/auth/forgot-password',
    changePassword: '/auth/change-password',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
  },
  profile: { me: '/profile/me' },
  admin: {
    users: '/admin/users',
    userById: (userId: string) => `/admin/users/${userId}`,
    approveUser: (userId: string) => `/admin/users/${userId}/approve`,
    rejectUser: (userId: string) => `/admin/users/${userId}/reject`,
    analytics: '/admin/analytics',
  },
  audit: { logs: '/audit/logs', summary: '/audit/summary' },
  workflows: { pending: '/workflows/pending' },
} as const;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions extends RequestInit {
  method?: HttpMethod;
}

interface StoredSession {
  accessToken: string;
  refreshToken?: string;
  issuedAt?: string;
  expiresIn?: number;
}

interface UserListResponse {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  is_approved: boolean;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
  last_login_at?: string | null;
}

interface CreateUserResponse {
  user_id: string;
  email: string;
  message: string;
}

interface DeleteUserResponse {
  user_id: string;
  email: string;
  message: string;
  deleted_at: string;
}

interface UserDetailResponse extends UserListResponse {
  updated_at?: string | null;
  login_count?: number;
}

interface PasswordResetResponse {
  message: string;
  email: string;
  reset_token_sent?: boolean;
}

interface ChangePasswordResponse {
  message: string;
  success?: boolean;
  changed_at?: string;
}

interface ForgotPasswordResponse {
  message: string;
  success?: boolean;
}

interface LogoutResponse {
  message: string;
  success?: boolean;
}

export class ApiClient {
  private baseURL: string;
  private session: StoredSession | null;

  constructor(baseURL: string = DEFAULT_BASE_URL) {
    this.baseURL = baseURL;
    this.session = this.loadSession();
  }

  private loadSession(): StoredSession | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const accessToken =
        window.localStorage.getItem('access_token') ??
        window.localStorage.getItem('token') ??
        undefined;
      if (!accessToken) {
        return null;
      }

      const refreshToken = window.localStorage.getItem('refresh_token') ?? undefined;
      const issuedAt = window.localStorage.getItem('token_issued_at') ?? undefined;
      const expiresInString = window.localStorage.getItem('token_expires_in') ?? undefined;
      const expiresIn = expiresInString ? Number(expiresInString) : undefined;

      return { accessToken, refreshToken, issuedAt, expiresIn };
    } catch (error) {
      logger.warn('Failed to load auth session', { error });
      return null;
    }
  }

  private persistSession(session: StoredSession | null): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (!session) {
        window.localStorage.removeItem('access_token');
        window.localStorage.removeItem('refresh_token');
        window.localStorage.removeItem('token_issued_at');
        window.localStorage.removeItem('token_expires_in');
        window.localStorage.removeItem('token');
        this.session = null;
        return;
      }

      window.localStorage.setItem('access_token', session.accessToken);
      window.localStorage.setItem('token', session.accessToken);
      if (session.refreshToken) {
        window.localStorage.setItem('refresh_token', session.refreshToken);
      } else {
        window.localStorage.removeItem('refresh_token');
      }

      if (session.issuedAt) {
        window.localStorage.setItem('token_issued_at', session.issuedAt);
      }

      if (typeof session.expiresIn === 'number') {
        window.localStorage.setItem('token_expires_in', String(session.expiresIn));
      }

      this.session = session;
    } catch (error) {
      logger.warn('Failed to persist auth session', { error });
    }
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.session?.accessToken) {
      headers['Authorization'] = `Bearer ${this.session.accessToken}`;
    }

    return headers;
  }

  private async parseJson<T>(response: Response): Promise<T | undefined> {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        return (await response.json()) as T;
      } catch (error) {
        if (import.meta.env.DEV) {
          logger.warn('Failed to parse JSON response', { error });
        }
        return undefined;
      }
    }

    if (response.status === 204 || response.status === 205) {
      return undefined;
    }

    const text = await response.text();
    if (!text) {
      return undefined;
    }

    try {
      return JSON.parse(text) as T;
    } catch (error) {
      if (import.meta.env.DEV) {
        logger.warn('Failed to parse text response as JSON', { error, text });
      }
      return undefined;
    }
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${path.startsWith('/') ? path : `/${path}`}`;
    const config: RequestInit = {
      method: options.method ?? 'GET',
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    // Debug logging
    if (import.meta.env.DEV) {
      logger.info(`[API] ${config.method} ${url}`, {
        body: options.body ? JSON.parse(options.body as string) : undefined,
        headers: config.headers,
      });
    }

    let response: Response;
    try {
      response = await fetch(url, config);

      // Debug logging for response
      if (import.meta.env.DEV) {
        logger.info(`[API] Response ${response.status} ${response.statusText}`, {
          url,
          status: response.status,
          ok: response.ok,
        });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ApiError({ status: 0, message: error.message, code: 'NETWORK_ERROR' });
      }
      throw new ApiError({ status: 0, message: 'Network request failed', code: 'NETWORK_ERROR' });
    }

    if (!response.ok) {
      if (response.status === 401) {
        this.persistSession(null);
      }

      const errorPayload = await this.parseJson(response);
      const normalized = normalizeApiError(response.status, response.statusText, errorPayload);

      // Debug logging for error code extraction
      if (import.meta.env.DEV) {
        logger.info('[API] Error normalization', {
          errorPayload,
          normalized,
          extractedCode: normalized.code,
        });
      }

      throw new ApiError({
        status: normalized.status,
        message: normalized.message,
        code: normalized.code,
        detail: normalized.detail,
        errors: normalized.errors,
        headers: response.headers,
        payload: errorPayload,
      });
    }

    const body = await this.parseJson<T>(response);
    return body as T;
  }

  setSessionTokens(loginResponse: LoginResponse): void {
    // Use enterprise token service for secure storage
    tokenService.storeTokens(loginResponse);

    // Also maintain backward compatibility with existing session storage
    const session: StoredSession = {
      accessToken: loginResponse.access_token,
      refreshToken: loginResponse.refresh_token,
      issuedAt: loginResponse.issued_at,
      expiresIn: loginResponse.expires_in,
    };
    this.persistSession(session);
  }

  clearSession(): void {
    // Clear using enterprise token service
    tokenService.clearTokens();

    // Also clear legacy session storage
    this.persistSession(null);
  }

  isAuthenticated(): boolean {
    // Use enterprise token service for authentication check
    return tokenService.isAuthenticated();
  }

  async login(
    emailOrCredentials: string | { email: string; password: string },
    password?: string
  ): Promise<LoginResponse> {
    const credentials =
      typeof emailOrCredentials === 'string'
        ? { email: emailOrCredentials, password: password ?? '' }
        : emailOrCredentials;

    const response = await this.request<LoginResponse>(ENDPOINTS.auth.login, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.setSessionTokens(response);
    return response;
  }

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    return await this.request<RegisterResponse>(ENDPOINTS.auth.register, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async logout(): Promise<LogoutResponse> {
    try {
      const response = await this.request<LogoutResponse>(ENDPOINTS.auth.logout, {
        method: 'POST',
      });
      return response;
    } finally {
      this.clearSession();
    }
  }

  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    return await this.request<PasswordResetResponse>(ENDPOINTS.auth.passwordReset, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return await this.request<ForgotPasswordResponse>(ENDPOINTS.auth.forgotPassword, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(payload: ResetPasswordRequest): Promise<{ message: string }> {
    return await this.request<{ message: string }>(ENDPOINTS.auth.resetPassword, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async changePassword(payload: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return await this.request<ChangePasswordResponse>(ENDPOINTS.auth.changePassword, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return await this.request<{ message: string }>(ENDPOINTS.auth.verifyEmail, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resendVerification(
    payload: ResendVerificationRequest
  ): Promise<ResendVerificationResponse> {
    return await this.request<ResendVerificationResponse>(ENDPOINTS.auth.resendVerification, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getUserProfile(): Promise<UserProfile> {
    return await this.request<UserProfile>(ENDPOINTS.profile.me);
  }

  async updateUserProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
    return await this.request<UserProfile>(ENDPOINTS.profile.me, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  private mapUserSummary(user: UserListResponse): UserSummary {
    return {
      user_id: user.user_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active,
      is_verified: user.is_verified,
      is_approved: user.is_approved,
      approved_by: user.approved_by ?? undefined,
      approved_at: user.approved_at ?? undefined,
      created_at: user.created_at,
      last_login_at: user.last_login_at ?? undefined,
    };
  }

  async getUsers(params?: AdminUsersQuery): Promise<UserSummary[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return;
        }
        searchParams.append(key, String(value));
      });
    }

    const query = searchParams.toString();
    const path = query ? `${ENDPOINTS.admin.users}?${query}` : ENDPOINTS.admin.users;
    const response = await this.request<UserListResponse[]>(path);
    return response.map((user) => this.mapUserSummary(user));
  }

  async getUser(userId: string): Promise<UserSummary> {
    const response = await this.request<UserDetailResponse>(ENDPOINTS.admin.userById(userId));
    return this.mapUserSummary(response);
  }

  async createUser(payload: CreateUserRequest): Promise<UserSummary> {
    const response = await this.request<CreateUserResponse>(ENDPOINTS.admin.users, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return await this.getUser(response.user_id);
  }

  async updateUser(userId: string, payload: UpdateUserRequest): Promise<UserSummary> {
    const response = await this.request<UserDetailResponse>(ENDPOINTS.admin.userById(userId), {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return this.mapUserSummary(response);
  }

  async deleteUser(userId: string): Promise<DeleteUserResponse> {
    return await this.request<DeleteUserResponse>(ENDPOINTS.admin.userById(userId), {
      method: 'DELETE',
    });
  }

  async approveUser(userId: string): Promise<UserSummary> {
    await this.request(ENDPOINTS.admin.approveUser(userId), {
      method: 'POST',
    });
    return await this.getUser(userId);
  }

  async rejectUser(userId: string, reason?: string): Promise<UserSummary> {
    await this.request(ENDPOINTS.admin.rejectUser(userId), {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return await this.getUser(userId);
  }

  async getUserAnalytics(): Promise<UserAnalytics> {
    const fallback: UserAnalytics = {
      total_users: 0,
      active_users: 0,
      new_users_today: 0,
      retention_rate: 0,
      engagement_score: 0,
      lifecycle_distribution: {},
      activity_trends: [],
      inactive_users: 0,
      new_users_last_30_days: 0,
      engagement_distribution: { high: 0, medium: 0, low: 0 },
      growth_rate: 0,
    };

    try {
      const analytics = await this.request<UserAnalytics>(ENDPOINTS.admin.analytics);
      return {
        ...fallback,
        ...analytics,
        engagement_distribution:
          analytics.engagement_distribution ?? fallback.engagement_distribution,
        lifecycle_distribution: analytics.lifecycle_distribution ?? fallback.lifecycle_distribution,
        activity_trends: analytics.activity_trends ?? fallback.activity_trends,
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        logger.warn('User analytics endpoint unavailable', { error });
      }
      return fallback;
    }
  }

  async getLifecycleAnalytics<T = unknown>(): Promise<T> {
    return await this.request<T>('/business-logic/lifecycle/analytics');
  }

  async getAuditLogs(params?: AuditLogsQuery): Promise<AuditLog[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return;
        }
        searchParams.append(key, String(value));
      });
    }

    const query = searchParams.toString();
    const path = query ? `${ENDPOINTS.audit.logs}?${query}` : ENDPOINTS.audit.logs;
    return await this.request<AuditLog[]>(path);
  }

  async getAuditSummary(): Promise<AuditSummary> {
    return await this.request<AuditSummary>(ENDPOINTS.audit.summary);
  }

  async getPendingApprovals(): Promise<PendingWorkflow[]> {
    try {
      return await this.request<PendingWorkflow[]>(ENDPOINTS.workflows.pending);
    } catch (error) {
      if (import.meta.env.DEV) {
        logger.warn('Pending workflows endpoint unavailable', { error });
      }
      return [];
    }
  }

  async getRoles(): Promise<UserRole[]> {
    try {
      return await this.request<UserRole[]>('/admin/roles');
    } catch (error) {
      if (import.meta.env.DEV) {
        logger.warn('Roles endpoint unavailable, using fallback roles', { error });
      }
      return [
        { id: 1, name: 'admin', description: 'Administrator', permissions: ['admin'] },
        { id: 2, name: 'user', description: 'Standard User', permissions: [] },
        {
          id: 3,
          name: 'manager',
          description: 'Manager',
          permissions: ['user:read', 'user:write'],
        },
      ];
    }
  }

  async execute<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return await this.request<T>(path, options);
  }
}

export const apiClient = new ApiClient();

export const useApi = () => ({
  isAuthenticated: apiClient.isAuthenticated.bind(apiClient),
  setSessionTokens: apiClient.setSessionTokens.bind(apiClient),
  clearSession: apiClient.clearSession.bind(apiClient),

  login: apiClient.login.bind(apiClient),
  register: apiClient.register.bind(apiClient),
  logout: apiClient.logout.bind(apiClient),
  requestPasswordReset: apiClient.requestPasswordReset.bind(apiClient),
  forgotPassword: apiClient.forgotPassword.bind(apiClient),
  resetPassword: apiClient.resetPassword.bind(apiClient),
  changePassword: apiClient.changePassword.bind(apiClient),
  verifyEmail: apiClient.verifyEmail.bind(apiClient),
  resendVerification: apiClient.resendVerification.bind(apiClient),

  getUserProfile: apiClient.getUserProfile.bind(apiClient),
  updateUserProfile: apiClient.updateUserProfile.bind(apiClient),

  getUsers: apiClient.getUsers.bind(apiClient),
  getUser: apiClient.getUser.bind(apiClient),
  createUser: apiClient.createUser.bind(apiClient),
  updateUser: apiClient.updateUser.bind(apiClient),
  deleteUser: apiClient.deleteUser.bind(apiClient),
  approveUser: apiClient.approveUser.bind(apiClient),
  rejectUser: apiClient.rejectUser.bind(apiClient),
  getUserAnalytics: apiClient.getUserAnalytics.bind(apiClient),
  getRoles: apiClient.getRoles.bind(apiClient),

  getAuditLogs: apiClient.getAuditLogs.bind(apiClient),
  getAuditSummary: apiClient.getAuditSummary.bind(apiClient),
  getPendingApprovals: apiClient.getPendingApprovals.bind(apiClient),

  execute: apiClient.execute.bind(apiClient),
});

export default apiClient;
