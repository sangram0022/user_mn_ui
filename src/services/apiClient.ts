/**
 * @deprecated The services module has been replaced by @lib/api.
 * Migrate imports to "@lib/api" directly.
 */
export { ApiClient, apiClient, useApi } from '@lib/api';
export type { RequestOptions } from '@lib/api';
export { apiClient as default } from '@lib/api';

/* Legacy implementation retained for reference.
import type {
  AdminUsersQuery,
  AuditLog,
  AuditLogsQuery,
  AuditSummary,
  ChangePasswordRequest,
  * /
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return await this.request<ForgotPasswordResponse>(ENDPOINTS.auth.forgotPassword, {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(payload: ResetPasswordRequest): Promise<{ message: string }> {
    return await this.request<{ message: string }>(ENDPOINTS.auth.resetPassword, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async changePassword(payload: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return await this.request<ChangePasswordResponse>(ENDPOINTS.auth.changePassword, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return await this.request<{ message: string }>(ENDPOINTS.auth.verifyEmail, {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  async resendVerification(payload: ResendVerificationRequest): Promise<ResendVerificationResponse> {
    return await this.request<ResendVerificationResponse>(ENDPOINTS.auth.resendVerification, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getUserProfile(): Promise<UserProfile> {
    return await this.request<UserProfile>(ENDPOINTS.profile.me);
  }

  async updateUserProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
    return await this.request<UserProfile>(ENDPOINTS.profile.me, {
      method: 'PUT',
      body: JSON.stringify(payload)
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
      last_login_at: user.last_login_at ?? undefined
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
      body: JSON.stringify(payload)
    });

    return await this.getUser(response.user_id);
  }

  async updateUser(userId: string, payload: UpdateUserRequest): Promise<UserSummary> {
    const response = await this.request<UserDetailResponse>(ENDPOINTS.admin.userById(userId), {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return this.mapUserSummary(response);
  }

  async deleteUser(userId: string): Promise<DeleteUserResponse> {
    return await this.request<DeleteUserResponse>(ENDPOINTS.admin.userById(userId), {
      method: 'DELETE'
    });
  }

  async approveUser(userId: string): Promise<UserSummary> {
    await this.request(ENDPOINTS.admin.approveUser(userId), {
      method: 'POST'
    });
    return await this.getUser(userId);
  }

  async rejectUser(userId: string, reason?: string): Promise<UserSummary> {
    await this.request(ENDPOINTS.admin.rejectUser(userId), {
      method: 'POST',
      body: JSON.stringify({ reason })
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
      growth_rate: 0
    };

    try {
      const analytics = await this.request<UserAnalytics>(ENDPOINTS.admin.analytics);
      return {
        ...fallback,
        ...analytics,
        engagement_distribution: analytics.engagement_distribution ?? fallback.engagement_distribution,
        lifecycle_distribution: analytics.lifecycle_distribution ?? fallback.lifecycle_distribution,
        activity_trends: analytics.activity_trends ?? fallback.activity_trends
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('User analytics endpoint unavailable', error);
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
        console.warn('Pending workflows endpoint unavailable', error);
      }
      return [];
    }
  }

  async getRoles(): Promise<UserRole[]> {
    try {
      return await this.request<UserRole[]>('/admin/roles');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Roles endpoint unavailable, using fallback roles', error);
      }
      return [
        {
          id: 1,
          name: 'admin',
          description: 'Administrator',
          permissions: ['admin']
        },
        {
          id: 2,
          name: 'user',
          description: 'Standard User',
          permissions: []
        },
        {
          id: 3,
          name: 'manager',
          description: 'Manager',
          permissions: ['user:read', 'user:write']
        }
      ];
    }
  }

  async execute<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return await this.request<T>(path, options);
  }
}

export const apiClient = new ApiClient();

export const useApi = () => ({
  // Session helpers
  isAuthenticated: apiClient.isAuthenticated.bind(apiClient),
  setSessionTokens: apiClient.setSessionTokens.bind(apiClient),
  clearSession: apiClient.clearSession.bind(apiClient),

  // Auth flows
  login: apiClient.login.bind(apiClient),
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

  // Admin
  getUsers: apiClient.getUsers.bind(apiClient),
  getUser: apiClient.getUser.bind(apiClient),
  createUser: apiClient.createUser.bind(apiClient),
  updateUser: apiClient.updateUser.bind(apiClient),
  deleteUser: apiClient.deleteUser.bind(apiClient),
  approveUser: apiClient.approveUser.bind(apiClient),
  rejectUser: apiClient.rejectUser.bind(apiClient),
  getUserAnalytics: apiClient.getUserAnalytics.bind(apiClient),
  getRoles: apiClient.getRoles.bind(apiClient),

  // Audit & workflows
  getAuditLogs: apiClient.getAuditLogs.bind(apiClient),
  getAuditSummary: apiClient.getAuditSummary.bind(apiClient),
  getPendingApprovals: apiClient.getPendingApprovals.bind(apiClient),

  // Raw execution
  execute: apiClient.execute.bind(apiClient)
});

export default apiClient;
export type { RequestOptions };
*/
