// Complete FastAPI Backend Integration - All API Endpoints from API_REFERENCE.md
import { API_ENDPOINTS, API_BASE_URL, getApiDebugInfo } from '../config/backend';
import type { ApiResponse, RegisterResponse, ResendVerificationResponse } from '../types';
import { ApiError } from '../utils/apiError';
import type { ApiErrorResponse } from '../types/error';
import { normalizeApiError } from '../utils/apiErrorNormalizer';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL, // Use centralized backend configuration
  
  ENDPOINTS: {
    // Authentication Endpoints
    REGISTER: API_ENDPOINTS.AUTH.REGISTER,
    LOGIN: API_ENDPOINTS.AUTH.LOGIN,
    REFRESH: API_ENDPOINTS.AUTH.REFRESH,
    LOGOUT: API_ENDPOINTS.AUTH.LOGOUT,
    RESEND_VERIFICATION: '/auth/resend-verification',
    
    // User Management Endpoints
    USERS: API_ENDPOINTS.USERS.BASE,
    USER_BY_ID: (id: number) => API_ENDPOINTS.USERS.BY_ID(id.toString()),
    
    // Profile Management Endpoints
    PROFILE_ME: API_ENDPOINTS.USERS.ME, // Updated to match backend API
    CHANGE_PASSWORD: API_ENDPOINTS.USERS.CHANGE_PASSWORD,
    
    // Business Logic - Lifecycle Management
    LIFECYCLE_INITIATE: '/business-logic/lifecycle/initiate',
    LIFECYCLE_PROGRESS: '/business-logic/lifecycle/progress',
    LIFECYCLE_ANALYTICS: '/business-logic/lifecycle/analytics',
    
    // Business Logic - Segmentation & Analytics
    SEGMENTATION_CREATE: '/business-logic/segmentation/create',
    USER_ANALYTICS: '/business-logic/analytics/user-analytics',
    COHORT_ANALYSIS: '/business-logic/analytics/cohort-analysis',
    CHURN_PREDICTION: '/business-logic/analytics/churn-prediction',
    
    // Business Logic - Workflow Management
    WORKFLOW_INITIATE: '/business-logic/workflows/initiate',
    WORKFLOW_APPROVE: (requestId: string) => `/business-logic/workflows/${requestId}/approve`,
    WORKFLOW_PENDING: '/business-logic/workflows/pending',
    WORKFLOW_STATUS: (requestId: string) => `/business-logic/workflows/${requestId}/status`,
    
    // Business Logic - Onboarding Management
    ONBOARDING_ASSIGN: '/business-logic/onboarding/assign',
    ONBOARDING_START: (userId: number) => `/business-logic/onboarding/${userId}/start`,
    ONBOARDING_COMPLETE_STEP: (userId: number) => `/business-logic/onboarding/${userId}/complete-step`,
    ONBOARDING_PROGRESS: (userId: number) => `/business-logic/onboarding/${userId}/progress`,
    
    // Business Logic - Compliance
    COMPLIANCE_REPORT: '/business-logic/compliance/report',
    
    // Business Integration
    BUSINESS_DASHBOARD: '/business/dashboard'
  }
};

// Pydantic Model Interfaces - Based on FastAPI Backend
export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  terms_accepted: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  username?: string;
  is_active?: boolean;
  role_id?: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  username?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

