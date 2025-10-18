/**
 * MSW Mock API Handlers
 *
 * This file contains all mock API handlers for testing.
 * Each handler intercepts HTTP requests and returns mock data.
 *
 * @see https://mswjs.io/docs/
 */

import { http, HttpResponse } from 'msw';

// Base API URL
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// ============================================================================
// Mock Data
// ============================================================================

/**
 * Mock user data
 */
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'admin',
  status: 'active',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

/**
 * Mock authentication tokens
 */
export const mockTokens = {
  accessToken: 'mock-access-token-12345',
  refreshToken: 'mock-refresh-token-67890',
  expiresIn: 3600,
};

/**
 * Mock users list
 */
export const mockUsers = [
  mockUser,
  {
    id: '2',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'moderator',
    status: 'active',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
];

/**
 * Mock workflows
 */
export const mockWorkflows = [
  {
    id: 'wf-1',
    name: 'User Onboarding',
    description: 'Onboard new users',
    status: 'active',
    steps: 5,
    completedSteps: 3,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'wf-2',
    name: 'Document Approval',
    description: 'Approve documents',
    status: 'pending',
    steps: 3,
    completedSteps: 1,
    createdAt: '2024-01-02T00:00:00.000Z',
  },
];

// ============================================================================
// Authentication Handlers
// ============================================================================

export const authHandlers = [
  /**
   * POST /auth/login - Login
   */
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    // Simulate authentication
    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json(
        {
          success: true,
          data: {
            user: mockUser,
            tokens: mockTokens,
          },
        },
        { status: 200 }
      );
    }

    // Invalid credentials
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      },
      { status: 401 }
    );
  }),

  /**
   * POST /auth/register - Register
   */
  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };

    // Simulate successful registration
    return HttpResponse.json(
      {
        success: true,
        data: {
          user: {
            ...mockUser,
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            id: `user-${Date.now()}`,
          },
          tokens: mockTokens,
        },
      },
      { status: 201 }
    );
  }),

  /**
   * POST /auth/logout - Logout
   */
  http.post(`${API_BASE_URL}/auth/logout`, () =>
    HttpResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    )
  ),

  /**
   * POST /auth/refresh - Refresh token
   */
  http.post(`${API_BASE_URL}/auth/refresh`, () =>
    HttpResponse.json(
      {
        success: true,
        data: {
          accessToken: 'new-access-token',
          expiresIn: 3600,
        },
      },
      { status: 200 }
    )
  ),

  /**
   * POST /auth/forgot-password - Forgot password
   */
  http.post(`${API_BASE_URL}/auth/forgot-password`, () =>
    HttpResponse.json(
      {
        success: true,
        message: 'Password reset email sent',
      },
      { status: 200 }
    )
  ),

  /**
   * POST /auth/reset-password - Reset password
   */
  http.post(`${API_BASE_URL}/auth/reset-password`, () =>
    HttpResponse.json(
      {
        success: true,
        message: 'Password reset successfully',
      },
      { status: 200 }
    )
  ),

  /**
   * GET /auth/me - Get current user
   */
  http.get(`${API_BASE_URL}/auth/me`, () =>
    HttpResponse.json(
      {
        success: true,
        data: mockUser,
      },
      { status: 200 }
    )
  ),
];

// ============================================================================
// User Management Handlers
// ============================================================================

