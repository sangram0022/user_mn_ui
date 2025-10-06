import baseApiClient, { type RequestOptions } from './apiClient';
import type {
  ChangePasswordRequest,
  CreateUserRequest,
  PendingWorkflow,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResendVerificationRequest,
  UserProfile,
  UserSummary,
  UserRole,
  UpdateUserRequest
} from '../types';

interface LegacyPageInfo {
  skip: number;
  limit: number;
  has_more: boolean;
}

interface LegacyUsersResponse {
  success: boolean;
  users: LegacyUser[];
  total: number;
  page_info: LegacyPageInfo;
}

export interface LegacyUser {
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
  };
  lifecycle_stage?: string;
  activity_score?: number;
  last_login_at?: string;
  created_at: string;
}

interface LegacyRolesResponse {
  success: boolean;
  roles: Array<Pick<UserRole, 'id' | 'name' | 'description' | 'permissions'>>;
}

interface LegacyRegisterPayload {
  email: string;
  password: string;
  confirm_password?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  terms_accepted?: boolean;
}

interface LegacyRegisterResponse {
  success: boolean;
  data?: RegisterResponse;
  message?: string;
  error?: string;
}

interface LegacyProfileResponse {
  success: boolean;
  profile?: UserProfile;
  message?: string;
}

interface LegacyActionResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

type LegacyCreateUserPayload = Partial<CreateUserRequest> & {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
};

interface LegacyAnalyticsResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

interface LegacyForgotPasswordResponse {
  success: boolean;
  message?: string;
}

interface LegacyResetPasswordResponse {
  success: boolean;
  message?: string;
}

const buildFullName = (summary: UserSummary): string | undefined => {
  const parts = [summary.first_name, summary.last_name].filter(Boolean);
  if (parts.length === 0) {
    return summary.full_name ?? undefined;
  }
  return parts.join(' ');
};

const toLegacyUser = (summary: UserSummary, index: number): LegacyUser => {
  const numericId = Number(summary.user_id);
  const fallbackId = index + 1;
  return {
    id: Number.isFinite(numericId) ? numericId : fallbackId,
    email: summary.email,
    username: summary.username ?? summary.email?.split('@')[0],
    full_name: buildFullName(summary),
    is_active: summary.is_active,
    is_verified: summary.is_verified,
    role: {
      id: fallbackId,
      name: summary.role,
      description: summary.role
    },
  lifecycle_stage: undefined,
  activity_score: undefined,
    last_login_at: summary.last_login_at ?? undefined,
    created_at: summary.created_at
  };
};

const resolvePageInfo = (params?: Record<string, unknown>): LegacyPageInfo => {
  const skip = typeof params?.skip === 'number'
    ? params.skip
    : Number(params?.skip ?? 0);
  const limit = typeof params?.limit === 'number'
    ? params.limit
    : Number(params?.limit ?? 25);
  return {
    skip,
    limit,
    has_more: false
  };
};

