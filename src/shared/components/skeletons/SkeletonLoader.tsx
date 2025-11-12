/**
 * Reusable Skeleton Loading Components
 * Single source of truth for all skeleton loading states
 * 
 * These are primitive skeleton components used as building blocks.
 * All components include ARIA attributes for accessibility.
 * 
 * @module SkeletonLoader
 */

/**
 * Props for basic skeleton components
 */
interface SkeletonProps {
  /** Additional CSS classes */
  className?: string;
  /** Width class (e.g., 'w-full', 'w-1/2') */
  width?: string;
}

/**
 * Basic skeleton line - primitive building block
 * 
 * @example
 * ```tsx
 * <SkeletonLine width="w-1/2" />
 * <SkeletonLine className="mb-4" />
 * ```
 */
export function SkeletonLine({ className = '', width = 'w-full' }: SkeletonProps) {
  return (
    <div 
      className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${width} ${className}`}
      role="status"
      aria-label="Loading content"
      aria-live="polite"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Multi-line text skeleton with natural paragraph width variation
 * 
 * @example
 * ```tsx
 * <SkeletonText lines={5} />
 * ```
 */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div 
      className="space-y-3"
      role="status"
      aria-label={`Loading ${lines} lines of text`}
      aria-live="polite"
    >
      <span className="sr-only">Loading text content...</span>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${
            i === lines - 1 ? 'w-2/3' : i === lines - 2 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Basic card skeleton with title, text, and button placeholder
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
      className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse"
      role="status"
      aria-label="Loading card content"
      aria-live="polite"
    >
      <span className="sr-only">Loading card...</span>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
      <div className="mt-4 h-10 bg-gray-200 dark:bg-gray-700 rounded w-24" />
    </div>
  );
}

/**
 * Props for avatar skeleton
 */
interface SkeletonAvatarProps {
  /** Avatar size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Circular avatar skeleton
 * 
 * @example
 * ```tsx
 * <SkeletonAvatar size="lg" />
 * <SkeletonAvatar size="sm" />
 * ```
 */
export function SkeletonAvatar({ size = 'md' }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };
  
  return (
    <div 
      className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse`}
      role="status"
      aria-label={`Loading ${size} avatar`}
      aria-live="polite"
    >
      <span className="sr-only">Loading avatar...</span>
    </div>
  );
}

/**
 * Button placeholder skeleton
 * 
 * @example
 * ```tsx
 * <div className="flex gap-2">
 *   <SkeletonButton />
 *   <SkeletonButton />
 * </div>
 * ```
 */
export function SkeletonButton() {
  return (
    <div 
      className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-24"
      role="status"
      aria-label="Loading button"
      aria-live="polite"
    >
      <span className="sr-only">Loading button...</span>
    </div>
  );
}
