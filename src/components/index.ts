/**
 * Components Barrel Export
 * 
 * This file provides a centralized export point for all UI components.
 * Benefits:
 * - Cleaner imports: import { Button, Card, Badge } from '../components'
 * - Better tree-shaking with modern bundlers
 * - Single source of truth for component exports
 */

export { default as Badge } from './Badge';
export { default as Button } from '../shared/components/ui/Button';
export { default as Card } from './Card';
export { default as Input } from './Input';
export { default as Layout } from './Layout';

// Loading and Skeleton components - Single source of truth
export { 
  LoadingSpinner, 
  LoadingFallback, 
  InlineSpinner,
  SkeletonLine, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonAvatar, 
  SkeletonButton,
  Skeleton,
  TableSkeleton,
  CardSkeleton,
  FormSkeleton,
  ProfileSkeleton,
  ListSkeleton,
  ChartSkeleton,
  DashboardSkeleton,
  PageSkeleton,
  StandardLoading,
  LoadingOverlay,
  ContentSkeleton,
} from '../shared/components/skeletons';

// Accessibility components (Week 4 - WCAG 2.1 AA)
export { SkipLink, Announcement } from '../shared/components/accessibility';

// Error display components
export { default as ErrorAlert } from '../shared/components/ui/ErrorAlert';