export const userHandlers = [
  /**
   * GET /users - Get all users
   */
  http.get(`${API_BASE_URL}/users`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';

    // Filter users by search term
    let filteredUsers = mockUsers;
    if (search) {
      filteredUsers = mockUsers.filter(
        (user) =>
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.firstName.toLowerCase().includes(search.toLowerCase()) ||
          user.lastName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Paginate results
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = filteredUsers.slice(start, end);

    return HttpResponse.json(
      {
        success: true,
        data: {
          users: paginatedUsers,
          pagination: {
            page,
            limit,
            total: filteredUsers.length,
            totalPages: Math.ceil(filteredUsers.length / limit),
          },
        },
      },
      { status: 200 }
    );
  }),

  /**
   * GET /users/:id - Get user by ID
   */
  http.get(`${API_BASE_URL}/users/:id`, ({ params }) => {
    const { id } = params;
    const user = mockUsers.find((u) => u.id === id);

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  }),

  /**
   * POST /users - Create user
   */
  http.post(`${API_BASE_URL}/users`, async ({ request }) => {
    const body = (await request.json()) as Partial<typeof mockUser>;

    const newUser = {
      ...mockUser,
      ...body,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(
      {
        success: true,
        data: newUser,
      },
      { status: 201 }
    );
  }),

  /**
   * PUT /users/:id - Update user
   */
  http.put(`${API_BASE_URL}/users/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Partial<typeof mockUser>;
    const user = mockUsers.find((u) => u.id === id);

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    const updatedUser = {
      ...user,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(
      {
        success: true,
        data: updatedUser,
      },
      { status: 200 }
    );
  }),

  /**
   * DELETE /users/:id - Delete user
   */
  http.delete(`${API_BASE_URL}/users/:id`, ({ params }) => {
    const { id } = params;
    const user = mockUsers.find((u) => u.id === id);

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        message: 'User deleted successfully',
      },
      { status: 200 }
    );
  }),
];

// ============================================================================
// Workflow Handlers
// ============================================================================

export const workflowHandlers = [
  /**
   * GET /workflows - Get all workflows
   */
  http.get(`${API_BASE_URL}/workflows`, () =>
    HttpResponse.json(
      {
        success: true,
        data: mockWorkflows,
      },
      { status: 200 }
    )
  ),

  /**
   * GET /workflows/:id - Get workflow by ID
   */
  http.get(`${API_BASE_URL}/workflows/:id`, ({ params }) => {
    const { id } = params;
    const workflow = mockWorkflows.find((w) => w.id === id);

    if (!workflow) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'WORKFLOW_NOT_FOUND',
            message: 'Workflow not found',
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        data: workflow,
      },
      { status: 200 }
    );
  }),

  /**
   * POST /workflows - Create workflow
   */
  http.post(`${API_BASE_URL}/workflows`, async ({ request }) => {
    const body = (await request.json()) as Partial<(typeof mockWorkflows)[0]>;

    const newWorkflow = {
      ...mockWorkflows[0],
      ...body,
      id: `wf-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json(
      {
        success: true,
        data: newWorkflow,
      },
      { status: 201 }
    );
  }),

  /**
   * PUT /workflows/:id - Update workflow
   */
  http.put(`${API_BASE_URL}/workflows/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Partial<(typeof mockWorkflows)[0]>;
    const workflow = mockWorkflows.find((w) => w.id === id);

    if (!workflow) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'WORKFLOW_NOT_FOUND',
            message: 'Workflow not found',
          },
        },
        { status: 404 }
      );
    }

    const updatedWorkflow = {
      ...workflow,
      ...body,
    };

    return HttpResponse.json(
      {
        success: true,
        data: updatedWorkflow,
      },
      { status: 200 }
    );
  }),
];

// ============================================================================
// Analytics Handlers
// ============================================================================

export const analyticsHandlers = [
  /**
   * GET /analytics/dashboard - Get dashboard analytics
   */
  http.get(`${API_BASE_URL}/analytics/dashboard`, () =>
    HttpResponse.json(
      {
        success: true,
        data: {
          totalUsers: 1234,
          activeUsers: 567,
          totalWorkflows: 89,
          completedWorkflows: 45,
          metrics: [
            { date: '2024-01-01', value: 100 },
            { date: '2024-01-02', value: 150 },
            { date: '2024-01-03', value: 200 },
          ],
        },
      },
      { status: 200 }
    )
  ),
];

// ============================================================================
// System Handlers
// ============================================================================

export const systemHandlers = [
  /**
   * GET /health - Health check
   */
  http.get(`${API_BASE_URL}/health`, () =>
    HttpResponse.json(
      {
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  ),
];

// ============================================================================
// Combined Handlers Export
// ============================================================================

/**
 * All API handlers for MSW
 */
export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...workflowHandlers,
  ...analyticsHandlers,
  ...systemHandlers,
];
