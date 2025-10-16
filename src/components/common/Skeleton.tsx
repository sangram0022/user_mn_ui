/**
 * Skeleton Loading Components
 *
 * Content-aware skeleton loaders for better perceived performance
 * Provides visual placeholders during data fetching
 */

import React from 'react';

/**
 * UserTableSkeleton - Skeleton for user table rows
 * Shows realistic loading state for user list
 */
export const UserTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 10 }) => {
  return (
    <div className="space-y-2" role="status" aria-label="Loading users">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg animate-pulse"
        >
          {/* Avatar skeleton */}
          <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>

          {/* Badge skeleton */}
          <div className="h-6 w-16 bg-gray-200 rounded-full" />

          {/* Action button skeleton */}
          <div className="h-8 w-20 bg-gray-200 rounded" />
        </div>
      ))}
      <span className="sr-only">Loading user data...</span>
    </div>
  );
};

/**
 * CardSkeleton - Generic card skeleton
 * Useful for dashboard cards, stat cards, etc.
 */
export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 border border-gray-200 rounded-lg animate-pulse" role="status">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
      <span className="sr-only">Loading content...</span>
    </div>
  );
};

/**
 * TableHeaderSkeleton - Skeleton for table headers
 */
export const TableHeaderSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-t-lg animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded flex-1" />
      ))}
    </div>
  );
};

/**
 * FormSkeleton - Skeleton for form fields
 */
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 5 }) => {
  return (
    <div className="space-y-6 animate-pulse" role="status">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded w-full" />
        </div>
      ))}
      <div className="h-10 bg-gray-200 rounded w-32" />
      <span className="sr-only">Loading form...</span>
    </div>
  );
};

/**
 * ProfileSkeleton - Skeleton for profile page
 */
export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" role="status">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 bg-gray-200 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      <span className="sr-only">Loading profile...</span>
    </div>
  );
};

/**
 * Shimmer effect CSS (add to global styles or Tailwind config)
 *
 * @keyframes shimmer {
 *   0% { background-position: -200% 0; }
 *   100% { background-position: 200% 0; }
 * }
 *
 * .skeleton-shimmer {
 *   background: linear-gradient(
 *     90deg,
 *     #f0f0f0 25%,
 *     #e0e0e0 50%,
 *     #f0f0f0 75%
 *   );
 *   background-size: 200% 100%;
 *   animation: shimmer 1.5s infinite;
 * }
 */

export default {
  UserTableSkeleton,
  CardSkeleton,
  TableHeaderSkeleton,
  FormSkeleton,
  ProfileSkeleton,
};
