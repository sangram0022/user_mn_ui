/**
 * SuspenseBoundary Component
 *
 * Wrapper around React.Suspense with better loading UX.
 * Provides customizable loading states and error boundaries.
 *
 * @author Senior React Developer
 * @created October 12, 2025
 */

import type { FC, ReactNode } from 'react';
import { Suspense } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface SuspenseBoundaryProps {
  children: ReactNode;
  loadingText?: string;
  fallback?: ReactNode;
}

/**
 * Suspense boundary with loading indicator
 *
 * @example
 * ```tsx
 * <SuspenseBoundary loadingText="Loading page...">
 *   <LazyComponent />
 * </SuspenseBoundary>
 * ```
 */
export const SuspenseBoundary: FC<SuspenseBoundaryProps> = ({
  children,
  loadingText = 'Loading...',
  fallback,
}) => {
  const defaultFallback = (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="lg" />
      {loadingText && (
        <p className="text-gray-600 text-sm font-medium animate-pulse">{loadingText}</p>
      )}
    </div>
  );

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>;
};

export default SuspenseBoundary;
