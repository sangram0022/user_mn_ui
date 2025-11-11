# Skeleton Screen Implementation Plan 2025

**Plan Date**: January 2025  
**Based on**: SKELETON_SCREEN_AUDIT_2025.md  
**Current Score**: 7.2/10  
**Target Score**: 9.5/10  
**Total Effort**: 8-12 days

---

## Executive Summary

This plan addresses critical issues in skeleton screen implementation identified in the audit, prioritizing high-impact improvements that enhance user experience, accessibility, and code quality.

### Goals

1. **Fix Critical Bugs** → Broken animations, missing dark mode, no accessibility
2. **Consolidate Components** → Single source of truth for skeletons
3. **Standardize Usage** → Replace spinners with context-appropriate skeletons
4. **Improve Quality** → Add tests, documentation, types
5. **Enhance Performance** → Optimize animations, reduce bundle size

### Success Metrics

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Overall Score | 7.2/10 | 9.5/10 | +32% |
| Component Coverage | 7/10 | 9.5/10 | +36% |
| Dark Mode Support | 5/10 | 10/10 | +100% |
| Accessibility | 4/10 | 10/10 | +150% |
| Test Coverage | 0% | 85%+ | ∞ |
| Documentation | 3/10 | 9/10 | +200% |
| Consistency | 5/10 | 9.5/10 | +90% |

---

## Phase 1: Critical Fixes (Priority 1)

**Timeline**: 1-2 days  
**Target Score**: 8.5/10  
**Impact**: Critical bugs fixed, immediate UX improvement

### Task 1.1: Fix Broken Shimmer Animation

**Effort**: 1 hour  
**Priority**: 🔴 Critical  
**Files**: `src/shared/components/loading/Skeletons.tsx`, `tailwind.config.js`

#### Current Issue

```tsx
// ❌ BROKEN: Invalid Tailwind classes
className="animate-pulse bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 bg-size-[200%_100%]"
style={{
  animation: 'shimmer 1.5s infinite',
}}
```

**Problems**:
1. `bg-linear-to-r` → Invalid (should be `bg-gradient-to-r`)
2. `bg-size-[200%_100%]` → Invalid syntax
3. Inline style injection pollutes global styles
4. Conflicts with `animate-pulse`

#### Solution

**Step 1**: Add shimmer keyframes to `tailwind.config.js`

```typescript
// tailwind.config.js
export default {
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '0%': { 
            transform: 'translateX(-100%)',
            opacity: '0.6',
          },
          '50%': {
            opacity: '1',
          },
          '100%': { 
            transform: 'translateX(100%)',
            opacity: '0.6',
          },
        },
      },
      animation: {
        shimmer: 'shimmer 2s ease-in-out infinite',
      },
    },
  },
};
```

**Step 2**: Update skeleton base component

```tsx
// src/shared/components/loading/Skeletons.tsx
interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  style,
  'aria-label': ariaLabel,
}) => (
  <div
    className={`relative overflow-hidden rounded bg-gray-200 dark:bg-gray-700 ${className}`}
    style={style}
    role="status"
    aria-label={ariaLabel || 'Loading content'}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-gray-500/40 to-transparent animate-shimmer" />
    <span className="sr-only">{ariaLabel || 'Loading, please wait...'}</span>
  </div>
);
```

**Acceptance Criteria**:
- ✅ Gradient syntax valid
- ✅ Animation smooth at 60fps
- ✅ Dark mode working
- ✅ No console warnings

---

### Task 1.2: Add Dark Mode to All Advanced Skeletons

**Effort**: 1-2 hours  
**Priority**: 🔴 Critical  
**Files**: `src/shared/components/loading/Skeletons.tsx`

#### Current Issue

All advanced skeletons use hard-coded light colors:

```tsx
// ❌ NO DARK MODE
className="border border-gray-200 bg-gray-200"
```

#### Solution

Add dark mode variants to all components:

```tsx
// ✅ WITH DARK MODE
className="border border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700"
```

**Components to Update**:
1. `TableSkeleton` (8 instances)
2. `CardSkeleton` (6 instances)
3. `FormSkeleton` (5 instances)
4. `ProfileSkeleton` (7 instances)
5. `ListSkeleton` (4 instances)
6. `ChartSkeleton` (9 instances)
7. `DashboardSkeleton` (12 instances)
8. `PageSkeleton` (3 instances)

**Pattern to Apply**:

```tsx
// Before:
className="bg-gray-200 border-gray-200"

// After:
className="bg-gray-200 dark:bg-gray-700 border-gray-200 dark:border-gray-700"
```

