import type { Meta, StoryObj } from '@storybook/react-vite';
import { Loader } from 'lucide-react';
import { Button } from './Button';

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
      description: 'Visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    isLoading: {
      control: 'boolean',
      description: 'Loading state with spinner',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width button',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Stories
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    size: 'md',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
    size: 'md',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
    size: 'md',
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
    size: 'md',
  },
};

// Size Variants
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

// States
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    isLoading: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

// Interactive Examples
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Loader className="w-4 h-4 mr-2" />
        Button with Icon
      </>
    ),
    variant: 'primary',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-8">
      <div className="flex gap-4 flex-wrap">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Button variant="primary" size="sm">
          Small
        </Button>
        <Button variant="primary" size="md">
          Medium
        </Button>
        <Button variant="primary" size="lg">
          Large
        </Button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Button variant="primary" disabled>
          Disabled
        </Button>
        <Button variant="primary" isLoading>
          Loading
        </Button>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-8">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    children: 'Dark Mode Button',
    variant: 'primary',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// Polymorphic Button (as link)
export const AsLink: Story = {
  args: {
    children: 'Link Button',
    as: 'a',
    href: 'https://example.com',
    variant: 'primary',
  },
};
