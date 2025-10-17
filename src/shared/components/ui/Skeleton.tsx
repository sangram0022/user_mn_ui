/**
 * Skeleton Component
 *
 * A versatile skeleton loader for showing loading states with smooth animations.
 * Follows React 19 best practices and design system principles.
 *
 * @example
 * // Basic usage
 * <Skeleton />
 *
 * // Custom width and height
 * <Skeleton width="200px" height="24px" />
 *
 * // Circular avatar
 * <Skeleton variant="circular" width="40px" height="40px" />
 *
 * // Multiple lines
 * <SkeletonText lines={3} />
 */

import { type CSSProperties } from 'react';

export interface SkeletonProps {
  /**
   * Variant of the skeleton
   * - rectangular: Default rectangle shape
   * - circular: Circle shape (for avatars, icons)
   * - text: Text line with natural width
   * - rounded: Rectangle with rounded corners
   */
  variant?: 'rectangular' | 'circular' | 'text' | 'rounded';

  /**
   * Width of the skeleton (CSS value)
   */
  width?: string | number;

  /**
   * Height of the skeleton (CSS value)
   */
  height?: string | number;

  /**
   * Animation style
   * - pulse: Pulsing opacity animation
   * - wave: Shimmer/wave animation
   * - none: No animation
   */
  animation?: 'pulse' | 'wave' | 'none';

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Custom inline styles
   */
  style?: CSSProperties;

  /**
   * Test ID for testing
   */
  testId?: string;
}

/**
 * Base Skeleton component
 */