**Acceptance Criteria**:
- ✅ All 8 advanced skeletons support dark mode
- ✅ Manual dark mode testing passed
- ✅ Playwright dark mode test passed

---

### Task 1.3: Add ARIA Attributes to All Skeletons

**Effort**: 30 minutes  
**Priority**: 🔴 Critical  
**Files**: `src/shared/components/SkeletonLoader.tsx`, `src/shared/components/loading/Skeletons.tsx`

#### Current Issue

No skeleton components have ARIA attributes:

```tsx
// ❌ NO ACCESSIBILITY
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="w-full space-y-4">
    {/* content */}
  </div>
);
```

#### Solution

Add proper ARIA to all components:

```tsx
// ✅ WITH ACCESSIBILITY
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
  'aria-label'?: string;
}

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
    {/* content */}
    <span className="sr-only">{ariaLabel}</span>
  </div>
);
```

**ARIA Attributes Required**:
- `role="status"` → Indicates loading state
- `aria-label` → Describes what's loading
- `aria-live="polite"` → Announces updates to screen readers
- `<span className="sr-only">` → Visually hidden text for screen readers

**Acceptance Criteria**:
- ✅ All 13 skeleton components have ARIA
- ✅ Screen reader testing passed (NVDA/JAWS)
- ✅ Lighthouse accessibility score 100

---

### Task 1.4: Replace DIY Spinners with Skeletons

**Effort**: 30 minutes  
**Priority**: 🔴 Critical  
**Files**: `src/pages/DashboardPage.tsx`, `src/pages/ProfilePage.tsx`, `src/domains/users/pages/UserListPage.tsx`

#### Current Issues

**DashboardPage.tsx** (Line 317):

```tsx
// ❌ BAD: DIY spinner
if (isLoading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Loading Dashboard</h2>
      </div>
    </div>
  );
}
```

**ProfilePage.tsx** (Line 413):

```tsx
// ❌ BAD: DIY spinner
if (isLoading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Loading Profile</h2>
      </div>
    </div>
  );
}
```

**UserListPage.tsx** (Line 311):

```tsx
// ❌ BAD: Spinner for table
{isLoading ? (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner />
  </div>
) : (
  <Suspense fallback={<LoadingSpinner />}>
    <VirtualTable ... />
  </Suspense>
)}
```

#### Solution

**DashboardPage.tsx**:

```tsx
// ✅ GOOD: Use DashboardSkeleton
import { DashboardSkeleton } from '@/shared/components/loading/Skeletons';

if (isLoading) {
  return <DashboardSkeleton />;
}
```

**ProfilePage.tsx**:

```tsx
// ✅ GOOD: Use ProfileSkeleton
import { ProfileSkeleton } from '@/shared/components/loading/Skeletons';

if (isLoading) {
  return <ProfileSkeleton />;
}
```

**UserListPage.tsx**:

```tsx
// ✅ GOOD: Use TableSkeleton with Suspense
import { TableSkeleton } from '@/shared/components/loading/Skeletons';

<Suspense fallback={<TableSkeleton rows={10} columns={6} />}>
  <VirtualTable ... />
</Suspense>

// Remove redundant isLoading check
```

**Acceptance Criteria**:
- ✅ All 3 pages use appropriate skeletons
- ✅ Loading states match final layout
- ✅ Smooth transition from skeleton to content
- ✅ No layout shift (CLS = 0)

---

### Task 1.5: Add TypeScript Interfaces to Advanced Skeletons

**Effort**: 30 minutes  
**Priority**: 🔴 Critical  
**Files**: `src/shared/components/loading/Skeletons.tsx`

#### Current Issue

Inline type definitions, no prop documentation:

```tsx
// ❌ BAD: Inline types
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ ... });
export const CardSkeleton: React.FC<{ count?: number }> = ({ ... });
```

#### Solution

Create proper interfaces:

```tsx
// ✅ GOOD: Proper interfaces

/**
 * Base skeleton props
 */
interface BaseSkeletonProps {
  className?: string;
  'aria-label'?: string;
}

/**
 * Props for TableSkeleton component
 */
interface TableSkeletonProps extends BaseSkeletonProps {
  /** Number of skeleton rows to display (default: 5) */
  rows?: number;
  /** Number of skeleton columns to display (default: 4) */
  columns?: number;
}

/**
 * Props for CardSkeleton component
 */
interface CardSkeletonProps extends BaseSkeletonProps {
  /** Number of skeleton cards to display (default: 3) */
  count?: number;
}

/**
 * Props for FormSkeleton component
 */
interface FormSkeletonProps extends BaseSkeletonProps {
  /** Number of form fields to display (default: 4) */
  fields?: number;
}

/**
 * Props for ListSkeleton component
 */
interface ListSkeletonProps extends BaseSkeletonProps {
  /** Number of list items to display (default: 5) */
  items?: number;
}

// Export types for consumers
export type {
  BaseSkeletonProps,
  TableSkeletonProps,
  CardSkeletonProps,
  FormSkeletonProps,
  ListSkeletonProps,
};
```

