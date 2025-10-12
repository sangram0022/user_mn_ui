/**
 * LoadingSpinner Component
 *
 * Simple, performant loading spinner using Tailwind CSS animations.
 * Converted from styled-components for better performance.
 *
 * @author Senior UI/UX Architect
 * @created October 12, 2025
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

/**
 * Loading spinner with size variants
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="md" />
 * <LoadingSpinner size="lg" color="text-blue-600" />
 * ```
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  color = 'border-t-blue-600',
}) => {
  return (
    <div className={`inline-block ${className}`} role="status" aria-label="Loading">
      <div className={`${sizeClasses[size]} border-gray-200 ${color} rounded-full animate-spin`} />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
