/**
 * Unit tests for useApiCall hook
 * 
 * Tests API call wrapper with loading states, error handling, and toast notifications
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApiCall } from '../useApiCall';
import type { ReactNode } from 'react';

// Mock the toast hook
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock('@hooks/useToast', () => ({
  useToast: () => mockToast,
}));

// Wrapper component for hooks that need providers
const wrapper = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

describe('useApiCall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic functionality', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useApiCall(), { wrapper });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.data).toBe(null);
    });

    it('should execute API call successfully', async () => {
      const { result } = renderHook(() => useApiCall(), { wrapper });
      const mockApiFunction = vi.fn().mockResolvedValue({ id: 1, name: 'Test' });

      const response = await result.current.execute(mockApiFunction);

      expect(mockApiFunction).toHaveBeenCalledTimes(1);
      expect(response).toEqual({ id: 1, name: 'Test' });
      expect(result.current.error).toBe(null);
    });

    it('should set loading state during API call', async () => {
      const { result } = renderHook(() => useApiCall(), { wrapper });
      const mockApiFunction = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: 'test' }), 100))
      );

      const promise = result.current.execute(mockApiFunction);
      
      // Should be loading immediately
      expect(result.current.loading).toBe(true);

      await promise;

      // Should not be loading after completion
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle API errors', async () => {
      const { result } = renderHook(() => useApiCall(), { wrapper });
      const mockError = new Error('API Error');
      const mockApiFunction = vi.fn().mockRejectedValue(mockError);

      await expect(result.current.execute(mockApiFunction)).rejects.toThrow('API Error');

      await waitFor(() => {
        expect(result.current.error).toBe(mockError);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should clear error state on successful call', async () => {
      const { result } = renderHook(() => useApiCall(), { wrapper });
      const mockErrorFunction = vi.fn().mockRejectedValue(new Error('Error'));
      const mockSuccessFunction = vi.fn().mockResolvedValue({ success: true });

      // First call fails
      await expect(result.current.execute(mockErrorFunction)).rejects.toThrow();
      
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Second call succeeds
      await result.current.execute(mockSuccessFunction);

      await waitFor(() => {
        expect(result.current.error).toBe(null);
      });
    });
  });

  describe('Toast notifications', () => {
    it('should show success toast when enabled', async () => {
      const { result } = renderHook(() => useApiCall({ showSuccessToast: true }), { wrapper });
      const mockApiFunction = vi.fn().mockResolvedValue({ success: true });

      await result.current.execute(mockApiFunction);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledTimes(1);
      });
    });

    it('should not show success toast by default', async () => {
      const { result } = renderHook(() => useApiCall(), { wrapper });
      const mockApiFunction = vi.fn().mockResolvedValue({ success: true });

      await result.current.execute(mockApiFunction);

      await waitFor(() => {
        expect(mockToast.success).not.toHaveBeenCalled();
      });
    });

    it('should show error toast when enabled', async () => {
      const { result } = renderHook(() => useApiCall({ showErrorToast: true }), { wrapper });
      const mockApiFunction = vi.fn().mockRejectedValue(new Error('API Error'));

      await expect(result.current.execute(mockApiFunction)).rejects.toThrow();

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledTimes(1);
      });
    });

    it('should use custom success message', async () => {
      const customMessage = 'Operation completed successfully';
      const { result } = renderHook(() => 
        useApiCall({ 
          showSuccessToast: true,
          successMessage: customMessage 
        }), 
        { wrapper }
      );
      const mockApiFunction = vi.fn().mockResolvedValue({ success: true });

      await result.current.execute(mockApiFunction);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(customMessage);
      });
    });

    it('should use custom error message', async () => {
      const customMessage = 'Operation failed';
      const { result } = renderHook(() => 
        useApiCall({ 
          showErrorToast: true,
          errorMessage: customMessage 
        }), 
        { wrapper }
      );
      const mockApiFunction = vi.fn().mockRejectedValue(new Error('Error'));

      await expect(result.current.execute(mockApiFunction)).rejects.toThrow();

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(customMessage);
      });
    });
  });

  describe('Callback functions', () => {
    it('should call onSuccess callback', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useApiCall({ onSuccess }), { wrapper });
      const mockData = { id: 1, name: 'Test' };
      const mockApiFunction = vi.fn().mockResolvedValue(mockData);

      await result.current.execute(mockApiFunction);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockData);
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onError callback', async () => {
      const onError = vi.fn();
      const { result } = renderHook(() => useApiCall({ onError }), { wrapper });
      const mockError = new Error('API Error');
      const mockApiFunction = vi.fn().mockRejectedValue(mockError);

      await expect(result.current.execute(mockApiFunction)).rejects.toThrow();

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(mockError);
        expect(onError).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onFinally callback on success', async () => {
      const onFinally = vi.fn();
      const { result } = renderHook(() => useApiCall({ onFinally }), { wrapper });
      const mockApiFunction = vi.fn().mockResolvedValue({ success: true });

      await result.current.execute(mockApiFunction);

      await waitFor(() => {
        expect(onFinally).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onFinally callback on error', async () => {
      const onFinally = vi.fn();
      const { result } = renderHook(() => useApiCall({ onFinally }), { wrapper });
      const mockApiFunction = vi.fn().mockRejectedValue(new Error('Error'));

      await expect(result.current.execute(mockApiFunction)).rejects.toThrow();

      await waitFor(() => {
        expect(onFinally).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Multiple calls', () => {
    it('should handle multiple sequential calls', async () => {
      const { result } = renderHook(() => useApiCall(), { wrapper });
      const mockFunction1 = vi.fn().mockResolvedValue({ id: 1 });
      const mockFunction2 = vi.fn().mockResolvedValue({ id: 2 });

      await result.current.execute(mockFunction1);
      await result.current.execute(mockFunction2);

      expect(mockFunction1).toHaveBeenCalledTimes(1);
      expect(mockFunction2).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid calls correctly', async () => {
      const { result } = renderHook(() => useApiCall(), { wrapper });
      const mockApiFunction = vi.fn().mockResolvedValue({ success: true });

      const promises = [
        result.current.execute(mockApiFunction),
        result.current.execute(mockApiFunction),
        result.current.execute(mockApiFunction),
      ];

      await Promise.all(promises);

      expect(mockApiFunction).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle non-Error objects', async () => {
      const { result } = renderHook(() => useApiCall(), { wrapper });
      const mockApiFunction = vi.fn().mockRejectedValue('String error');

      await expect(result.current.execute(mockApiFunction)).rejects.toBe('String error');

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });

    it('should handle null error', async () => {
      const { result } = renderHook(() => useApiCall(), { wrapper });
      const mockApiFunction = vi.fn().mockRejectedValue(null);

      await expect(result.current.execute(mockApiFunction)).rejects.toBeNull();
    });

    it('should handle undefined return value', async () => {
      const { result } = renderHook(() => useApiCall(), { wrapper });
      const mockApiFunction = vi.fn().mockResolvedValue(undefined);

      const response = await result.current.execute(mockApiFunction);

      expect(response).toBeUndefined();
    });
  });

  describe('State management', () => {
    it('should store response data', async () => {
      const { result } = renderHook(() => useApiCall(), { wrapper });
      const mockData = { id: 1, name: 'Test', items: [1, 2, 3] };
      const mockApiFunction = vi.fn().mockResolvedValue(mockData);

      await result.current.execute(mockApiFunction);

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });
    });

    it('should update data on subsequent calls', async () => {
      const { result } = renderHook(() => useApiCall(), { wrapper });
      const mockData1 = { id: 1 };
      const mockData2 = { id: 2 };
      const mockFunction1 = vi.fn().mockResolvedValue(mockData1);
      const mockFunction2 = vi.fn().mockResolvedValue(mockData2);

      await result.current.execute(mockFunction1);
      
      await waitFor(() => {
        expect(result.current.data).toEqual(mockData1);
      });

      await result.current.execute(mockFunction2);

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData2);
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should work with user management API', async () => {
      const { result } = renderHook(() => 
        useApiCall({ 
          showSuccessToast: true,
          successMessage: 'User updated successfully'
        }), 
        { wrapper }
      );
      
      const mockUpdateUser = vi.fn().mockResolvedValue({ 
        id: 1, 
        status: 'active' 
      });

      await result.current.execute(mockUpdateUser);

      expect(mockUpdateUser).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith('User updated successfully');
    });

    it('should work with GDPR data export', async () => {
      const { result } = renderHook(() => useApiCall(), { wrapper });
      const mockExportData = vi.fn().mockResolvedValue({
        data: { user: 'data' },
        format: 'json'
      });

      const response = await result.current.execute(mockExportData);

      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('format');
    });

    it('should work with audit log filtering', async () => {
      const { result } = renderHook(() => useApiCall(), { wrapper });
      const mockFetchLogs = vi.fn().mockResolvedValue({
        logs: [],
        total: 0
      });

      const response = await result.current.execute(mockFetchLogs);

      expect(response).toHaveProperty('logs');
      expect(response).toHaveProperty('total');
    });
  });
});
