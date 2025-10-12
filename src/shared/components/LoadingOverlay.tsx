/**
 * LoadingOverlay Component
 *
 * Transparent overlay with loading spinner for form submissions.
 * Does not hide the entire page - maintains context visibility.
 *
 * @author Senior UI/UX Architect
 * @created October 12, 2025
 */

import React from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  transparent?: boolean;
  className?: string;
}

/**
 * Loading overlay that doesn't hide form content
 *
 * Features:
 * - Transparent background (user can see form beneath)
 * - Prevents interaction during loading
 * - Customizable message
 * - Smooth transitions
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <form>...</form>
 *   <LoadingOverlay isLoading={isSubmitting} message="Signing in..." />
 * </div>
 * ```
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  transparent = true,
  className = '',
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center z-50 ${
        transparent ? 'bg-white/70' : 'bg-white/90'
      } backdrop-blur-sm transition-opacity duration-200 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center">
        <div className="inline-block h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
