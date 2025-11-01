import { describe, it, expect } from 'vitest';
import {
  AUTH_ERROR_MESSAGES,
  HTTP_ERROR_MESSAGES,
  formatErrorMessage,
  formatValidationErrors,
  isNetworkError,
  isAuthError,
  getErrorSeverity,
} from '../errorMessages';

describe('Error Message Constants', () => {
  describe('AUTH_ERROR_MESSAGES', () => {
    it('should have all authentication error messages', () => {
      expect(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.USER_NOT_FOUND).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.INCORRECT_PASSWORD).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.ACCOUNT_LOCKED).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.ACCOUNT_DISABLED).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED).toBeDefined();
    });

    it('should have all registration error messages', () => {
      expect(AUTH_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.USERNAME_TAKEN).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.WEAK_PASSWORD).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.INVALID_EMAIL).toBeDefined();
    });

    it('should have all token error messages', () => {
      expect(AUTH_ERROR_MESSAGES.TOKEN_EXPIRED).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.TOKEN_INVALID).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.CSRF_TOKEN_INVALID).toBeDefined();
    });

    it('should have all password reset error messages', () => {
      expect(AUTH_ERROR_MESSAGES.RESET_TOKEN_EXPIRED).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.RESET_TOKEN_INVALID).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.PASSWORD_RECENTLY_USED).toBeDefined();
    });

    it('should have all email verification error messages', () => {
      expect(AUTH_ERROR_MESSAGES.VERIFICATION_TOKEN_EXPIRED).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.VERIFICATION_TOKEN_INVALID).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED).toBeDefined();
    });

    it('should have rate limiting error messages', () => {
      expect(AUTH_ERROR_MESSAGES.TOO_MANY_REQUESTS).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED).toBeDefined();
    });

    it('should have OAuth error messages', () => {
      expect(AUTH_ERROR_MESSAGES.OAUTH_PROVIDER_ERROR).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.OAUTH_CANCELLED).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.OAUTH_EMAIL_IN_USE).toBeDefined();
    });

    it('should have network error messages', () => {
      expect(AUTH_ERROR_MESSAGES.NETWORK_ERROR).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.TIMEOUT_ERROR).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.SERVER_ERROR).toBeDefined();
    });

    it('should have validation error messages', () => {
      expect(AUTH_ERROR_MESSAGES.VALIDATION_ERROR).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.MISSING_REQUIRED_FIELD).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.INVALID_INPUT).toBeDefined();
    });

    it('should have permission error messages', () => {
      expect(AUTH_ERROR_MESSAGES.UNAUTHORIZED).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.FORBIDDEN).toBeDefined();
    });

    it('should have unknown error message', () => {
      expect(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('HTTP_ERROR_MESSAGES', () => {
    it('should have all common HTTP status codes', () => {
      expect(HTTP_ERROR_MESSAGES[400]).toBeDefined();
      expect(HTTP_ERROR_MESSAGES[401]).toBeDefined();
      expect(HTTP_ERROR_MESSAGES[403]).toBeDefined();
      expect(HTTP_ERROR_MESSAGES[404]).toBeDefined();
      expect(HTTP_ERROR_MESSAGES[408]).toBeDefined();
      expect(HTTP_ERROR_MESSAGES[409]).toBeDefined();
      expect(HTTP_ERROR_MESSAGES[422]).toBeDefined();
      expect(HTTP_ERROR_MESSAGES[429]).toBeDefined();
      expect(HTTP_ERROR_MESSAGES[500]).toBeDefined();
      expect(HTTP_ERROR_MESSAGES[502]).toBeDefined();
      expect(HTTP_ERROR_MESSAGES[503]).toBeDefined();
      expect(HTTP_ERROR_MESSAGES[504]).toBeDefined();
    });

    it('should have user-friendly messages for each status', () => {
      expect(HTTP_ERROR_MESSAGES[401]).toContain('log in');
      expect(HTTP_ERROR_MESSAGES[403]).toContain('permission');
      expect(HTTP_ERROR_MESSAGES[404]).toContain('not found');
      expect(HTTP_ERROR_MESSAGES[500]).toContain('server error');
    });
  });
});

describe('formatErrorMessage', () => {
  describe('null and undefined handling', () => {
    it('should return unknown error for null', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = formatErrorMessage(null as any);
      expect(result).toBe(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
    });

    it('should return unknown error for undefined', () => {
      const result = formatErrorMessage(undefined);
      expect(result).toBe(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
    });
  });

  describe('string error handling', () => {
    it('should return the string directly', () => {
      const error = 'Custom error message';
      expect(formatErrorMessage(error)).toBe('Custom error message');
    });

    it('should handle empty string', () => {
      // Empty string falls through to default error message
      expect(formatErrorMessage('')).toBe(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
    });
  });

  describe('Error object handling', () => {
    it('should return error message from Error object', () => {
      const error = new Error('Something went wrong');
      expect(formatErrorMessage(error)).toBe('Something went wrong');
    });

    it('should return unknown error for Error with no message', () => {
      const error = new Error();
      expect(formatErrorMessage(error)).toBe(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
    });
  });

  describe('error code handling', () => {
    it('should return message for known error code', () => {
      const error = { code: 'INVALID_CREDENTIALS' };
      expect(formatErrorMessage(error)).toBe(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    });

    it('should handle all auth error codes', () => {
      const codes = [
        'USER_NOT_FOUND',
        'INCORRECT_PASSWORD',
        'ACCOUNT_LOCKED',
        'TOKEN_EXPIRED',
        'EMAIL_ALREADY_EXISTS',
      ];

      codes.forEach(code => {
        const error = { code };
        const result = formatErrorMessage(error);
        expect(result).toBe(AUTH_ERROR_MESSAGES[code]);
      });
    });

    it('should fall through for unknown error code', () => {
      const error = { code: 'UNKNOWN_CODE' };
      expect(formatErrorMessage(error)).toBe(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
    });
  });

  describe('FastAPI detail field handling', () => {
    it('should return detail field when present', () => {
      const error = {
        code: 'SOME_CODE',
        detail: 'Detailed error from FastAPI',
      };
      expect(formatErrorMessage(error)).toBe('Detailed error from FastAPI');
    });

    it('should prioritize code over detail', () => {
      const error = {
        code: 'INVALID_CREDENTIALS',
        detail: 'Some other message',
      };
      expect(formatErrorMessage(error)).toBe(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    });

    it('should ignore non-string detail', () => {
      const error = {
        detail: { nested: 'object' },
      };
      expect(formatErrorMessage(error)).toBe(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
    });
  });

  describe('message field handling', () => {
    it('should return message field when no code', () => {
      const error = { message: 'Custom message' };
      expect(formatErrorMessage(error)).toBe('Custom message');
    });

    it('should fall back to message when code not found', () => {
      const error = {
        code: 'UNKNOWN_CODE',
        message: 'Fallback message',
      };
      expect(formatErrorMessage(error)).toBe('Fallback message');
    });
  });

  describe('error field handling', () => {
    it('should return error field when present', () => {
      const error = { error: 'Error description' };
      expect(formatErrorMessage(error)).toBe('Error description');
    });

    it('should prioritize message over error field', () => {
      const error = {
        message: 'Message text',
        error: 'Error text',
      };
      expect(formatErrorMessage(error)).toBe('Message text');
    });

    it('should ignore non-string error field', () => {
      const error = {
        error: { nested: 'object' },
      };
      expect(formatErrorMessage(error)).toBe(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
    });
  });

  describe('HTTP status code handling', () => {
    it('should return message for known HTTP status', () => {
      const error = { status: 404 };
      expect(formatErrorMessage(error)).toBe(HTTP_ERROR_MESSAGES[404]);
    });

    it('should handle all HTTP status codes', () => {
      const statuses = [400, 401, 403, 408, 429, 500, 502, 503, 504];

      statuses.forEach(status => {
        const error = { status };
        const result = formatErrorMessage(error);
        expect(result).toBe(HTTP_ERROR_MESSAGES[status]);
      });
    });

    it('should fall back to unknown for unhandled status', () => {
      const error = { status: 418 }; // I'm a teapot
      expect(formatErrorMessage(error)).toBe(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
    });

    it('should prioritize code over status', () => {
      const error = {
        code: 'INVALID_CREDENTIALS',
        status: 401,
      };
      expect(formatErrorMessage(error)).toBe(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    });
  });

  describe('complex error object handling', () => {
    it('should handle error with multiple fields', () => {
      const error = {
        code: 'TOKEN_EXPIRED',
        status: 401,
        message: 'Token has expired',
        detail: 'Your session has timed out',
      };
      expect(formatErrorMessage(error)).toBe(AUTH_ERROR_MESSAGES.TOKEN_EXPIRED);
    });

    it('should handle nested error objects', () => {
      const error = {
        response: {
          data: {
            code: 'USER_NOT_FOUND',
          },
        },
      };
      // Note: This should return UNKNOWN because we don't traverse nested response.data
      expect(formatErrorMessage(error)).toBe(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
    });
  });
});

describe('formatValidationErrors', () => {
  it('should format single field error', () => {
    const errors = { email: 'Invalid email format' };
    const result = formatValidationErrors(errors);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe('Email: Invalid email format');
  });

  it('should format multiple field errors', () => {
    const errors = {
      email: 'Invalid email format',
      password: 'Password too short',
    };
    const result = formatValidationErrors(errors);

    expect(result).toHaveLength(2);
    expect(result).toContain('Email: Invalid email format');
    expect(result).toContain('Password: Password too short');
  });

  it('should format field with array of errors', () => {
    const errors = {
      password: ['Too short', 'Missing uppercase', 'Missing number'],
    };
    const result = formatValidationErrors(errors);

    expect(result).toHaveLength(3);
    expect(result).toContain('Password: Too short');
    expect(result).toContain('Password: Missing uppercase');
    expect(result).toContain('Password: Missing number');
  });

  it('should capitalize field names', () => {
    const errors = {
      email: 'Invalid',
      password: 'Too weak',
      username: 'Taken',
    };
    const result = formatValidationErrors(errors);

    expect(result[0]).toMatch(/^Email:/);
    expect(result[1]).toMatch(/^Password:/);
    expect(result[2]).toMatch(/^Username:/);
  });

  it('should format snake_case field names', () => {
    const errors = {
      first_name: 'Required',
      last_name: 'Required',
      phone_number: 'Invalid',
    };
    const result = formatValidationErrors(errors);

    expect(result[0]).toBe('First name: Required');
    expect(result[1]).toBe('Last name: Required');
    expect(result[2]).toBe('Phone number: Invalid');
  });

  it('should format camelCase field names', () => {
    const errors = {
      firstName: 'Required',
      lastName: 'Required',
      phoneNumber: 'Invalid',
    };
    const result = formatValidationErrors(errors);

    expect(result[0]).toBe('First name: Required');
    expect(result[1]).toBe('Last name: Required');
    expect(result[2]).toBe('Phone number: Invalid');
  });

  it('should handle empty errors object', () => {
    const errors = {};
    const result = formatValidationErrors(errors);

    expect(result).toHaveLength(0);
  });

  it('should handle mixed string and array errors', () => {
    const errors = {
      email: 'Invalid email',
      password: ['Too short', 'Missing special'],
      username: 'Already taken',
    };
    const result = formatValidationErrors(errors);

    expect(result).toHaveLength(4);
    expect(result).toContain('Email: Invalid email');
    expect(result).toContain('Password: Too short');
    expect(result).toContain('Password: Missing special');
    expect(result).toContain('Username: Already taken');
  });
});

describe('isNetworkError', () => {
  it('should return true for NETWORK_ERROR code', () => {
    const error = { code: 'NETWORK_ERROR' };
    expect(isNetworkError(error)).toBe(true);
  });

  it('should return true for ECONNABORTED code', () => {
    const error = { code: 'ECONNABORTED' };
    expect(isNetworkError(error)).toBe(true);
  });

  it('should return true for ERR_NETWORK code', () => {
    const error = { code: 'ERR_NETWORK' };
    expect(isNetworkError(error)).toBe(true);
  });

  it('should return true for message containing "network"', () => {
    const error = { message: 'Network request failed' };
    expect(isNetworkError(error)).toBe(true);
  });

  it('should return true for uppercase NETWORK in message', () => {
    const error = { message: 'NETWORK CONNECTION LOST' };
    expect(isNetworkError(error)).toBe(true);
  });

  it('should return false for non-network errors', () => {
    const error = { code: 'INVALID_CREDENTIALS' };
    expect(isNetworkError(error)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isNetworkError(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isNetworkError(undefined)).toBe(false);
  });

  it('should return false for string', () => {
    expect(isNetworkError('Some error')).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isNetworkError({})).toBe(false);
  });
});

describe('isAuthError', () => {
  it('should return true for 401 status', () => {
    const error = { status: 401 };
    expect(isAuthError(error)).toBe(true);
  });

  it('should return true for 403 status', () => {
    const error = { status: 403 };
    expect(isAuthError(error)).toBe(true);
  });

  it('should return true for INVALID_CREDENTIALS code', () => {
    const error = { code: 'INVALID_CREDENTIALS' };
    expect(isAuthError(error)).toBe(true);
  });

  it('should return true for TOKEN_EXPIRED code', () => {
    const error = { code: 'TOKEN_EXPIRED' };
    expect(isAuthError(error)).toBe(true);
  });

  it('should return true for UNAUTHORIZED code', () => {
    const error = { code: 'UNAUTHORIZED' };
    expect(isAuthError(error)).toBe(true);
  });

  it('should return true for error with both status and code', () => {
    const error = { status: 401, code: 'TOKEN_EXPIRED' };
    expect(isAuthError(error)).toBe(true);
  });

  it('should return false for non-auth status codes', () => {
    expect(isAuthError({ status: 400 })).toBe(false);
    expect(isAuthError({ status: 404 })).toBe(false);
    expect(isAuthError({ status: 500 })).toBe(false);
  });

  it('should return false for non-auth error codes', () => {
    const error = { code: 'NETWORK_ERROR' };
    expect(isAuthError(error)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isAuthError(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isAuthError(undefined)).toBe(false);
  });

  it('should return false for string', () => {
    expect(isAuthError('Auth error')).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isAuthError({})).toBe(false);
  });
});

describe('getErrorSeverity', () => {
  describe('error severity', () => {
    it('should return error for 500 status', () => {
      const error = { status: 500 };
      expect(getErrorSeverity(error)).toBe('error');
    });

    it('should return error for 503 status', () => {
      const error = { status: 503 };
      expect(getErrorSeverity(error)).toBe('error');
    });

    it('should return error for SERVER_ERROR code', () => {
      const error = { code: 'SERVER_ERROR' };
      expect(getErrorSeverity(error)).toBe('error');
    });

    it('should return error for unknown errors', () => {
      const error = { code: 'UNKNOWN_ERROR' };
      expect(getErrorSeverity(error)).toBe('error');
    });

    it('should return error for validation errors', () => {
      const error = { status: 400 };
      expect(getErrorSeverity(error)).toBe('error');
    });
  });

  describe('warning severity', () => {
    it('should return warning for 429 status', () => {
      const error = { status: 429 };
      expect(getErrorSeverity(error)).toBe('warning');
    });

    it('should return warning for RATE_LIMIT_EXCEEDED code', () => {
      const error = { code: 'RATE_LIMIT_EXCEEDED' };
      expect(getErrorSeverity(error)).toBe('warning');
    });

    it('should return warning for TOO_MANY_REQUESTS code', () => {
      const error = { code: 'TOO_MANY_REQUESTS' };
      expect(getErrorSeverity(error)).toBe('warning');
    });

    it('should return warning for auth errors (401)', () => {
      const error = { status: 401 };
      expect(getErrorSeverity(error)).toBe('warning');
    });

    it('should return warning for auth errors (403)', () => {
      const error = { status: 403 };
      expect(getErrorSeverity(error)).toBe('warning');
    });

    it('should return warning for auth error codes', () => {
      expect(getErrorSeverity({ code: 'INVALID_CREDENTIALS' })).toBe('warning');
      expect(getErrorSeverity({ code: 'TOKEN_EXPIRED' })).toBe('warning');
      expect(getErrorSeverity({ code: 'UNAUTHORIZED' })).toBe('warning');
    });
  });

  describe('default behavior', () => {
    it('should return error for null', () => {
      expect(getErrorSeverity(null)).toBe('error');
    });

    it('should return error for undefined', () => {
      expect(getErrorSeverity(undefined)).toBe('error');
    });

    it('should return error for string', () => {
      expect(getErrorSeverity('Some error')).toBe('error');
    });

    it('should return error for empty object', () => {
      expect(getErrorSeverity({})).toBe('error');
    });

    it('should return error for unrecognized status codes', () => {
      expect(getErrorSeverity({ status: 404 })).toBe('error');
      expect(getErrorSeverity({ status: 418 })).toBe('error');
    });
  });

  describe('priority handling', () => {
    it('should prioritize critical error status over code', () => {
      const error = { status: 500, code: 'RATE_LIMIT_EXCEEDED' };
      expect(getErrorSeverity(error)).toBe('error');
    });

    it('should prioritize rate limit code over auth status', () => {
      const error = { status: 401, code: 'RATE_LIMIT_EXCEEDED' };
      expect(getErrorSeverity(error)).toBe('warning');
    });
  });
});
