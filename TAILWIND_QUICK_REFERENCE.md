# 🚀 Tailwind v4 Quick Reference - User Management UI

## Component Classes (Minimal Custom CSS)

### Buttons

```html
<!-- Primary Button -->
<button class="btn btn-primary">Click Me</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Cancel</button>

<!-- Button Sizes -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-lg">Large</button>

<!-- Disabled -->
<button class="btn btn-primary" disabled>Disabled</button>
```

### Forms

```html
<!-- Input Field -->
<div>
  <label class="form-label" for="email">Email</label>
  <input class="form-input" id="email" type="email" />
  <p class="form-error">Error message</p>
</div>

<!-- With Icon -->
<div class="relative">
  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <Mail class="w-5 h-5 text-gray-400" />
  </div>
  <input class="form-input pl-10" />
</div>
```

### Cards

```html
<!-- Basic Card -->
<div class="card">
  <div class="card-body">
    <h3>Title</h3>
    <p>Content</p>
  </div>
</div>

<!-- Feature Card -->
<div class="card">
  <div class="card-body space-y-4">
    <Shield class="w-12 h-12 text-blue-600" />
    <h3 class="text-xl font-semibold">Feature</h3>
    <p class="text-gray-600">Description</p>
  </div>
</div>
```

## Common Tailwind Patterns

### Layout

```html
<!-- Centered Container -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">Content</div>

<!-- Flex Row with Gap -->
<div class="flex items-center gap-4">Item 1 | Item 2</div>

<!-- Responsive Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">Card | Card | Card</div>

<!-- Full Height Page -->
<div class="min-h-screen flex flex-col">Header | Content | Footer</div>
```

### Spacing

```html
<!-- Stack (Vertical Spacing) -->
<div class="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Inline (Horizontal Spacing) -->
<div class="space-x-4">
  <span>Item 1</span>
  <span>Item 2</span>
</div>

<!-- Padding -->
<div class="p-4">All sides</div>
<div class="px-4 py-6">Horizontal & Vertical</div>

<!-- Margin -->
<div class="m-4">All sides</div>
<div class="mx-auto">Center horizontally</div>
```

### Typography

```html
<!-- Headings -->
<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold">Hero Title</h1>
<h2 class="text-3xl font-semibold">Section Title</h2>
<h3 class="text-xl font-medium">Card Title</h3>

<!-- Body Text -->
<p class="text-base text-gray-700">Regular text</p>
<p class="text-sm text-gray-600">Small text</p>
<p class="text-lg text-gray-800">Large text</p>

<!-- Text Alignment -->
<p class="text-left">Left</p>
<p class="text-center">Center</p>
<p class="text-right">Right</p>

<!-- Gradient Text -->
<span class="text-gradient">Gradient Text</span>
```

### Colors

```html
<!-- Text Colors -->
<p class="text-gray-900">Dark text</p>
<p class="text-gray-600">Medium text</p>
<p class="text-blue-600">Primary color</p>
<p class="text-red-600">Error</p>
<p class="text-green-600">Success</p>

<!-- Background Colors -->
<div class="bg-white">White background</div>
<div class="bg-gray-50">Light gray</div>
<div class="bg-blue-600">Primary color</div>

<!-- Gradients -->
<div class="bg-gradient-to-r from-blue-600 to-purple-600">Gradient background</div>
<div class="bg-gradient-to-br from-gray-50 via-white to-blue-50">Subtle gradient</div>
```

### Borders & Shadows

```html
<!-- Borders -->
<div class="border border-gray-200">Border</div>
<div class="border-2 border-blue-600">Thick border</div>
<div class="border-t border-b">Top and bottom</div>

<!-- Rounded Corners -->
<div class="rounded">Small radius</div>
<div class="rounded-lg">Medium radius</div>
<div class="rounded-xl">Large radius</div>
<div class="rounded-full">Full circle/pill</div>

<!-- Shadows -->
<div class="shadow-sm">Small shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
```

### Interactive States

```html
<!-- Hover -->
<button class="hover:bg-blue-700">Hover me</button>
<a class="hover:text-blue-700">Hover link</a>

<!-- Focus -->
<input class="focus:ring-2 focus:ring-blue-500" />

<!-- Active -->
<button class="active:bg-blue-800">Click me</button>

<!-- Disabled -->
<button class="disabled:opacity-50 disabled:cursor-not-allowed" disabled>Disabled</button>

<!-- Group Hover -->
<div class="group">
  <img class="group-hover:scale-110" />
  <p class="group-hover:text-blue-600">Hover parent</p>
</div>
```

