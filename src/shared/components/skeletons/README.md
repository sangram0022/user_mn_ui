# Skeleton Components - Performance Guide

## 📦 Components Overview

Centralized skeleton loading components with performance optimizations and accessibility built-in.

### Available Components

- **TableSkeleton** - Data tables
- **CardSkeleton** - Card grids
- **FormSkeleton** - Form fields
- **ProfileSkeleton** - Profile pages
- **ListSkeleton** - List views
- **ChartSkeleton** - Charts/graphs
- **DashboardSkeleton** - Dashboard pages
- **PageSkeleton** - Generic pages
- **Skeleton** - Base primitive
- **StandardLoading** - Loading states
- **LoadingSpinner** - Simple spinners

## 🚀 Usage

```tsx
import { TableSkeleton, CardSkeleton } from '@/shared/components/skeletons';

// With Suspense (recommended)
<Suspense fallback={<TableSkeleton rows={10} columns={6} />}>
  <UserTable />
</Suspense>

// Conditional rendering
{isLoading ? <DashboardSkeleton /> : <Dashboard data={data} />}
```

## ⚡ Performance Optimizations

### 1. GPU-Accelerated Animation
The shimmer effect uses `transform: translateX()` which is GPU-accelerated:

```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

✅ **Best Practice**: Always use `animate-shimmer` class from Tailwind config
❌ **Avoid**: Custom animations with `left`, `right`, or `opacity` only

### 2. Memoization Strategy

Skeleton components are memoized to prevent unnecessary re-renders:

```tsx
export const TableSkeleton = React.memo<TableSkeletonProps>(({ ... }) => {
  // Component implementation
});
```

**When to use additional memoization**:
- ✅ Skeleton is inside frequently re-rendering parent
- ✅ Skeleton has dynamic props that rarely change
- ❌ Skeleton is already inside Suspense boundary (no need)

### 3. Minimal DOM Nodes

Each skeleton uses minimal DOM structure:
- Base skeleton: 2 divs (wrapper + shimmer overlay)
- Complex skeletons: Composites of base skeletons

**Optimization tip**: For very large lists, consider virtualizing:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

// Virtualize skeleton rows for 1000+ items
const rowVirtualizer = useVirtualizer({
  count: 1000,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
});
```

### 4. Dark Mode Performance

Dark mode uses CSS variables and classes (no JS):

```tsx
// Efficient: CSS handles switching
<div className="bg-gray-200 dark:bg-gray-700" />

// Avoid: JS-based theme switching
const bg = isDark ? 'bg-gray-700' : 'bg-gray-200';
```

## 📊 Performance Metrics

| Component | DOM Nodes | Animation | Memory |
|-----------|-----------|-----------|--------|
| TableSkeleton (5x4) | ~42 | GPU | ~5KB |
| CardSkeleton (3) | ~48 | GPU | ~6KB |
| DashboardSkeleton | ~120 | GPU | ~15KB |
| ListSkeleton (5) | ~50 | GPU | ~6KB |

## 🎯 Best Practices

### 1. Choose the Right Skeleton

```tsx
// ✅ Good: Matches content structure
<Suspense fallback={<TableSkeleton rows={10} columns={6} />}>
  <UserTable />
</Suspense>

// ❌ Bad: Generic loading for specific content
<Suspense fallback={<div>Loading...</div>}>
  <UserTable />
</Suspense>
```

### 2. Appropriate Sizing

```tsx
// ✅ Good: Match expected data size
<TableSkeleton rows={query.data?.pagination.pageSize ?? 10} />

// ❌ Bad: Arbitrary fixed size
<TableSkeleton rows={50} /> // When only 10 items expected
```

### 3. Accessibility

All skeletons include:
- `role="status"` - Announces loading state
- `aria-live="polite"` - Screen reader support
- `aria-label` - Descriptive label
- `.sr-only` text - Additional context

```tsx
// Customize labels for better context
<TableSkeleton aria-label="Loading user data" />
```

### 4. Suspense Integration

