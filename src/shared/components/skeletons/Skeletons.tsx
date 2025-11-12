/**
 * Loading Skeleton Components
 * Provide visual feedback while content is loading
 * Used with React Suspense boundaries
 */

import React from 'react';

/**
 * TypeScript interfaces for skeleton components
 */
interface BaseSkeletonProps {
  className?: string;
  'aria-label'?: string;
}

interface SkeletonProps extends BaseSkeletonProps {
  style?: React.CSSProperties;
}

interface TableSkeletonProps extends BaseSkeletonProps {
  /** Number of skeleton rows to display (default: 5) */
  rows?: number;
  /** Number of skeleton columns to display (default: 4) */
  columns?: number;
}

interface CardSkeletonProps extends BaseSkeletonProps {
  /** Number of skeleton cards to display (default: 3) */
  count?: number;
}

interface FormSkeletonProps extends BaseSkeletonProps {
  /** Number of form fields to display (default: 4) */
  fields?: number;
}

interface ListSkeletonProps extends BaseSkeletonProps {
  /** Number of list items to display (default: 5) */
  items?: number;
}

/**
 * Base skeleton with shimmer animation
 * Fixed: Uses proper gradient syntax and GPU-accelerated animation
 */
const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  style,
}) => (
  <div
    className={`relative overflow-hidden rounded bg-gray-200 dark:bg-gray-700 ${className}`}
    style={style}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-gray-500/40 to-transparent animate-shimmer" />
  </div>
);

/**
 * Table skeleton for data tables
 * Displays a loading placeholder for data tables with configurable rows and columns
 * 
 * @example
 * ```tsx
 * <Suspense fallback={<TableSkeleton rows={10} columns={6} />}>
 *   <UserTable />
 * </Suspense>
 * ```
 */
export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  className = '',
  'aria-label': ariaLabel = 'Loading table data',
}) => (
  <div 
    className={`w-full space-y-4 ${className}`}
    role="status"
    aria-label={ariaLabel}
    aria-live="polite"
  >
    {/* Header */}
    <div className="flex gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} className="h-10 flex-1" aria-label="Loading column header" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex gap-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-16 flex-1" aria-label="Loading cell data" />
        ))}
      </div>
    ))}
    <span className="sr-only">{ariaLabel}</span>
  </div>
);

/**
 * Card skeleton for card layouts
 * Displays a grid of loading cards
 * 
 * @example
 * ```tsx
 * <Suspense fallback={<CardSkeleton count={6} />}>
 *   <ProductGrid />
 * </Suspense>
 * ```
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  count = 3, 
  className = '',
  'aria-label': ariaLabel = 'Loading cards',
}) => (
  <div 
    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    role="status"
    aria-label={ariaLabel}
    aria-live="polite"
  >
    {Array.from({ length: count }).map((_, i) => (
      <div key={`card-${i}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4 bg-white dark:bg-gray-800">
        <Skeleton className="h-8 w-3/4" aria-label="Loading card title" />
        <Skeleton className="h-4 w-full" aria-label="Loading card content" />
        <Skeleton className="h-4 w-5/6" aria-label="Loading card content" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" aria-label="Loading button" />
          <Skeleton className="h-8 w-20" aria-label="Loading button" />
        </div>
      </div>
    ))}
    <span className="sr-only">{ariaLabel}</span>
  </div>
);

/**
 * Form skeleton for forms
 * Displays loading placeholder for form fields
 * 
 * @example
 * ```tsx
 * {isLoading ? (
 *   <FormSkeleton fields={6} />
 * ) : (
 *   <UserForm />
 * )}
 * ```
 */
export const FormSkeleton: React.FC<FormSkeletonProps> = ({ 
  fields = 4,
  className = '',
  'aria-label': ariaLabel = 'Loading form',
}) => (
  <div 
    className={`space-y-6 max-w-2xl ${className}`}
    role="status"
    aria-label={ariaLabel}
    aria-live="polite"
  >
    {Array.from({ length: fields }).map((_, i) => (
      <div key={`field-${i}`} className="space-y-2">
        <Skeleton className="h-4 w-32" aria-label="Loading field label" />
        <Skeleton className="h-10 w-full" aria-label="Loading field input" />
      </div>
    ))}
    <div className="flex gap-4">
      <Skeleton className="h-10 w-32" aria-label="Loading submit button" />
      <Skeleton className="h-10 w-32" aria-label="Loading cancel button" />
    </div>
    <span className="sr-only">{ariaLabel}</span>
  </div>
);

/**
 * Profile skeleton for profile pages
 * Displays loading placeholder for user profile pages
 * 
 * @example
 * ```tsx
 * {profileQuery.isLoading ? (
 *   <ProfileSkeleton />
 * ) : (
 *   <ProfileView data={profileQuery.data} />
 * )}
 * ```
 */
