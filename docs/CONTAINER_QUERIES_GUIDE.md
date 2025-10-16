# Container Queries Implementation Guide

## Overview

Container queries enable true component-based responsive design, where components adapt to their immediate container's size rather than the viewport. This creates truly reusable components that work in any layout context.

## ✅ Completed Implementation

### Files Created

- ✅ `src/styles/container-queries.css` (580 lines) - Complete container query system
- ✅ `src/domains/demo/ContainerQueriesDemo.tsx` - Interactive demonstration page
- ✅ `src/domains/demo/ContainerQueriesDemo.stories.tsx` - 7 Storybook story variants

### Components Updated

- ✅ `Card.tsx` - Added `responsive` prop with container query support
- ✅ `Modal.tsx` - Added `responsive` prop with container query support

### Integration

- ✅ Imported into `src/styles/index.css`
- ✅ Available throughout application
- ✅ Backward compatible (responsive defaults to false)

## Browser Support

| Browser     | Version | Release Date   | Support |
| ----------- | ------- | -------------- | ------- |
| Chrome/Edge | 105+    | September 2022 | ✅      |
| Safari      | 16+     | September 2022 | ✅      |
| Firefox     | 110+    | February 2023  | ✅      |

**Global Support: ~92%** (as of 2025)

## Container Types

### 1. Card Container (`container-card`)

Adapt card layouts based on available space:

```tsx
<Card responsive variant="elevated">
  <div className="card-header">...</div>
  <div className="card-body">...</div>
  <div className="card-actions">...</div>
</Card>
```

**Breakpoints:**

- **Compact (< 400px)**: Vertical stack, full-width elements
- **Medium (400-600px)**: Flex layouts with wrapping
- **Large (> 600px)**: Grid layouts, optimal spacing

### 2. Modal Container (`container-modal`)

Modals adapt padding and button layout:

```tsx
<Modal responsive size="lg" isOpen={isOpen} onClose={onClose}>
  <div className="modal-body">...</div>
</Modal>
```

**Breakpoints:**

- **Compact (< 500px)**: Full-width buttons, reduced padding
- **Medium (500-768px)**: Horizontal buttons, moderate padding
- **Large (> 768px)**: Full padding, optimal spacing

### 3. Table Container (`container-table`)

Tables transform based on available space:

```tsx
<div className="container-table">
  <table className="table-responsive">...</table>
</div>
```

**Breakpoints:**

- **Card view (< 640px)**: Stacked card layout
- **Scroll (640-1024px)**: Horizontal scrolling
- **Full (> 1024px)**: Normal table layout

### 4. Form Container (`container-form`)

Forms adjust column layout automatically:

```tsx
<form className="container-form form-responsive">
  <div className="form-group">...</div>
  <div className="form-group-full">...</div>
  <div className="form-actions">...</div>
</form>
```

**Breakpoints:**

- **Single column (< 640px)**: Stack all fields
- **Two columns (640-1024px)**: Group in 2 columns
- **Three columns (> 1024px)**: Full 3-column layout

### 5. Sidebar Container (`container-sidebar`)

Sidebars collapse to icon-only:

```tsx
<aside className="container-sidebar sidebar-responsive">
  <div className="sidebar-item">
    <span className="sidebar-icon">🏠</span>
    <span className="sidebar-text">Home</span>
  </div>
</aside>
```

**Breakpoints:**

- **Collapsed (< 240px)**: Icon-only navigation
- **Expanded (> 240px)**: Icons with text labels

### 6. Main Container (`container-main`)

General-purpose container for page layouts:

```tsx
<main className="container-main">{content}</main>
```

## Utility Classes

### Fluid Typography

Use container query units (cqw) for fluid typography:

```tsx
<h1 className="text-cq-xl">Responsive Heading</h1>
<h2 className="text-cq-lg">Subheading</h2>
<p className="text-cq">Body text</p>
```

**Classes:**

- `text-cq`: `clamp(1rem, 2cqw + 0.5rem, 1.5rem)`
- `text-cq-lg`: `clamp(1.25rem, 3cqw + 0.75rem, 2rem)`
- `text-cq-xl`: `clamp(1.5rem, 4cqw + 1rem, 2.5rem)`

### Fluid Spacing

```tsx
<div className="padding-cq-md gap-cq-sm">{content}</div>
```

**Padding Classes:**

- `padding-cq-sm`: `clamp(0.5rem, 2cqw, 1rem)`
- `padding-cq-md`: `clamp(1rem, 3cqw, 2rem)`
- `padding-cq-lg`: `clamp(1.5rem, 4cqw, 3rem)`

**Gap Classes:**

- `gap-cq-sm`: `clamp(0.5rem, 2cqw, 1rem)`
- `gap-cq-md`: `clamp(1rem, 3cqw, 2rem)`
- `gap-cq-lg`: `clamp(1.5rem, 4cqw, 3rem)`

## Debug Utilities

### Support Detection

Check if browser supports container queries:

```tsx
const hasSupport = CSS.supports('container-type: inline-size');

if (hasSupport) {
  element.classList.add('container-card', 'card-responsive');
} else {
  // Fallback to media queries
  element.classList.add('fallback-responsive');
}
```

### Visual Debug Indicator

Add debug class to see support status:

```tsx
<div className="container-card container-debug">
  {/* Shows green "CQ: Supported" or red "CQ: Not Supported" badge */}
</div>
```

## Usage Examples

### Example 1: Responsive Card in Sidebar

