/**
 * Backend API Integration Tests
 * Tests all new API methods added for backend integration
 * Coverage: Role Management (7), Health Checks (5), Error Logging (1), GDPR, Audit
 *
 * Reference: backend_api_details/API_DOCUMENTATION.md
 * Date: 2025-10-20
 */

import type {
  AssignRoleResponse,
  AuditLog,
  AuditLogsQueryParams,
  CreateRoleRequest,
  DatabaseHealthResponse,
  DetailedHealthResponse,
  FrontendErrorRequest,
  FrontendErrorResponse,
  GDPRExportRequest,
  GDPRExportResponse,
  HealthCheckResponse,
  ReadinessCheckResponse,
  RoleResponse,
  SystemHealthResponse,
} from '@shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient } from '../client';

describe('Backend API Integration - Role Management', () => {
  let client: ApiClient;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    client = new ApiClient('http://localhost:8001/api/v1', false);
    originalFetch = global.fetch;
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('getAllRoles()', () => {
    it('should fetch all roles successfully', async () => {
      const mockRoles: RoleResponse[] = [
        {
          role_id: '1',
          role_name: 'admin',
          description: 'Administrator role',
          permissions: ['user:read', 'user:write', 'user:delete'],
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          role_id: '2',
          role_name: 'manager',
          description: 'Manager role',
          permissions: ['user:read', 'user:write'],
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockRoles), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.getAllRoles();

      expect(result).toEqual(mockRoles);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/admin/roles',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle empty roles list', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.getAllRoles();

      expect(result).toEqual([]);
    });
  });

  describe('createRole()', () => {
    it('should create a new role successfully', async () => {
      const newRole: CreateRoleRequest = {
        name: 'moderator',
        description: 'Content moderator role',
        permissions: ['content:read', 'content:moderate'],
      };

      const mockResponse = {
        message: 'Role created successfully',
        role_id: '3',
        role_name: 'moderator',
      };

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.createRole(newRole);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/admin/roles',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newRole),
        })
      );
    });

    it('should handle role already exists error', async () => {
      const newRole: CreateRoleRequest = {
        name: 'admin',
        description: 'Duplicate role',
        permissions: [],
      };

      const mockFetch = vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              error: 'Role already exists',
              code: 'ROLE_002',
            }),
            {
              status: 409,
              headers: { 'Content-Type': 'application/json' },
            }
          )
      );
      (global as any).fetch = mockFetch;

      await expect(client.createRole(newRole)).rejects.toThrow();
    });
  });

  describe('getRole()', () => {
    it('should fetch a specific role by name', async () => {
      const mockRole: RoleResponse = {
        role_id: '1',
        role_name: 'admin',
        description: 'Administrator role',
        permissions: ['user:read', 'user:write', 'user:delete'],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockRole), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.getRole('admin');

      expect(result).toEqual(mockRole);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/admin/roles/admin',
        expect.any(Object)
      );
    });

    it('should handle role not found error', async () => {
      const mockFetch = vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              error: 'Role not found',
              code: 'ROLE_001',
            }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            }
          )
      );
      (global as any).fetch = mockFetch;

      await expect(client.getRole('nonexistent')).rejects.toThrow();
    });
  });

  describe('updateRole()', () => {
    it('should update a role successfully', async () => {
      const updateData = {
        description: 'Updated description',
        permissions: ['user:read'],
      };

      const mockResponse = {
        message: 'Role updated successfully',
        role_name: 'manager',
      };

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.updateRole('manager', updateData);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/admin/roles/manager',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      );
    });
  });

  describe('deleteRole()', () => {
    it('should delete a role successfully', async () => {
      const mockResponse = {
        message: 'Role deleted successfully',
        role_name: 'moderator',
      };

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.deleteRole('moderator');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/admin/roles/moderator',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('assignRoleToUser()', () => {
    it('should assign role to user successfully', async () => {
      const mockResponse: AssignRoleResponse = {
        message: 'Role assigned successfully',
        user_id: 'user-123',
        role: 'manager',
      };

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.assignRoleToUser('user-123', 'manager');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/admin/users/user-123/assign-role',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ role: 'manager' }),
        })
      );
    });
  });

  describe('revokeRoleFromUser()', () => {
    it('should revoke role from user successfully', async () => {
      const mockResponse = {
        message: 'Role revoked successfully',
        user_id: 'user-123',
      };

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.revokeRoleFromUser('user-123');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/admin/users/user-123/revoke-role',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});

describe('Backend API Integration - Health Checks', () => {
  let client: ApiClient;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    client = new ApiClient('http://localhost:8001/api/v1', false);
    originalFetch = global.fetch;
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('readinessCheck()', () => {
    it('should return ready status when all dependencies are healthy', async () => {
      const mockResponse: ReadinessCheckResponse = {
        status: 'ready',
        timestamp: '2025-10-20T10:00:00Z',
        checks: {
          database: 'healthy',
          redis: 'healthy',
          external_api: 'healthy',
        },
      };

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.readinessCheck();

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/health/ready',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return not ready when dependencies are unhealthy', async () => {
      const mockResponse: ReadinessCheckResponse = {
        status: 'not_ready',
        timestamp: '2025-10-20T10:00:00Z',
        checks: {
          database: 'healthy',
          redis: 'unhealthy',
          external_api: 'degraded',
        },
      };

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      await expect(client.readinessCheck()).rejects.toThrow();
    });
  });

  describe('livenessCheck()', () => {
    it('should return alive status', async () => {
      const mockResponse: HealthCheckResponse = {
        status: 'healthy',
        timestamp: '2025-10-20T10:00:00Z',
      };

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.livenessCheck();

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/health/live',
        expect.any(Object)
      );
    });
  });

  describe('detailedHealth()', () => {
    it('should return detailed health information', async () => {
      const mockResponse: DetailedHealthResponse = {
        status: 'healthy',
        version: '1.0.0',
        timestamp: '2025-10-20T10:00:00Z',
        uptime: 86400,
        components: {
          database: {
            status: 'healthy',
            response_time_ms: 5,
            details: {
              connection_pool: '10/50',
              active_queries: 3,
            },
          },
          cache: {
            status: 'healthy',
            response_time_ms: 1,
            details: {
              hit_rate: '95%',
              memory_usage: '2GB/8GB',
            },
          },
          external_services: {
            status: 'degraded',
            response_time_ms: 250,
            details: {
              api_gateway: 'healthy',
              payment_service: 'degraded',
            },
          },
        },
      };

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.detailedHealth();

      expect(result).toEqual(mockResponse);
      expect(result.components).toBeDefined();
      expect(result.components.database.status).toBe('healthy');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/health/detailed',
        expect.any(Object)
      );
    });
  });

  describe('databaseHealth()', () => {
    it('should return database health status', async () => {
      const mockResponse: DatabaseHealthResponse = {
        status: 'healthy',
        response_time_ms: 5,
        connection_pool: {
          active: 10,
          idle: 40,
          total: 50,
        },
        queries: {
          total: 1000,
          failed: 2,
          slow: 5,
        },
      };

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.databaseHealth();

      expect(result).toEqual(mockResponse);
      expect(result.connection_pool.active).toBe(10);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/health/database',
        expect.any(Object)
      );
    });
  });

  describe('systemHealth()', () => {
    it('should return system resource information', async () => {
      const mockResponse: SystemHealthResponse = {
        status: 'healthy',
        cpu_usage: 45.5,
        memory_usage: 60.2,
        disk_usage: 70.0,
        load_average: [1.5, 1.2, 1.0],
        process_info: {
          pid: 12345,
          memory_mb: 256,
          cpu_percent: 5.0,
          uptime_seconds: 86400,
        },
      };

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.systemHealth();

      expect(result).toEqual(mockResponse);
      expect(result.cpu_usage).toBe(45.5);
      expect(result.memory_usage).toBe(60.2);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/health/system',
        expect.any(Object)
      );
    });
  });
});

describe('Backend API Integration - Frontend Error Logging', () => {
  let client: ApiClient;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    client = new ApiClient('http://localhost:8001/api/v1', false);
    originalFetch = global.fetch;
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('logFrontendError()', () => {
    it('should log frontend error successfully', async () => {
      const errorPayload: FrontendErrorRequest = {
        message: 'Unhandled exception in UserProfile component',
        stack: 'Error: Cannot read property "name" of undefined\n  at UserProfile.tsx:45',
        severity: 'high',
        context: {
          component: 'UserProfile',
          action: 'render',
          user_id: 'user-123',
          url: '/profile',
          user_agent: 'Mozilla/5.0...',
        },
      };

      const mockResponse: FrontendErrorResponse = {
        message: 'Error logged successfully',
        error_id: 'err-123',
        timestamp: '2025-10-20T10:00:00Z',
      };

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.logFrontendError(errorPayload);

      expect(result).toEqual(mockResponse);
      expect(result.error_id).toBe('err-123');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/logs/frontend-errors',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(errorPayload),
        })
      );
    });

    it('should handle different severity levels', async () => {
      const severityLevels: Array<'low' | 'medium' | 'high' | 'critical'> = [
        'low',
        'medium',
        'high',
        'critical',
      ];

      for (const severity of severityLevels) {
        const errorPayload: FrontendErrorRequest = {
          message: `Test error - ${severity}`,
          stack: 'Error stack trace',
          severity,
          context: {},
        };

        const mockResponse: FrontendErrorResponse = {
          message: 'Error logged successfully',
          error_id: `err-${severity}`,
          timestamp: '2025-10-20T10:00:00Z',
        };

        const mockFetch = vi.fn(
          async () =>
            new Response(JSON.stringify(mockResponse), {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            })
        );
        (global as any).fetch = mockFetch;

        const result = await client.logFrontendError(errorPayload);

        expect(result.error_id).toBe(`err-${severity}`);
      }
    });
  });
});

