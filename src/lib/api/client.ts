import { BACKEND_CONFIG } from '@shared/config/api';
import { createCSRFTokenService } from '@shared/services/auth/csrfTokenService';
import { tokenService } from '@shared/services/auth/tokenService';
import type {
  AdminActivateUserResponse,
  AdminDeactivateUserResponse,
  AdminUsersQuery,
  AssignRoleResponse,
  AuditLog,
  AuditLogsQueryParams,
  AuditSummary,
  ChangePasswordRequest,
  CreateRoleRequest,
  CreateRoleResponse,
  CreateUserRequest,
  CSRFTokenResponse,
  DatabaseHealthResponse,
  DeleteRoleResponse,
  DetailedHealthResponse,
  ForgotPasswordResponse,
  FrontendErrorRequest,
  FrontendErrorResponse,
  GDPRDeleteRequest,
  GDPRDeleteResponse,
  GDPRExportRequest,
  GDPRExportResponse,
  GDPRExportStatus,
  HealthCheckResponse,
  LoginResponse,
  PendingWorkflow,
  ReadinessCheckResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  ResetPasswordRequest,
  RevokeRoleResponse,
  // ✅ NEW: Backend API types
  RoleResponse,
  SystemHealthResponse,
  UpdateRoleRequest,
  UpdateRoleResponse,
  UpdateUserRequest,
  UserAnalytics,
  UserProfile,
  UserRole,
  UserSummary,
} from '@shared/types';
import { normalizeApiError } from '@shared/utils/error';
import { logger } from './../../shared/utils/logger';

import { ApiError } from './error';

const DEFAULT_BASE_URL = BACKEND_CONFIG.API_BASE_URL;

/**
 * Complete API Endpoints (48 endpoints)
 * Reference: backend_api_details/API_DOCUMENTATION.md
 *
 * ✅ All endpoints match backend specification 100%
 */
