import { useNavigationState } from '@hooks/useNavigate';
import type { FC } from 'react';

/**
 * Loading Bar Component
 *
 * Displays a thin animated loading bar at the top of the viewport
 * during page transitions. Automatically shows/hides based on navigation state.
 *
 * Features:
 * - Automatic visibility during transitions
 * - Smooth CSS animations
 * - Accessible (aria-label for screen readers)
 * - Respects reduced motion preferences
 * - Fixed positioning (doesn't affect layout)
 *
 * @example
 * ```tsx
 * // Add to your root layout/app component
 * function App() {
 *   return (
 *     <>
 *       <LoadingBar />
 *       <Routes>{...}</Routes>
 *     </>
 *   );
 * }
 * ```
 */
export const LoadingBar: FC = () => {
  const { isNavigating } = useNavigationState();

  if (!isNavigating) {
    return null;
  }

  return (
    <div
      role="progressbar"
      aria-label="Page loading"
      aria-busy="true"
      className="view-transition-loading"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background:
          'linear-gradient(90deg, transparent, var(--color-primary, #3b82f6) 50%, transparent)',
        animation: 'loading-bar 1s ease-in-out infinite',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
};

/**
 * Spinner Component for Loading States
 *
 * Alternative to LoadingBar - displays a centered spinner during transitions.
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="md" />
 * ```
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const { isNavigating } = useNavigationState();

  if (!isNavigating) {
    return null;
  }

  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <div role="status" aria-label="Loading" className={`fixed top-4 right-4 z-[9999] ${className}`}>
      <div
        className={`animate-spin rounded-full border-blue-600 border-t-transparent ${sizeClasses[size]}`}
        style={{ borderTopColor: 'transparent' }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingBar;
