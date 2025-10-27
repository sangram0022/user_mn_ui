import { useTransition } from 'react';

/**
 * Custom hook for View Transitions API with React 19 useTransition
 *
 * ✅ React 19 Optimized - No useCallback needed
 *
 * Provides smooth page transitions using the browser's View Transitions API
 * with fallback to React's useTransition for unsupported browsers.
 *
 * @example
 * ```tsx
 * const { transition, isPending } = useViewTransition();
 *
 * const handleNavigate = () => {
 *   transition(() => {
 *     navigate('/dashboard');
 *   });
 * };
 * ```
 *
 * @returns Object with transition function and isPending state
 */
export function useViewTransition() {
  const [isPending, startTransition] = useTransition();

  // ✅ React 19: No useCallback needed - startTransition is stable
  const transition = (callback: () => void) => {
    // Check if browser supports View Transitions API
    // @ts-expect-error - View Transitions API is not yet in TypeScript lib
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      // Use native View Transitions API for smooth animations
      // @ts-expect-error - View Transitions API is not yet in TypeScript lib
      document.startViewTransition(() => {
        startTransition(callback);
      });
    } else {
      // Fallback to React's useTransition for unsupported browsers
      startTransition(callback);
    }
  };

  return {
    /**
     * Execute a state update with view transition animation
     * @param callback - Function to execute during transition
     */
    transition,

    /**
     * Indicates if a transition is currently in progress
     */
    isPending,
  };
}

/**
 * Type definition for View Transitions API (for future TypeScript support)
 * Remove once TypeScript officially supports View Transitions API
 */
export interface ViewTransition {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition(): void;
}

/**
 * Helper to check if View Transitions API is supported
 */
export function supportsViewTransitions(): boolean {
  return (
    typeof document !== 'undefined' &&
    // @ts-expect-error - View Transitions API is not yet in TypeScript lib
    'startViewTransition' in document
  );
}
