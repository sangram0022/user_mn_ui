import { describe, it, expect } from 'vitest';
import { parseApiError, getErrorSeverity, isAuthError, formatErrorForDisplay } from '../errorParser';

describe('errorParser', () => {
  it('parses structured API errors', () => {
    const error = {
      error: {
        message: {
          error_code: 'ACCOUNT_LOCKED',
          message: 'Too many attempts',
          data: ['try again later'],
        },
        status_code: 423,
        path: '/api/v1/auth/login',
        timestamp: '2025-01-01T00:00:00.000Z',
      },
    };

    const parsed = parseApiError(error);

    expect(parsed.code).toBe('ACCOUNT_LOCKED');
    expect(parsed.statusCode).toBe(423);
    expect(parsed.details).toEqual(['try again later']);
    expect(parsed.message).toBeTruthy();
  });

  it('returns sensible defaults for string errors', () => {
    const parsed = parseApiError('Something went wrong');

    expect(parsed.code).toBe('UNKNOWN_ERROR');
    expect(parsed.message).toContain('Something went wrong');
  });

  it('identifies authentication errors', () => {
    const error = {
      error: {
        message: {
          error_code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials provided',
          data: [],
        },
        status_code: 401,
        path: '/api/v1/auth/login',
        timestamp: '2025-01-01T00:00:00.000Z',
      },
    };

    expect(isAuthError(error)).toBe(true);
    expect(getErrorSeverity(error)).toBe('warning');
    expect(formatErrorForDisplay(error)).toBeTruthy();
  });
});
