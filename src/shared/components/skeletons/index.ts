/**
 * Skeleton Components - Barrel Export
 * 
 * Centralized export for all skeleton loading components.
 * Use these components as Suspense fallbacks for better UX.
 * 
 * @example
 * ```tsx
 * import { TableSkeleton, CardSkeleton } from '@/shared/components/skeletons';
 * 
 * <Suspense fallback={<TableSkeleton rows={10} />}>
 *   <UserTable />
 * </Suspense>
 * ```
 */

// Advanced skeleton layouts
export {
  TableSkeleton,
  CardSkeleton,
  FormSkeleton,
  ProfileSkeleton,
  ListSkeleton,
  ChartSkeleton,
  DashboardSkeleton,
  PageSkeleton,
  type TableSkeletonProps,
  type CardSkeletonProps,
  type FormSkeletonProps,
  type ListSkeletonProps,
  type BaseSkeletonProps,
} from './Skeletons';

// Basic skeleton primitives
export {
  SkeletonLine,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
} from './SkeletonLoader';

// UI skeleton variants
export { default as Skeleton } from './Skeleton';
export {
  SkeletonText as UISkeletonText,
  SkeletonCard as UISkeletonCard,
  SkeletonAvatar as UISkeletonAvatar,
  SkeletonButton as UISkeletonButton,
  SkeletonTable as UISkeletonTable,
} from './Skeleton';

// Loading helpers
export {
  StandardLoading,
  LoadingOverlay,
  ContentSkeleton,
} from './StandardLoading';

export {
  LoadingSpinner,
  LoadingFallback,
  InlineSpinner,
} from './LoadingSpinner';
