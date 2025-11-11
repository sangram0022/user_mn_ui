/**
 * Tests for Advanced Skeleton Components
 * 
 * Tests:
 * - Component rendering
 * - ARIA attributes
 * - Dark mode support
 * - Props validation
 * - Accessibility compliance
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  TableSkeleton,
  CardSkeleton,
  FormSkeleton,
  ProfileSkeleton,
  ListSkeleton,
  ChartSkeleton,
  DashboardSkeleton,
  PageSkeleton,
} from '../Skeletons';

describe('TableSkeleton', () => {
  it('renders with default props', () => {
    render(<TableSkeleton />);
    const container = screen.getByRole('status');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-label', 'Loading table with 5 rows and 4 columns');
  });

  it('renders custom rows and columns', () => {
    render(<TableSkeleton rows={10} columns={6} />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-label', 'Loading table with 10 rows and 6 columns');
  });

  it('has ARIA attributes for accessibility', () => {
    render(<TableSkeleton />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading table data...')).toHaveClass('sr-only');
  });

  it('applies showHeader prop correctly', () => {
    const { container } = render(<TableSkeleton showHeader={false} />);
    // When showHeader is false, there should be no header divider
    const dividers = container.querySelectorAll('.border-b');
    expect(dividers.length).toBe(0);
  });

  it('has dark mode classes', () => {
    const { container } = render(<TableSkeleton />);
    const elements = container.querySelectorAll('.dark\\:bg-gray-700');
    expect(elements.length).toBeGreaterThan(0);
  });
});

describe('CardSkeleton', () => {
  it('renders with default props', () => {
    render(<CardSkeleton />);
    const container = screen.getByRole('status');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-label', 'Loading card');
  });

  it('renders multiple cards', () => {
    render(<CardSkeleton count={3} />);
    const containers = screen.getAllByRole('status');
    expect(containers).toHaveLength(3);
  });

  it('has ARIA attributes', () => {
    render(<CardSkeleton />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading card...')).toHaveClass('sr-only');
  });

  it('applies showImage prop correctly', () => {
    const { container } = render(<CardSkeleton showImage={false} />);
    const images = container.querySelectorAll('.h-48');
    expect(images.length).toBe(0);
  });
});

describe('FormSkeleton', () => {
  it('renders with default props', () => {
    render(<FormSkeleton />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-label', 'Loading form with 3 fields');
  });

  it('renders custom number of fields', () => {
    render(<FormSkeleton fields={5} />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-label', 'Loading form with 5 fields');
  });

  it('has ARIA attributes', () => {
    render(<FormSkeleton />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('applies showButtons prop correctly', () => {
    const { container } = render(<FormSkeleton showButtons={false} />);
    const buttons = container.querySelectorAll('.h-10.w-24');
    expect(buttons.length).toBe(0);
  });
});

describe('ProfileSkeleton', () => {
  it('renders correctly', () => {
    render(<ProfileSkeleton />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-label', 'Loading profile');
  });

  it('has ARIA attributes', () => {
    render(<ProfileSkeleton />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading profile information...')).toHaveClass('sr-only');
  });

  it('contains avatar skeleton', () => {
    const { container } = render(<ProfileSkeleton />);
    const avatar = container.querySelector('.rounded-full.h-24.w-24');
    expect(avatar).toBeInTheDocument();
  });
});

describe('ListSkeleton', () => {
  it('renders with default props', () => {
    render(<ListSkeleton />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-label', 'Loading list with 5 items');
  });

  it('renders custom number of items', () => {
    render(<ListSkeleton items={10} />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-label', 'Loading list with 10 items');
  });

  it('has ARIA attributes', () => {
    render(<ListSkeleton />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('applies showAvatar prop correctly', () => {
    const { container } = render(<ListSkeleton showAvatar={false} />);
    const avatars = container.querySelectorAll('.rounded-full');
    expect(avatars.length).toBe(0);
  });
});

describe('ChartSkeleton', () => {
  it('renders correctly', () => {
    render(<ChartSkeleton />);
    const containers = screen.getAllByRole('status');
    expect(containers.length).toBeGreaterThan(0);
    expect(containers[0]).toHaveAttribute('aria-label', 'Loading chart');
  });

  it('has ARIA attributes', () => {
    render(<ChartSkeleton />);
    const containers = screen.getAllByRole('status');
    expect(containers[0]).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading chart data...')).toHaveClass('sr-only');
  });

  it('has dark mode classes', () => {
    const { container } = render(<ChartSkeleton />);
    const darkElements = container.querySelectorAll('.dark\\:border-gray-700');
    expect(darkElements.length).toBeGreaterThan(0);
  });
});

describe('DashboardSkeleton', () => {
  it('renders correctly', () => {
    render(<DashboardSkeleton />);
    const containers = screen.getAllByRole('status');
    expect(containers.length).toBeGreaterThan(0);
    expect(containers[0]).toHaveAttribute('aria-label', 'Loading dashboard');
  });

  it('has ARIA attributes', () => {
    render(<DashboardSkeleton />);
    const containers = screen.getAllByRole('status');
    expect(containers[0]).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading dashboard...')).toHaveClass('sr-only');
  });

  it('contains metric cards', () => {
    const { container } = render(<DashboardSkeleton />);
    const cards = container.querySelectorAll('.border.rounded-lg.p-6');
    expect(cards.length).toBeGreaterThan(0);
  });
});

describe('PageSkeleton', () => {
  it('renders correctly', () => {
    render(<PageSkeleton />);
    const containers = screen.getAllByRole('status');
    expect(containers.length).toBeGreaterThan(0);
    expect(containers[0]).toHaveAttribute('aria-label', 'Loading page');
  });

  it('has ARIA attributes', () => {
    render(<PageSkeleton />);
    const containers = screen.getAllByRole('status');
    expect(containers[0]).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading page content...')).toHaveClass('sr-only');
  });

  it('has dark mode classes', () => {
    const { container } = render(<PageSkeleton />);
    const darkElements = container.querySelectorAll('.dark\\:bg-gray-900');
    expect(darkElements.length).toBeGreaterThan(0);
  });
});

// Accessibility tests
describe('Accessibility Tests', () => {
  it('all skeletons have role="status"', () => {
    const { container: table } = render(<TableSkeleton />);
    const { container: card } = render(<CardSkeleton />);
    const { container: form } = render(<FormSkeleton />);
    const { container: profile } = render(<ProfileSkeleton />);
    
    expect(table.querySelector('[role="status"]')).toBeInTheDocument();
    expect(card.querySelector('[role="status"]')).toBeInTheDocument();
    expect(form.querySelector('[role="status"]')).toBeInTheDocument();
    expect(profile.querySelector('[role="status"]')).toBeInTheDocument();
  });

  it('all skeletons have aria-live="polite"', () => {
    render(<TableSkeleton />);
    render(<CardSkeleton />);
    render(<FormSkeleton />);
    render(<ProfileSkeleton />);
    
    const statusElements = screen.getAllByRole('status');
    statusElements.forEach(element => {
      expect(element).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('all skeletons have sr-only text', () => {
    render(<TableSkeleton />);
    render(<CardSkeleton />);
    render(<FormSkeleton />);
    render(<ProfileSkeleton />);
    
    const srOnlyElements = document.querySelectorAll('.sr-only');
    expect(srOnlyElements.length).toBeGreaterThan(0);
  });
});

// Animation tests
describe('Animation Tests', () => {
  it('skeleton elements have shimmer animation', () => {
    const { container } = render(<TableSkeleton />);
    const animatedElements = container.querySelectorAll('.animate-shimmer');
    expect(animatedElements.length).toBeGreaterThan(0);
  });

  it('uses bg-gradient-to-r for shimmer effect', () => {
    const { container } = render(<CardSkeleton />);
    const gradientElements = container.querySelectorAll('.bg-gradient-to-r');
    expect(gradientElements.length).toBeGreaterThan(0);
  });
});
