/**
 * Reusable Skeleton Loading Components
 * Single source of truth for all skeleton loading states
 */

interface SkeletonProps {
  className?: string;
  width?: string;
}

export function SkeletonLine({ className = '', width = 'w-full' }: SkeletonProps) {
  return (
    <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${width} ${className}`} />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine 
          key={i} 
          width={i === lines - 1 ? 'w-2/3' : i === lines - 2 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
      <SkeletonText lines={3} />
      <div className="mt-4 h-10 bg-gray-200 dark:bg-gray-700 rounded w-24" />
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };
  
  return (
    <div className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse`} />
  );
}

export function SkeletonButton() {
  return (
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-24" />
  );
}
