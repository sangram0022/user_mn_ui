/**
 * LoadingOverlay Component
 *
 * Transparent overlay with loading spinner for form submissions.
 * Does not hide the entire page - maintains context visibility.
 *
 * @author Senior UI/UX Architect
 * @created October 12, 2025
 */

import type React from 'react';

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
      className={`absolute inset-0 z-50 flex items-center justify-center backdrop-blur ${
        transparent ? 'bg-white/70' : 'bg-white/90'
      } ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center">
        {/* Small spinner - 10mm (~38px) */}
        <div className="inline-block h-[38px] w-[38px] animate-spin rounded-full border-[3px] border-blue-500/30 border-t-blue-500" />
        {message && <p className="mt-3 text-sm font-medium text-gray-700">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingOverlay;