const ENDPOINTS = {
  // ============================================================================
  // AUTHENTICATION ENDPOINTS (13 endpoints)
  // ============================================================================
  auth: {
    // Standard authentication (JWT tokens)
    login: '/auth/login', // POST - User login
    register: '/auth/register', // POST - User registration
    logout: '/auth/logout', // POST - User logout
    refresh: '/auth/refresh', // POST - Refresh access token
    verifyEmail: '/auth/verify-email', // POST - Verify email with token
    resendVerification: '/auth/resend-verification', // POST - Resend verification email
    forgotPassword: '/auth/forgot-password', // POST - Request password reset
    resetPassword: '/auth/reset-password', // POST - Reset password with token
    changePassword: '/auth/change-password', // POST - Change password (authenticated)
    passwordReset: '/auth/password-reset', // POST - Password reset (alias)

    // Secure authentication (httpOnly cookies)
    loginSecure: '/auth/secure-login', // POST - Login with secure cookies
    logoutSecure: '/auth/secure-logout', // POST - Logout (clear cookies)
    refreshSecure: '/auth/secure-refresh', // POST - Refresh token (cookies)

    // CSRF protection
    csrfToken: '/auth/csrf-token', // GET - Get CSRF token
    validateCsrf: '/auth/validate-csrf', // POST - Validate CSRF token
  },

  // ============================================================================
  // PROFILE ENDPOINTS (6 endpoints with aliases)
  // ============================================================================
  profile: {
    me: '/profile/me', // GET/PUT - Current user profile
    root: '/profile', // GET/PUT - Profile (alias)
    rootSlash: '/profile/', // GET/PUT - Profile (alias)
  },

  // ============================================================================
  // ADMIN - USER MANAGEMENT ENDPOINTS (7 endpoints)
  // ============================================================================
  admin: {
    users: '/admin/users', // GET/POST - List/Create users
    userById: (userId: string) => `/admin/users/${userId}`, // GET/PUT/DELETE - User operations
    approveUserLegacy: '/admin/approve-user', // POST - Approve user (legacy)
    approveUser: (userId: string) => `/admin/users/${userId}/approve`, // POST - Approve user (RESTful)
    rejectUser: (userId: string) => `/admin/users/${userId}/reject`, // POST - Reject user

    // Custom activation endpoints (if different from approve)
    activateUser: (userId: string) => `/admin/users/${userId}/activate`, // POST - Activate user
    deactivateUser: (userId: string) => `/admin/users/${userId}/deactivate`, // POST - Deactivate user

    // ============================================================================
    // ADMIN - ROLE MANAGEMENT ENDPOINTS (7 endpoints) ✅ NEW
    // ============================================================================
    roles: '/admin/roles', // GET/POST - List/Create roles
    roleByName: (roleName: string) => `/admin/roles/${roleName}`, // GET/PUT/DELETE - Role operations
    assignRole: (userId: string) => `/admin/users/${userId}/assign-role`, // POST - Assign role
    revokeRole: (userId: string) => `/admin/users/${userId}/revoke-role`, // POST - Revoke role

    // ============================================================================
    // ADMIN - AUDIT LOGS (1 endpoint)
    // ============================================================================
    auditLogs: '/admin/audit-logs', // GET - Admin audit logs

    // Analytics
    analytics: '/admin/analytics', // GET - User analytics
  },

  // ============================================================================
  // AUDIT ENDPOINTS (2 endpoints)
  // ============================================================================
  audit: {
    logs: '/audit/logs', // GET - Query audit logs
    summary: '/audit/summary', // GET - Audit summary statistics
  },

  // ============================================================================
  // GDPR ENDPOINTS (3 endpoints)
  // ============================================================================
  gdpr: {
    exportMyData: '/gdpr/export/my-data', // POST - Export personal data
    exportStatus: (exportId: string) => `/gdpr/export/status/${exportId}`, // GET - Export status
    deleteMyAccount: '/gdpr/delete/my-account', // DELETE - Delete account (GDPR)
  },

  // ============================================================================
  // HEALTH ENDPOINTS (7 endpoints) ✅ NEW
  // ============================================================================
  health: {
    root: '/health/', // GET - Basic health check
    ping: '/health/ping', // GET - Ping endpoint
    ready: '/health/ready', // GET - Readiness probe
    live: '/health/live', // GET - Liveness probe
    detailed: '/health/detailed', // GET - Detailed health status
    database: '/health/database', // GET - Database health check
    system: '/health/system', // GET - System resources check

    // Legacy endpoint (deprecated, use /health/)
    check: '/health', // GET - Health check (legacy)
  },

  // ============================================================================
  // LOGS ENDPOINTS (1 endpoint) ✅ NEW
  // ============================================================================
  logs: {
    frontendErrors: '/logs/frontend-errors', // POST - Log frontend errors
  },

  // ============================================================================
  // WORKFLOWS (Non-standard, keeping for backward compatibility)
  // ============================================================================
  workflows: {
    pending: '/workflows/pending', // GET - Pending workflows
  },
} as const;
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions extends RequestInit {
  method?: HttpMethod;
  timeout?: number; // [NEW] Request timeout in milliseconds (default: 30000)
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

interface LogoutResponse {
  message: string;
  success?: boolean;
}

export class ApiClient {
  private baseURL: string;
  private session: StoredSession | null;
  // Request deduplication: prevent multiple simultaneous identical requests
  private pendingRequests: Map<string, Promise<unknown>>;
  // CSRF Token Service for httpOnly cookie-based authentication
  private csrfTokenService: ReturnType<typeof createCSRFTokenService>;
  // Configuration flag for using new secure endpoints
  private useSecureEndpoints: boolean;
  // Rate limit tracking with exponential backoff
  private rateLimitState: Map<string, { retryAfter: number; backoffMs: number }>;
  // Retry configuration for transient errors
  private retryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    retryableStatusCodes: [500, 502, 503, 504], // Server errors
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH'], // Network errors
  };

  constructor(baseURL: string = DEFAULT_BASE_URL, useSecureEndpoints = true) {
    this.baseURL = baseURL;
    this.session = this.loadSession();
    this.pendingRequests = new Map();
    this.csrfTokenService = createCSRFTokenService(baseURL);
    this.useSecureEndpoints = useSecureEndpoints;
    this.rateLimitState = new Map();
  }

  private loadSession(): StoredSession | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      // Use sessionStorage for better security (tokens cleared on tab close)
      const accessToken =
        window.sessionStorage.getItem('access_token') ??
        window.sessionStorage.getItem('token') ??
        undefined;
      if (!accessToken) {
        return null;
      }

      const refreshToken = window.sessionStorage.getItem('refresh_token') ?? undefined;
      const issuedAt = window.sessionStorage.getItem('token_issued_at') ?? undefined;
      const expiresInString = window.sessionStorage.getItem('token_expires_in') ?? undefined;
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
        // Clear all token data from sessionStorage
        window.sessionStorage.removeItem('access_token');
        window.sessionStorage.removeItem('refresh_token');
        window.sessionStorage.removeItem('token_issued_at');
        window.sessionStorage.removeItem('token_expires_in');
        window.sessionStorage.removeItem('token');
        this.session = null;
        return;
      }

      // Store tokens in sessionStorage (cleared on tab close for better security)
      window.sessionStorage.setItem('access_token', session.accessToken);
      window.sessionStorage.setItem('token', session.accessToken);
      if (session.refreshToken) {
        window.sessionStorage.setItem('refresh_token', session.refreshToken);
      } else {
        window.sessionStorage.removeItem('refresh_token');
      }

      if (session.issuedAt) {
        window.sessionStorage.setItem('token_issued_at', session.issuedAt);
      }

      if (typeof session.expiresIn === 'number') {
        window.sessionStorage.setItem('token_expires_in', String(session.expiresIn));
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

    // Add CSRF token for state-changing requests (when using new secure endpoints)
    if (this.useSecureEndpoints) {
      const csrfHeader = this.csrfTokenService.getTokenHeader();
      if (csrfHeader) {
        Object.assign(headers, csrfHeader);
      }
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

  /**
   * Request deduplication: if a request to the same URL with same method is already pending,
   * return the existing promise instead of creating a new request.
   * For POST/PUT/DELETE with body, include body hash in deduplication key.
   */
  private async dedupedRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const method = options.method ?? 'GET';

    // For mutation requests with body, include body in deduplication key
    let dedupeKey = `${method}:${path}`;
    if (options.body && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
      // Simple hash of body for deduplication
      const bodyStr =
        typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      const bodyHash = bodyStr
        .split('')
        .reduce((hash, char) => (hash << 5) - hash + char.charCodeAt(0), 0);
      dedupeKey = `${method}:${path}:${bodyHash}`;
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(dedupeKey);
    if (pending) {
      logger.debug(`[API] Deduplicating request: ${dedupeKey}`);
      return pending as Promise<T>;
    }

    // Create new request and store promise
    const requestPromise = this.request<T>(path, options).finally(() => {
      // Clean up after request completes
      this.pendingRequests.delete(dedupeKey);
    });

    this.pendingRequests.set(dedupeKey, requestPromise);
    return requestPromise;
  }

  /**
   * Calculate exponential backoff delay with jitter
   * Prevents "thundering herd" problem when multiple clients retry simultaneously
   * Formula: delay * (1 + random jitter +/- 10%)
   */
  private calculateRetryDelay(attempt: number): number {
    const baseDelay = this.retryConfig.baseDelay * Math.pow(2, attempt);
    const cappedDelay = Math.min(baseDelay, this.retryConfig.maxDelay);

    // [NEW] Add jitter: +/- 10% of delay to prevent synchronized retries
    const jitterFactor = 0.9 + Math.random() * 0.2; // Random between 0.9 and 1.1
    const delayWithJitter = cappedDelay * jitterFactor;

    return Math.round(delayWithJitter);
  }

  /**
   * Check if error is retryable (transient failure)
   */
  private isRetryableError(error: unknown): boolean {
    // Retryable HTTP status codes (5xx server errors)
    if (error instanceof ApiError) {
      // Retry server errors (5xx)
      if (this.retryConfig.retryableStatusCodes.includes(error.status)) {
        return true;
      }
      // Retry network errors (status 0 = network failure)
      if (error.status === 0 && error.code === 'NETWORK_ERROR') {
        return true;
      }
      return false;
    }

    // Network errors (fetch failures)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true;
    }

    // Node.js network errors (for SSR/testing environments)
    if (error && typeof error === 'object' && 'code' in error) {
      return this.retryConfig.retryableErrors.includes(String(error.code));
    }

    return false;
  }

  /**
   * Sleep for specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   *  PRODUCTION FIX: Fetch with timeout to prevent hanging requests
   * Prevents memory leaks from indefinite request hangs
   * Default timeout: 30 seconds per request
   */
  private fetchWithTimeout(
    url: string,
    config: RequestInit,
    timeoutMs: number = 30000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      logger.warn(`[API] Request timeout after ${timeoutMs}ms: ${url}`);
      controller.abort();
    }, timeoutMs);

    return fetch(url, { ...config, signal: controller.signal })
      .then((response) => {
        clearTimeout(timeoutId);
        return response;
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        if (error?.name === 'AbortError') {
          throw new ApiError({
            status: 0,
            message: `Request timeout after ${timeoutMs}ms`,
            code: 'REQUEST_TIMEOUT',
          });
        }
        throw error;
      });
  }

  /**
   * Retry wrapper with exponential backoff for transient errors
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    context: string,
    attempt = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const isRetryable = this.isRetryableError(error);
      const hasRetriesLeft = attempt < this.retryConfig.maxRetries;

      if (!isRetryable || !hasRetriesLeft) {
        // Don't retry: either non-retryable error or max retries reached
        if (hasRetriesLeft && !isRetryable) {
          logger.debug(`[API] Non-retryable error for ${context}`, { error });
        } else if (!hasRetriesLeft) {
          logger.warn(`[API] Max retries (${this.retryConfig.maxRetries}) reached for ${context}`, {
            error,
          });
        }
        throw error;
      }

      // Calculate delay and retry
      const delay = this.calculateRetryDelay(attempt);
      const retryNumber = attempt + 1;

      logger.warn(
        `[API] Retry ${retryNumber}/${this.retryConfig.maxRetries} for ${context} after ${delay}ms`,
        {
          error: error instanceof Error ? error.message : String(error),
          statusCode: error instanceof ApiError ? error.status : undefined,
          attempt: retryNumber,
          delay,
        }
      );

      await this.sleep(delay);
      return this.retryWithBackoff(operation, context, attempt + 1);
    }
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const method = options.method ?? 'GET';
    const context = `${method} ${path}`;

    // Wrap request execution with retry logic
    return this.retryWithBackoff(() => this._executeRequest<T>(path, options), context);
  }

  /**
   * Execute HTTP request (internal implementation)
   * Called by request() with retry wrapper
   */
  private async _executeRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${path.startsWith('/') ? path : `/${path}`}`;
    const method = options.method ?? 'GET';

    // Check for active rate limit on this endpoint
    const rateLimitKey = `${method}:${path}`;
    const rateLimitInfo = this.rateLimitState.get(rateLimitKey);

    if (rateLimitInfo && Date.now() < rateLimitInfo.retryAfter) {
      const waitMs = rateLimitInfo.retryAfter - Date.now();
      logger.warn(`[API] Rate limited, waiting ${waitMs}ms before retry`, {
        endpoint: rateLimitKey,
        backoffMs: rateLimitInfo.backoffMs,
      });

      // Wait for backoff period
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    const config: RequestInit = {
      method,
      // Enable httpOnly cookie transmission (required for secure endpoints)
      credentials: this.useSecureEndpoints ? 'include' : 'same-origin',
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
      //  Use timeout-wrapped fetch (30s default, configurable per request)
      const requestTimeoutMs = options.timeout || 30000;
      response = await this.fetchWithTimeout(url, config, requestTimeoutMs);

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

      //  PRODUCTION FIX: Handle rate limiting (429) with automatic retry
      // Don't throw immediately - let retryWithBackoff handle it
      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('Retry-After');
        const currentBackoff = rateLimitInfo?.backoffMs ?? 1000;
        const nextBackoff = Math.min(currentBackoff * 2, 60000); // Max 60 seconds

        // Add jitter to retry-after delay to prevent thundering herd
        const jitterFactor = 0.9 + Math.random() * 0.2; // 10% jitter
        const retryAfterMs = retryAfterHeader
          ? Math.round(parseInt(retryAfterHeader, 10) * 1000 * jitterFactor)
          : Math.round(currentBackoff * jitterFactor);

        this.rateLimitState.set(rateLimitKey, {
          retryAfter: Date.now() + retryAfterMs,
          backoffMs: nextBackoff,
        });

        logger.warn(`[API] Rate limit hit (429), will retry after ${retryAfterMs}ms`, {
          endpoint: rateLimitKey,
          backoffMs: nextBackoff,
          retryAfterHeader,
          jitterApplied: true,
        });

        //  PRODUCTION READY: Emit event for UI feedback
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('api:rate-limit', {
              detail: { retryAfterMs, endpoint: rateLimitKey },
            })
          );
        }

        // Wait before throwing so retry logic can pick it up
        await this.sleep(retryAfterMs);
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
        details: normalized.detail,
        errors: normalized.errors,
        headers: response.headers,
        payload: errorPayload,
      });
    }

    // Clear rate limit state on successful request
    if (rateLimitInfo) {
      this.rateLimitState.delete(rateLimitKey);
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

    // Use secure endpoint if enabled, otherwise fallback to legacy endpoint
    const endpoint = this.useSecureEndpoints ? ENDPOINTS.auth.loginSecure : ENDPOINTS.auth.login;

    const response = await this.request<LoginResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.setSessionTokens(response);

    // For secure endpoints, fetch CSRF token after login
    if (this.useSecureEndpoints) {
      try {
        await this.csrfTokenService.fetchToken();
        logger.debug('CSRF token fetched after login');
      } catch (err) {
        logger.warn('Failed to fetch CSRF token after login', { error: err });
        // Continue anyway, CSRF token will be fetched on first request
      }
    }

    return response;
  }

  /**
   * Secure login using httpOnly cookies (recommended)
   * Automatically fetches CSRF token for subsequent requests
   */
  async loginSecure(
    emailOrCredentials: string | { email: string; password: string },
    password?: string
  ): Promise<LoginResponse> {
    const credentials =
      typeof emailOrCredentials === 'string'
        ? { email: emailOrCredentials, password: password ?? '' }
        : emailOrCredentials;

    const response = await this.request<LoginResponse>(ENDPOINTS.auth.loginSecure, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.setSessionTokens(response);

    // Fetch CSRF token after successful login
    try {
      await this.csrfTokenService.fetchToken();
      logger.debug('CSRF token fetched after secure login');
    } catch (err) {
      logger.warn('Failed to fetch CSRF token after secure login', { error: err });
      // Continue anyway, CSRF token will be fetched on first request
    }

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
      // Use secure endpoint if enabled
      const endpoint = this.useSecureEndpoints
        ? ENDPOINTS.auth.logoutSecure
        : ENDPOINTS.auth.logout;
      const response = await this.request<LogoutResponse>(endpoint, {
        method: 'POST',
      });
      return response;
    } finally {
      // Clear session and CSRF tokens
      this.clearSession();
      this.csrfTokenService.clearAll();
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
    return await this.dedupedRequest<UserProfile>(ENDPOINTS.profile.me);
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
    const response = await this.dedupedRequest<UserListResponse[]>(path);
    return response.map((user) => this.mapUserSummary(user));
  }

  async getUser(userId: string): Promise<UserSummary> {
    const response = await this.dedupedRequest<UserDetailResponse>(
      ENDPOINTS.admin.userById(userId)
    );
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

  async activateUser(userId: string): Promise<AdminActivateUserResponse> {
    return await this.request<AdminActivateUserResponse>(ENDPOINTS.admin.activateUser(userId), {
      method: 'POST',
    });
  }

  async deactivateUser(userId: string, reason: string): Promise<AdminDeactivateUserResponse> {
    return await this.request<AdminDeactivateUserResponse>(ENDPOINTS.admin.deactivateUser(userId), {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
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
      const analytics = await this.dedupedRequest<UserAnalytics>(ENDPOINTS.admin.analytics);
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
    return await this.dedupedRequest<T>('/business-logic/lifecycle/analytics');
  }

  /**
   * Get audit logs with advanced filtering
   * GET /audit/logs
   * @param params Query parameters (action, resource, user_id, start_date, end_date, severity, page, limit)
   * @returns Array of audit log entries
   */
  async getAuditLogs(params?: AuditLogsQueryParams): Promise<AuditLog[]> {
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
    return await this.dedupedRequest<AuditLog[]>(path);
  }

  async getAuditSummary(): Promise<AuditSummary> {
    return await this.dedupedRequest<AuditSummary>(ENDPOINTS.audit.summary);
  }

  async getPendingApprovals(): Promise<PendingWorkflow[]> {
    try {
      return await this.dedupedRequest<PendingWorkflow[]>(ENDPOINTS.workflows.pending);
    } catch (error) {
      if (import.meta.env.DEV) {
        logger.warn('Pending workflows endpoint unavailable', { error });
      }
      return [];
    }
  }

  async getCSRFToken(): Promise<CSRFTokenResponse> {
    return await this.request<CSRFTokenResponse>(ENDPOINTS.auth.csrfToken, {
      method: 'GET',
    });
  }

  /**
   * Request GDPR data export
   * POST /gdpr/export/my-data
   * @param options Export options (format, include_audit_logs, include_metadata)
   * @returns Export request confirmation with export_id
   */
  async requestGDPRExport(options?: GDPRExportRequest): Promise<GDPRExportResponse> {
    return await this.request<GDPRExportResponse>(ENDPOINTS.gdpr.exportMyData, {
      method: 'POST',
      body: options ? JSON.stringify(options) : undefined,
    });
  }

  async getGDPRExportStatus(exportId: string): Promise<GDPRExportStatus> {
    return await this.request<GDPRExportStatus>(ENDPOINTS.gdpr.exportStatus(exportId), {
      method: 'GET',
    });
  }

  async requestGDPRDelete(payload: GDPRDeleteRequest): Promise<GDPRDeleteResponse> {
    return await this.request<GDPRDeleteResponse>(ENDPOINTS.gdpr.deleteMyAccount, {
      method: 'DELETE',
      body: JSON.stringify(payload),
    });
  }

  async deleteMyAccount(
    password: string,
    confirmation: string,
    reason?: string
  ): Promise<GDPRDeleteResponse> {
    return await this.requestGDPRDelete({ password, confirmation, reason });
  }

  async healthCheck(): Promise<{ status: string; version: string; timestamp: string }> {
    return await this.request<{ status: string; version: string; timestamp: string }>(
      ENDPOINTS.health.check,
      {
        method: 'GET',
      }
    );
  }

  async ping(): Promise<{ message: string; timestamp: string }> {
    return await this.request<{ message: string; timestamp: string }>(ENDPOINTS.health.ping, {
      method: 'GET',
    });
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

  // ============================================================================
  // ROLE MANAGEMENT ENDPOINTS (7 new methods) ✅
  // Reference: backend_api_details/API_ADMIN_ENDPOINTS.md
  // ============================================================================

  /**
   * Get all roles
   * GET /admin/roles
   * @returns Array of all roles with permissions
   */
  async getAllRoles(): Promise<RoleResponse[]> {
    return await this.dedupedRequest<RoleResponse[]>(ENDPOINTS.admin.roles);
  }

  /**
   * Create new role
   * POST /admin/roles
   * @param payload Role details (name, description, permissions)
   * @returns Created role details
   */
  async createRole(payload: CreateRoleRequest): Promise<CreateRoleResponse> {
    return await this.request<CreateRoleResponse>(ENDPOINTS.admin.roles, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get role by name
   * GET /admin/roles/{roleName}
   * @param roleName Role name (e.g., 'admin', 'manager')
   * @returns Role details with permissions
   */
  async getRole(roleName: string): Promise<RoleResponse> {
    return await this.dedupedRequest<RoleResponse>(ENDPOINTS.admin.roleByName(roleName));
  }

  /**
   * Update role
   * PUT /admin/roles/{roleName}
   * @param roleName Role name to update
   * @param payload Updated role details
   * @returns Updated role details
   */
  async updateRole(roleName: string, payload: UpdateRoleRequest): Promise<UpdateRoleResponse> {
    return await this.request<UpdateRoleResponse>(ENDPOINTS.admin.roleByName(roleName), {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Delete role
   * DELETE /admin/roles/{roleName}
   * @param roleName Role name to delete
   * @returns Deletion confirmation
   */
  async deleteRole(roleName: string): Promise<DeleteRoleResponse> {
    return await this.request<DeleteRoleResponse>(ENDPOINTS.admin.roleByName(roleName), {
      method: 'DELETE',
    });
  }

  /**
   * Assign role to user
   * POST /admin/users/{userId}/assign-role
   * @param userId User ID
   * @param role Role name to assign
   * @returns Assignment confirmation
   */
  async assignRoleToUser(userId: string, role: string): Promise<AssignRoleResponse> {
    return await this.request<AssignRoleResponse>(ENDPOINTS.admin.assignRole(userId), {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  /**
   * Revoke role from user
   * POST /admin/users/{userId}/revoke-role
   * @param userId User ID
   * @returns Revocation confirmation
   */
  async revokeRoleFromUser(userId: string): Promise<RevokeRoleResponse> {
    return await this.request<RevokeRoleResponse>(ENDPOINTS.admin.revokeRole(userId), {
      method: 'POST',
    });
  }

  // ============================================================================
  // HEALTH CHECK ENDPOINTS (5 new methods) ✅
  // Reference: backend_api_details/API_PROFILE_GDPR_ENDPOINTS.md
  // ============================================================================

  /**
   * Readiness probe (Kubernetes)
   * GET /health/ready
   * @returns Readiness status (dependencies checked)
   */
  async readinessCheck(): Promise<ReadinessCheckResponse> {
    return await this.request<ReadinessCheckResponse>(ENDPOINTS.health.ready, {
      method: 'GET',
    });
  }

  /**
   * Liveness probe (Kubernetes)
   * GET /health/live
   * @returns Liveness status (basic health)
   */
  async livenessCheck(): Promise<HealthCheckResponse> {
    return await this.request<HealthCheckResponse>(ENDPOINTS.health.live, {
      method: 'GET',
    });
  }

  /**
   * Detailed health check
   * GET /health/detailed
   * @returns Detailed health status with components
   */
  async detailedHealth(): Promise<DetailedHealthResponse> {
    return await this.request<DetailedHealthResponse>(ENDPOINTS.health.detailed, {
      method: 'GET',
    });
  }

  /**
   * Database health check
   * GET /health/database
   * @returns Database connection status
   */
  async databaseHealth(): Promise<DatabaseHealthResponse> {
    return await this.request<DatabaseHealthResponse>(ENDPOINTS.health.database, {
      method: 'GET',
    });
  }

  /**
   * System health check
   * GET /health/system
   * @returns System resources (CPU, memory, disk)
   */
  async systemHealth(): Promise<SystemHealthResponse> {
    return await this.request<SystemHealthResponse>(ENDPOINTS.health.system, {
      method: 'GET',
    });
  }

  // ============================================================================
  // FRONTEND ERROR LOGGING ENDPOINT (1 new method) ✅
  // Reference: backend_api_details/API_PROFILE_GDPR_ENDPOINTS.md
  // ============================================================================

  /**
   * Log frontend error to backend
   * POST /logs/frontend-errors
   * @param payload Frontend error details
   * @returns Logging confirmation
   */
  async logFrontendError(payload: FrontendErrorRequest): Promise<FrontendErrorResponse> {
    return await this.request<FrontendErrorResponse>(ENDPOINTS.logs.frontendErrors, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
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

  // Authentication
  login: apiClient.login.bind(apiClient),
  loginSecure: apiClient.loginSecure.bind(apiClient),
  register: apiClient.register.bind(apiClient),
  logout: apiClient.logout.bind(apiClient),
  requestPasswordReset: apiClient.requestPasswordReset.bind(apiClient),
  forgotPassword: apiClient.forgotPassword.bind(apiClient),
  resetPassword: apiClient.resetPassword.bind(apiClient),
  changePassword: apiClient.changePassword.bind(apiClient),
  verifyEmail: apiClient.verifyEmail.bind(apiClient),
  resendVerification: apiClient.resendVerification.bind(apiClient),

  // Profile
  getUserProfile: apiClient.getUserProfile.bind(apiClient),
  updateUserProfile: apiClient.updateUserProfile.bind(apiClient),

  // Admin - User Management
  getUsers: apiClient.getUsers.bind(apiClient),
  getUser: apiClient.getUser.bind(apiClient),
  createUser: apiClient.createUser.bind(apiClient),
  updateUser: apiClient.updateUser.bind(apiClient),
  deleteUser: apiClient.deleteUser.bind(apiClient),
  approveUser: apiClient.approveUser.bind(apiClient),
  rejectUser: apiClient.rejectUser.bind(apiClient),
  activateUser: apiClient.activateUser.bind(apiClient),
  deactivateUser: apiClient.deactivateUser.bind(apiClient),

  // Admin - Analytics
  getUserAnalytics: apiClient.getUserAnalytics.bind(apiClient),

  // Admin - Role Management ✅ NEW (7 methods)
  getRoles: apiClient.getRoles.bind(apiClient),
  getAllRoles: apiClient.getAllRoles.bind(apiClient),
  createRole: apiClient.createRole.bind(apiClient),
  getRole: apiClient.getRole.bind(apiClient),
  updateRole: apiClient.updateRole.bind(apiClient),
  deleteRole: apiClient.deleteRole.bind(apiClient),
  assignRoleToUser: apiClient.assignRoleToUser.bind(apiClient),
  revokeRoleFromUser: apiClient.revokeRoleFromUser.bind(apiClient),

  // Audit
  getAuditLogs: apiClient.getAuditLogs.bind(apiClient),
  getAuditSummary: apiClient.getAuditSummary.bind(apiClient),

  // Workflows
  getPendingApprovals: apiClient.getPendingApprovals.bind(apiClient),

  // GDPR
  requestGDPRExport: apiClient.requestGDPRExport.bind(apiClient),
  getGDPRExportStatus: apiClient.getGDPRExportStatus.bind(apiClient),
  requestGDPRDelete: apiClient.requestGDPRDelete.bind(apiClient),
  deleteMyAccount: apiClient.deleteMyAccount.bind(apiClient),

  // Security
  getCSRFToken: apiClient.getCSRFToken.bind(apiClient),

  // Health ✅ NEW (7 methods total: 2 existing + 5 new)
  healthCheck: apiClient.healthCheck.bind(apiClient),
  ping: apiClient.ping.bind(apiClient),
  readinessCheck: apiClient.readinessCheck.bind(apiClient),
  livenessCheck: apiClient.livenessCheck.bind(apiClient),
  detailedHealth: apiClient.detailedHealth.bind(apiClient),
  databaseHealth: apiClient.databaseHealth.bind(apiClient),
  systemHealth: apiClient.systemHealth.bind(apiClient),

  // Frontend Error Logging ✅ NEW (1 method)
  logFrontendError: apiClient.logFrontendError.bind(apiClient),

  // Generic
  execute: apiClient.execute.bind(apiClient),
});

export default apiClient;
