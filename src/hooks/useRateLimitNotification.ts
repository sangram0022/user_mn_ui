import { useEffect, useRef } from 'react';
import { useToast } from './useToast';

/**
 * Hook to show rate limit notifications
 * Listens for rate limit errors (429) and displays a toast notification
 * indicating that the request is being retried
 */
export function useRateLimitNotification() {
  const { toast } = useToast();
  const toastIdRef = useRef<string | null>(null);

  useEffect(() => {
    /**
     * Listen for rate limit errors via custom events
     * The API client will dispatch these events when rate limiting occurs
     */
    const handleRateLimit = (event: Event) => {
      const customEvent = event as CustomEvent<{ retryAfterMs: number; endpoint: string }>;
      const { retryAfterMs, endpoint: _endpoint } = customEvent.detail;

      // Dismiss previous rate limit toast if it exists
      if (toastIdRef.current) {
        // Note: We don't have a dismiss method in this context, but we can track it
      }

      const retrySeconds = Math.round(retryAfterMs / 1000);

      // Show rate limit notification
      toastIdRef.current = toast.warning(
        `Server is busy. Retrying in ${retrySeconds} second${retrySeconds !== 1 ? 's' : ''}...`,
        {
          duration: retryAfterMs + 1000, // Keep it visible during retry
          action: {
            label: 'Cancel',
            onClick: () => {
              console.warn('[RateLimit] User cancelled the retry');
              // The actual cancellation would need to be handled by the API client
              // via an AbortController
            },
          },
        }
      );
    };

    window.addEventListener('api:rate-limit', handleRateLimit);

    return () => {
      window.removeEventListener('api:rate-limit', handleRateLimit);
    };
  }, [toast]);
}

/**
 * Dispatch rate limit event for UI feedback
 * Called by the API client when rate limiting is detected
 * @internal Used by API client only
 */
export function dispatchRateLimitEvent(retryAfterMs: number, endpoint: string) {
  window.dispatchEvent(
    new CustomEvent('api:rate-limit', {
      detail: { retryAfterMs, endpoint },
    })
  );
}