export interface UpdateProfileRequest {
  full_name?: string;
  bio?: string;
  location?: string;
  website?: string;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  preferences?: {
    email_notifications?: boolean;
    theme?: 'light' | 'dark';
    language?: string;
  };
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface LifecycleInitiateRequest {
  user_ids: number[];
  trigger_event?: string;
  config_overrides?: {
    skip_email_verification?: boolean;
    custom_onboarding_template?: string;
  };
}

export interface LifecycleProgressRequest {
  user_id: number;
  completed_step: string;
  additional_data?: Record<string, unknown>;
}

export interface CreateSegmentRequest {
  name: string;
  description: string;
  segment_type: string;
  criteria: {
    min_activity_score?: number;
    registration_days_ago?: number;
    engagement_level?: string;
    min_login_frequency?: number;
    feature_usage_threshold?: number;
  };
}

export interface WorkflowInitiateRequest {
  workflow_type: string;
  target_user_id?: number;
  request_data: Record<string, unknown>;
  justification: string;
  workflow_id?: string;
}

export interface WorkflowApprovalRequest {
  action: 'approve' | 'reject';
  comments?: string;
}

export interface OnboardingAssignRequest {
  user_ids: number[];
  template_id: string;
  custom_deadline_days?: number;
}

export interface OnboardingCompleteStepRequest {
  step_id: string;
  completion_data?: Record<string, unknown>;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number | string;
    email: string;
    username?: string;
    role: string;
    is_superuser?: boolean;
    is_active?: boolean;
    is_verified?: boolean;
    first_name?: string;
    last_name?: string;
    role_id?: string;
    created_at?: string;
    updated_at?: string;
    last_login?: string;
  };
}

export interface User {
  id: number;
  email: string;
  username?: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  role: {
    id: number;
    name: string;
    description: string;
    permissions: string[];
  };
  lifecycle_stage?: string;
  activity_score?: number;
  created_at: string;
  last_login_at?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  username?: string;
  full_name?: string;
  profile_picture_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  preferences?: {
    email_notifications: boolean;
    theme: string;
    language: string;
  };
  onboarding_completed: boolean;
  lifecycle_stage: string;
  created_at: string;
}

export interface PaginatedUsersResponse {
  success: boolean;
  users: User[];
  total: number;
  page_info: {
    skip: number;
    limit: number;
    has_more: boolean;
  };
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private readonly debugEnabled: boolean;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.debugEnabled = import.meta.env.DEV && this.getFromStorage('ENABLE_API_DEBUG') === 'true';

    if (this.debugEnabled) {
      console.debug('[ApiClient] Initialized with baseURL:', this.baseURL);
    }
    
    // Show debug info in development
    if (import.meta.env.DEV && this.debugEnabled) {
      getApiDebugInfo();
    }
    
