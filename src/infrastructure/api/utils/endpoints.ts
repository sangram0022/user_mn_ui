/**
 * API Endpoint utilities for creating consistent endpoint URLs
 */

export interface EndpointConfig {
  baseURL?: string;
  version?: string;
  path: string;
  params?: Record<string, string | number>;
}

export const createApiEndpoint = (config: EndpointConfig): string => {
  const { baseURL = '/api', version = 'v1', path, params } = config;

  let endpoint = `${baseURL}/${version}${path}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value.toString());
    });

    const queryString = searchParams.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
  }

  return endpoint;
};

export const apiEndpoints = {
  // Authentication endpoints
  auth: {
    login: () => createApiEndpoint({ path: '/auth/login' }),
    register: () => createApiEndpoint({ path: '/auth/register' }),
    logout: () => createApiEndpoint({ path: '/auth/logout' }),
    refresh: () => createApiEndpoint({ path: '/auth/refresh' }),
    verifyEmail: () => createApiEndpoint({ path: '/auth/verify-email' }),
    resendVerification: () => createApiEndpoint({ path: '/auth/resend-verification' }),
    passwordReset: () => createApiEndpoint({ path: '/auth/password-reset' }),
    resetPassword: () => createApiEndpoint({ path: '/auth/reset-password' }),
    changePassword: () => createApiEndpoint({ path: '/auth/change-password' }),
  },

  // Profile endpoints
  profile: {
    me: () => createApiEndpoint({ path: '/profile/me' }),
  },

  // Admin endpoints
  admin: {
    users: (params?: Record<string, string | number>) =>
      createApiEndpoint({ path: '/admin/users', params }),
    userById: (userId: string) => createApiEndpoint({ path: `/admin/users/${userId}` }),
    approveUser: () => createApiEndpoint({ path: '/admin/approve-user' }),
    rejectUser: (userId: string) => createApiEndpoint({ path: `/admin/users/${userId}/reject` }),
    roles: () => createApiEndpoint({ path: '/admin/roles' }),
    stats: () => createApiEndpoint({ path: '/admin/stats' }),
    auditLogs: (params?: Record<string, string | number>) =>
      createApiEndpoint({ path: '/admin/audit-logs', params }),
  },

  // Audit endpoints
  audit: {
    logs: (params?: Record<string, string | number>) =>
      createApiEndpoint({ path: '/audit/logs', params }),
    summary: () => createApiEndpoint({ path: '/audit/summary' }),
  },

  // Bulk operations endpoints
  bulk: {
    createUsers: () => createApiEndpoint({ path: '/bulk/users/create' }),
    validateUsers: () => createApiEndpoint({ path: '/bulk/users/validate' }),
  },

  // GDPR endpoints
  gdpr: {
    exportMyData: () => createApiEndpoint({ path: '/gdpr/export/my-data' }),
    deleteMyAccount: () => createApiEndpoint({ path: '/gdpr/delete/my-account' }),
  },

  // Health endpoints
  health: {
    basic: () => createApiEndpoint({ path: '/health', baseURL: '' }),
    ready: () => createApiEndpoint({ path: '/health/ready', baseURL: '' }),
    detailed: () => createApiEndpoint({ path: '/health/detailed', baseURL: '' }),
    db: () => createApiEndpoint({ path: '/health/db', baseURL: '' }),
    system: () => createApiEndpoint({ path: '/health/system', baseURL: '' }),
  },

  // Analytics endpoints
  analytics: {
    events: (params?: Record<string, string | number>) =>
      createApiEndpoint({ path: '/analytics/events', params }),
    metrics: (params?: Record<string, string | number>) =>
      createApiEndpoint({ path: '/analytics/metrics', params }),
    reports: (params?: Record<string, string | number>) =>
      createApiEndpoint({ path: '/analytics/reports', params }),
    reportById: (reportId: string) => createApiEndpoint({ path: `/analytics/reports/${reportId}` }),
    userAnalytics: (userId: string, params?: Record<string, string | number>) =>
      createApiEndpoint({ path: `/analytics/users/${userId}`, params }),
    systemAnalytics: (params?: Record<string, string | number>) =>
      createApiEndpoint({ path: '/analytics/system', params }),
  },

  // Workflow endpoints
  workflows: {
    list: (params?: Record<string, string | number>) =>
      createApiEndpoint({ path: '/workflows', params }),
    byId: (workflowId: string) => createApiEndpoint({ path: `/workflows/${workflowId}` }),
    execute: (workflowId: string) =>
      createApiEndpoint({ path: `/workflows/${workflowId}/execute` }),
    instances: (workflowId: string, params?: Record<string, string | number>) =>
      createApiEndpoint({ path: `/workflows/${workflowId}/instances`, params }),
    instanceById: (workflowId: string, instanceId: string) =>
      createApiEndpoint({ path: `/workflows/${workflowId}/instances/${instanceId}` }),
    cancelInstance: (workflowId: string, instanceId: string) =>
      createApiEndpoint({ path: `/workflows/${workflowId}/instances/${instanceId}/cancel` }),
  },
};
