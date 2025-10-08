import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useErrorHandler } from '../errors/useErrorHandler';
import { errorLogger } from '../../utils/errorLogger';

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.spyOn(errorLogger, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles errors via handleError and logs context', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error('Test error'), 'TestComponent');
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.errorMessage).toBeTruthy();
    expect(errorLogger.log).toHaveBeenCalledWith(expect.objectContaining({ code: expect.any(String) }), { component: 'TestComponent' });
  });

  it('clears error state correctly', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.setError('Something went wrong');
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.errorMessage).toBeNull();
  });

  it('flags authentication errors', async () => {
    const { result } = renderHook(() => useErrorHandler());

    const apiError = {
      error: {
        message: {
          error_code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password',
          data: [],
        },
        status_code: 401,
        path: '/api/v1/auth/login',
        timestamp: new Date().toISOString(),
      },
    };

    act(() => {
      result.current.handleError(apiError, 'LoginForm');
    });

    await waitFor(() => {
      expect(result.current.isAuthenticationError).toBe(true);
      expect(result.current.error?.code).toBe('INVALID_CREDENTIALS');
    });
  });
});
