// Shared test utilities
export const mockApiResponse = <T>(data: T, delay = 100) =>
  new Promise<T>(resolve => setTimeout(() => resolve(data), delay));

export const mockUser = { id: 'user_1',
  name: 'Test User',
  email: 'test@example.com', };

export const mockAuth = { token: 'mock-token',
  expires: Date.now() + 3600 * 1000, };
