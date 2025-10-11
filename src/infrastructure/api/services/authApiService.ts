import { apiClient } from '../apiClient';

export interface AuthApiResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
}

export interface AuthApiError {
  error_code: string;
  message: string;
  details?: any;
}

export const authApiService = {
  async login(email: string, password: string): Promise<AuthApiResponse> {
    const response = await apiClient.post<AuthApiResponse>('/auth/login', { email, password });
    return response.data;
  },

  async register(data: {
    email: string;
    password: string;
    confirm_password: string;
    first_name?: string;
    last_name?: string;
  }): Promise<{ user_id: string; message: string }> {
    const response = await apiClient.post<{ user_id: string; message: string }>(
      '/auth/register',
      data
    );
    return response.data;
  },

  async logout(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/logout');
    return response.data;
  },

  async refreshToken(): Promise<AuthApiResponse> {
    const response = await apiClient.post<AuthApiResponse>('/auth/refresh');
    return response.data;
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/verify-email', { token });
    return response.data;
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/resend-verification', {
      email,
    });
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/password-reset', { email });
    return response.data;
  },

  async resetPassword(token: string, new_password: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', {
      token,
      new_password,
    });
    return response.data;
  },

  async changePassword(
    current_password: string,
    new_password: string
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', {
      current_password,
      new_password,
    });
    return response.data;
  },
};
