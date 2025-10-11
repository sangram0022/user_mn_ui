/**
 * Domain Loading Skeletons
 *
 * Optimized loading states for route-based code splitting
 * Provides instant visual feedback while domain chunks load
 *
 * @module shared/ui/skeletons
 */

import { memo } from 'react';

/**
 * Base Skeleton Component
 */
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton = memo<SkeletonProps>(
  ({
    className = '',
    width = '100%',
    height = '20px',
    variant = 'rectangular',
    animation = 'pulse',
  }) => {
    const baseClasses = 'bg-gray-200 dark:bg-gray-700';

    const variantClasses = {
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-md',
    };

    const animationClasses = {
      pulse: 'animate-pulse',
      wave: 'animate-wave',
      none: '',
    };

    return (
      <div
        className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
        style={{ width, height }}
        aria-busy="true"
        aria-live="polite"
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * Generic Domain Loading Skeleton
 *
 * Use as fallback for any domain
 */
export const DomainLoadingSkeleton = memo(() => {
  return (
    <div
      className="min-h-screen bg-white dark:bg-gray-900 p-6"
      role="status"
      aria-label="Loading domain"
    >
      {/* Header */}
      <div className="mb-8">
        <Skeleton height="40px" width="300px" className="mb-2" />
        <Skeleton height="20px" width="500px" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <Skeleton height="200px" className="mb-4" />
            <Skeleton height="24px" width="80%" className="mb-2" />
            <Skeleton height="16px" width="60%" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading content...</span>
    </div>
  );
});

DomainLoadingSkeleton.displayName = 'DomainLoadingSkeleton';

/**
 * Authentication Domain Skeleton
 *
 * Optimized for login/register pages
 */
export const AuthenticationSkeleton = memo(() => {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"
      role="status"
    >
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Skeleton variant="circular" width="80px" height="80px" />
        </div>

        {/* Title */}
        <Skeleton height="32px" width="60%" className="mb-2 mx-auto" />
        <Skeleton height="20px" width="80%" className="mb-8 mx-auto" />

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <Skeleton height="16px" width="100px" className="mb-2" />
            <Skeleton height="44px" width="100%" />
          </div>
          <div>
            <Skeleton height="16px" width="100px" className="mb-2" />
            <Skeleton height="44px" width="100%" />
          </div>
        </div>

        {/* Button */}
        <Skeleton height="48px" width="100%" className="mt-6" />

        {/* Links */}
        <div className="mt-4 flex justify-between">
          <Skeleton height="16px" width="120px" />
          <Skeleton height="16px" width="120px" />
        </div>
      </div>

      <span className="sr-only">Loading authentication...</span>
    </div>
  );
});

AuthenticationSkeleton.displayName = 'AuthenticationSkeleton';

/**
 * User Management Skeleton
 *
 * Optimized for user list/table pages
 */
export const UserManagementSkeleton = memo(() => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6" role="status">
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton height="36px" width="250px" />
        <Skeleton height="40px" width="150px" />
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <Skeleton height="40px" width="300px" />
        <Skeleton height="40px" width="150px" />
        <Skeleton height="40px" width="150px" />
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 flex gap-4">
          <Skeleton height="20px" width="30%" />
          <Skeleton height="20px" width="20%" />
          <Skeleton height="20px" width="15%" />
          <Skeleton height="20px" width="15%" />
          <Skeleton height="20px" width="20%" />
        </div>

        {/* Table Rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-4">
            <Skeleton height="20px" width="30%" />
            <Skeleton height="20px" width="20%" />
            <Skeleton height="20px" width="15%" />
            <Skeleton height="20px" width="15%" />
            <Skeleton height="20px" width="20%" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <Skeleton height="20px" width="150px" />
        <div className="flex gap-2">
          <Skeleton height="36px" width="36px" />
          <Skeleton height="36px" width="36px" />
          <Skeleton height="36px" width="36px" />
          <Skeleton height="36px" width="36px" />
        </div>
      </div>

      <span className="sr-only">Loading user management...</span>
    </div>
  );
});

UserManagementSkeleton.displayName = 'UserManagementSkeleton';

/**
 * Analytics Dashboard Skeleton
 *
 * Optimized for dashboard with charts and metrics
 */
export const AnalyticsDashboardSkeleton = memo(() => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" role="status">
      {/* Header */}
      <div className="mb-6">
        <Skeleton height="32px" width="300px" className="mb-2" />
        <Skeleton height="20px" width="400px" />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <Skeleton height="16px" width="120px" className="mb-2" />
            <Skeleton height="36px" width="150px" className="mb-1" />
            <Skeleton height="14px" width="100px" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <Skeleton height="24px" width="200px" className="mb-4" />
            <Skeleton height="300px" width="100%" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <Skeleton height="24px" width="200px" className="mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton height="20px" width="30%" />
              <Skeleton height="20px" width="20%" />
              <Skeleton height="20px" width="25%" />
              <Skeleton height="20px" width="25%" />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Loading analytics dashboard...</span>
    </div>
  );
});

AnalyticsDashboardSkeleton.displayName = 'AnalyticsDashboardSkeleton';

/**
 * Workflow Engine Skeleton
 *
 * Optimized for workflow builder/kanban views
 */
export const WorkflowEngineSkeleton = memo(() => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" role="status">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton height="32px" width="250px" />
        <div className="flex gap-2">
          <Skeleton height="40px" width="120px" />
          <Skeleton height="40px" width="120px" />
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((col) => (
          <div key={col} className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <Skeleton height="24px" width="120px" className="mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((card) => (
                <div key={card} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                  <Skeleton height="20px" width="90%" className="mb-2" />
                  <Skeleton height="16px" width="70%" className="mb-3" />
                  <div className="flex gap-2">
                    <Skeleton variant="circular" width="24px" height="24px" />
                    <Skeleton variant="circular" width="24px" height="24px" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Loading workflow engine...</span>
    </div>
  );
});

WorkflowEngineSkeleton.displayName = 'WorkflowEngineSkeleton';

/**
 * System Administration Skeleton
 *
 * Optimized for settings/admin pages
 */
export const SystemAdministrationSkeleton = memo(() => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6" role="status">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Skeleton height="36px" width="300px" className="mb-8" />

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="40px" width="120px" />
          ))}
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {[1, 2, 3].map((section) => (
            <div key={section}>
              <Skeleton height="24px" width="200px" className="mb-4" />
              <div className="space-y-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex justify-between items-center">
                    <div className="flex-1">
                      <Skeleton height="20px" width="180px" className="mb-2" />
                      <Skeleton height="16px" width="300px" />
                    </div>
                    <Skeleton height="32px" width="80px" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Loading system administration...</span>
    </div>
  );
});

SystemAdministrationSkeleton.displayName = 'SystemAdministrationSkeleton';

/**
 * Export all skeletons
 */
export default {
  Skeleton,
  DomainLoadingSkeleton,
  AuthenticationSkeleton,
  UserManagementSkeleton,
  AnalyticsDashboardSkeleton,
  WorkflowEngineSkeleton,
  SystemAdministrationSkeleton,
};
