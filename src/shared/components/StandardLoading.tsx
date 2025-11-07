/**
 * Standardized Loading Component
 * Provides consistent loading states across the application
 */

import type { FC, ReactNode } from 'react';

interface StandardLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSpinner?: boolean;
}

export const StandardLoading: FC<StandardLoadingProps> = ({
  message = 'Loading...',
  size = 'md',
  className = '',
  showSpinner = true,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {showSpinner && (
        <svg
          className={`animate-spin text-gray-400 mr-2 ${sizeClasses[size]}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span className="text-gray-600">{message}</span>
    </div>
  );
};

/**
 * Loading overlay for full-screen or container loading
 */
interface LoadingOverlayProps extends StandardLoadingProps {
  isVisible: boolean;
  children?: ReactNode;
}

export const LoadingOverlay: FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  size = 'lg',
  children,
}) => {
  if (!isVisible) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <StandardLoading message={message} size={size} />
      </div>
    </div>
  );
};

/**
 * Skeleton loader for content placeholders
 */
interface SkeletonLoaderProps {
  lines?: number;
  className?: string;
}

export const ContentSkeleton: FC<SkeletonLoaderProps> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded animate-pulse ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};