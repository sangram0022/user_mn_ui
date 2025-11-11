import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { config } from '@/core/config';
import {
  mockAdminUserListResponse,
  mockAdminUserDetail,
  mockAdminUser,
  mockListRolesResponse,
  mockAdminRole,
  mockAdminStats,
  mockGrowthAnalytics,
  mockAuditLogListResponse,
} from './mockData';

// Mock API base URL - should match the actual API client configuration
const API_BASE_URL = config.api.baseUrl;
const API_PREFIX = '/api/v1';

/**
 * MSW Request Handlers for Admin API
 */
export const adminHandlers = [
  // ==================== User Management ====================

  // List users
  http.get(`${API_BASE_URL}${API_PREFIX}/admin/users`, () => {
    return HttpResponse.json({ success: true, data: mockAdminUserListResponse });
  }),

  // Get user detail
  http.get(`${API_BASE_URL}${API_PREFIX}/admin/users/:id`, ({ params }) => {
    const { id } = params;
    if (id === 'user-1') {
      return HttpResponse.json({ success: true, data: mockAdminUserDetail });
    }
    return HttpResponse.json(
      { success: false, error: 'User not found', detail: 'User not found', code: 'USER_001' },
      { status: 404 }
    );
  }),

  // Create user
  http.post(`${API_BASE_URL}${API_PREFIX}/admin/users`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { success: true, data: { ...mockAdminUser, ...(body as Record<string, unknown>) } },
      { status: 201 }
    );
  }),

  // Update user
  http.put(`${API_BASE_URL}${API_PREFIX}/admin/users/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    if (id === 'user-1') {
      return HttpResponse.json({ success: true, data: { ...mockAdminUserDetail, ...(body as Record<string, unknown>) } });
    }
    return HttpResponse.json(
      { success: false, error: 'User not found', detail: 'User not found', code: 'USER_001' },
      { status: 404 }
    );
  }),

  // Delete user
  http.delete(`${API_BASE_URL}${API_PREFIX}/admin/users/:id`, ({ params }) => {
    const { id } = params;
    if (id === 'user-1') {
      return HttpResponse.json({ success: true, data: { message: 'User deleted successfully' } });
    }
    return HttpResponse.json(
      { success: false, error: 'User not found', detail: 'User not found', code: 'USER_001' },
      { status: 404 }
    );
  }),

  // Approve user
  http.post(`${API_BASE_URL}${API_PREFIX}/admin/users/:id/approve`, ({ params }) => {
    const { id } = params;
    if (id === 'user-2') {
      return HttpResponse.json({ success: true, data: {
        user_id: id as string,
        email: 'jane.smith@example.com',
        username: 'janesmith',
        status: 'active',
        role: 'user',
        approved_at: new Date().toISOString(),
        approved_by: 'admin-1',
        welcome_email_sent: true,
        initial_permissions: ['read'],
        message: 'User approved successfully',
      }});
    }
    return HttpResponse.json(
      { detail: 'User not found', code: 'USER_001' },
      { status: 404 }
    );
  }),

  // Reject user
  http.post(`${API_BASE_URL}${API_PREFIX}/admin/users/:id/reject`, ({ params }) => {
    const { id } = params;
    if (id === 'user-2') {
      return HttpResponse.json({ message: 'User rejected and deleted' });
    }
    return HttpResponse.json(
      { detail: 'User not found', code: 'USER_001' },
      { status: 404 }
    );
  }),

  // Bulk approve users
  http.post(`${API_BASE_URL}${API_PREFIX}/admin/users/bulk-approve`, async ({ request }) => {
    const body = await request.json() as { user_ids: string[] };
    return HttpResponse.json({
      total: body.user_ids.length,
      succeeded: body.user_ids.length,
      failed: 0,
      success_ids: body.user_ids,
      errors: [],
    });
  }),

  // Bulk reject users
  http.post(`${API_BASE_URL}${API_PREFIX}/admin/users/bulk-reject`, async ({ request }) => {
    const body = await request.json() as { user_ids: string[] };
    return HttpResponse.json({
      total: body.user_ids.length,
      succeeded: body.user_ids.length,
      failed: 0,
      success_ids: body.user_ids,
      errors: [],
    });
  }),

  // Activate user
  http.post(`${API_BASE_URL}${API_PREFIX}/admin/users/:id/activate`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      ...mockAdminUser,
      id: id as string,
      status: 'active',
    });
  }),

  // Suspend user
  http.post(`${API_BASE_URL}${API_PREFIX}/admin/users/:id/suspend`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      ...mockAdminUser,
      id: id as string,
      status: 'suspended',
    });
  }),

  // Assign role
  http.post(`${API_BASE_URL}${API_PREFIX}/admin/users/:id/roles/:roleName`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      ...mockAdminUser,
      id: id as string,
      role: params.roleName as string,
    });
  }),

  // Revoke role
  http.delete(`${API_BASE_URL}${API_PREFIX}/admin/users/:id/roles/:roleName`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      ...mockAdminUser,
      id: id as string,
      role: 'user',
    });
  }),

  // ==================== Role Management ====================

  // List roles
  http.get(`${API_BASE_URL}${API_PREFIX}/admin/roles`, () => {
    return HttpResponse.json(mockListRolesResponse);
  }),

  // Get role detail
  http.get(`${API_BASE_URL}${API_PREFIX}/admin/roles/:name`, ({ params }) => {
    const { name } = params;
    if (name === 'admin') {
      return HttpResponse.json({ role: mockAdminRole });
    }
    return HttpResponse.json(
      { detail: 'Role not found', code: 'ROLE_001' },
      { status: 404 }
    );
  }),

  // Create role
  http.post(`${API_BASE_URL}${API_PREFIX}/admin/roles`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ role: body }, { status: 201 });
  }),

  // Update role
  http.put(`${API_BASE_URL}${API_PREFIX}/admin/roles/:name`, async ({ params, request }) => {
    const { name } = params;
    const body = await request.json();
    if (name === 'admin') {
      return HttpResponse.json({ role: { ...mockAdminRole, ...(body as Record<string, unknown>) } });
    }
    return HttpResponse.json(
      { detail: 'Role not found', code: 'ROLE_001' },
      { status: 404 }
    );
  }),

  // Delete role
  http.delete(`${API_BASE_URL}${API_PREFIX}/admin/roles/:name`, ({ params }) => {
    const { name } = params;
    if (name === 'custom_role') {
      return HttpResponse.json({ message: 'Role deleted successfully' });
    }
    if (name === 'admin') {
      return HttpResponse.json(
        { detail: 'Cannot delete system role', code: 'ROLE_003' },
        { status: 400 }
      );
    }
    return HttpResponse.json(
      { detail: 'Role not found', code: 'ROLE_001' },
      { status: 404 }
    );
  }),

  // ==================== Analytics ====================

  // Get admin stats
  http.get(`${API_BASE_URL}${API_PREFIX}/admin/analytics/stats`, () => {
    return HttpResponse.json(mockAdminStats);
  }),

  // Get growth analytics
  http.get(`${API_BASE_URL}${API_PREFIX}/admin/analytics/growth`, () => {
    return HttpResponse.json(mockGrowthAnalytics);
  }),

  // ==================== Audit Logs ====================

  // Get audit logs
  http.get(`${API_BASE_URL}${API_PREFIX}/admin/audit-logs`, () => {
    return HttpResponse.json(mockAuditLogListResponse);
  }),

  // Export audit logs
  http.post(`${API_BASE_URL}${API_PREFIX}/admin/audit-logs/export`, () => {
    return HttpResponse.json({
      export_url: 'https://example.com/exports/audit-logs-123.csv',
      expires_at: '2024-01-15T12:00:00Z',
    });
  }),
];

/**
 * Error handlers for testing error scenarios
 */
export const errorHandlers = [
  // Unauthorized error
  http.get(`${API_BASE_URL}${API_PREFIX}/admin/users`, () => {
    return HttpResponse.json(
      { detail: 'Not authenticated', code: 'AUTH_001' },
      { status: 401 }
    );
  }),

  // Forbidden error
  http.post(`${API_BASE_URL}${API_PREFIX}/admin/users`, () => {
    return HttpResponse.json(
      { detail: 'Insufficient permissions', code: 'PERM_002' },
      { status: 403 }
    );
  }),

  // Validation error
  http.post(`${API_BASE_URL}${API_PREFIX}/admin/users`, () => {
    return HttpResponse.json(
      {
        detail: 'Validation error',
        code: 'VALIDATION_001',
        errors: {
          email: ['Invalid email format'],
          password: ['Password too weak'],
        },
      },
      { status: 422 }
    );
  }),

  // Server error
  http.get(`${API_BASE_URL}${API_PREFIX}/admin/analytics/stats`, () => {
    return HttpResponse.json(
      { detail: 'Internal server error', code: 'SYSTEM_001' },
      { status: 500 }
    );
  }),
];

/**
 * Create and export MSW server
 */
export const server = setupServer(...adminHandlers);

/**
 * Helper to create custom error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  statusCode: number,
  errors?: Record<string, string[]>
) {
  return {
    name: 'AdminError',
    message,
    code,
    statusCode,
    context: errors ? { errors } : undefined,
  };
}

/**
 * Helper to reset handlers to default
 */
export function resetHandlers(): void {
  server.resetHandlers(...adminHandlers);
}

/**
 * Helper to use error handlers
 */
export function useErrorHandlers(): void {
  server.use(...errorHandlers);
}