describe('Backend API Integration - Enhanced GDPR', () => {
  let client: ApiClient;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    client = new ApiClient('http://localhost:8001/api/v1', false);
    originalFetch = global.fetch;
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('requestGDPRExport() with options', () => {
    it('should request GDPR export as JSON', async () => {
      const options: GDPRExportRequest = {
        format: 'json',
        include_audit_logs: true,
        include_metadata: true,
      };

      const mockResponse: GDPRExportResponse = {
        message: 'Export request created',
        export_id: 'export-123',
        status: 'pending',
        estimated_completion: '2025-10-20T11:00:00Z',
      };

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 202,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.requestGDPRExport(options);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/gdpr/export/my-data',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(options),
        })
      );
    });

    it('should request GDPR export as CSV', async () => {
      const options: GDPRExportRequest = {
        format: 'csv',
        include_audit_logs: false,
        include_metadata: false,
      };

      const mockResponse: GDPRExportResponse = {
        message: 'Export request created',
        export_id: 'export-456',
        status: 'pending',
        estimated_completion: '2025-10-20T11:00:00Z',
      };

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 202,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.requestGDPRExport(options);

      expect(result.export_id).toBe('export-456');
      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body as string);
      expect(body.format).toBe('csv');
    });

    it('should work without options (default behavior)', async () => {
      const mockResponse: GDPRExportResponse = {
        message: 'Export request created',
        export_id: 'export-789',
        status: 'pending',
        estimated_completion: '2025-10-20T11:00:00Z',
      };

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockResponse), {
            status: 202,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.requestGDPRExport();

      expect(result.export_id).toBe('export-789');
    });
  });
});