    // Initialize token from localStorage
    this.token = this.getFromStorage('access_token');
    if (this.debugEnabled) {
      console.debug('[ApiClient] Initial token state:', !!this.token);
    }
  }

  private getLocalStorage(): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      return window.localStorage;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[ApiClient] Unable to access localStorage:', error);
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

  private debug(...args: unknown[]) {
    if (this.debugEnabled) {
      console.debug('[ApiClient]', ...args);
    }
  }

  private info(...args: unknown[]) {
    if (this.debugEnabled) {
      console.info('[ApiClient]', ...args);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    this.debug('Making API request to:', url);
    
    // Ensure we have the latest token from localStorage
    if (!this.token) {
      this.token = this.getFromStorage('access_token');
      this.debug('Refreshed token from storage:', !!this.token);
    }
    
    this.debug('Current token available:', !!this.token);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      this.debug('Authorization header set with Bearer token');
    } else {
      this.debug('No token available for API request');
    }

    this.debug('Request headers:', headers);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (this.debugEnabled) {
          console.error('[ApiClient] Request failed:', {
            status: response.status,
            statusText: response.statusText,
            url,
            hasToken: !!this.token
          });
        }

        const isAuthEndpoint = endpoint.includes('/auth/login')
          || endpoint.includes('/auth/register')
          || endpoint.includes('/auth/refresh');
        const hasRefreshToken = this.getFromStorage('refresh_token');

        if (response.status === 401 && !isAuthEndpoint && hasRefreshToken) {
          this.info('Token expired, attempting refresh...');
          await this.refreshToken();

          headers.Authorization = `Bearer ${this.token}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });

          if (!retryResponse.ok) {
            const retryPayload = await this.parseJson(retryResponse);
            const normalizedRetryError = normalizeApiError(
              retryResponse.status,
              retryResponse.statusText,
              retryPayload
            );

            if (retryResponse.status === 401) {
              this.handleAuthError();
            }

            throw new ApiError({
              status: normalizedRetryError.status,
              message: normalizedRetryError.message,
              code: normalizedRetryError.code,
              detail: normalizedRetryError.detail,
              errors: normalizedRetryError.errors,
              headers: retryResponse.headers,
              payload: retryPayload
            });
          }

          this.debug('Request succeeded after token refresh');
          const retryBody = await this.parseJson<T>(retryResponse);
          return retryBody as T;
        }

        if (response.status === 401) {
          this.handleAuthError();
        }

        const errorPayload = await this.parseJson<ApiErrorResponse | Record<string, unknown>>(response);
        const normalizedError = normalizeApiError(response.status, response.statusText, errorPayload);

        throw new ApiError({
          status: normalizedError.status,
          message: normalizedError.message,
          code: normalizedError.code,
          detail: normalizedError.detail,
          errors: normalizedError.errors,
          headers: response.headers,
          payload: errorPayload
        });
      }

      const responseBody = await this.parseJson<T>(response);
      return responseBody as T;
    } catch (error) {
      if (error instanceof ApiError) {
        if (this.debugEnabled) {
          console.error('[ApiClient] Request failed with structured error:', error);
        }
        throw error;
      }

      console.error('API request failed:', error);

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

  private handleAuthError() {
    this.removeFromStorage('access_token');
    this.removeFromStorage('refresh_token');
    this.token = null;
    // Redirect to login page or trigger auth state update
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  setToken(token: string) {
    this.token = token;
    this.setInStorage('access_token', token);
  }

  clearToken() {
    this.token = null;
    this.removeFromStorage('access_token');
    this.removeFromStorage('refresh_token');
  }

  // Authentication Endpoints
  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const payload = await this.request<RegisterResponse>(API_CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return {
      success: true,
      data: payload,
      message: payload?.message ?? 'User registered successfully.',
      status: 201,
      meta: payload
        ? {
            user_id: payload.user_id,
            email: payload.email,
            verification_required: payload.verification_required,
            approval_required: payload.approval_required,
            created_at: payload.created_at,
            verification_token: payload.verification_token,
          }
        : undefined,
    };
  }

  async resendVerificationEmail(email: string): Promise<ApiResponse<ResendVerificationResponse>> {
    const payload = await this.request<ResendVerificationResponse>(API_CONFIG.ENDPOINTS.RESEND_VERIFICATION, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return {
      success: true,
      data: payload,
      message: payload?.message ?? 'Verification email resent successfully.',
      status: 200,
      meta: payload
        ? {
            email: payload.email,
            resent_at: payload.resent_at,
          }
        : undefined,
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
      this.setInStorage('refresh_token', response.refresh_token);
    }
    
    return response;
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getFromStorage('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<AuthResponse>(API_CONFIG.ENDPOINTS.REFRESH, {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.access_token) {
      this.setToken(response.access_token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request<ApiResponse>(API_CONFIG.ENDPOINTS.LOGOUT, {
      method: 'POST',
    });
    
    this.clearToken();
    return response;
  }

  async verifyEmail(data: { token: string }): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/v1/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Password Recovery Endpoints
  async forgotPassword(data: { email: string }): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: { 
    token: string; 
    new_password: string; 
    confirm_password: string; 
  }): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User Management Endpoints
  async getUsers(params: {
    skip?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
    role?: string;
  } = {}): Promise<PaginatedUsersResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_CONFIG.ENDPOINTS.USERS}?${queryString}` : API_CONFIG.ENDPOINTS.USERS;
    
    return this.request<PaginatedUsersResponse>(endpoint);
  }

  async getUserById(userId: number): Promise<{ success: boolean; user: User }> {
    return this.request(API_CONFIG.ENDPOINTS.USER_BY_ID(userId));
  }

  async createUser(data: CreateUserRequest): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.USERS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(userId: number, data: UpdateUserRequest): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.USER_BY_ID(userId), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: number): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.USER_BY_ID(userId), {
      method: 'DELETE',
    });
  }

  // Role Management Endpoints
  async getRoles(): Promise<{ success: boolean; roles: Array<{ id: number; name: string; description: string; }> }> {
    return this.request<{ success: boolean; roles: Array<{ id: number; name: string; description: string; }> }>(
      API_ENDPOINTS.ROLES.BASE
    );
  }

  // Profile Management Endpoints
  async getProfile(): Promise<{ success: boolean; profile: UserProfile }> {
    return this.request(API_CONFIG.ENDPOINTS.PROFILE_ME);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.PROFILE_ME, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Business Logic - Lifecycle Management
  async initiateUserLifecycle(data: LifecycleInitiateRequest): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.LIFECYCLE_INITIATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async progressLifecycle(data: LifecycleProgressRequest): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.LIFECYCLE_PROGRESS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLifecycleAnalytics(): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.LIFECYCLE_ANALYTICS);
  }

  // Business Logic - Analytics & Segmentation
  async getUserAnalytics(): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.USER_ANALYTICS);
  }

  async createSegment(data: CreateSegmentRequest): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.SEGMENTATION_CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCohortAnalysis(period: 'weekly' | 'monthly' | 'quarterly' = 'monthly'): Promise<ApiResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.COHORT_ANALYSIS}?period=${period}`);
  }

  async getChurnPrediction(userIds?: number[]): Promise<ApiResponse> {
    const params = userIds ? `?${userIds.map(id => `user_ids=${id}`).join('&')}` : '';
    return this.request(`${API_CONFIG.ENDPOINTS.CHURN_PREDICTION}${params}`);
  }

  // Business Logic - Workflow Management
  async initiateWorkflow(data: WorkflowInitiateRequest): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.WORKFLOW_INITIATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveWorkflow(requestId: string, data: WorkflowApprovalRequest): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.WORKFLOW_APPROVE(requestId), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPendingWorkflows(): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.WORKFLOW_PENDING);
  }

  async getWorkflowStatus(requestId: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.WORKFLOW_STATUS(requestId));
  }

  // Business Logic - Onboarding Management
  async assignOnboarding(data: OnboardingAssignRequest): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.ONBOARDING_ASSIGN, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async startOnboarding(userId: number): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.ONBOARDING_START(userId), {
      method: 'POST',
    });
  }

  async completeOnboardingStep(userId: number, data: OnboardingCompleteStepRequest): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.ONBOARDING_COMPLETE_STEP(userId), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOnboardingProgress(userId: number): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.ONBOARDING_PROGRESS(userId));
  }

  // Business Logic - Compliance
  async getComplianceReport(params: {
    user_ids?: number[];
    requirements?: string[];
  } = {}): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.user_ids) {
      params.user_ids.forEach(id => queryParams.append('user_ids', id.toString()));
    }
    
    if (params.requirements) {
      params.requirements.forEach(req => queryParams.append('requirements', req));
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_CONFIG.ENDPOINTS.COMPLIANCE_REPORT}?${queryString}` : API_CONFIG.ENDPOINTS.COMPLIANCE_REPORT;
    
    return this.request(endpoint);
  }

  // Business Integration
  async getBusinessDashboard(params: {
    include_analytics?: boolean;
    include_pending_workflows?: boolean;
    include_lifecycle_stats?: boolean;
    include_compliance_summary?: boolean;
    date_range_days?: number;
  } = {}): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_CONFIG.ENDPOINTS.BUSINESS_DASHBOARD}?${queryString}` : API_CONFIG.ENDPOINTS.BUSINESS_DASHBOARD;
    
    return this.request(endpoint);
  }

  // Generic method for external custom requests
  async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, options);
  }

  private async parseJson<T>(response: Response): Promise<T | undefined> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      try {
        return (await response.json()) as T;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('[ApiClient] Failed to parse JSON response:', error);
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
        console.warn('[ApiClient] Failed to read response text:', error);
      }
      return undefined;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
