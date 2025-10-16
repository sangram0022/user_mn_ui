import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContainerQueriesDemo } from './ContainerQueriesDemo';

const meta = {
  title: 'Features/Container Queries',
  component: ContainerQueriesDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Container Queries Demo

A comprehensive demonstration of modern CSS container queries for component-based responsive design.

## Key Features

- **Component-Based Responsiveness**: Components adapt to their container, not the viewport
- **Card Layouts**: Responsive cards with flexible header, body, and action layouts
- **Table Transformations**: Tables convert to card views on narrow containers
- **Form Grids**: Forms automatically arrange fields in 1, 2, or 3 columns
- **Modal Adaptability**: Modals adjust padding and button layout based on available space

## Browser Support

- Chrome/Edge 105+ (September 2022)
- Safari 16+ (September 2022)  
- Firefox 110+ (February 2023)
- ~92% global browser support as of 2025

## Benefits

1. **True Component Reusability**: Components work perfectly in any layout context
2. **No Breakpoint Proliferation**: Container-based breakpoints instead of media queries
3. **Maintainability**: Responsive logic is colocated with component styles
4. **Performance**: No JavaScript required for responsive behavior

## Usage

\`\`\`tsx
// Enable container queries with the responsive prop
<Card responsive variant="elevated">
  {children}
</Card>

<Modal responsive size="lg" isOpen={isOpen} onClose={onClose}>
  {content}
</Modal>
\`\`\`

## Implementation Details

Container queries are defined in \`src/styles/container-queries.css\` with six main container types:

1. **Card Container** (\`container-card\`)
   - Compact: < 400px - Stack all elements vertically
   - Medium: 400px - 600px - Flex layouts with wrapping
   - Large: > 600px - Full layout with optimal spacing

2. **Modal Container** (\`container-modal\`)
   - Compact: < 500px - Reduced padding, full-width buttons
   - Medium: 500px - 768px - Moderate spacing
   - Large: > 768px - Full padding and spacing

3. **Table Container** (\`container-table\`)
   - Card view: < 640px - Convert to stacked cards
   - Scroll: 640px - 1024px - Horizontal scrolling
   - Full: > 1024px - Normal table layout

4. **Form Container** (\`container-form\`)
   - Single column: < 640px
   - Two columns: 640px - 1024px
   - Three columns: > 1024px

5. **Sidebar Container** (\`container-sidebar\`)
   - Collapsed: < 240px - Icons only
   - Expanded: > 240px - Icons with text

6. **Main Container** (\`container-main\`)
   - General-purpose container for page layouts
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ContainerQueriesDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Full interactive demo showing all container query features.
 *
 * **What to try:**
 * 1. Click the "Small", "Medium", "Large" buttons to resize the demo container
 * 2. Watch how cards, tables, and forms adapt to the container width
 * 3. Open the modal to see responsive behavior
 * 4. Resize your browser window to see viewport-independent behavior
 * 5. Check your browser's container query support indicator
 */
export const FullDemo: Story = {};

/**
 * Demo rendered in a narrow container (384px).
 *
 * Shows how components adapt to tight spaces:
 * - Cards: Vertical stacking, full-width elements
 * - Tables: Card-based layout with stacked fields
 * - Forms: Single column layout
 * - Modals: Compact padding, full-width buttons
 */
export const SmallContainer: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-sm mx-auto">
        <Story />
      </div>
    ),
  ],
};

/**
 * Demo rendered in a medium container (672px).
 *
 * Shows intermediate layouts:
 * - Cards: Flex layouts with some wrapping
 * - Tables: Horizontal scrolling
 * - Forms: Two-column layout
 * - Modals: Moderate spacing
 */
export const MediumContainer: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto">
        <Story />
      </div>
    ),
  ],
};

/**
 * Demo rendered in a large container (1152px).
 *
 * Shows optimal layouts:
 * - Cards: Full layout with optimal spacing
 * - Tables: Normal table display
 * - Forms: Three-column layout
 * - Modals: Full padding and spacing
 */
export const LargeContainer: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-6xl mx-auto">
        <Story />
      </div>
    ),
  ],
};

/**
 * Side-by-side comparison showing container query behavior.
 *
 * The same components render differently based on their container,
 * demonstrating true component-based responsive design.
 */
export const SideBySideComparison: Story = {
  render: () => (
    <div className="flex gap-4 p-4">
      <div className="w-96 border-2 border-blue-500 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-4 text-center">Small (384px)</h3>
        <ContainerQueriesDemo />
      </div>
      <div className="flex-1 border-2 border-green-500 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-4 text-center">Large (auto)</h3>
        <ContainerQueriesDemo />
      </div>
    </div>
  ),
};

/**
 * Dark mode variant of the demo.
 *
 * Container queries work seamlessly with dark mode,
 * maintaining responsive behavior across themes.
 */
export const DarkMode: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};

/**
 * Browser support check showing container query detection.
 *
 * Demonstrates how to detect container query support
 * and provide appropriate fallbacks.
 */
export const BrowserSupport: Story = {
  render: () => {
    const hasSupport = CSS.supports('container-type: inline-size');

    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Container Query Support</h1>
          <div
            className={`inline-block px-6 py-3 rounded-lg text-xl font-semibold ${
              hasSupport
                ? 'bg-green-100 text-green-800 border-2 border-green-500'
                : 'bg-red-100 text-red-800 border-2 border-red-500'
            }`}
          >
            {hasSupport ? '✓ Supported' : '✗ Not Supported'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Browser Compatibility</h2>
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Browser</th>
                <th className="px-4 py-2 text-left">Version</th>
                <th className="px-4 py-2 text-left">Release Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-2">Chrome/Edge</td>
                <td className="px-4 py-2">105+</td>
                <td className="px-4 py-2">September 2022</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Safari</td>
                <td className="px-4 py-2">16+</td>
                <td className="px-4 py-2">September 2022</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Firefox</td>
                <td className="px-4 py-2">110+</td>
                <td className="px-4 py-2">February 2023</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Detection Code</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{`// Check container query support
const hasSupport = CSS.supports('container-type: inline-size');

if (hasSupport) {
  // Use container queries
  element.classList.add('container-card', 'card-responsive');
} else {
  // Fallback to media queries
  element.classList.add('fallback-responsive');
}`}</code>
          </pre>
        </div>
      </div>
    );
  },
};
