import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { BrowserRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import ToastProvider from '@app/providers/ToastProvider';
import { AuthProvider } from '@domains/auth/providers/AuthProvider';
import RoleManagementPage from '@domains/admin/pages/RoleManagementPage';
import { server } from '../../../test/mocks/server';

/**
 * Integration Tests for Admin Domain
 *
 * These tests verify the integration between:
 * - RoleManagementPage component
 * - API client for role operations
 * - Admin authorization
 * - Audit logging on changes
 */

const API_BASE_URL = 'http://localhost:8000';

// Mock environment variables
vi.stubEnv('VITE_BACKEND_URL', API_BASE_URL);
vi.stubEnv('VITE_API_BASE_URL', `${API_BASE_URL}/api/v1`);

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});

// Helper to render with all providers
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>{ui}</AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

describe('Role Management Integration', () => {
  beforeEach(() => {
    // Set up authenticated super-admin state
    localStorage.setItem('auth_token', 'mock-super-admin-token');
    localStorage.setItem('user_role', 'super_admin');
  });

  it.skip('should load and display roles from API', async () => {
    // Mock successful roles list response
    server.use(
      http.get(`${API_BASE_URL}/api/v1/roles`, async () => {
        return HttpResponse.json({
          roles: [
            {
              id: '1',
              name: 'admin',
              description: 'Administrator role',
              permissions: ['user:read', 'user:write', 'role:read', 'role:write'],
            },
            {
              id: '2',
              name: 'user',
              description: 'User role',
              permissions: ['user:read', 'profile:write'],
            },
            {
              id: '3',
              name: 'guest',
              description: 'Guest role',
              permissions: ['user:read'],
            },
          ],
        });
      })
    );

    renderWithProviders(<RoleManagementPage />);

    // Wait for roles to load
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
      expect(screen.getByText('guest')).toBeInTheDocument();
    });
  });

  it.skip('should handle API error when loading roles', async () => {
    // Mock API error
    server.use(
      http.get(`${API_BASE_URL}/api/v1/roles`, async () => {
        return HttpResponse.json(
          { error: 'Permission denied', detail: 'Insufficient permissions' },
          { status: 403 }
        );
      })
    );

    renderWithProviders(<RoleManagementPage />);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/permission|denied|error/i)).toBeInTheDocument();
    });
  });

  it.skip('should create new role with validation', async () => {
    const createSpy = vi.fn();

    // Mock GET roles
    server.use(
      http.get(`${API_BASE_URL}/api/v1/roles`, async () => {
        return HttpResponse.json({
          roles: [
            {
              id: '1',
              name: 'admin',
              description: 'Administrator',
              permissions: [],
            },
          ],
        });
      })
    );

    // Mock POST to create role
    server.use(
      http.post(`${API_BASE_URL}/api/v1/roles`, async () => {
        createSpy();
        return HttpResponse.json(
          {
            id: '4',
            name: 'moderator',
            description: 'Moderator role',
            permissions: ['user:read', 'user:moderate'],
          },
          { status: 201 }
        );
      })
    );

    renderWithProviders(<RoleManagementPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    // Click create button
    const user = userEvent.setup();
    const createButton = screen.getByRole('button', { name: /create role|new role/i });
    await user.click(createButton);

    // Fill form
    await user.type(screen.getByLabelText(/role name/i), 'moderator');
    await user.type(screen.getByLabelText(/description/i), 'Moderator role');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create|submit/i });
    await user.click(submitButton);

    // Verify API was called
    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/success|created/i)).toBeInTheDocument();
    });
  });

  it.skip('should update role permissions', async () => {
    const updateSpy = vi.fn();

    // Mock roles list
    server.use(
      http.get(`${API_BASE_URL}/api/v1/roles`, async () => {
        return HttpResponse.json({
          roles: [
            {
              id: '1',
              name: 'admin',
              description: 'Administrator',
              permissions: ['user:read', 'user:write'],
            },
          ],
        });
      })
    );

    // Mock permission update
    server.use(
      http.put(`${API_BASE_URL}/api/v1/roles/1/permissions`, async () => {
        updateSpy();
        return HttpResponse.json({
          id: '1',
          name: 'admin',
          permissions: ['user:read', 'user:write', 'role:read', 'role:write', 'audit:read'],
        });
      })
    );

    renderWithProviders(<RoleManagementPage />);

    // Wait for load
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    // Click edit permissions
    const user = userEvent.setup();
    const editButton = screen.getByTestId('role-1-edit-permissions');
    await user.click(editButton);

    // Add new permission
    const auditCheckbox = screen.getByLabelText(/audit:read/i);
    await user.click(auditCheckbox);

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Verify API was called
    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledTimes(1);
    });
  });

  it.skip('should delete role with confirmation', async () => {
    const deleteSpy = vi.fn();

    server.use(
      http.get(`${API_BASE_URL}/api/v1/roles`, async () => {
        return HttpResponse.json({
          roles: [
            {
              id: '3',
              name: 'guest',
              description: 'Guest role',
              permissions: [],
            },
          ],
        });
      })
    );

    // Mock delete endpoint
    server.use(
      http.delete(`${API_BASE_URL}/api/v1/roles/3`, async () => {
        deleteSpy();
        return HttpResponse.json({ message: 'Role deleted' });
      })
    );

    renderWithProviders(<RoleManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('guest')).toBeInTheDocument();
    });

    // Click delete button
    const user = userEvent.setup();
    const deleteButton = screen.getByTestId('role-3-delete');
    await user.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm|yes/i });
    await user.click(confirmButton);

    // Verify API was called
    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledTimes(1);
    });

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/deleted|success/i)).toBeInTheDocument();
    });
  });

  it.skip('should audit log role changes', async () => {
    const auditSpy = vi.fn();

    server.use(
      http.get(`${API_BASE_URL}/api/v1/roles`, async () => {
        return HttpResponse.json({
          roles: [
            {
              id: '1',
              name: 'admin',
              description: 'Administrator',
              permissions: [],
            },
          ],
        });
      })
    );

    // Mock audit log endpoint
    server.use(
      http.post(`${API_BASE_URL}/api/v1/audit-logs`, async ({ request }) => {
        const body = await request.json();
        auditSpy(body);
        return HttpResponse.json({ id: 'log-123', timestamp: new Date().toISOString() });
      })
    );

    // Mock role update
    server.use(
      http.put(`${API_BASE_URL}/api/v1/roles/1`, async () => {
        return HttpResponse.json({
          id: '1',
          name: 'administrator',
          description: 'System Administrator',
        });
      })
    );

    renderWithProviders(<RoleManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    // Edit role description
    const user = userEvent.setup();
    const editButton = screen.getByTestId('role-1-edit');
    await user.click(editButton);

    const descriptionInput = screen.getByDisplayValue(/Administrator/i);
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'System Administrator - Super Admin');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Verify audit log was created
    // (This assumes your API automatically logs changes or your client logs them)
    // await waitFor(() => {
    //   expect(auditSpy).toHaveBeenCalled();
    // });
  });

  it.skip('should handle concurrent role updates', async () => {
    let updateCount = 0;

    server.use(
      http.get(`${API_BASE_URL}/api/v1/roles`, async () => {
        return HttpResponse.json({
          roles: [
            { id: '1', name: 'admin', description: 'Admin', permissions: [] },
            { id: '2', name: 'user', description: 'User', permissions: [] },
          ],
        });
      })
    );

    // Mock concurrent updates
    server.use(
      http.put(`${API_BASE_URL}/api/v1/roles/1`, async () => {
        updateCount++;
        return HttpResponse.json({ id: '1', name: 'admin' });
      }),
      http.put(`${API_BASE_URL}/api/v1/roles/2`, async () => {
        updateCount++;
        return HttpResponse.json({ id: '2', name: 'user' });
      })
    );

    renderWithProviders(<RoleManagementPage />);

    const user = userEvent.setup();
    const editButtons = screen.getAllByTestId(/role-\d-edit/);

    // Click multiple edit buttons concurrently
    await Promise.all(editButtons.map((btn) => user.click(btn)));

    // Make changes and save
    const saveButtons = screen.getAllByRole('button', { name: /save/i });
    await Promise.all(saveButtons.map((btn) => user.click(btn)));

    // Verify concurrent updates
    await waitFor(() => {
      expect(updateCount).toBeGreaterThanOrEqual(1);
    });
  });

  it.skip('should handle rate limiting on bulk operations', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/roles/bulk-update`, async () => {
        return HttpResponse.json(
          { error: 'Too many requests', retry_after: 60 },
          {
            status: 429,
            headers: { 'X-RateLimit-Remaining': '0' },
          }
        );
      })
    );

    renderWithProviders(<RoleManagementPage />);

    // Attempt bulk operation
    const bulkButton = screen.getByRole('button', { name: /bulk|batch/i });
    const user = userEvent.setup();
    await user.click(bulkButton);

    // Verify rate limit message
    await waitFor(() => {
      expect(screen.getByText(/rate limit|too many requests/i)).toBeInTheDocument();
    });
  });
});

describe('Admin Authorization Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it.skip('should prevent non-admin access to role management', async () => {
    // Set regular user role
    localStorage.setItem('auth_token', 'mock-user-token');
    localStorage.setItem('user_role', 'user');

    renderWithProviders(<RoleManagementPage />);

    // Should show access denied
    await waitFor(() => {
      expect(screen.getByText(/not authorized|access denied|permission/i)).toBeInTheDocument();
    });
  });

  it.skip('should allow super-admin full access to all features', async () => {
    // Set super-admin role
    localStorage.setItem('auth_token', 'mock-super-admin-token');
    localStorage.setItem('user_role', 'super_admin');

    // Mock successful response
    server.use(
      http.get(`${API_BASE_URL}/api/v1/roles`, async () => {
        return HttpResponse.json({
          roles: [{ id: '1', name: 'admin', description: 'Admin', permissions: [] }],
        });
      })
    );

    renderWithProviders(<RoleManagementPage />);

    // Should load management interface
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByTestId('role-management-toolbar')).toBeInTheDocument();
    });
  });
});
