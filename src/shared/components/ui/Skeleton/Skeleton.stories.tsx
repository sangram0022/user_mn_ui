import { Skeleton } from '@shared/components/ui/Skeleton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular', 'rounded'],
      description: 'Shape variant of the skeleton',
    },
    animation: {
      control: 'select',
      options: ['pulse', 'wave', 'none'],
      description: 'Animation type',
    },
    width: {
      control: 'text',
      description: 'Width (CSS value)',
    },
    height: {
      control: 'text',
      description: 'Height (CSS value)',
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Variants
export const Text: Story = {
  args: {
    variant: 'text',
    width: '200px',
  },
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: '40px',
    height: '40px',
  },
};

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    width: '300px',
    height: '200px',
  },
};

export const Rounded: Story = {
  args: {
    variant: 'rounded',
    width: '300px',
    height: '200px',
  },
};

// Animation Types
export const PulseAnimation: Story = {
  args: {
    variant: 'rectangular',
    animation: 'pulse',
    width: '300px',
    height: '150px',
  },
};

export const WaveAnimation: Story = {
  args: {
    variant: 'rectangular',
    animation: 'wave',
    width: '300px',
    height: '150px',
  },
};

export const NoAnimation: Story = {
  args: {
    variant: 'rectangular',
    animation: 'none',
    width: '300px',
    height: '150px',
  },
};

// Complex Layouts
export const UserCard: Story = {
  render: () => (
    <div className="flex items-start gap-4 p-4 border border-[var(--color-border)] rounded-lg max-w-md">
      <Skeleton variant="circular" width="48px" height="48px" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="80%" />
      </div>
    </div>
  ),
};

export const ContentCard: Story = {
  render: () => (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden max-w-sm">
      <Skeleton variant="rectangular" width="100%" height="200px" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  ),
};

export const SkeletonGrid: Story = {
  render: () => (
    <Skeleton.Grid columns={3} className="gap-4">
      {Array.from({ length: 6 }, (_, i) => ({ id: `grid-item-${i}` })).map(({ id }) => (
        <div key={id} className="border border-[var(--color-border)] rounded-lg overflow-hidden">
          <Skeleton variant="rectangular" width="100%" height="150px" />
          <div className="p-3 space-y-2">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
          </div>
        </div>
      ))}
    </Skeleton.Grid>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const TableRows: Story = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      {Array.from({ length: 5 }, (_, i) => ({ id: `table-row-${i}` })).map(({ id }) => (
        <div key={id} className="flex items-center gap-4">
          <Skeleton variant="circular" width="32px" height="32px" />
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="25%" />
          <Skeleton variant="text" width="20%" />
        </div>
      ))}
    </div>
  ),
};

export const Dashboard: Story = {
  render: () => (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="200px" height="32px" />
        <Skeleton variant="rounded" width="120px" height="36px" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }, (_, i) => ({ id: `stat-card-${i}` })).map(({ id }) => (
          <div key={id} className="p-4 border border-[var(--color-border)] rounded-lg space-y-2">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" height="24px" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <Skeleton variant="rectangular" width="100%" height="300px" />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const DarkMode: Story = {
  args: {
    variant: 'rectangular',
    width: '300px',
    height: '200px',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};