```tsx
// Card adapts to narrow sidebar context
<aside className="w-64">
  <Card responsive variant="elevated">
    <h3>Quick Stats</h3>
    <p>Compact layout in sidebar</p>
  </Card>
</aside>
```

### Example 2: Responsive Modal

```tsx
function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal
      responsive
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="User Settings"
      size="lg"
      footer={
        <>
          <button>Cancel</button>
          <button>Save</button>
        </>
      }
    >
      <form className="container-form form-responsive">{/* Form adapts to modal size */}</form>
    </Modal>
  );
}
```

### Example 3: Responsive Data Table

```tsx
<div className="container-table bg-white rounded-lg shadow">
  <table className="table-responsive w-full">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td data-label="Name">John Doe</td>
        <td data-label="Email">john@example.com</td>
        <td data-label="Role">Admin</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Note:** `data-label` attributes are used for mobile card view.

### Example 4: Responsive Form

```tsx
<Card responsive>
  <form className="container-form form-responsive">
    <div className="form-group">
      <label>First Name</label>
      <input type="text" />
    </div>

    <div className="form-group">
      <label>Last Name</label>
      <input type="text" />
    </div>

    <div className="form-group form-group-full">
      <label>Email</label>
      <input type="email" />
    </div>

    <div className="form-actions">
      <button type="button">Cancel</button>
      <button type="submit">Save</button>
    </div>
  </form>
</Card>
```

## Testing the Implementation

### 1. View the Demo Page

Access the interactive demo:

```
http://localhost:5175/demo/container-queries
```

Or view in Storybook:

```bash
npm run storybook
# Navigate to Features > Container Queries
```

### 2. Test Scenarios

- ✅ **Small Container (384px)**: Click "Small" button
- ✅ **Medium Container (672px)**: Click "Medium" button
- ✅ **Large Container (1152px)**: Click "Large" button
- ✅ **Resize Browser**: Components remain responsive
- ✅ **Dark Mode**: Container queries work with dark mode

### 3. Storybook Stories

Available stories:

1. **FullDemo** - Complete interactive demonstration
2. **SmallContainer** - Fixed 384px width
3. **MediumContainer** - Fixed 672px width
4. **LargeContainer** - Fixed 1152px width
5. **SideBySideComparison** - Compare different sizes
6. **DarkMode** - Container queries in dark mode
7. **BrowserSupport** - Support detection and compatibility info

## Benefits Over Media Queries

| Aspect                  | Media Queries            | Container Queries  |
| ----------------------- | ------------------------ | ------------------ |
| **Responds to**         | Viewport size            | Container size     |
| **Reusability**         | Context-dependent        | Fully reusable     |
| **Composition**         | Difficult                | Natural            |
| **Maintenance**         | Breakpoint proliferation | Container-specific |
| **Component isolation** | No                       | Yes                |

## Performance Considerations

✅ **No JavaScript Required**: Pure CSS solution
✅ **No Runtime Overhead**: Browser handles all calculations
✅ **Progressive Enhancement**: Fallbacks for older browsers
✅ **No Re-layout Thrashing**: Efficient browser optimization

## Migration from Media Queries

### Before (Media Queries)

```css
.card {
  padding: 1rem;
}

@media (min-width: 640px) {
  .card {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .card {
    padding: 2rem;
  }
}
```

### After (Container Queries)

```css
.container-card {
  container-type: inline-size;
}

.card-responsive {
  padding: 1rem;
}

@container card (min-width: 640px) {
  .card-responsive {
    padding: 1.5rem;
  }
}

@container card (min-width: 1024px) {
  .card-responsive {
    padding: 2rem;
  }
}
```

## Fallback Strategy

For browsers without container query support:

```tsx
// Option 1: Feature detection
const hasContainerQueries = CSS.supports('container-type: inline-size');

if (hasContainerQueries) {
  // Use container queries
  return <Card responsive />;
} else {
  // Use media queries fallback
  return <Card />;
}

// Option 2: CSS fallback
@supports not (container-type: inline-size) {
  /* Media query fallbacks */
  .card-responsive {
    /* Traditional responsive styles */
  }
}
```

## Next Steps

### Additional Components to Update

Consider adding container query support to:

1. ✅ Card (completed)
2. ✅ Modal (completed)
3. ⏳ DataTable
4. ⏳ Select/Dropdown
5. ⏳ Tabs
6. ⏳ Accordion
7. ⏳ Navigation

### Usage Pattern

```tsx
// Standard pattern for adding container query support
interface ComponentProps {
  responsive?: boolean; // Default: false
  // ... other props
}

function Component({ responsive = false, ...props }: ComponentProps) {
  const containerClasses = responsive ? 'container-{type} {type}-responsive' : '';

  return <div className={`base-classes ${containerClasses}`}>{/* Component content */}</div>;
}
```

## Resources

- **MDN Documentation**: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries
- **Can I Use**: https://caniuse.com/css-container-queries
- **Browser Support**: Chrome 105+, Safari 16+, Firefox 110+
- **Demo Page**: `/demo/container-queries`
- **Storybook**: Features > Container Queries

## Conclusion

Container queries provide a powerful, modern approach to responsive design that creates truly reusable components. The implementation is production-ready with excellent browser support and no performance overhead.

---

**Status**: ✅ Implemented and ready for use
**Browser Support**: 92% global coverage
**Performance**: No overhead
**Integration**: Imported in main stylesheet
**Documentation**: Complete with examples
**Testing**: Interactive demo and Storybook stories available
