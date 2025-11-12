/**
 * Skeleton Loading Components
 * Improves perceived performance with loading placeholders
 * 
 * @module Skeleton
 */

/**
 * Props for the base Skeleton component
 */
interface SkeletonProps {
  /** Additional CSS classes */
  className?: string;
  /** Visual variant */
  variant?: 'text' | 'circular' | 'rectangular';
  /** Width (string or number in px) */
  width?: string | number;
  /** Height (string or number in px) */
  height?: string | number;
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Base skeleton component with customizable shape, size, and animation
 * 
 * @example
 * ```tsx
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton variant="rectangular" width="100%" height={200} animation="wave" />
 * <Skeleton variant="text" width="80%" />
 * ```
 */
export default function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      role="status"
      aria-label={`Loading ${variant} content`}
      aria-live="polite"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Pre-built skeleton components for common UI patterns
 * All include ARIA attributes for accessibility
 */

/**
 * Multi-line text skeleton with natural width variation
 * 
 * @example
 * ```tsx
 * <SkeletonText lines={5} />
 * ```
 */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div 
      className="space-y-2"
      role="status"
      aria-label={`Loading ${lines} lines of text`}
      aria-live="polite"
    >
      <span className="sr-only">Loading text content...</span>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`bg-gray-200 dark:bg-gray-700 rounded h-4 animate-pulse`}
          style={{ width: i === lines - 1 ? '80%' : '100%' }}
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton with image, title, text, and buttons
 * 
 * @example
 * ```tsx
 * <div className="grid grid-cols-3 gap-4">
 *   {[1,2,3].map(i => <SkeletonCard key={i} />)}
 * </div>
 * ```
 */
export function SkeletonCard() {
  return (
    <div 
      className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4"
      role="status"
      aria-label="Loading card content"
      aria-live="polite"
    >
      <span className="sr-only">Loading card...</span>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-[200px] animate-pulse" />
      <div className="bg-gray-200 dark:bg-gray-700 rounded h-6 animate-pulse" style={{ width: '60%' }} />
      <div className="space-y-2">
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 animate-pulse" />
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 animate-pulse" style={{ width: '80%' }} />
      </div>
      <div className="flex gap-2">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-8 w-20 animate-pulse" />
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-8 w-20 animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Circular avatar skeleton
 * 
 * @example
 * ```tsx
 * <SkeletonAvatar size={48} />
 * ```
 */
export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      className="bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading avatar"
      aria-live="polite"
    >
      <span className="sr-only">Loading avatar...</span>
    </div>
  );
}

/**
 * Button skeleton placeholder
 * 
 * @example
 * ```tsx
 * <SkeletonButton width={120} />
 * ```
 */
export function SkeletonButton({ width = 100 }: { width?: number }) {
  return (
    <div
      className="bg-gray-200 dark:bg-gray-700 rounded-lg h-10 animate-pulse"
      style={{ width }}
      role="status"
      aria-label="Loading button"
      aria-live="polite"
    >
      <span className="sr-only">Loading button...</span>
    </div>
  );
}

/**
 * Props for table skeleton
 */
interface SkeletonTableProps {
  /** Number of rows to display */
  rows?: number;
  /** Number of columns to display */
  cols?: number;
}

/**
 * Table skeleton with header and rows
 * 
 * @example
 * ```tsx
 * <SkeletonTable rows={10} cols={6} />
 * ```
 */
export function SkeletonTable({ rows = 5, cols = 4 }: SkeletonTableProps) {
  return (
    <div 
      className="space-y-2"
      role="status"
      aria-label={`Loading table with ${rows} rows and ${cols} columns`}
      aria-live="polite"
    >
      <span className="sr-only">Loading table data...</span>
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={`header-${i}`}
            className="bg-gray-200 dark:bg-gray-700 rounded h-5 flex-1 animate-pulse"
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="bg-gray-200 dark:bg-gray-700 rounded h-4 flex-1 animate-pulse"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
