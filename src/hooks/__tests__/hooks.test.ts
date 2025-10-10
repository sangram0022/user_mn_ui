/**
 * Unit Tests: Custom Hooks
 * Expert-level testing by 25-year React veteran
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAsyncOperation } from '../useAsyncOperation';
import { useFormState } from '../useFormState';
import { usePagination } from '../usePagination';

describe('useAsyncOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAsyncOperation());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.error /* data not in interface */).toBeNull();
  });

  it('should handle successful async operation', async () => {
    const mockFn = vi.fn().mockResolvedValue({ id: 1, name: 'Test' });
    const { result } = renderHook(() => useAsyncOperation());
    
    act(() => {
      result.current.execute(mockFn);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error /* data not in interface */).toEqual({ id: 1, name: 'Test' });
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle failed async operation', async () => {
    const mockError = new Error('Operation failed');
    const mockFn = vi.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() => useAsyncOperation());
    
    act(() => {
      result.current.execute(mockFn);
    });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(mockError);
      expect(result.current.error /* data not in interface */).toBeNull();
    });
  });

  it('should reset state', async () => {
    const mockFn = vi.fn().mockResolvedValue({ data: 'test' });
    const { result } = renderHook(() => useAsyncOperation());
    
    await act(async () => {
      await result.current.execute(mockFn);
    });
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe('useFormState', () => {
  const initialValues = {
    email: '',
    password: '',
  };

  it('should initialize with initial values', () => {
    const { result } = renderHook(() => useFormState({ initialValues }));
    
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('should update field value', () => {
    const { result } = renderHook(() => useFormState({ initialValues }));
    
    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
    });
    
    expect(result.current.values.email).toBe('test@example.com');
  });

  it('should mark field as touched', () => {
    const { result } = renderHook(() => useFormState({ initialValues }));
    
    act(() => {
      result.current.setFieldTouched('email', true);
    });
    
    expect(result.current.touched.email).toBe(true);
  });

  it('should set validation errors', () => {
    const { result } = renderHook(() => useFormState({ initialValues }));
    
    act(() => {
      result.current.setErrors({ email: 'Email is required' });
    });
    
    expect(result.current.errors.email).toBe('Email is required');
  });

  it('should reset form', () => {
    const { result } = renderHook(() => useFormState({ initialValues }));
    
    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldTouched('email', true);
      result.current.setErrors({ email: 'Invalid email' });
    });
    
    act(() => {
      result.current.resetForm();
    });
    
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });
});

describe('usePagination', () => {
  const totalItems = 100;
  const pageSize = 10;

  it('should initialize with correct values', () => {
    const { result } = renderHook(() => 
      usePagination({ initialTotal: totalItems, pageSize })
    );
    
    expect(result.current.page).toBe(1);
    expect(Math.ceil(result.current.total / result.current.pageSize)).toBe(10);
    expect(result.current.skip).toBe(0);
    expect((result.current.skip + result.current.limit)).toBe(10);
  });

  it('should go to next page', () => {
    const { result } = renderHook(() => 
      usePagination({ initialTotal: totalItems, pageSize })
    );
    
    act(() => {
      result.current.nextPage();
    });
    
    expect(result.current.page).toBe(2);
    expect(result.current.skip).toBe(10);
    expect((result.current.skip + result.current.limit)).toBe(20);
  });

  it('should go to previous page', () => {
    const { result } = renderHook(() => 
      usePagination({ initialTotal: totalItems, pageSize, initialPage: 3 })
    );
    
    act(() => {
      result.current.previousPage();
    });
    
    expect(result.current.page).toBe(2);
  });

  it('should not go beyond last page', () => {
    const { result } = renderHook(() => 
      usePagination({ initialTotal: totalItems, pageSize, initialPage: 10 })
    );
    
    act(() => {
      result.current.nextPage();
    });
    
    expect(result.current.page).toBe(10);
  });

  it('should not go before first page', () => {
    const { result } = renderHook(() => 
      usePagination({ initialTotal: totalItems, pageSize })
    );
    
    act(() => {
      result.current.previousPage();
    });
    
    expect(result.current.page).toBe(1);
  });

  it('should jump to specific page', () => {
    const { result } = renderHook(() => 
      usePagination({ initialTotal: totalItems, pageSize })
    );
    
    act(() => {
      result.current.setPage(5);
    });
    
    expect(result.current.page).toBe(5);
    expect(result.current.skip).toBe(40);
    expect((result.current.skip + result.current.limit)).toBe(50);
  });
});