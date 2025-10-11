import { apiClient } from '../apiClient';

export interface UserProfile {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  status: string;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface UserListItem {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
}

export const usersApiService = {
  // Profile endpoints
  async getMyProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/profile/me');
    return response.data;
  },

  async updateMyProfile(data: { first_name?: string; last_name?: string }): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/profile/me', data);
    return response.data;
  },

  // Admin endpoints
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    is_active?: boolean;
  }): Promise<UserListItem[]> {
    const response = await apiClient.get<UserListItem[]>('/admin/users', { params });
    return response.data;
  },

  async getUserById(userId: string): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>(`/admin/users/${userId}`);
    return response.data;
  },

  async createUser(data: CreateUserData): Promise<{ user_id: string; message: string }> {
    const response = await apiClient.post<{ user_id: string; message: string }>(
      '/admin/users',
      data
    );
    return response.data;
  },

  async updateUser(userId: string, data: UpdateUserData): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>(`/admin/users/${userId}`, data);
    return response.data;
  },

  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/admin/users/${userId}`);
    return response.data;
  },

  async approveUser(userId: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/admin/approve-user', {
      user_id: userId,
    });
    return response.data;
  },

  async rejectUser(userId: string, reason: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/admin/users/${userId}/reject`, {
      reason,
    });
    return response.data;
  },

  async getRoles(): Promise<
    Array<{
      name: string;
      display_name: string;
      description: string;
      permissions: string[];
    }>
  > {
    const response = await apiClient.get<
      Array<{
        name: string;
        display_name: string;
        description: string;
        permissions: string[];
      }>
    >('/admin/roles');
    return response.data;
  },

  async getAdminStats(): Promise<{
    total_users: number;
    active_users: number;
    inactive_users: number;
    unverified_users: number;
    unapproved_users: number;
    users_by_role: Record<string, number>;
    recent_registrations: number;
    recent_logins: number;
  }> {
    const response = await apiClient.get<{
      total_users: number;
      active_users: number;
      inactive_users: number;
      unverified_users: number;
      unapproved_users: number;
      users_by_role: Record<string, number>;
      recent_registrations: number;
      recent_logins: number;
    }>('/admin/stats');
    return response.data;
  },
};
