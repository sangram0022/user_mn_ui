/**
 * Mock utilities for testing
 */

// Mock API client
export const mockApiClient = { auth: {
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    refreshToken: vi.fn(),
  },
  users: { getUsers: vi.fn(),
    getUserById: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
  // Add more mock methods as needed
};

// Mock user data
export const mockUser = { id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user' as const,
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z', };

// Mock auth context
export const mockAuthContext = { user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  updateProfile: vi.fn(), };

// Mock error
export const mockError = { code: 'TEST_ERROR',
  message: 'Test error message',
  details: ['Test error detail'],
  category: 'unknown' as const,
  severity: 'medium' as const,
  userMessage: 'A test error occurred',
  retryable: false,
  timestamp: '2023-01-01T00:00:00Z', };