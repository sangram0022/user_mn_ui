/**
 * Custom hook for managing loading states with React 19 features
 */
import { useState, useCallback, useTransition, startTransition } from 'react';

export interface UseLoadingOptions { initialLoading?: boolean;
  enableTransition?: boolean; }

export function useLoading(options: UseLoadingOptions = {}) { const { initialLoading = false, enableTransition = true } = options;
  
  const [loading, setLoading] = useState(initialLoading);
  const [isPending, transition] = useTransition();

  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => { if (enableTransition) {
        return new Promise<T>((resolve, reject) => {
          startTransition(async () => {
            try {
              const result = await asyncFn();
              resolve(result);
            } catch (error) { reject(error);
            }
          });
        });
      } else { setLoading(true);
        try {
          const result = await asyncFn();
          return result;
        } finally { setLoading(false);
        }
      }
    },
    [enableTransition]
  );

  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);

  return { loading: enableTransition ? isPending : loading,
    isPending,
    withLoading,
    startLoading,
    stopLoading,
    transition,
  };
}