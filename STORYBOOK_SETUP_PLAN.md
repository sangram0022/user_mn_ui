# Phase 2: Component Documentation with Storybook

**Status**: 🚧 IN PROGRESS  
**Priority**: HIGH (P2)  
**Estimated Time**: 2 days (8-10 hours)  
**Started**: October 15, 2025

---

## Overview

Setting up Storybook 8.x for comprehensive component documentation, including:

- Interactive component playground
- Prop documentation
- Usage examples
- Accessibility testing
- Visual regression baseline

---

## Implementation Plan

### Step 1: Install Storybook (30 mins)

- ✅ Install Storybook 8.x with Vite builder
- ✅ Configure for React + TypeScript
- ✅ Set up essential addons

### Step 2: Configure Integration (1 hour)

- ✅ Integrate with existing Tailwind CSS
- ✅ Support design tokens
- ✅ Enable dark mode toggle
- ✅ Add viewport configurations

### Step 3: Create Core Stories (4 hours)

Priority components:

1. **Button** (polymorphic, variants, sizes, states)
2. **Alert** (all variants, dismissible, with actions)
3. **Skeleton** (animations, grid, variants)
4. **Modal** (sizes, scroll behavior, focus trap)
5. **Badge** (variants, sizes)
6. **Input/Form** (validation, states)

### Step 4: Advanced Stories (2 hours)

- VirtualUserTable (virtualization demo)
- ErrorBoundary (error simulation)
- Toast system (notification variants)

### Step 5: Documentation Pages (1 hour)

- Design system overview
- Color tokens reference
- Typography scale
- Spacing system
- Animation guidelines

### Step 6: Testing Setup (30 mins)

- Accessibility addon
- Visual regression baseline
- Interaction testing

---

## Installation Commands

```bash
# Install Storybook CLI
npx storybook@latest init --type react

# Essential Addons
npm install --save-dev @storybook/addon-essentials
npm install --save-dev @storybook/addon-interactions
npm install --save-dev @storybook/addon-a11y
npm install --save-dev @storybook/addon-links
npm install --save-dev @storybook/addon-themes

# Testing utilities
npm install --save-dev @storybook/test
npm install --save-dev @storybook/testing-library
```

---

## Configuration Files

### `.storybook/main.ts`

```typescript
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': '/src',
          '@shared': '/src/shared',
          '@domains': '/src/domains',
          '@hooks': '/src/hooks',
          '@lib': '/src/lib',
        },
      },
    });
  },
};

export default config;
```

### `.storybook/preview.ts`

```typescript
import type { Preview } from '@storybook/react';
import '../src/styles/index-new.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
```

---

## Sample Stories

### Button.stories.tsx

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@shared/components/ui/Button/Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};
```

---

## Progress Tracking

### ✅ Completed

- Initial planning and architecture

### 🚧 In Progress

- Storybook installation

### ⏳ Todo

- Configuration setup
- Core component stories
- Advanced component stories
- Documentation pages
- Testing setup

---

## Success Criteria

- [ ] Storybook runs successfully (`npm run storybook`)
- [ ] All priority components have stories
- [ ] Dark mode toggle works
- [ ] Accessibility checks pass
- [ ] Interactive examples demonstrate all props
- [ ] Documentation pages complete
- [ ] Visual regression baseline captured

---

## Timeline

| Day       | Task                                           | Hours    |
| --------- | ---------------------------------------------- | -------- |
| Day 1     | Setup + Core Stories (Button, Alert, Skeleton) | 5-6      |
| Day 2     | Advanced Stories + Documentation               | 3-4      |
| **Total** |                                                | **8-10** |

---

## Next Steps

1. Run Storybook installation command
2. Configure integration with Vite + Tailwind
3. Create Button story (template for others)
4. Document design tokens
5. Set up accessibility testing