**Acceptance Criteria**:
- ✅ All components have proper interfaces
- ✅ Props documented with JSDoc
- ✅ Types exported for consumers
- ✅ No TypeScript errors

---

## Phase 2: High-Priority Improvements (Priority 2)

**Timeline**: 2-3 days  
**Target Score**: 9.2/10  
**Impact**: Consolidation, standardization, documentation

### Task 2.1: Consolidate Skeleton Components

**Effort**: 3-4 hours  
**Priority**: 🟠 High  
**Files**: Create `src/shared/components/Skeletons/index.tsx`

#### Current Issue

4 separate files with overlapping functionality:
- `SkeletonLoader.tsx` → Basic primitives
- `loading/Skeletons.tsx` → Advanced layouts
- `StandardLoading.tsx` → Has `ContentSkeleton` duplicate
- `LoadingSpinner.tsx` → Spinner components (keep separate)

#### Solution

Create unified skeleton system:

```text
src/shared/components/Skeletons/
├── index.tsx                 [Main exports]
├── primitives.tsx            [Basic shapes: Line, Text, Card, Avatar, Button]
├── layouts.tsx               [Complex layouts: Table, Form, Profile, List]
├── specialized.tsx           [Domain-specific: Dashboard, Chart, Settings]
├── types.ts                  [TypeScript interfaces]
└── README.md                 [Usage documentation]
```

**Migration Strategy**:

1. **Step 1**: Create new directory structure
2. **Step 2**: Move and consolidate components
3. **Step 3**: Update all imports across codebase
4. **Step 4**: Deprecate old files with warnings
5. **Step 5**: Remove old files after migration

**Import Pattern**:

```tsx
// Before (inconsistent):
import { SkeletonCard } from '@/shared/components/SkeletonLoader';
import { TableSkeleton } from '@/shared/components/loading/Skeletons';

// After (consistent):
import { SkeletonCard, TableSkeleton } from '@/shared/components/Skeletons';
```

**Acceptance Criteria**:
- ✅ Single import path for all skeletons
- ✅ All old imports updated
- ✅ No breaking changes
- ✅ Build passes without warnings

---

### Task 2.2: Standardize Suspense Fallbacks

**Effort**: 2 hours  
**Priority**: 🟠 High  
**Files**: `src/core/routing/RouteRenderer.tsx`, `src/shared/examples/SuspenseExample.tsx`, `src/domains/users/pages/UserListPage.tsx`

#### Current Issue

Inconsistent Suspense fallbacks (11 instances):
- 5 use skeletons ✅
- 3 use spinners ❌
- 2 use unknown/dynamic ⚠️

#### Solution

**Create Standard Fallback Components**:

```tsx
// src/shared/components/Skeletons/fallbacks.tsx

/**
 * Standard fallback for route loading
 */
export const RouteLoadingFallback: React.FC = () => <PageSkeleton />;

/**
 * Standard fallback for component loading
 */
export const ComponentLoadingFallback: React.FC = () => (
  <div className="p-6">
    <SkeletonCard />
  </div>
);

/**
 * Standard fallback for modal loading
 */
export const ModalLoadingFallback: React.FC = () => (
  <div className="space-y-4">
    <SkeletonLine width="60%" />
    <SkeletonText lines={3} />
  </div>
);
```

**Update RouteRenderer.tsx**:

```tsx
// Before:
<Suspense fallback={<RouteLoadingFallback />}>
  {/* Uses spinner component */}
</Suspense>

// After:
import { PageSkeleton } from '@/shared/components/Skeletons';

<Suspense fallback={<PageSkeleton />}>
  {element}
</Suspense>
```

**Update UserListPage.tsx**:

```tsx
// Before:
<Suspense fallback={<LoadingSpinner />}>
  <VirtualTable />
</Suspense>

// After:
import { TableSkeleton } from '@/shared/components/Skeletons';

<Suspense fallback={<TableSkeleton rows={10} columns={6} />}>
  <VirtualTable />
</Suspense>
```

**Create Suspense Pattern Guide**:

