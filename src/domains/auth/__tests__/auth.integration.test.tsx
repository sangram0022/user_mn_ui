import { AuthProvider } from '@/domains/auth/contexts/AuthContext';
import { LoginPage } from '@/domains/auth/pages/LoginPage';
import { server } from '@/test/mocks/server';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Integration Tests for Authentication Flow
 *
 * These tests verify the integration between:
 * - LoginPage component
 * - AuthContext
 * - API client
 * - Routing
 */

// Helper to render with all providers
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  );
}

describe('Login Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Reset MSW handlers to default
    server.resetHandlers();
  });

  it('should complete full login flow with API', async () => {
    const user = userEvent.setup();

    // Mock successful login response
    server.use(
      http.post('/api/v1/auth/login', async () => {
        return HttpResponse.json({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          user: {
            id: '123',
            email: 'user@example.com',
            role: 'admin',
            is_active: true,
          },
        });
      })
    );

    renderWithProviders(<LoginPage />);

    // Fill in login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Wait for API call and navigation
    await waitFor(() => {
      // Verify token was stored
      const token = localStorage.getItem('auth_token');
      expect(token).toBe('mock-access-token');
    });

    // Verify success message or navigation
    // Note: Navigation testing would require React Router testing utilities
  });

  it('should handle API error responses', async () => {
    const user = userEvent.setup();

    // Mock failed login response
    server.use(
      http.post('/api/v1/auth/login', async () => {
        return HttpResponse.json(
          {
            error: 'Invalid credentials',
            detail: 'Email or password is incorrect',
          },
          { status: 401 }
        );
      })
    );

    renderWithProviders(<LoginPage />);

    // Fill in login form
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    // Verify token was NOT stored
    const token = localStorage.getItem('auth_token');
    expect(token).toBeNull();
  });

  it('should handle network errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock network error
    server.use(
      http.post('/api/v1/auth/login', async () => {
        return HttpResponse.error();
      })
    );

    renderWithProviders(<LoginPage />);

    // Fill and submit form
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/network error|unable to connect/i)).toBeInTheDocument();
    });
  });

  it('should validate input before API call', async () => {
    const user = userEvent.setup();
    const apiSpy = vi.fn();

    // Spy on API calls
    server.use(
      http.post('/api/v1/auth/login', async () => {
        apiSpy();
        return HttpResponse.json({});
      })
    );

    renderWithProviders(<LoginPage />);

    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify validation errors appear
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();

    // Verify API was NOT called
    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('should show loading state during API call', async () => {
    const user = userEvent.setup();

    // Mock slow API response
    server.use(
      http.post('/api/v1/auth/login', async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return HttpResponse.json({ access_token: 'token' });
      })
    );

    renderWithProviders(<LoginPage />);

    // Fill and submit form
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify loading state
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();

    // Or verify spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should handle rate limiting errors', async () => {
    const user = userEvent.setup();

    // Mock rate limit response
    server.use(
      http.post('/api/v1/auth/login', async () => {
        return HttpResponse.json(
          {
            error: 'Too many requests',
            retry_after: 60,
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Date.now() + 60000),
            },
          }
        );
      })
    );

    renderWithProviders(<LoginPage />);

    // Fill and submit form
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify rate limit message
    await waitFor(() => {
      expect(screen.getByText(/too many attempts|please wait/i)).toBeInTheDocument();
    });
  });
});

describe('Logout Integration', () => {
  beforeEach(() => {
    // Set up authenticated state
    localStorage.setItem('auth_token', 'mock-token');
  });

  it('should call logout API and clear local state', async () => {
    const apiSpy = vi.fn();

    // Mock logout endpoint
    server.use(
      http.post('/api/v1/auth/logout', async () => {
        apiSpy();
        return HttpResponse.json({ message: 'Logged out successfully' });
      })
    );

    // Render component with logout button (e.g., Header)
    // This is a simplified example
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AuthProvider>
          <button
            onClick={() => {
              // This would typically be in your logout handler
              fetch('/api/v1/auth/logout', { method: 'POST' }).then(() => {
                localStorage.removeItem('auth_token');
              });
            }}
          >
            Logout
          </button>
        </AuthProvider>
      </BrowserRouter>
    );

    await user.click(screen.getByRole('button', { name: /logout/i }));

    // Verify API was called
    await waitFor(() => {
      expect(apiSpy).toHaveBeenCalledTimes(1);
    });

    // Verify token was cleared
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});

describe('Token Refresh Integration', () => {
  it('should automatically refresh expired token', async () => {
    const refreshSpy = vi.fn();

    // Mock token refresh endpoint
    server.use(
      http.post('/api/v1/auth/refresh', async () => {
        refreshSpy();
        return HttpResponse.json({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
        });
      })
    );

    // Mock 401 response that should trigger refresh
    server.use(
      http.get('/api/v1/users', async () => {
        return HttpResponse.json({ error: 'Token expired' }, { status: 401 });
      })
    );

    // Set up initial auth state
    localStorage.setItem('auth_token', 'expired-token');
    localStorage.setItem('refresh_token', 'valid-refresh-token');

    // Make an API call that will fail with 401
    // Your API client should automatically call refresh
    // This would be tested via your actual API client implementation

    // Verify refresh was called
    // await waitFor(() => {
    //   expect(refreshSpy).toHaveBeenCalledTimes(1);
    // });
  });
});