describe('Backend API Integration - Enhanced Audit Logs', () => {
  let client: ApiClient;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    client = new ApiClient('http://localhost:8001/api/v1', false);
    originalFetch = global.fetch;
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('getAuditLogs() with advanced filtering', () => {
    it('should filter by action and resource', async () => {
      const params: AuditLogsQueryParams = {
        action: 'create',
        resource: 'user',
        page: 1,
        limit: 10,
      };

      const mockLogs: AuditLog[] = [
        {
          id: '1',
          action: 'create',
          resource: 'user',
          user_id: 'admin-123',
          timestamp: '2025-10-20T10:00:00Z',
          details: { created_user_id: 'user-456' },
        },
      ];

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockLogs), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.getAuditLogs(params);

      expect(result).toEqual(mockLogs);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('action=create'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('resource=user'),
        expect.any(Object)
      );
    });

    it('should filter by date range', async () => {
      const params: AuditLogsQueryParams = {
        start_date: '2025-10-01',
        end_date: '2025-10-20',
        page: 1,
        limit: 50,
      };

      const mockLogs: AuditLog[] = [];

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockLogs), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      await client.getAuditLogs(params);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('start_date=2025-10-01'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('end_date=2025-10-20'),
        expect.any(Object)
      );
    });

    it('should filter by severity and user', async () => {
      const params: AuditLogsQueryParams = {
        severity: 'high',
        user_id: 'user-123',
        page: 1,
        limit: 20,
      };

      const mockLogs: AuditLog[] = [
        {
          id: '2',
          action: 'delete',
          resource: 'user',
          user_id: 'user-123',
          timestamp: '2025-10-20T09:00:00Z',
          details: { deleted_user_id: 'user-789' },
        },
      ];

      const mockFetch = vi.fn(
        async () =>
          new Response(JSON.stringify(mockLogs), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      );
      (global as any).fetch = mockFetch;

      const result = await client.getAuditLogs(params);

      expect(result.length).toBe(1);
      expect(result[0].user_id).toBe('user-123');
    });
  });
});