export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  className = '',
  style,
  testId = 'skeleton',
}: SkeletonProps) {
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
    none: '',
  };

  const defaultHeight = {
    rectangular: '1rem',
    circular: '2.5rem',
    text: '1rem',
    rounded: '1rem',
  };

  return (
    <div
      className={`
        skeleton
        ${variantClasses[variant]} 
        ${animationClasses[animation]}
        ${className}
      `.trim()}
      style={
        {
          '--skeleton-width': width ?? '100%',
          '--skeleton-height': height ?? defaultHeight[variant],
          width: 'var(--skeleton-width)',
          height: 'var(--skeleton-height)',
          ...style,
        } as React.CSSProperties
      }
      data-testid={testId}
      data-variant={variant}
      data-animation={animation}
      role="status"
      aria-label="Loading..."
      aria-live="polite"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Skeleton for text content with multiple lines
 */
export interface SkeletonTextProps {
  /**
   * Number of lines to display
   */
  lines?: number;

  /**
   * Width of last line (percentage)
   */
  lastLineWidth?: string;

  /**
   * Spacing between lines
   */
  spacing?: 'tight' | 'normal' | 'relaxed';

  /**
   * Animation style
   */
  animation?: 'pulse' | 'wave' | 'none';

  /**
   * Custom class name
   */
  className?: string;
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = '60%',
  spacing = 'normal',
  animation = 'pulse',
  className = '',
}: SkeletonTextProps) {
  const spacingClasses = {
    tight: 'space-y-2',
    normal: 'space-y-3',
    relaxed: 'space-y-4',
  };

  return (
    <div className={`${spacingClasses[spacing]} ${className}`} data-testid="skeleton-text">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? lastLineWidth : '100%'}
          animation={animation}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for card/panel layouts
 */
export interface SkeletonCardProps {
  /**
   * Show avatar/image placeholder
   */
  showAvatar?: boolean;

  /**
   * Avatar variant
   */
  avatarVariant?: 'circular' | 'rectangular';

  /**
   * Number of text lines
   */
  lines?: number;

  /**
   * Show action buttons
   */
  showActions?: boolean;

  /**
   * Animation style
   */
  animation?: 'pulse' | 'wave' | 'none';

  /**
   * Custom class name
   */
  className?: string;
}

export function SkeletonCard({
  showAvatar = true,
  avatarVariant = 'circular',
  lines = 3,
  showActions = false,
  animation = 'pulse',
  className = '',
}: SkeletonCardProps) {
  return (
    <div
      className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}
      data-testid="skeleton-card"
    >
      {showAvatar && (
        <div className="flex items-center space-x-4 mb-4">
          <Skeleton variant={avatarVariant} width="48px" height="48px" animation={animation} />
          <div className="flex-1">
            <Skeleton variant="text" width="120px" animation={animation} />
            <Skeleton variant="text" width="80px" height="12px" animation={animation} />
          </div>
        </div>
      )}

      <SkeletonText lines={lines} animation={animation} />

      {showActions && (
        <div className="flex space-x-2 mt-4">
          <Skeleton variant="rounded" width="80px" height="36px" animation={animation} />
          <Skeleton variant="rounded" width="80px" height="36px" animation={animation} />
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton for table rows
 */
export interface SkeletonTableProps {
  /**
   * Number of columns
   */
  columns?: number;

  /**
   * Number of rows
   */
  rows?: number;

  /**
   * Show header
   */
  showHeader?: boolean;

  /**
   * Animation style
   */
  animation?: 'pulse' | 'wave' | 'none';

  /**
   * Custom class name
   */
  className?: string;
}

export function SkeletonTable({
  columns = 4,
  rows = 5,
  showHeader = true,
  animation = 'pulse',
  className = '',
}: SkeletonTableProps) {
  return (
    <div className={`space-y-2 ${className}`} data-testid="skeleton-table">
      {showHeader && (
        <div
          className="skeleton-grid"
          data-columns={columns}
          style={{ '--columns': columns } as React.CSSProperties}
        >
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={`header-${index}`} variant="text" height="20px" animation={animation} />
          ))}
        </div>
      )}

      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="skeleton-grid"
          data-columns={columns}
          style={{ '--columns': columns } as React.CSSProperties}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" animation={animation} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for list items
 */
export interface SkeletonListProps {
  /**
   * Number of items
   */
  items?: number;

  /**
   * Show avatar
   */
  showAvatar?: boolean;

  /**
   * Number of text lines per item
   */
  lines?: number;

  /**
   * Animation style
   */
  animation?: 'pulse' | 'wave' | 'none';

  /**
   * Custom class name
   */
  className?: string;
}

export function SkeletonList({
  items = 5,
  showAvatar = true,
  lines = 2,
  animation = 'pulse',
  className = '',
}: SkeletonListProps) {
  return (
    <div className={`space-y-4 ${className}`} data-testid="skeleton-list">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-start space-x-4">
          {showAvatar && (
            <Skeleton variant="circular" width="40px" height="40px" animation={animation} />
          )}
          <div className="flex-1 space-y-2">
            <SkeletonText lines={lines} animation={animation} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for form fields
 */
export interface SkeletonFormProps {
  /**
   * Number of fields
   */
  fields?: number;

  /**
   * Show submit button
   */
  showButton?: boolean;

  /**
   * Animation style
   */
  animation?: 'pulse' | 'wave' | 'none';

  /**
   * Custom class name
   */
  className?: string;
}

export function SkeletonForm({
  fields = 4,
  showButton = true,
  animation = 'pulse',
  className = '',
}: SkeletonFormProps) {
  return (
    <div className={`space-y-4 ${className}`} data-testid="skeleton-form">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" width="100px" height="16px" animation={animation} />
          <Skeleton variant="rounded" height="40px" animation={animation} />
        </div>
      ))}

      {showButton && (
        <Skeleton
          variant="rounded"
          width="120px"
          height="40px"
          animation={animation}
          className="mt-6"
        />
      )}
    </div>
  );
}

/**
 * PageSkeleton - Full page loading skeleton with header and content
 */
export interface PageSkeletonProps {
  heading?: string;
  actionCount?: number;
  descriptionLines?: number;
}

export function PageSkeleton({
  heading = 'Loading',
  actionCount = 0,
  descriptionLines = 0,
}: PageSkeletonProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="status" aria-label={heading}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <Skeleton width="256px" height="32px" />
            {descriptionLines > 0 && (
              <div className="space-y-2">
                {Array.from({ length: descriptionLines }).map((_, i) => (
                  <Skeleton key={i} width="384px" height="16px" />
                ))}
              </div>
            )}
          </div>
          {actionCount > 0 && (
            <div className="flex space-x-3">
              {Array.from({ length: actionCount }).map((_, i) => (
                <Skeleton key={i} width="96px" height="40px" />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="space-y-4">
            <Skeleton height="16px" />
            <Skeleton width="83%" height="16px" />
            <Skeleton width="66%" height="16px" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * DashboardSkeleton - Dashboard loading skeleton with metrics and charts
 */
export interface DashboardSkeletonProps {
  heading?: string;
  actionCount?: number;
  descriptionLines?: number;
}

export function DashboardSkeleton({
  heading = 'Loading dashboard',
  actionCount = 3,
  descriptionLines = 2,
}: DashboardSkeletonProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="status" aria-label={heading}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <Skeleton width="256px" height="32px" />
            {descriptionLines > 0 && (
              <div className="space-y-2">
                {Array.from({ length: descriptionLines }).map((_, i) => (
                  <Skeleton key={i} width="384px" height="16px" />
                ))}
              </div>
            )}
          </div>
          {actionCount > 0 && (
            <div className="flex space-x-3">
              {Array.from({ length: actionCount }).map((_, i) => (
                <Skeleton key={i} width="96px" height="40px" />
              ))}
            </div>
          )}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <Skeleton width="96px" height="16px" className="mb-4" />
              <Skeleton width="128px" height="32px" className="mb-2" />
              <Skeleton width="80px" height="12px" />
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <Skeleton width="192px" height="24px" className="mb-4" />
              <Skeleton height="256px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * TableSkeleton - Table loading skeleton
 */
export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      role="status"
      aria-label="Loading table"
    >
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} height="20px" className="flex-1" />
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-6 py-4">
              <div className="flex space-x-4">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton key={colIndex} height="16px" className="flex-1" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Export all skeleton components
export default Skeleton;
