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
      className={`absolute inset-0 flex items-center justify-center z-50 ${className}`}
      style={{
        backgroundColor: transparent ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center">
        {/* Small spinner - 10mm (~38px) */}
        <div
          className="inline-block rounded-full animate-spin"
          style={{
            width: '38px',
            height: '38px',
            border: '3px solid rgba(59, 130, 246, 0.3)',
            borderTopColor: '#3b82f6',
          }}
        />
        {message && <p className="mt-3 text-sm text-gray-700 font-medium">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingOverlay;
