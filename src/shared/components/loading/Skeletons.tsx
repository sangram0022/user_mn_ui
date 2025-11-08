/**
 * Loading Skeleton Components
 * Provide visual feedback while content is loading
 * Used with React Suspense boundaries
 */

import React from 'react';

/**
 * Base skeleton with shimmer animation
 */
const Skeleton: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ 
  className = '', 
  style 
}) => (
  <div
    className={`animate-pulse bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 bg-size-[200%_100%] rounded ${className}`}
    style={{
      animation: 'shimmer 1.5s infinite',
      ...style,
    }}
  />
);

/**
 * Table skeleton for data tables
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className="w-full space-y-4">
    {/* Header */}
    <div className="flex gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} className="h-10 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex gap-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-16 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Card skeleton for card layouts
 */
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={`card-${i}`} className="border border-gray-200 rounded-lg p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Form skeleton for forms
 */
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <div className="space-y-6 max-w-2xl">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={`field-${i}`} className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex gap-4">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

/**
 * Profile skeleton for profile pages
 */
export const ProfileSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto p-6 space-y-8">
    {/* Header */}
    <div className="flex items-center gap-6">
      <Skeleton className="h-24 w-24 rounded-full" />
      <div className="space-y-3 flex-1">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
    {/* Stats */}
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={`stat-${i}`} className="border border-gray-200 rounded-lg p-4 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
    {/* Content */}
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </div>
);

/**
 * List skeleton for list views
 */
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div
        key={`list-item-${i}`}
        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
      >
        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-20 shrink-0" />
      </div>
    ))}
  </div>
);

/**
 * Chart skeleton for analytics/charts
 */
export const ChartSkeleton: React.FC = () => (
  <div className="w-full h-80 space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-8 w-32" />
    </div>
    <div className="relative h-64">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between w-12">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={`y-${i}`} className="h-4 w-8" />
        ))}
      </div>
      {/* Bars */}
      <div className="ml-16 h-full flex items-end gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={`bar-${i}`}
            className="flex-1"
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
    </div>
    {/* X-axis labels */}
    <div className="ml-16 flex gap-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={`x-${i}`} className="h-4 flex-1" />
      ))}
    </div>
  </div>
);

/**
 * Dashboard skeleton
 */
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8 p-6">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={`stat-card-${i}`} className="border border-gray-200 rounded-lg p-6 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="border border-gray-200 rounded-lg p-6">
        <ChartSkeleton />
      </div>
      <div className="border border-gray-200 rounded-lg p-6">
        <ChartSkeleton />
      </div>
    </div>
  </div>
);

/**
 * Page skeleton - generic page loading
 */
export const PageSkeleton: React.FC = () => (
  <div className="min-h-screen p-6 space-y-6">
    <Skeleton className="h-12 w-96" />
    <Skeleton className="h-px w-full" />
    <div className="space-y-4">
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-5/6" />
      <Skeleton className="h-6 w-4/6" />
    </div>
  </div>
);

// Add shimmer animation to global styles or use inline
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;
  document.head.appendChild(style);
}

export default Skeleton;