```markdown
# Suspense Fallback Pattern Guide

## When to use skeletons vs spinners

### Use Skeletons ✅
- Page navigation
- Data tables/lists
- Content-heavy sections
- Dashboard widgets
- Profile pages
- Forms

### Use Spinners ✅
- Button actions (inline)
- Search/filter operations (inline)
- Quick mutations
- Background sync

## Standard Patterns

### Route Loading
```tsx
<Suspense fallback={<PageSkeleton />}>
  <LazyRoute />
</Suspense>
```

### Table Loading
```tsx
<Suspense fallback={<TableSkeleton rows={10} columns={5} />}>
  <DataTable />
</Suspense>
```

### Dashboard Loading
```tsx
<Suspense fallback={<DashboardSkeleton />}>
  <Dashboard />
</Suspense>
```
```

**Acceptance Criteria**:
- ✅ All Suspense boundaries use appropriate fallbacks
- ✅ Pattern guide created
- ✅ No spinners used for content loading
- ✅ Consistent across codebase

---

### Task 2.3: Add Comprehensive JSDoc Documentation

**Effort**: 2-3 hours  
**Priority**: 🟠 High  
**Files**: All skeleton component files

#### Current Issue

Minimal or no documentation:
- No usage examples
- No prop descriptions
- No "when to use" guidance

#### Solution

Add comprehensive JSDoc to all components:

```tsx
/**
 * Table Skeleton Component
 * 
 * Displays a loading placeholder for data tables with configurable rows and columns.
 * Provides visual feedback that matches the layout of the final table content.
 * 
 * @component
 * @example
 * Basic usage:
 * ```tsx
 * <Suspense fallback={<TableSkeleton />}>
 *   <UserTable />
 * </Suspense>
 * ```
 * 
 * @example
 * Custom configuration:
 * ```tsx
 * <TableSkeleton 
 *   rows={10} 
 *   columns={6} 
 *   className="rounded-xl" 
 *   aria-label="Loading user data table"
 * />
 * ```
 * 
 * @example
 * With TanStack Query:
 * ```tsx
 * const { data, isLoading } = useQuery(...);
 * 
 * if (isLoading) {
 *   return <TableSkeleton rows={pageSize} columns={5} />;
 * }
 * ```
 * 
 * @param {TableSkeletonProps} props - Component props
 * @param {number} [props.rows=5] - Number of skeleton rows to display
 * @param {number} [props.columns=4] - Number of skeleton columns to display
 * @param {string} [props.className] - Additional CSS classes for customization
 * @param {string} [props.aria-label="Loading table data"] - Accessibility label for screen readers
 * 
 * @returns {JSX.Element} Table skeleton component
 * 
 * @accessibility
 * - Uses role="status" for screen reader announcements
 * - Includes aria-label for context
 * - Provides visually hidden text for screen readers
 * 
 * @see {@link ProfileSkeleton} for profile page loading
 * @see {@link ListSkeleton} for list view loading
 * @see {@link DashboardSkeleton} for dashboard loading
 */
export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  className = '',
  'aria-label': ariaLabel = 'Loading table data',
}) => {
  // Implementation
};
```

**Documentation Checklist** (apply to all 13 components):
- ✅ Component description
- ✅ Usage examples (basic, custom, with queries)
- ✅ Param descriptions
- ✅ Default values
- ✅ Accessibility notes
- ✅ Related components
- ✅ Best practices

**Acceptance Criteria**:
- ✅ All components have comprehensive JSDoc
- ✅ Examples tested and working
- ✅ VSCode IntelliSense shows docs
- ✅ Typedoc generates API docs

---

### Task 2.4: Create Missing Skeleton Components

**Effort**: 4-6 hours  
**Priority**: 🟠 High  
**Files**: `src/shared/components/Skeletons/specialized.tsx`

#### Components to Create

##### 1. SettingsSkeleton (2 hours)

```tsx
/**
 * Settings Skeleton Component
 * For settings/configuration pages with sections and form fields
 */
export const SettingsSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto p-6 space-y-8" role="status" aria-label="Loading settings">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
    </div>
    
    {/* Settings Sections */}
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={`section-${i}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={`field-${j}`} className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-10 w-20" />
            </div>
          ))}
        </div>
      </div>
    ))}
    
    {/* Action Buttons */}
    <div className="flex gap-4">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-24" />
    </div>
    
    <span className="sr-only">Loading settings, please wait...</span>
  </div>
);
```

##### 2. UserDetailSkeleton (2 hours)

```tsx
/**
 * User Detail Skeleton Component
 * For user detail/profile view pages
 */
