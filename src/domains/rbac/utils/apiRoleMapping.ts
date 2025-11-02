// ========================================
// API Role Mapping - Backend endpoint configuration
// ========================================
// Centralized mapping of API endpoints to required roles
// Backend compatible with permissions.yaml from user_mn
// ========================================

import type { ApiEndpointConfig, UserRole } from '../types/rbac.types';

/**
 * ✅ SINGLE SOURCE OF TRUTH for API endpoint access control
 * Maps API endpoints to required roles and permissions
 * Backend compatible with user_mn/permissions.yaml
 */
export const API_ENDPOINTS: ApiEndpointConfig[] = [
  // ======================== Health Checks ========================
  {
    path: '/health',
    method: 'GET',
    requiredRoles: [],
    requiredPermissions: [],
    public: true,
    description: 'Health check - no auth required',
  },
  {
    path: '/health/ping',
    method: 'GET',
    requiredRoles: [],
    requiredPermissions: [],
    public: true,
    description: 'Ping endpoint',
  },

  // ======================== Authentication ========================
  {
    path: '/auth/login',
    method: 'POST',
    requiredRoles: [],
    requiredPermissions: [],
    public: true,
    description: 'User login',
  },
  {
    path: '/auth/register',
    method: 'POST',
    requiredRoles: [],
    requiredPermissions: [],
    public: true,
    description: 'User registration',
  },
  {
    path: '/auth/refresh-token',
    method: 'POST',
    requiredRoles: [],
    requiredPermissions: [],
    public: true,
    description: 'Refresh access token',
  },
  {
    path: '/auth/logout',
    method: 'POST',
    requiredRoles: ['user' as UserRole],
    requiredPermissions: [],
    description: 'Logout user',
  },

  // ======================== Email Verification ========================
  {
    path: '/auth/send-verification',
    method: 'POST',
    requiredRoles: [],
    requiredPermissions: [],
    public: true,
    description: 'Send verification email',
  },
  {
    path: '/auth/verify-email',
    method: 'POST',
    requiredRoles: [],
    requiredPermissions: [],
    public: true,
    description: 'Verify email with token',
  },
  {
    path: '/auth/resend-verification',
    method: 'POST',
    requiredRoles: ['user' as UserRole],
    requiredPermissions: [],
    description: 'Resend verification email',
  },

  // ======================== Password Management ========================
  {
    path: '/auth/forgot-password',
    method: 'POST',
    requiredRoles: [],
    requiredPermissions: [],
    public: true,
    description: 'Request password reset',
  },
  {
    path: '/auth/reset-password',
    method: 'POST',
    requiredRoles: [],
    requiredPermissions: [],
    public: true,
    description: 'Reset password with token',
  },
  {
    path: '/auth/change-password',
    method: 'POST',
    requiredRoles: ['user' as UserRole],
    requiredPermissions: [],
    description: 'Change password (authenticated)',
  },

  // ======================== User Profile ========================
  {
    path: '/user/profile',
    method: 'GET',
    requiredRoles: ['user' as UserRole],
    requiredPermissions: ['profile:view_own'],
    description: 'Get current user profile',
  },
  {
    path: '/user/profile',
    method: 'PUT',
    requiredRoles: ['user' as UserRole],
    requiredPermissions: ['profile:edit_own'],
    description: 'Update user profile',
  },

  // ======================== MFA Management ========================
  {
    path: '/mfa/enable',
    method: 'POST',
    requiredRoles: ['user' as UserRole],
    requiredPermissions: ['mfa:enable'],
    description: 'Enable MFA',
  },
  {
    path: '/mfa/disable',
    method: 'POST',
    requiredRoles: ['user' as UserRole],
    requiredPermissions: ['mfa:disable'],
    description: 'Disable MFA',
  },
  {
    path: '/mfa/verify',
    method: 'POST',
    requiredRoles: [],
    requiredPermissions: [],
    public: true,
    description: 'Verify MFA code',
  },

  // ======================== Session Management ========================
  {
    path: '/sessions',
    method: 'GET',
    requiredRoles: ['user' as UserRole],
    requiredPermissions: ['sessions:view_own'],
    description: 'List user sessions',
  },
  {
    path: '/sessions/:sessionId/revoke',
    method: 'POST',
    requiredRoles: ['user' as UserRole],
    requiredPermissions: ['sessions:revoke'],
    description: 'Revoke session',
  },
  {
    path: '/sessions/revoke-all',
    method: 'POST',
    requiredRoles: ['user' as UserRole],
    requiredPermissions: ['sessions:revoke'],
    description: 'Revoke all sessions',
  },

  // ======================== User Management (Admin) ========================
  {
    path: '/users',
    method: 'GET',
    requiredRoles: ['employee' as UserRole],
    requiredPermissions: ['users:view_list'],
    description: 'List users',
  },
  {
    path: '/users/:userId',
    method: 'GET',
    requiredRoles: ['employee' as UserRole],
    requiredPermissions: ['users:view_detail'],
    description: 'Get user details',
  },
  {
    path: '/users',
    method: 'POST',
    requiredRoles: ['admin' as UserRole],
    requiredPermissions: ['users:create'],
    description: 'Create new user (admin only)',
  },
  {
    path: '/users/:userId',
    method: 'PUT',
    requiredRoles: ['admin' as UserRole],
    requiredPermissions: ['users:update'],
    description: 'Update user',
  },
  {
    path: '/users/:userId',
    method: 'DELETE',
    requiredRoles: ['admin' as UserRole],
    requiredPermissions: ['users:delete'],
    description: 'Delete user',
  },

  // ======================== RBAC Management ========================
  {
    path: '/rbac/roles',
    method: 'GET',
    requiredRoles: ['admin' as UserRole],
    requiredPermissions: ['rbac:view_roles'],
    description: 'List all roles',
  },
  {
    path: '/rbac/permissions',
    method: 'GET',
    requiredRoles: ['admin' as UserRole],
    requiredPermissions: ['rbac:view_permissions'],
    description: 'List all permissions',
  },
  {
    path: '/rbac/user-roles/:userId',
    method: 'GET',
    requiredRoles: ['admin' as UserRole],
    requiredPermissions: ['rbac:view_roles'],
    description: 'Get user roles',
  },
  {
    path: '/rbac/assign-role',
    method: 'POST',
    requiredRoles: ['admin' as UserRole],
    requiredPermissions: ['rbac:assign_roles'],
    description: 'Assign role to user',
  },
  {
    path: '/rbac/remove-role',
    method: 'POST',
    requiredRoles: ['admin' as UserRole],
    requiredPermissions: ['rbac:assign_roles'],
    description: 'Remove role from user',
  },

  // ======================== Audit Logging ========================
  {
    path: '/audit/logs',
    method: 'GET',
    requiredRoles: ['admin' as UserRole],
    requiredPermissions: ['audit:view_all_logs'],
    description: 'List all audit logs (admin)',
  },
  {
    path: '/audit/logs/my',
    method: 'GET',
    requiredRoles: ['user' as UserRole],
    requiredPermissions: ['audit:view_own_logs'],
    description: 'List own audit logs',
  },
  {
    path: '/audit/logs/export',
    method: 'GET',
    requiredRoles: ['admin' as UserRole],
    requiredPermissions: ['audit:export_logs'],
    description: 'Export audit logs',
  },

  // ======================== Admin Dashboard ========================
  {
    path: '/admin/dashboard',
    method: 'GET',
    requiredRoles: ['admin' as UserRole],
    requiredPermissions: ['admin:dashboard'],
    description: 'Admin dashboard stats',
  },
  {
    path: '/admin/system-config',
    method: 'GET',
    requiredRoles: ['admin' as UserRole],
    requiredPermissions: ['admin:system_config'],
    description: 'Get system configuration',
  },
  {
    path: '/admin/system-config',
    method: 'PUT',
    requiredRoles: ['super_admin' as UserRole],
    requiredPermissions: ['admin:system_config'],
    description: 'Update system configuration (super admin)',
  },

  // ======================== Features ========================
  {
    path: '/features',
    method: 'GET',
    requiredRoles: ['user' as UserRole],
    requiredPermissions: ['features:view'],
    description: 'Get user features',
  },
  {
    path: '/features',
    method: 'PUT',
    requiredRoles: ['admin' as UserRole],
    requiredPermissions: ['features:manage'],
    description: 'Manage features',
  },

  // ======================== GDPR ========================
  {
    path: '/gdpr/export',
    method: 'POST',
    requiredRoles: ['user' as UserRole],
    requiredPermissions: ['gdpr:export_data'],
    description: 'Export personal data',
  },
  {
    path: '/gdpr/delete',
    method: 'DELETE',
    requiredRoles: ['super_admin' as UserRole],
    requiredPermissions: ['gdpr:delete_data'],
    description: 'Delete user data (super admin)',
  },
];

/**
 * Get required roles for an API endpoint
 */
export function getEndpointRoles(method: string, path: string): UserRole[] {
  const endpoint = API_ENDPOINTS.find(
    ep =>
      ep.method === method && normalizePath(ep.path) === normalizePath(path)
  );
  return endpoint?.requiredRoles || [];
}

/**
 * Check if endpoint is public (no auth required)
 */
export function isEndpointPublic(method: string, path: string): boolean {
  const endpoint = API_ENDPOINTS.find(
    ep =>
      ep.method === method && normalizePath(ep.path) === normalizePath(path)
  );
  return endpoint?.public || false;
}

/**
 * Normalize API path for comparison
 * Converts /users/:userId to /users/*
 */
function normalizePath(path: string): string {
  return path.replace(/:[\w]+/g, '*');
}

/**
 * Get all endpoints accessible by a role
 */
export function getAccessibleEndpoints(userRoles: UserRole[]): ApiEndpointConfig[] {
  return API_ENDPOINTS.filter(endpoint => {
    if (endpoint.public) return true;
    if (!endpoint.requiredRoles || endpoint.requiredRoles.length === 0)
      return true;

    return userRoles.some(role => endpoint.requiredRoles.includes(role));
  });
}
