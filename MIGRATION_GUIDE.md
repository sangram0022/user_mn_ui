# Migration Guide: From Inline Styles to CSS Classes

## Quick Start (5 Minutes)

### Step 1: Activate New CSS System

```typescript
// src/main.tsx
// Replace this line:
import './styles/index.css';

// With this:
import './styles/index-new.css';
```

### Step 2: Update Button Imports

```typescript
// Old import
import { Button } from '@shared/ui/Button';

// New import
import { Button } from '@shared/components/ui/Button/Button';
```

---

## Common Migration Patterns

### Pattern 1: Inline Style → Data Attribute

**Before**:

```tsx
<div style={{ '--progress': `${progress}%` } as React.CSSProperties}>
  <div className="progress-bar" />
</div>
```

**After**:

```tsx
<div data-progress={progress}>
  <div className="toast-progress-bar" />
</div>
```

```css
/* In component CSS */
[data-progress] .toast-progress-bar {
  transform: scaleX(calc(attr(data-progress number) / 100));
}
```

### Pattern 2: Dynamic Styles → CSS Variables

**Before**:

```tsx
<div style={{ height: totalHeight, position: 'relative' }}>
```

**After**:

```tsx
<div
  className="virtual-container"
  style={{ '--total-height': `${totalHeight}px` }}
>
```

```css
.virtual-container {
  height: var(--total-height);
  position: relative;
}
```

### Pattern 3: Conditional Styles → Data Attributes

**Before**:

```tsx
<button
  style={{
    opacity: isLoading ? 0.6 : 1,
    pointerEvents: isLoading ? 'none' : 'auto'
  }}
>
```

**After**:

```tsx
<button className="btn" data-loading={isLoading || undefined}>
```

```css
.btn[data-loading] {
  opacity: 0.6;
  pointer-events: none;
}
```

---

## Component-Specific Migrations

### Toast Component

**File**: `src/shared/components/ui/ToastContainer.tsx`

**Current** (Line 235):

```tsx
<div className="..." style={{ '--progress': `${progress}%` } as React.CSSProperties} />
```

**Replace with**:

```tsx
<div className="toast-progress">
  <div className="toast-progress-bar" style={{ animationDuration: `${duration}ms` }} />
</div>
```

### Skeleton Component

**File**: `src/shared/components/ui/Skeleton.tsx`

**Current** (Line 114):

```tsx
<div style={computedStyle} />
```

**Replace with**:

```tsx
<div className="skeleton" data-variant={variant} data-animation={animation} />
```

**Current** (Line 294, 306):

```tsx
<div style={{ '--columns': columns } as React.CSSProperties}>
```

**Replace with**:

```tsx
<div className="skeleton-grid" data-columns={columns}>
```

```css
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(var(--columns, 3), 1fr);
  gap: var(--grid-gap);
}
```

### Virtual User Table

**File**: `src/domains/users/components/VirtualUserTable.tsx`

**Current** (Line 291, 295):

```tsx
<div style={{ '--container-height': `${CONTAINER_HEIGHT}px` }}>
  <div style={{ '--total-height': `${totalHeight}px` }}>
```

**Replace with**:

```tsx
<div
  className="virtual-container"
  style={{ '--container-height': `${CONTAINER_HEIGHT}px` }}
>
  <div
    className="virtual-content"
    style={{ '--total-height': `${totalHeight}px` }}
  >
```

```css
/* Add to component CSS */
.virtual-container {
  height: var(--container-height);
  overflow: auto;
}

.virtual-content {
  height: var(--total-height);
  position: relative;
}
```

---

## Using Layout Compositions

### Stack (Vertical Spacing)

```tsx
// Before
<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
  <Card />
  <Card />
</div>

// After
<div className="stack" data-gap="md">
  <Card />
  <Card />
</div>
```

### Cluster (Horizontal Wrapping)

```tsx
// Before
<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
  <Button />
  <Button />
</div>

// After
<div className="cluster" data-gap="sm" data-align="start">
  <Button />
  <Button />
</div>
```

### Auto Grid

```tsx
// Before
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1rem'
}}>

// After
<div className="auto-grid" data-gap="md" data-columns="4">
```

### Container

```tsx
// Before
<div style={{
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '0 1rem'
}}>

// After
<div className="container" data-size="xl">
```

---

## Using Design Tokens

### In Components (CSS)

```css
/* Instead of hardcoded values */
.my-component {
  background: #ffffff;
  color: #1f2937;
  padding: 16px;
  border-radius: 8px;
}

/* Use semantic tokens */
.my-component {
  background: rgb(var(--color-background-elevated));
  color: rgb(var(--color-text-primary));
  padding: var(--spacing-component-md);
  border-radius: var(--border-radius-component);
}
```

