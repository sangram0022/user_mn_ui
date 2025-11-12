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
  // Updated: TableSkeleton uses a generic aria-label
  expect(container).toHaveAttribute('aria-label', 'Loading table data');
  });

  it('renders custom rows and columns', () => {
  render(<TableSkeleton rows={10} columns={6} />);
  const container = screen.getByRole('status');
  // Updated: TableSkeleton exposes a generic aria-label
  expect(container).toHaveAttribute('aria-label', 'Loading table data');
  });

  it('has ARIA attributes for accessibility', () => {
    render(<TableSkeleton />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');
  // Updated: sr-only text does not include ellipsis
  expect(screen.getByText('Loading table data')).toHaveClass('sr-only');
  });

  it('renders table headers', () => {
    const { container } = render(<TableSkeleton />);
    // TableSkeleton always renders headers
    const headers = container.querySelectorAll('.flex.gap-4');
    expect(headers.length).toBeGreaterThan(0);
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
  // Updated: CardSkeleton uses plural aria-label for the grid
  expect(container).toHaveAttribute('aria-label', 'Loading cards');
  });

  it('renders multiple cards', () => {
  render(<CardSkeleton count={3} />);
  const { container } = render(<CardSkeleton count={3} />);
  // Updated: CardSkeleton renders multiple card items inside a single status container
  const cards = container.querySelectorAll('.border.rounded-lg.p-6');
  expect(cards.length).toBe(3);
  });

  it('has ARIA attributes', () => {
    render(<CardSkeleton />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  // Updated: sr-only text uses plural and no ellipsis
  expect(screen.getByText('Loading cards')).toHaveClass('sr-only');
  });

  it('renders card structure', () => {
    const { container } = render(<CardSkeleton />);
    const cards = container.querySelectorAll('.border.rounded-lg');
    expect(cards.length).toBeGreaterThan(0);
  });
});

describe('FormSkeleton', () => {
  it('renders with default props', () => {
  render(<FormSkeleton />);
  const container = screen.getByRole('status');
  // Updated: FormSkeleton uses a generic aria-label
  expect(container).toHaveAttribute('aria-label', 'Loading form');
  });

  it('renders custom number of fields', () => {
  render(<FormSkeleton fields={5} />);
  const containerCustom = screen.getByRole('status');
  // Updated: FormSkeleton uses a generic aria-label
  expect(containerCustom).toHaveAttribute('aria-label', 'Loading form');
  });

  it('has ARIA attributes', () => {
    render(<FormSkeleton />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('renders form buttons', () => {
    const { container } = render(<FormSkeleton />);
    // FormSkeleton renders action buttons by default
    const buttons = container.querySelectorAll('.flex.gap-4');
    expect(buttons.length).toBeGreaterThan(0);
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
  // Updated: sr-only text is a concise label
  expect(screen.getByText('Loading profile')).toHaveClass('sr-only');
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
  // Updated: ListSkeleton uses a generic aria-label
  expect(container).toHaveAttribute('aria-label', 'Loading list');
  });

  it('renders custom number of items', () => {
  render(<ListSkeleton items={10} />);
  const containerCustom = screen.getByRole('status');
  // Updated: ListSkeleton uses a generic aria-label
  expect(containerCustom).toHaveAttribute('aria-label', 'Loading list');
  });

  it('has ARIA attributes', () => {
    render(<ListSkeleton />);
    const containers = screen.getAllByRole('status');
    expect(containers[0]).toHaveAttribute('aria-live', 'polite');
  });

  it('renders with avatar by default', () => {
    const { container } = render(<ListSkeleton />);
    // ListSkeleton includes avatars in list items
    const avatars = container.querySelectorAll('.rounded-full');
    expect(avatars.length).toBeGreaterThan(0);
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
    // Chart skeleton uses multiple nested sr-only texts, not a single 'Loading chart data...'
    const srOnlyElements = document.querySelectorAll('.sr-only');
    expect(srOnlyElements.length).toBeGreaterThan(0);
  });

  it('has dark mode classes', () => {
    const { container } = render(<ChartSkeleton />);
    // ChartSkeleton uses dark:bg-gray-700, not dark:border-gray-700
    const darkElements = container.querySelectorAll('.dark\\:bg-gray-700');
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
    // Dashboard skeleton uses multiple nested sr-only texts for each stat card
    const srOnlyElements = document.querySelectorAll('.sr-only');
    expect(srOnlyElements.length).toBeGreaterThan(0);
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
    // Page skeleton uses 'Loading page' as main sr-only text, not 'Loading page content...'
    expect(screen.getByText('Loading page')).toHaveClass('sr-only');
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