### Animations

```html
<!-- Fade In -->
<div class="animate-fade-in">Fades in with slide up</div>

<!-- Slide In -->
<div class="animate-slide-in">Slides in from left</div>

<!-- Shimmer (Loading) -->
<div class="animate-shimmer">Loading shimmer effect</div>

<!-- Transitions -->
<div class="transition-all duration-200">Smooth transitions</div>
<div class="transition-colors duration-300">Color transitions only</div>
```

### Responsive Design

```html
<!-- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px) -->

<!-- Hide on mobile, show on desktop -->
<div class="hidden md:block">Desktop only</div>

<!-- Show on mobile, hide on desktop -->
<div class="block md:hidden">Mobile only</div>

<!-- Responsive sizes -->
<div class="text-sm md:text-base lg:text-lg">Responsive text</div>

<!-- Responsive grid -->
<div class="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">Responsive columns</div>

<!-- Responsive spacing -->
<div class="px-4 sm:px-6 lg:px-8">Responsive padding</div>
```

### Positioning

```html
<!-- Relative/Absolute -->
<div class="relative">
  <div class="absolute top-0 right-0">Positioned element</div>
</div>

<!-- Fixed -->
<div class="fixed top-0 left-0 right-0">Fixed header</div>

<!-- Sticky -->
<div class="sticky top-0">Sticky element</div>

<!-- Z-Index -->
<div class="z-10">Layer 10</div>
<div class="z-50">Layer 50</div>
```

## Page Templates

### Home Page Pattern

```tsx
<div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50">
  <Header />

  <section className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
    <div className="max-w-7xl mx-auto">
      <div className="text-center space-y-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
          <span className="text-gray-900">Secure User</span>
          <br />
          <span className="text-gradient">Management System</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-gray-600">Description text</p>

        <div className="flex gap-4 justify-center">
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  </section>
</div>
```

### Login/Register Pattern

```tsx
<div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 via-white to-blue-50">
  <div className="w-full max-w-md space-y-8">
    {/* Logo & Title */}
    <div className="text-center space-y-3">
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
        <Lock className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-3xl font-bold">Welcome Back</h2>
      <p className="text-gray-600">Sign in to continue</p>
    </div>

    {/* Form Card */}
    <div className="card">
      <div className="card-body space-y-6">
        <form className="space-y-5">{/* Form fields */}</form>
      </div>
    </div>
  </div>
</div>
```

### Dashboard Pattern

```tsx
<div className="min-h-screen bg-gray-50">
  <Header />

  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="card">
        <div className="card-body">{/* Main content */}</div>
      </div>
    </div>
  </main>
</div>
```

## CSS Variables (Available in `app.css`)

```css
/* Colors */
var(--color-primary)
var(--color-success)
var(--color-error)
var(--color-gray-50) to var(--color-gray-900)

/* Spacing */
var(--spacing-xs) to var(--spacing-3xl)

/* Typography */
var(--font-sans)
var(--text-xs) to var(--text-5xl)

/* Effects */
var(--shadow-sm) to var(--shadow-xl)
var(--radius-sm) to var(--radius-full)
var(--transition-fast/base/slow)
```

## Tips

1. **Use Tailwind utilities first** - 90% of styling
2. **Component classes sparingly** - Only for complex patterns
3. **Responsive by default** - Mobile-first approach
4. **Consistent spacing** - Use gap, space-y, space-x
5. **Semantic colors** - text-gray-600, text-blue-600, etc.
6. **Accessibility** - Always include focus states
7. **Performance** - Use transitions sparingly

## Common Mistakes to Avoid

❌ Don't create new CSS classes
✅ Use Tailwind utilities

❌ Don't use inline styles
✅ Use Tailwind classes

❌ Don't forget responsive variants
✅ Add sm:, md:, lg: breakpoints

❌ Don't stack too many utilities
✅ Extract to component if needed

---

**Quick Links**:

- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- [Color Reference](https://tailwindcss.com/docs/customizing-colors)