### With Alpha Channel

```css
/* Opacity support */
.overlay {
  background: rgb(var(--color-gray-900) / 0.75);
}

.hover-state {
  background: rgb(var(--color-hover-overlay) / var(--color-hover-overlay-opacity));
}
```

### Component Tokens

```css
/* Use component-specific tokens */
.btn-primary {
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
  box-shadow: var(--button-primary-shadow);
}

.btn-primary:hover {
  background: var(--button-primary-bg-hover);
  box-shadow: var(--button-primary-shadow-hover);
}
```

---

## Button Component Updates

### Old Button Usage

```tsx
import { Button } from '@shared/ui/Button';

<Button variant="primary" size="md" isLoading={isLoading}>
  Save
</Button>;
```

### New Button Usage (Same API!)

```tsx
import { Button } from '@shared/components/ui/Button/Button';

<Button variant="primary" size="md" isLoading={isLoading}>
  Save
</Button>;
```

### New Features

**Polymorphic**:

```tsx
<Button as="a" href="/dashboard" variant="outline">
  Go to Dashboard
</Button>

<Button as={Link} to="/profile" variant="ghost">
  View Profile
</Button>
```

**Button Group**:

```tsx
import { ButtonGroup } from '@shared/components/ui/Button/Button';

<ButtonGroup attached>
  <Button variant="secondary">Option 1</Button>
  <Button variant="secondary">Option 2</Button>
  <Button variant="secondary">Option 3</Button>
</ButtonGroup>;
```

**Icon Button**:

```tsx
import { IconButton } from '@shared/components/ui/Button/Button';

<IconButton icon={<Settings />} variant="ghost" aria-label="Settings" />;
```

---

## Dark Mode

### Automatic Dark Mode

All components using design tokens automatically support dark mode!

```tsx
// Component CSS
.my-card {
  background: rgb(var(--color-background-elevated));
  color: rgb(var(--color-text-primary));
}

// Automatically becomes dark when user switches theme
// No additional code needed!
```

### Testing Dark Mode

```tsx
// In ThemeContext
const { theme, setTheme } = useTheme();

// Toggle theme
<button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Toggle Theme</button>;
```

---

## Checklist for Each Component

- [ ] Remove all inline `style={{}}` attributes
- [ ] Use CSS classes from design system
- [ ] Replace hardcoded colors with tokens
- [ ] Use layout compositions where applicable
- [ ] Add data attributes for states
- [ ] Test in light and dark mode
- [ ] Verify accessibility (keyboard, screen reader)
- [ ] Check responsive behavior

---

## Performance Tips

### 1. Use Composition Over Custom CSS

```tsx
// Instead of custom div with styles
<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

// Use composition
<div className="stack" data-gap="md">
```

### 2. Leverage CSS Layers

```css
/* High priority override */
@layer overrides {
  .special-button {
    /* This will override component styles */
  }
}
```

### 3. Use Data Attributes for States

```tsx
// Better than className concatenation
<div data-loading={isLoading} data-error={hasError}>
```

```css
[data-loading] {
  /* ... */
}
[data-error] {
  /* ... */
}
[data-loading][data-error] {
  /* combined state */
}
```

---

## Common Pitfalls

### ❌ Don't Do This

```tsx
// Hardcoded colors
<div style={{ background: '#3b82f6' }}>

// Inline calculations
<div style={{ width: `${100 / items.length}%` }}>

// Scattered responsive styles
<div style={{
  padding: window.innerWidth < 768 ? '1rem' : '2rem'
}}>
```

### ✅ Do This Instead

```tsx
// Use tokens
<div className="bg-primary">

// Use CSS grid
<div className="auto-grid" data-columns={items.length}>

// Use responsive classes or container queries
<div className="box" data-padding="md">
```

---

## Need Help?

1. Check `css_ui1.md` for comprehensive analysis
2. See `IMPLEMENTATION_SUMMARY.md` for overview
3. Look at `src/shared/components/ui/Button/Button.tsx` for example
4. Review design tokens in `src/styles/tokens/`

---

## Gradual Migration Strategy

You don't need to migrate everything at once!

### Phase 1 (Week 1)

- Update main.tsx to use new CSS
- Migrate Button component
- Fix Toast inline styles

### Phase 2 (Week 2)

- Migrate Skeleton component
- Update VirtualUserTable
- Consolidate Alert components

### Phase 3 (Week 3)

- Migrate remaining components
- Test all pages in dark mode
- Performance optimization

---

**Questions?** Check the documentation or ask the team!
