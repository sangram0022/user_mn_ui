/**
 * Shared UI Components - Design System
 * @module shared/ui
 *
 * Reusable UI components used across all domains
 * Note: Main components are in @shared/components/ui, these are re-exports for backward compatibility
 */

// Re-export from consolidated location
export { Modal, ModalFooter } from '@shared/components/ui/Modal';
export type { ModalFooterProps, ModalProps, ModalSize } from '@shared/components/ui/Modal';

export { Badge } from '@shared/components/ui/Badge';
export type { BadgeProps, BadgeSize, BadgeVariant } from '@shared/components/ui/Badge';

export { getSeverityBadgeVariant, getStatusBadgeVariant } from '@shared/components/ui/Badge';

export {
  DashboardSkeleton,
  PageSkeleton,
  Skeleton,
  SkeletonCard,
  SkeletonForm,
  SkeletonList,
  SkeletonTable,
  SkeletonText,
  TableSkeleton,
} from '@shared/components/ui/Skeleton';
export type {
  DashboardSkeletonProps,
  PageSkeletonProps,
  SkeletonProps,
  TableSkeletonProps,
} from '@shared/components/ui/Skeleton';

// To be implemented - move truly reusable components here
// export { Button } from './Button';
// export { Input } from './Input';
// export { Loading } from './Loading';
// export { ErrorBoundary } from './ErrorBoundary';