export const apiClientLegacy = {
  async register(payload: LegacyRegisterPayload): Promise<LegacyRegisterResponse> {
    const request: RegisterRequest = {
      email: payload.email,
      password: payload.password,
      confirm_password: payload.confirm_password ?? payload.password,
      first_name: payload.first_name ?? '',
      last_name: payload.last_name ?? '',
      username: payload.username
    };

  const response = await baseApiClient.register(request);
    return {
      success: true,
      data: response,
      message: response.message
    };
  },

  async forgotPassword(input: { email: string } | string): Promise<LegacyForgotPasswordResponse> {
    const email = typeof input === 'string' ? input : input.email;
  const response = await baseApiClient.forgotPassword(email);
    return {
      success: response.success ?? true,
      message: response.message ?? 'Password reset link sent if the email exists.'
    };
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<LegacyResetPasswordResponse> {
  const response = await baseApiClient.resetPassword(payload);
    return {
      success: true,
      message: response.message
    };
  },

  async resendVerificationEmail(email: string): Promise<LegacyActionResponse> {
  const response = await baseApiClient.resendVerification({ email } satisfies ResendVerificationRequest);
    return {
      success: true,
      message: response.message,
      data: response
    };
  },

  async verifyEmail(payload: { token: string }): Promise<LegacyActionResponse> {
  const response = await baseApiClient.verifyEmail(payload.token);
    return {
      success: true,
      message: response.message,
      data: response
    };
  },

  async getUserAnalytics(): Promise<LegacyAnalyticsResponse> {
  const analytics = await baseApiClient.getUserAnalytics();
    return {
      success: true,
      data: analytics
    };
  },

  async getUsers(params?: Record<string, unknown>): Promise<LegacyUsersResponse> {
    const summaries = await baseApiClient.getUsers();
    return {
      success: true,
      users: summaries.map(toLegacyUser),
      total: summaries.length,
      page_info: resolvePageInfo(params)
    };
  },

  async getRoles(): Promise<LegacyRolesResponse> {
    const roles = await baseApiClient.getRoles();
    return {
      success: true,
      roles: roles.map((role: UserRole, index: number) => ({
        id: role.id ?? index + 1,
        name: role.name,
        description: role.description ?? role.name,
        permissions: role.permissions ?? []
      }))
    };
  },

  async createUser(payload: LegacyCreateUserPayload): Promise<LegacyActionResponse> {
    const request: CreateUserRequest = {
      email: payload.email,
      password: payload.password,
      first_name: payload.first_name ?? payload.email.split('@')[0] ?? 'First',
      last_name: payload.last_name ?? 'User',
      role: payload.role,
      is_active: payload.is_active ?? true,
      username: payload.username,
      phone_number: payload.phone_number
    };

    const created = await baseApiClient.createUser(request);
    return {
      success: true,
      data: created,
      message: 'User created successfully.'
    };
  },

  async updateUser(userId: number | string, payload: UpdateUserRequest): Promise<LegacyActionResponse> {
    const updated = await baseApiClient.updateUser(String(userId), payload);
    return {
      success: true,
      data: updated,
      message: 'User updated successfully.'
    };
  },

  async deleteUser(userId: number | string): Promise<LegacyActionResponse> {
    const response = await baseApiClient.deleteUser(String(userId));
    return {
      success: true,
      data: response,
      message: response.message ?? 'User deleted successfully.'
    };
  },

  async initiateUserLifecycle(..._args: unknown[]): Promise<LegacyActionResponse> {
    return {
      success: false,
      message: 'Lifecycle automation is not yet available in this environment.'
    };
  },

  async getProfile(): Promise<LegacyProfileResponse> {
    const profile = await baseApiClient.getUserProfile();
    return {
      success: true,
      profile
    };
  },

  async updateProfile(payload: Partial<UserProfile>): Promise<LegacyActionResponse> {
    const updatedProfile = await baseApiClient.updateUserProfile(payload);
    return {
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully.'
    };
  },

  async changePassword(payload: ChangePasswordRequest): Promise<LegacyActionResponse> {
    const response = await baseApiClient.changePassword(payload);
    return {
      success: response.success ?? true,
      data: response,
      message: response.message ?? 'Password changed successfully.'
    };
  },

  async approveWorkflow(_requestId?: string | number, _payload?: unknown): Promise<LegacyActionResponse> {
    return {
      success: false,
      message: 'Workflow approvals are not yet integrated with the backend.'
    };
  },

  async getPendingWorkflows(): Promise<{ success: boolean; data: PendingWorkflow[]; message?: string }> {
    const workflows = await baseApiClient.getPendingApprovals();
    return {
      success: true,
      data: workflows,
      message: workflows.length ? undefined : 'No pending workflows.'
    };
  },

  async makeRequest(path: string, options?: RequestInit): Promise<unknown> {
    const normalizedOptions: RequestOptions | undefined = options
      ? {
          ...options,
          method: options.method && ['GET', 'POST', 'PUT', 'DELETE'].includes(options.method.toUpperCase())
            ? options.method.toUpperCase() as RequestOptions['method']
            : undefined
        }
      : undefined;

    return await baseApiClient.execute(path, normalizedOptions);
  }
};
export const apiClient = apiClientLegacy;
export default apiClientLegacy;
