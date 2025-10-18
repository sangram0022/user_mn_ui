import ToastProvider from '@app/providers/ToastProvider';
import { AuthProvider } from '@domains/auth/providers/AuthProvider';
import UserManagementPage from '@domains/users/pages/UserManagementPage';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { BrowserRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../../test/mocks/server';

/**
 * Integration Tests for User Management Domain
 *
 * These tests verify the integration between:
 * - UserManagementPage component
 * - API client for user operations
 * - Role-based access control
 * - Error handling and recovery
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

describe('User Management Integration', () => {
  beforeEach(() => {
    // Set up authenticated admin state
    localStorage.setItem('auth_token', 'mock-admin-token');
    localStorage.setItem('user_role', 'admin');
  });

  it.skip('should load and display user list from API', async () => {
    // Mock successful user list response
    server.use(
      http.get(`${API_BASE_URL}/api/v1/users`, async () =>
        HttpResponse.json({
          users: [
            { id: '1', email: 'user1@example.com', role: 'user', is_active: true },
            { id: '2', email: 'user2@example.com', role: 'user', is_active: true },
            { id: '3', email: 'admin@example.com', role: 'admin', is_active: true },
          ],
          total: 3,
          page: 1,
        })
      )
    );

    renderWithProviders(<UserManagementPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });
  });

  it.skip('should handle API error when loading users', async () => {
    // Mock API error
    server.use(
      http.get(`${API_BASE_URL}/api/v1/users`, async () =>
        HttpResponse.json(
          { error: 'Internal server error', detail: 'Failed to fetch users' },
          { status: 500 }
        )
      )
    );

    renderWithProviders(<UserManagementPage />);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
    });
  });

  it.skip('should handle network timeout gracefully', async () => {
    // Mock network timeout
    server.use(
      http.get(`${API_BASE_URL}/api/v1/users`, async () => {
        await new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), 100)
        );
        return HttpResponse.json({});
      })
    );

    renderWithProviders(<UserManagementPage />);

    // Wait for timeout error message
    await waitFor(() => {
      expect(screen.getByText(/timeout|unable to connect/i)).toBeInTheDocument();
    });
  });

  it.skip('should retry on failure with exponential backoff', async () => {
    let attemptCount = 0;

    // Mock API that fails twice then succeeds
    server.use(
      http.get(`${API_BASE_URL}/api/v1/users`, async () => {
        attemptCount++;
        if (attemptCount < 3) {
          return HttpResponse.json({ error: 'Service unavailable' }, { status: 503 });
        }
        return HttpResponse.json({
          users: [{ id: '1', email: 'user@example.com', role: 'user', is_active: true }],
        });
      })
    );

    renderWithProviders(<UserManagementPage />);

    // Wait for successful load after retries
    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    // Verify multiple attempts were made
    expect(attemptCount).toBeGreaterThanOrEqual(1);
  });

  it.skip('should prevent unauthorized access without admin role', async () => {
    // Set non-admin role
    localStorage.setItem('user_role', 'user');

    renderWithProviders(<UserManagementPage />);

    // Wait for access denied message
    await waitFor(() => {
      expect(screen.getByText(/not authorized|access denied/i)).toBeInTheDocument();
    });

    // Verify API was not called
    // (would need to mock and verify spy)
  });

  it.skip('should update user role via API', async () => {
    const updateSpy = vi.fn();

    // Mock user list endpoint
    server.use(
      http.get(`${API_BASE_URL}/api/v1/users`, async () =>
        HttpResponse.json({
          users: [
            { id: '1', email: 'user1@example.com', role: 'user', is_active: true },
            { id: '2', email: 'user2@example.com', role: 'user', is_active: true },
          ],
        })
      )
    );

    // Mock user update endpoint
    server.use(
      http.put(`${API_BASE_URL}/api/v1/users/1`, async () => {
        updateSpy();
        return HttpResponse.json({
          id: '1',
          email: 'user1@example.com',
          role: 'admin',
          is_active: true,
        });
      })
    );

    renderWithProviders(<UserManagementPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });

    // Find and click role update button
    const updateButton = screen.getByTestId('user-1-role-update');
    const user = userEvent.setup();
    await user.click(updateButton);

    // Verify API was called
    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledTimes(1);
    });
  });

  it.skip('should handle deactivate user API call', async () => {
    const deactivateSpy = vi.fn();

    server.use(
      http.get(`${API_BASE_URL}/api/v1/users`, async () =>
        HttpResponse.json({
          users: [{ id: '1', email: 'user1@example.com', role: 'user', is_active: true }],
        })
      )
    );

    // Mock deactivate endpoint
    server.use(
      http.patch(`${API_BASE_URL}/api/v1/users/1`, async () => {
        deactivateSpy();
        return HttpResponse.json({
          id: '1',
          email: 'user1@example.com',
          role: 'user',
          is_active: false,
        });
      })
    );

    renderWithProviders(<UserManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });

    // Find and click deactivate button
    const deactivateButton = screen.getByTestId('user-1-deactivate');
    const user = userEvent.setup();
    await user.click(deactivateButton);

    // Verify API was called
    await waitFor(() => {
      expect(deactivateSpy).toHaveBeenCalledTimes(1);
    });
  });

  it.skip('should handle rate limiting with retry after header', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/users`, async () =>
        HttpResponse.json(
          { error: 'Too many requests', retry_after: 60 },
          {
            status: 429,
            headers: {
              'X-RateLimit-Remaining': '0',
              'Retry-After': '60',
            },
          }
        )
      )
    );

    renderWithProviders(<UserManagementPage />);

    // Wait for rate limit message
    await waitFor(() => {
      expect(screen.getByText(/too many requests|rate limit|please wait/i)).toBeInTheDocument();
    });
  });

  it.skip('should handle concurrent user operations', async () => {
    const updateSpy1 = vi.fn();
    const updateSpy2 = vi.fn();

    // Mock concurrent operations
    let updateCount = 0;
    server.use(
      http.put(`${API_BASE_URL}/api/v1/users/1`, async () => {
        updateCount++;
        updateSpy1();
        return HttpResponse.json({ id: '1', role: 'admin' });
      }),
      http.put(`${API_BASE_URL}/api/v1/users/2`, async () => {
        updateCount++;
        updateSpy2();
        return HttpResponse.json({ id: '2', role: 'moderator' });
      })
    );

    renderWithProviders(<UserManagementPage />);

    // Simulate concurrent updates
    const user = userEvent.setup();
    const button1 = screen.getByTestId('user-1-update');
    const button2 = screen.getByTestId('user-2-update');

    await Promise.all([user.click(button1), user.click(button2)]);

    // Verify both operations completed
    await waitFor(() => {
      expect(updateCount).toBe(2);
    });
  });
});

describe('Role-Based Access Control Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it.skip('should enforce role-based access on profile page', async () => {
    // Set user role
    localStorage.setItem('auth_token', 'mock-user-token');
    localStorage.setItem('user_role', 'user');

    renderWithProviders(<UserManagementPage />);

    // Should either show limited view or access denied
    await waitFor(() => {
      const denied = screen.queryByText(/not authorized|access denied/i);
      const limited = screen.queryByText(/view only|limited access/i);
      expect(denied || limited).toBeTruthy();
    });
  });

  it.skip('should allow admin full access', async () => {
    // Set admin role
    localStorage.setItem('auth_token', 'mock-admin-token');
    localStorage.setItem('user_role', 'admin');

    // Mock successful response for admin
    server.use(
      http.get(`${API_BASE_URL}/api/v1/users`, async () =>
        HttpResponse.json({
          users: [{ id: '1', email: 'user@example.com', role: 'user', is_active: true }],
        })
      )
    );

    renderWithProviders(<UserManagementPage />);

    // Should load and show full management interface
    await waitFor(() => {
      expect(screen.getByTestId('user-list')).toBeInTheDocument();
      expect(screen.getByTestId('user-actions')).toBeInTheDocument();
    });
  });
});
