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

// Loading components - Single source of truth
export { 
  LoadingSpinner, 
  LoadingFallback, 
  InlineSpinner 
} from '../shared/components/LoadingSpinner';

export { 
  SkeletonLine, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonAvatar, 
  SkeletonButton 
} from '../shared/components/SkeletonLoader';

// New Skeleton components (Week 4)
export { default as Skeleton, SkeletonTable } from '../shared/components/ui/Skeleton';

// Accessibility components (Week 4 - WCAG 2.1 AA)
export { SkipLink, Announcement } from '../shared/components/accessibility';

// Error display components
export { default as ErrorAlert } from '../shared/components/ui/ErrorAlert';
