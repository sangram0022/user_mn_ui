/**
 * Custom hook for API calls with error handling and loading states
 */
import { useState, useCallback, useRef, useEffect } from 'react';

export interface ApiState<T> { data: T | null;
  loading: boolean;
  error: Error | null; }

export interface UseApiOptions { onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number; }

export function useApi<T = unknown>(
  apiFunction: (...args: unknown[]) => Promise<T>,
  options: UseApiOptions = {}
) { const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { onSuccess, onError, retryCount = 0, retryDelay = 1000 } = options;
  const retryAttempts = useRef(0);
  const abortController = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: unknown[]) => { // Cancel previous request if still pending
      if (abortController.current) {
        abortController.current.abort();
      }

      abortController.current = new AbortController();
      retryAttempts.current = 0;

      const attemptRequest = async (): Promise<void> => { setState(prev => ({ ...prev, loading: true, error: null }));

        try { const result = await apiFunction(...args);
          
          if (!abortController.current?.signal.aborted) {
            setState({
              data: result,
              loading: false,
              error: null,
            });
            onSuccess?.(result);
          }
        } catch (error) { if (!abortController.current?.signal.aborted) {
            const apiError = error instanceof Error ? error : new Error('Unknown error');
            
            // Retry logic
            if (retryAttempts.current < retryCount && !apiError.message.includes('abort')) {
              retryAttempts.current++;
              setTimeout(attemptRequest, retryDelay);
              return;
            }

            setState({ data: null,
              loading: false,
              error: apiError,
            });
            onError?.(apiError);
          }
        }
      };

      await attemptRequest();
    },
    [apiFunction, onSuccess, onError, retryCount, retryDelay]
  );

  const reset = useCallback(() => { setState({
      data: null,
      loading: false,
      error: null,
    });
    retryAttempts.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => { return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return { ...state,
    execute,
    reset,
    retry: execute,
  };
}