export const UserDetailSkeleton: React.FC = () => (
  <div className="max-w-5xl mx-auto p-6 space-y-8" role="status" aria-label="Loading user details">
    {/* Header with Avatar and Actions */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-6">
        <Skeleton className="h-32 w-32 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-10 w-10 rounded" />
      </div>
    </div>
    
    {/* Tabs */}
    <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={`tab-${i}`} className="h-10 w-24 mb-[-1px]" />
      ))}
    </div>
    
    {/* Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`info-${i}`} className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
      
      {/* Sidebar */}
      <div className="space-y-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
          <Skeleton className="h-6 w-24" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`activity-${i}`} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    <span className="sr-only">Loading user details, please wait...</span>
  </div>
);
```

##### 3. SearchResultsSkeleton (1.5 hours)

```tsx
/**
 * Search Results Skeleton Component
 * For search result pages with filters and result cards
 */
interface SearchResultsSkeletonProps extends BaseSkeletonProps {
  results?: number;
  showFilters?: boolean;
}

export const SearchResultsSkeleton: React.FC<SearchResultsSkeletonProps> = ({
  results = 6,
  showFilters = true,
  className = '',
  'aria-label': ariaLabel = 'Loading search results',
}) => (
  <div className={`space-y-6 ${className}`} role="status" aria-label={ariaLabel}>
    {/* Search Header */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-32" />
    </div>
    
    <div className="flex gap-6">
      {/* Filters Sidebar */}
      {showFilters && (
        <div className="w-64 space-y-6 shrink-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`filter-${i}`} className="space-y-3">
              <Skeleton className="h-5 w-32" />
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={`option-${j}`} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      
      {/* Results Grid */}
      <div className="flex-1 space-y-4">
        {Array.from({ length: results }).map((_, i) => (
          <div key={`result-${i}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex gap-4">
              <Skeleton className="h-24 w-24 rounded shrink-0" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    <span className="sr-only">{ariaLabel}</span>
  </div>
);
```

##### 4. NotificationSkeleton (1 hour)

```tsx
/**
 * Notification Skeleton Component
 * For notification lists and feeds
 */
interface NotificationSkeletonProps extends BaseSkeletonProps {
  items?: number;
}

export const NotificationSkeleton: React.FC<NotificationSkeletonProps> = ({
  items = 5,
  className = '',
  'aria-label': ariaLabel = 'Loading notifications',
}) => (
  <div className={`space-y-2 ${className}`} role="status" aria-label={ariaLabel}>
    {Array.from({ length: items }).map((_, i) => (
      <div 
        key={`notification-${i}`} 
        className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-2 w-2 rounded-full shrink-0" />
      </div>
    ))}
    <span className="sr-only">{ariaLabel}</span>
  </div>
);
```

**Acceptance Criteria**:
- ✅ All 4 new components created
- ✅ Dark mode support
- ✅ ARIA attributes
- ✅ TypeScript types
- ✅ JSDoc documentation
- ✅ Usage examples

---

### Task 2.5: Write Comprehensive Tests

**Effort**: 1 day  
**Priority**: 🟠 High  
**Files**: `src/shared/components/Skeletons/__tests__/`

#### Test Structure

```text
__tests__/
├── primitives.test.tsx       [Basic shapes]
├── layouts.test.tsx          [Complex layouts]
├── specialized.test.tsx      [Domain-specific]
├── accessibility.test.tsx    [ARIA, screen reader]
├── dark-mode.test.tsx        [Theme switching]
├── suspense.test.tsx         [Integration with Suspense]
└── performance.test.tsx      [Animation performance]
```

#### Test Examples

##### Unit Tests

```tsx
// __tests__/primitives.test.tsx
import { render, screen } from '@testing-library/react';
import { SkeletonLine, SkeletonText, SkeletonCard } from '../primitives';

describe('Skeleton Primitives', () => {
  describe('SkeletonLine', () => {
    it('renders with default width', () => {
      render(<SkeletonLine />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders with custom width', () => {
      render(<SkeletonLine width="50%" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ width: '50%' });
    });

    it('applies custom className', () => {
      render(<SkeletonLine className="custom-class" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('custom-class');
    });

    it('has proper ARIA attributes', () => {
      render(<SkeletonLine aria-label="Loading title" />);
      expect(screen.getByLabelText('Loading title')).toBeInTheDocument();
    });
  });

  describe('SkeletonText', () => {
    it('renders correct number of lines', () => {
      const { container } = render(<SkeletonText lines={3} />);
      const lines = container.querySelectorAll('[role="presentation"]');
      expect(lines).toHaveLength(3);
    });

    it('applies dark mode classes', () => {
      const { container } = render(<SkeletonText lines={2} />);
      const lines = container.querySelectorAll('[role="presentation"]');
      lines.forEach(line => {
        expect(line).toHaveClass('dark:bg-gray-700');
      });
    });
  });
});
```

##### Integration Tests

```tsx
// __tests__/suspense.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import { TableSkeleton } from '../layouts';

// Mock async component
const AsyncTable = () => {
  throw new Promise(resolve => setTimeout(resolve, 100));
};

const ResolvedTable = () => <table role="table">Table Content</table>;

describe('Suspense Integration', () => {
  it('shows TableSkeleton while component loads', async () => {
    const { rerender } = render(
      <Suspense fallback={<TableSkeleton rows={5} columns={4} />}>
        <AsyncTable />
      </Suspense>
    );

    // Should show skeleton
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading table data')).toBeInTheDocument();

    // Wait and rerender with resolved component
    await waitFor(() => {}, { timeout: 150 });
    rerender(
      <Suspense fallback={<TableSkeleton rows={5} columns={4} />}>
        <ResolvedTable />
      </Suspense>
    );

    // Should hide skeleton and show content
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('maintains layout during loading', () => {
    const { container } = render(
      <Suspense fallback={<TableSkeleton rows={5} columns={4} />}>
        <AsyncTable />
      </Suspense>
    );

    // Measure skeleton dimensions
    const skeleton = container.querySelector('[role="status"]');
    const rect = skeleton?.getBoundingClientRect();
    
    expect(rect?.height).toBeGreaterThan(0);
    expect(rect?.width).toBeGreaterThan(0);
  });
});
```

##### Accessibility Tests

```tsx
// __tests__/accessibility.test.tsx
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TableSkeleton, ProfileSkeleton, DashboardSkeleton } from '../';

expect.extend(toHaveNoViolations);

describe('Skeleton Accessibility', () => {
  it('TableSkeleton has no accessibility violations', async () => {
    const { container } = render(<TableSkeleton />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ProfileSkeleton has proper ARIA', () => {
    render(<ProfileSkeleton />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-label');
    expect(skeleton).toHaveAttribute('aria-live', 'polite');
    
    // Check for screen reader text
    expect(screen.getByText(/loading.*please wait/i)).toHaveClass('sr-only');
  });

  it('DashboardSkeleton announces to screen readers', () => {
    render(<DashboardSkeleton aria-label="Loading dashboard analytics" />);
    expect(screen.getByLabelText('Loading dashboard analytics')).toBeInTheDocument();
  });

  it('all skeletons have role="status"', () => {
    const { rerender } = render(<TableSkeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    rerender(<ProfileSkeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    rerender(<DashboardSkeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```

##### Dark Mode Tests

```tsx
// __tests__/dark-mode.test.tsx
import { render } from '@testing-library/react';
import { TableSkeleton, CardSkeleton } from '../';

describe('Dark Mode Support', () => {
  it('TableSkeleton has dark mode classes', () => {
    const { container } = render(<TableSkeleton />);
    const elements = container.querySelectorAll('.dark\\:bg-gray-700');
    expect(elements.length).toBeGreaterThan(0);
  });

  it('CardSkeleton has dark border classes', () => {
    const { container } = render(<CardSkeleton count={3} />);
    const cards = container.querySelectorAll('.dark\\:border-gray-700');
    expect(cards.length).toBe(3);
  });

  it('all skeletons have dark mode support', () => {
    const components = [
      <TableSkeleton key="table" />,
      <CardSkeleton key="card" />,
      <ProfileSkeleton key="profile" />,
      <DashboardSkeleton key="dashboard" />,
    ];

    components.forEach(component => {
      const { container } = render(component);
      const darkElements = container.querySelectorAll('[class*="dark:"]');
      expect(darkElements.length).toBeGreaterThan(0);
    });
  });
});
```

**Test Coverage Goals**:
- ✅ Unit tests: 90%+ coverage
- ✅ Integration tests: All Suspense patterns
- ✅ Accessibility tests: 100% components
- ✅ Visual regression: Key components
- ✅ Performance tests: Animation FPS

**Acceptance Criteria**:
- ✅ 85%+ overall test coverage
- ✅ All accessibility tests pass
- ✅ CI pipeline green
- ✅ No flaky tests

---

## Phase 3: Medium-Priority Enhancements (Priority 3)

**Timeline**: 3-5 days  
**Target Score**: 9.5/10  
**Impact**: Polish, optimization, developer experience

### Task 3.1: Optimize Animation Performance

**Effort**: 2 hours  
**Priority**: 🟡 Medium

#### Performance Audit

1. **Measure current FPS** (Chrome DevTools Performance tab)
2. **Identify janky animations** (< 60fps)
3. **Profile CPU usage**
4. **Check for layout recalculations**

#### Optimizations

```tsx
// Before: May cause repaints
<div className="animate-pulse bg-gray-200" style={{ opacity: 0.6 }} />

// After: GPU-accelerated
<div className="animate-pulse bg-gray-200" style={{ willChange: 'opacity' }} />
```

**Add to tailwind.config.js**:

```typescript
module.exports = {
  theme: {
    extend: {
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
    },
  },
};
```

**Acceptance Criteria**:
- ✅ All animations 60fps stable
- ✅ CPU usage < 5%
- ✅ No layout thrashing
- ✅ Lighthouse performance 100

---

### Task 3.2: Create Storybook Stories

**Effort**: 1 day  
**Priority**: 🟡 Medium

#### Story Structure

```text
stories/
├── Primitives.stories.tsx
├── Layouts.stories.tsx
├── Specialized.stories.tsx
└── Patterns.stories.tsx
```

#### Example Story

```tsx
// Primitives.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { SkeletonLine, SkeletonText, SkeletonCard } from '../Skeletons';

const meta: Meta<typeof SkeletonLine> = {
  title: 'Components/Skeletons/Primitives',
  component: SkeletonLine,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof SkeletonLine>;

export const Line: Story = {
  args: {
    width: '100%',
  },
};

export const CustomWidth: Story = {
  args: {
    width: '60%',
  },
};

export const Text: Story = {
  render: () => <SkeletonText lines={3} />,
};

export const Card: Story = {
  render: () => <SkeletonCard />,
};

export const DarkMode: Story = {
  render: () => (
    <div className="dark bg-gray-900 p-6">
      <SkeletonText lines={5} />
    </div>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
```

**Acceptance Criteria**:
- ✅ All components have stories
- ✅ Interactive controls for props
- ✅ Dark mode toggle
- ✅ Accessibility audit panel
- ✅ Mobile viewport testing

---

### Task 3.3: Add Skeleton Customization System

**Effort**: 1 day  
**Priority**: 🟡 Medium

#### Theme Integration

```tsx
// src/shared/components/Skeletons/theme.ts

export interface SkeletonTheme {
  colors: {
    light: string;
    dark: string;
    shimmer: string;
  };
  animation: {
    speed: string;
    easing: string;
  };
  borderRadius: string;
}

export const defaultSkeletonTheme: SkeletonTheme = {
  colors: {
    light: 'bg-gray-200',
    dark: 'dark:bg-gray-700',
    shimmer: 'via-white/40 dark:via-gray-500/40',
  },
  animation: {
    speed: '2s',
    easing: 'ease-in-out',
  },
  borderRadius: 'rounded',
};

// Context provider
export const SkeletonThemeContext = createContext<SkeletonTheme>(defaultSkeletonTheme);

export const SkeletonThemeProvider: React.FC<{ 
  theme?: Partial<SkeletonTheme>; 
  children: React.ReactNode;
}> = ({ theme, children }) => {
  const mergedTheme = { ...defaultSkeletonTheme, ...theme };
  return (
    <SkeletonThemeContext.Provider value={mergedTheme}>
      {children}
    </SkeletonThemeContext.Provider>
  );
};
```

**Usage**:

```tsx
// Customize globally
<SkeletonThemeProvider theme={{ 
  colors: { light: 'bg-blue-200', dark: 'dark:bg-blue-800' },
  animation: { speed: '1.5s' },
}}>
  <App />
</SkeletonThemeProvider>

// Customize for specific section
<SkeletonThemeProvider theme={{ borderRadius: 'rounded-xl' }}>
  <DashboardSkeleton />
</SkeletonThemeProvider>
```

**Acceptance Criteria**:
- ✅ Theme context implemented
- ✅ All skeletons respect theme
- ✅ Documentation with examples
- ✅ No breaking changes

---

### Task 3.4: Performance Monitoring Integration

**Effort**: 4 hours  
**Priority**: 🟡 Medium

#### Tracking Skeleton Display Duration

```tsx
// src/shared/components/Skeletons/analytics.ts

export const useSkeletonMetrics = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      
      // Log to analytics
      window.gtag?.('event', 'skeleton_display', {
        component: componentName,
        duration_ms: Math.round(duration),
      });
      
      // Warn if loading too long
      if (duration > 3000) {
        console.warn(`${componentName} displayed for ${duration}ms - investigate slow loading`);
      }
    };
  }, [componentName]);
};
```

**Usage**:

```tsx
export const TableSkeleton: React.FC<TableSkeletonProps> = (props) => {
  useSkeletonMetrics('TableSkeleton');
  
  return (
    // Skeleton JSX
  );
};
```

**Acceptance Criteria**:
- ✅ Metrics tracked for all skeletons
- ✅ Analytics integration
- ✅ Performance warnings
- ✅ Dashboard visualization

---

## Phase 4: Low-Priority Nice-to-Haves (Priority 4)

**Timeline**: Optional (2-3 days)  
**Target Score**: 9.8/10  
**Impact**: Advanced features, automation

### Task 4.1: Create Skeleton Generator CLI

**Effort**: 2 days  
**Priority**: 🟢 Low

**Not detailed here - optional future enhancement**

---

### Task 4.2: Add Skeleton Analytics

**Effort**: 1 day  
**Priority**: 🟢 Low

**Not detailed here - optional future enhancement**

---

## Implementation Checklist

### Phase 1 (1-2 Days) ✅

- [ ] Task 1.1: Fix broken shimmer animation (1 hour)
- [ ] Task 1.2: Add dark mode to advanced skeletons (1-2 hours)
- [ ] Task 1.3: Add ARIA attributes (30 mins)
- [ ] Task 1.4: Replace DIY spinners (30 mins)
- [ ] Task 1.5: Add TypeScript interfaces (30 mins)

### Phase 2 (2-3 Days) ✅

- [ ] Task 2.1: Consolidate components (3-4 hours)
- [ ] Task 2.2: Standardize Suspense fallbacks (2 hours)
- [ ] Task 2.3: Add JSDoc documentation (2-3 hours)
- [ ] Task 2.4: Create missing components (4-6 hours)
- [ ] Task 2.5: Write comprehensive tests (1 day)

### Phase 3 (3-5 Days) ⚠️

- [ ] Task 3.1: Optimize animations (2 hours)
- [ ] Task 3.2: Create Storybook stories (1 day)
- [ ] Task 3.3: Add customization system (1 day)
- [ ] Task 3.4: Performance monitoring (4 hours)

### Phase 4 (Optional) 🔵

- [ ] Task 4.1: Skeleton generator CLI (2 days)
- [ ] Task 4.2: Skeleton analytics (1 day)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking changes during consolidation | Medium | High | Careful migration, deprecation warnings |
| Test failures in CI | Low | Medium | Thorough testing before merge |
| Performance regression | Low | High | Benchmark before/after, rollback plan |
| Incomplete dark mode testing | Medium | Medium | Manual testing + Playwright tests |
| Storybook configuration issues | Low | Low | Use existing setup |

---

## Success Criteria

### Technical Metrics

- [ ] ✅ Overall score 9.5/10 or higher
- [ ] ✅ 85%+ test coverage
- [ ] ✅ Zero TypeScript errors
- [ ] ✅ Zero accessibility violations
- [ ] ✅ Lighthouse score 100
- [ ] ✅ 60fps animations
- [ ] ✅ Bundle size < 12KB (optimized from 13.6KB)

### Quality Metrics

- [ ] ✅ All 13 components support dark mode
- [ ] ✅ All components have ARIA attributes
- [ ] ✅ All components have TypeScript types
- [ ] ✅ All components have JSDoc with examples
- [ ] ✅ All Suspense boundaries use appropriate skeletons
- [ ] ✅ Zero DIY loading spinners in pages

### Developer Experience

- [ ] ✅ Single import path for all skeletons
- [ ] ✅ Comprehensive documentation
- [ ] ✅ Pattern guide created
- [ ] ✅ Storybook stories for all components
- [ ] ✅ VSCode IntelliSense working

---

## Timeline Summary

| Phase | Duration | Target Score | Key Deliverables |
|-------|----------|-------------|------------------|
| **Phase 1** | 1-2 days | 8.5/10 | Critical bugs fixed, immediate UX improvement |
| **Phase 2** | 2-3 days | 9.2/10 | Consolidation, tests, documentation |
| **Phase 3** | 3-5 days | 9.5/10 | Optimization, Storybook, customization |
| **Phase 4** | Optional | 9.8/10 | Advanced features, automation |
| **Total** | 8-12 days | 9.5/10 | Production-ready skeleton system |

---

## Next Steps

1. **Get approval** for Phase 1 implementation
2. **Create feature branch**: `feature/skeleton-improvements`
3. **Start with Task 1.1**: Fix shimmer animation
4. **Daily progress updates** in team standup
5. **PR review** after each phase
6. **Deploy to staging** after Phase 1
7. **Monitor metrics** in production

---

**END OF IMPLEMENTATION PLAN**

See `SKELETON_SCREEN_AUDIT_2025.md` for detailed findings.