```tsx
// ✅ Best: Nested suspense boundaries
<Suspense fallback={<PageSkeleton />}>
  <DashboardLayout>
    <Suspense fallback={<TableSkeleton />}>
      <UserTable />
    </Suspense>
    <Suspense fallback={<ChartSkeleton />}>
      <AnalyticsChart />
    </Suspense>
  </DashboardLayout>
</Suspense>

// ❌ Avoid: Single suspense for everything
<Suspense fallback={<PageSkeleton />}>
  <EntireApp />
</Suspense>
```

## 🔧 Advanced Optimization

### Custom Skeleton with Memoization

```tsx
import { TableSkeleton } from '@/shared/components/skeletons';
import { memo } from 'react';

// Memoize wrapper when parent re-renders frequently
const MemoizedTableLoading = memo(() => (
  <TableSkeleton rows={20} columns={8} />
));

// Use in frequently updating parent
function FrequentlyUpdatingParent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Update {count}</button>
      {isLoading && <MemoizedTableLoading />}
    </div>
  );
}
```

### Skeleton with Transition

```tsx
import { Transition } from '@headlessui/react';

function SmoothSkeletonTransition({ isLoading, children }) {
  return (
    <>
      <Transition
        show={isLoading}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <TableSkeleton />
      </Transition>
      
      <Transition
        show={!isLoading}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
      >
        {children}
      </Transition>
    </>
  );
}
```

## 🐛 Common Issues & Solutions

### Issue 1: Skeleton Flashing

**Problem**: Skeleton appears and disappears too quickly

**Solution**: Add minimum display time

```tsx
const [showSkeleton, setShowSkeleton] = useState(true);

useEffect(() => {
  if (!isLoading) {
    // Keep skeleton for at least 300ms to avoid flash
    const timer = setTimeout(() => setShowSkeleton(false), 300);
    return () => clearTimeout(timer);
  }
  setShowSkeleton(true);
}, [isLoading]);

return showSkeleton ? <TableSkeleton /> : <Table data={data} />;
```

### Issue 2: Shimmer Not Visible

**Problem**: Shimmer animation not showing

**Solution**: Check Tailwind config includes shimmer animation

```js
// tailwind.config.js
keyframes: {
  shimmer: {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' }
  }
},
animation: {
  shimmer: 'shimmer 2.5s linear infinite'
}
```

### Issue 3: Layout Shift

**Problem**: Content jumps when skeleton is replaced

**Solution**: Match skeleton dimensions to content

```tsx
// Reserve space with min-height
<div className="min-h-[400px]">
  {isLoading ? (
    <TableSkeleton rows={10} />
  ) : (
    <Table data={data} />
  )}
</div>
```

## 📚 Additional Resources

- [React Suspense Documentation](https://react.dev/reference/react/Suspense)
- [Web Vitals](https://web.dev/vitals/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Animations Performance](https://web.dev/animations-guide/)

## 🎨 Customization

### Creating Custom Skeletons

```tsx
import { Skeleton } from '@/shared/components/skeletons';

function CustomProductSkeleton() {
  return (
    <div 
      role="status" 
      aria-label="Loading product"
      className="space-y-4"
    >
      <Skeleton className="h-64 w-full" /> {/* Image */}
      <Skeleton className="h-6 w-3/4" />   {/* Title */}
      <Skeleton className="h-4 w-1/2" />   {/* Price */}
      <Skeleton className="h-10 w-32" />   {/* Button */}
      <span className="sr-only">Loading product details...</span>
    </div>
  );
}
```

### Theming

Skeletons automatically adapt to your theme:

```tsx
// Light mode: bg-gray-200
// Dark mode: bg-gray-700 (via dark: classes)

// Custom colors (if needed)
<Skeleton className="bg-blue-100 dark:bg-blue-900" />
```

## ✅ Checklist

Before deploying skeleton screens:

- [ ] Skeleton matches content structure
- [ ] Appropriate sizing (not too large/small)
- [ ] Accessibility attributes present
- [ ] Dark mode support tested
- [ ] No layout shift on load
- [ ] Shimmer animation visible
- [ ] Performance profiled (no jank)
- [ ] Suspense boundaries configured
- [ ] Minimum display time if needed
- [ ] Mobile responsiveness verified

---

**Last Updated**: November 2025  
**Maintained by**: Frontend Team  
**Questions?** Check our [Component Library Docs](../../../docs/)
