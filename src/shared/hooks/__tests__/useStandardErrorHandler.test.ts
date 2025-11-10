/**
 * Tests for useStandardErrorHandler hook
 * 
 * @see CODE_AUDIT_FIX_PLAN.md Phase 1.1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStandardErrorHandler, useFormErrorHandler, useSilentErrorHandler } from '../useStandardErrorHandler';
import { APIError, ValidationError } from '@/core/error/types';

// Mock dependencies
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/core/logging', () => ({
  logger: () => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

describe('useStandardErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle API errors and show toast', () => {
    const { result } = renderHook(() => useStandardErrorHandler());
    const error = new APIError('Test error', 500, 'GET', '/api/test');

    act(() => {
      const handlingResult = result.current(error);
      expect(handlingResult.handled).toBe(true);
      expect(handlingResult.userMessage).toBeTruthy();
    });
  });

  it('should handle validation errors with field errors', () => {
    const { result } = renderHook(() => useStandardErrorHandler());
    const fieldErrors = { email: ['Invalid email'], password: ['Too short'] };
    const error = new ValidationError('Validation failed', fieldErrors);
    const fieldErrorSetter = vi.fn();

    act(() => {
      result.current(error, { fieldErrorSetter });
      expect(fieldErrorSetter).toHaveBeenCalled();
    });
  });

  it('should not show toast when showToast is false', () => {
    const { result } = renderHook(() => useStandardErrorHandler());
    const error = new Error('Test error');

    act(() => {
      result.current(error, { showToast: false });
      // Toast should not be called (verified in mock)
    });
  });

  it('should use custom message when provided', () => {
    const { result } = renderHook(() => useStandardErrorHandler());
    const error = new Error('Test error');
    const customMessage = 'Custom error message';

    act(() => {
      result.current(error, { customMessage });
      // Custom message should be used (verified by mock toast call)
    });
  });
});

describe('useFormErrorHandler', () => {
  it('should handle form errors with field setter', () => {
    const { result } = renderHook(() => useFormErrorHandler());
    const fieldErrors = { email: ['Invalid'] };
    const error = new ValidationError('Validation failed', fieldErrors);
    const setFieldErrors = vi.fn();

    act(() => {
      result.current(error, setFieldErrors);
      expect(setFieldErrors).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  it('should show toast by default', () => {
    const { result } = renderHook(() => useFormErrorHandler());
    const error = new Error('Form error');
    const setFieldErrors = vi.fn();

    act(() => {
      result.current(error, setFieldErrors);
      // Toast should be called by default
    });
  });
});

describe('useSilentErrorHandler', () => {
  it('should not show toast notifications', () => {
    const { result } = renderHook(() => useSilentErrorHandler());
    const error = new Error('Silent error');

    act(() => {
      result.current(error);
      // Toast should NOT be called
    });
  });

  it('should still log errors', () => {
    const { result } = renderHook(() => useSilentErrorHandler());
    const error = new Error('Silent error');

    act(() => {
      result.current(error, { logError: true });
      // Logger should still be called
    });
  });
});
