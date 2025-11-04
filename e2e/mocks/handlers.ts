import { http, HttpResponse } from 'msw';

const BASE_API_URL = 'http://localhost:8000/api/v1';

export const handlers = [
  // Auth endpoints
  http.post(`${BASE_API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    // Mock successful login
    if (body.email === 'test@example.com' && body.password === 'TestPassword123!') {
      return HttpResponse.json({
        success: true,
        data: {
          access_token: 'mock-jwt-token-abc123',
          token_type: 'bearer',
          user: {
            id: '1',
            email: 'test@example.com',
            firstname: 'Test',
            lastname: 'User',
            role: 'user',
            is_active: true,
            is_verified: true,
          },
        },
      });
    }
    
    // Invalid credentials
    return HttpResponse.json(
      {
        success: false,
        error: 'Invalid credentials',
      },
      { status: 401 }
    );
  }),

  // Get current user profile
  http.get(`${BASE_API_URL}/users/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        phone_number: '+1234567890',
        role: 'user',
        roles: ['user'],
        is_active: true,
        is_verified: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    });
  }),

  // Update user profile
  http.patch(`${BASE_API_URL}/users/me`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as Record<string, unknown>;

    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        email: 'test@example.com',
        first_name: body.first_name || 'Test',
        last_name: body.last_name || 'User',
        phone_number: body.phone_number || '+1234567890',
        role: 'user',
        roles: ['user'],
        is_active: true,
        is_verified: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      },
    });
  }),

  // Change password
  http.post(`${BASE_API_URL}/auth/change-password`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as {
      current_password: string;
      new_password: string;
    };

    // Mock validation
    if (body.current_password === body.new_password) {
      return HttpResponse.json(
        {
          success: false,
          error: 'New password must be different from current password',
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  }),

  // Forgot password
  http.post(`${BASE_API_URL}/auth/forgot-password`, async () => {
    // Always return success for security (email enumeration prevention)
    return HttpResponse.json({
      success: true,
      message: 'Password reset email sent if account exists',
    });
  }),

  // Register
  http.post(`${BASE_API_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as {
      email: string;
      password: string;
      firstname: string;
      lastname: string;
    };

    // Mock successful registration
    return HttpResponse.json({
      success: true,
      data: {
        id: '2',
        email: body.email,
        firstname: body.firstname,
        lastname: body.lastname,
        role: 'user',
        is_active: false,
        is_verified: false,
      },
      message: 'Registration successful. Please verify your email.',
    });
  }),

  // Logout
  http.post(`${BASE_API_URL}/auth/logout`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  }),
];