export const ProfileSkeleton: React.FC<BaseSkeletonProps> = ({ 
  className = '',
  'aria-label': ariaLabel = 'Loading profile',
}) => (
  <div 
    className={`max-w-4xl mx-auto p-6 space-y-8 ${className}`}
    role="status"
    aria-label={ariaLabel}
    aria-live="polite"
  >
    {/* Header */}
    <div className="flex items-center gap-6">
      <Skeleton className="h-24 w-24 rounded-full" aria-label="Loading profile avatar" />
      <div className="space-y-3 flex-1">
        <Skeleton className="h-8 w-64" aria-label="Loading profile name" />
        <Skeleton className="h-4 w-48" aria-label="Loading profile bio" />
      </div>
    </div>
    {/* Stats */}
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={`stat-${i}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2 bg-white dark:bg-gray-800">
          <Skeleton className="h-4 w-20" aria-label="Loading stat label" />
          <Skeleton className="h-8 w-16" aria-label="Loading stat value" />
        </div>
      ))}
    </div>
    {/* Content */}
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" aria-label="Loading section title" />
      <Skeleton className="h-4 w-full" aria-label="Loading content" />
      <Skeleton className="h-4 w-5/6" aria-label="Loading content" />
      <Skeleton className="h-4 w-4/6" aria-label="Loading content" />
    </div>
    <span className="sr-only">{ariaLabel}</span>
  </div>
);

/**
 * List skeleton for list views
 * Displays loading placeholder for list items
 * 
 * @example
 * ```tsx
 * <Suspense fallback={<ListSkeleton items={10} />}>
 *   <NotificationList />
 * </Suspense>
 * ```
 */
export const ListSkeleton: React.FC<ListSkeletonProps> = ({ 
  items = 5,
  className = '',
  'aria-label': ariaLabel = 'Loading list',
}) => (
  <div 
    className={`space-y-3 ${className}`}
    role="status"
    aria-label={ariaLabel}
    aria-live="polite"
  >
    {Array.from({ length: items }).map((_, i) => (
      <div
        key={`list-item-${i}`}
        className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
      >
        <Skeleton className="h-12 w-12 rounded-full shrink-0" aria-label="Loading avatar" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" aria-label="Loading title" />
          <Skeleton className="h-4 w-1/2" aria-label="Loading description" />
        </div>
        <Skeleton className="h-8 w-20 shrink-0" aria-label="Loading action button" />
      </div>
    ))}
    <span className="sr-only">{ariaLabel}</span>
  </div>
);

/**
 * Chart skeleton for analytics/charts
 * Displays loading placeholder for charts and graphs
 * 
 * @example
 * ```tsx
 * <Suspense fallback={<ChartSkeleton />}>
 *   <AnalyticsChart />
 * </Suspense>
 * ```
 */
export const ChartSkeleton: React.FC<BaseSkeletonProps> = ({ 
  className = '',
  'aria-label': ariaLabel = 'Loading chart',
}) => (
  <div 
    className={`w-full h-80 space-y-4 ${className}`}
    role="status"
    aria-label={ariaLabel}
    aria-live="polite"
  >
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-40" aria-label="Loading chart title" />
      <Skeleton className="h-8 w-32" aria-label="Loading chart controls" />
    </div>
    <div className="relative h-64">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between w-12">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={`y-${i}`} className="h-4 w-8" aria-label="Loading y-axis label" />
        ))}
      </div>
      {/* Bars */}
      <div className="ml-16 h-full flex items-end gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={`bar-${i}`}
            className="flex-1"
            style={{ height: `${Math.random() * 60 + 40}%` }}
            aria-label="Loading chart bar"
          />
        ))}
      </div>
    </div>
    {/* X-axis labels */}
    <div className="ml-16 flex gap-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={`x-${i}`} className="h-4 flex-1" aria-label="Loading x-axis label" />
      ))}
    </div>
    <span className="sr-only">{ariaLabel}</span>
  </div>
);

/**
 * Dashboard skeleton
 * Displays loading placeholder for dashboard pages
 * 
 * @example
 * ```tsx
 * {isLoading ? (
 *   <DashboardSkeleton />
 * ) : (
 *   <Dashboard metrics={data} />
 * )}
 * ```
 */
export const DashboardSkeleton: React.FC<BaseSkeletonProps> = ({ 
  className = '',
  'aria-label': ariaLabel = 'Loading dashboard',
}) => (
  <div 
    className={`space-y-8 p-6 ${className}`}
    role="status"
    aria-label={ariaLabel}
    aria-live="polite"
  >
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-10 w-64" aria-label="Loading dashboard title" />
      <Skeleton className="h-4 w-96" aria-label="Loading dashboard description" />
    </div>
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={`stat-card-${i}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-3 bg-white dark:bg-gray-800">
          <Skeleton className="h-4 w-20" aria-label="Loading stat label" />
          <Skeleton className="h-8 w-24" aria-label="Loading stat value" />
          <Skeleton className="h-3 w-16" aria-label="Loading stat change" />
        </div>
      ))}
    </div>
    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
        <ChartSkeleton aria-label="Loading first chart" />
      </div>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
        <ChartSkeleton aria-label="Loading second chart" />
      </div>
    </div>
    <span className="sr-only">{ariaLabel}</span>
  </div>
);

/**
 * Page skeleton - generic page loading
 * Displays loading placeholder for full page content
 * 
 * @example
 * ```tsx
 * <Suspense fallback={<PageSkeleton />}>
 *   <SettingsPage />
 * </Suspense>
 * ```
 */
export const PageSkeleton: React.FC<BaseSkeletonProps> = ({ 
  className = '',
  'aria-label': ariaLabel = 'Loading page',
}) => (
  <div 
    className={`min-h-screen p-6 space-y-6 bg-gray-50 dark:bg-gray-900 ${className}`}
    role="status"
    aria-label={ariaLabel}
    aria-live="polite"
  >
    <Skeleton className="h-12 w-96" aria-label="Loading page title" />
    <Skeleton className="h-px w-full" aria-label="Loading divider" />
    <div className="space-y-4">
      <Skeleton className="h-6 w-full" aria-label="Loading content" />
      <Skeleton className="h-6 w-5/6" aria-label="Loading content" />
      <Skeleton className="h-6 w-4/6" aria-label="Loading content" />
    </div>
    <span className="sr-only">{ariaLabel}</span>
  </div>
);

// Export types for consumers
export type {
  BaseSkeletonProps,
  SkeletonProps,
  TableSkeletonProps,
  CardSkeletonProps,
  FormSkeletonProps,
  ListSkeletonProps,
};

export default Skeleton;
