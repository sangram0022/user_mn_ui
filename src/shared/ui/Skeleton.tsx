/**
 * Skeleton Loading Components
 *
 * Provides skeleton loaders for better perceived performance.
 * Shows content placeholders while data is loading.
 *
 * @author Senior React Developer
 * @created October 12, 2025
 */

import type { FC } from 'react';

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton component for shimmer effect
 */
export const Skeleton: FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} aria-hidden="true" />
);

/**
 * Page skeleton with heading and action buttons
 */
interface PageSkeletonProps {
  heading?: string;
  actionCount?: number;
  descriptionLines?: number;
}

export const PageSkeleton: FC<PageSkeletonProps> = ({
  heading = 'Loading',
  actionCount = 0,
  descriptionLines = 0,
}) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="status" aria-label={heading}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-8 w-64" />
          {descriptionLines > 0 && (
            <div className="space-y-2">
              {Array.from({ length: descriptionLines }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-96" />
              ))}
            </div>
          )}
        </div>
        {actionCount > 0 && (
          <div className="flex space-x-3">
            {Array.from({ length: actionCount }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Dashboard skeleton with metrics and charts
 */
interface DashboardSkeletonProps {
  heading?: string;
  actionCount?: number;
  descriptionLines?: number;
}

export const DashboardSkeleton: FC<DashboardSkeletonProps> = ({
  heading = 'Loading dashboard',
  actionCount = 3,
  descriptionLines = 2,
}) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="status" aria-label={heading}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          {descriptionLines > 0 && (
            <div className="space-y-2">
              {Array.from({ length: descriptionLines }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-96" />
              ))}
            </div>
          )}
        </div>
        {actionCount > 0 && (
          <div className="flex space-x-3">
            {Array.from({ length: actionCount }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white shadow rounded-lg p-6">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white shadow rounded-lg p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Table skeleton for data tables
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: FC<TableSkeletonProps> = ({ rows = 5, columns = 4 }) => (
  <div
    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    role="status"
    aria-label="Loading table"
  >
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-5 flex-1" />
          ))}
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Card skeleton for card layouts
 */
interface CardSkeletonProps {
  count?: number;
}

export const CardSkeleton: FC<CardSkeletonProps> = ({ count = 3 }) => (
  <div
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    role="status"
    aria-label="Loading cards"
  >
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white shadow rounded-lg p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <div className="mt-6 flex space-x-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Form skeleton for form layouts
 */
interface FormSkeletonProps {
  fields?: number;
}

export const FormSkeleton: FC<FormSkeletonProps> = ({ fields = 4 }) => (
  <div className="bg-white shadow rounded-lg p-6" role="status" aria-label="Loading form">
    <div className="space-y-6">
      <Skeleton className="h-8 w-48 mb-6" />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex space-x-3 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  </div>
);
