import { useViewTransition } from '@hooks/useViewTransition';
import type { NavigateFunction, NavigateOptions } from 'react-router-dom';
import { useNavigate as useRouterNavigate } from 'react-router-dom';

/**
 * Enhanced useNavigate hook with View Transitions API support
 *
 * Drop-in replacement for React Router's useNavigate that adds
 * smooth page transitions using the View Transitions API.
 *
 * Features:
 * - Automatic view transitions on navigation
 * - Fallback to standard navigation for unsupported browsers
 * - Same API as React Router's useNavigate
 * - Maintains navigation history correctly
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const navigate = useNavigate();
 *
 *   const handleClick = () => {
 *     navigate('/dashboard');
 *   };
 *
 *   return <button onClick={handleClick}>Go to Dashboard</button>;
 * }
 * ```
 */
export function useNavigate(): NavigateFunction {
  const routerNavigate = useRouterNavigate();
  const { transition } = useViewTransition();

  const navigate: NavigateFunction = (to, options?: NavigateOptions) => {
    // Handle numeric navigation (go back/forward)
    if (typeof to === 'number') {
      // No view transition for history navigation
      return routerNavigate(to);
    }

    // Use view transition for route navigation
    transition(() => {
      routerNavigate(to, options as NavigateOptions);
    });
  };

  return navigate;
}

/**
 * Hook to get current navigation state with transition info
 *
 * @returns Object with navigation state and helpers
 */
export function useNavigationState() {
  const { isPending } = useViewTransition();

  return {
    /**
     * True if a navigation transition is in progress
     */
    isNavigating: isPending,

    /**
     * CSS class for loading state
     */
    loadingClass: isPending ? 'opacity-70 pointer-events-none' : '',
  };
}
