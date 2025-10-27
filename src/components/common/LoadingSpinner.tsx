/**
 * LoadingSpinner Component
 *
 * Simple, performant loading spinner using CSS utility classes.
 * Follows design system conventions with spinner utilities.
 *
 * @author Senior UI/UX Architect
 * @created October 12, 2025
 * @updated October 26, 2025 - Migrated to spinner utilities
 */

import type React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'primary' | 'white' | 'success';
}

/**
 * Loading spinner with size and variant options
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="md" />
 * <LoadingSpinner size="lg" variant="white" />
 * <LoadingSpinner size="sm" variant="success" />
 * ```
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  variant = 'primary',
}) => {
  const sizeClass = size === 'md' ? 'spinner' : `spinner spinner-${size}`;
  const variantClass = variant === 'primary' ? '' : `spinner-${variant}`;

  return (
    <div className={`inline-block ${className}`} role="status" aria-label="Loading">
      <div className={`${sizeClass} ${variantClass}`.trim()} />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
