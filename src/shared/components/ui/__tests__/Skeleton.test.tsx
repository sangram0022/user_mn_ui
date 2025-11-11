/**
 * Tests for UI Skeleton Components
 * 
 * Tests the sophisticated Skeleton.tsx components with
 * animation options and customization
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Skeleton, {
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonTable,
} from '../ui/Skeleton';

describe('Skeleton (base component)', () => {
  it('renders with default text variant', () => {
    render(<Skeleton />);
    const element = screen.getByRole('status');
    expect(element).toBeInTheDocument();
  });

  it('renders circular variant', () => {
    const { container } = render(<Skeleton variant="circular" />);
    const element = container.querySelector('.rounded-full');
    expect(element).toBeInTheDocument();
  });

  it('renders rectangular variant', () => {
    const { container } = render(<Skeleton variant="rectangular" />);
    const element = container.querySelector('.rounded-lg');
    expect(element).toBeInTheDocument();
  });

  it('applies custom width and height', () => {
    const { container } = render(<Skeleton width={200} height={100} />);
    const element = container.querySelector('[style*="width"]');
    expect(element).toHaveStyle({ width: '200px', height: '100px' });
  });

  it('supports pulse animation', () => {
    const { container } = render(<Skeleton animation="pulse" />);
    const element = container.querySelector('.animate-pulse');
    expect(element).toBeInTheDocument();
  });

  it('supports wave animation (shimmer)', () => {
    const { container } = render(<Skeleton animation="wave" />);
    const element = container.querySelector('.animate-shimmer');
    expect(element).toBeInTheDocument();
  });

  it('supports no animation', () => {
    const { container } = render(<Skeleton animation="none" />);
    const element = container.querySelector('[class*="animate"]');
    expect(element).toBeNull();
  });

  it('has ARIA attributes', () => {
    render(<Skeleton />);
    const element = screen.getByRole('status');
    expect(element).toHaveAttribute('aria-label');
    expect(element).toHaveAttribute('aria-live', 'polite');
  });

  it('has dark mode support', () => {
    const { container } = render(<Skeleton />);
    const element = container.querySelector('.dark\\:bg-gray-700');
    expect(element).toBeInTheDocument();
  });
});

describe('SkeletonText (UI)', () => {
  it('renders with default 3 lines', () => {
    render(<SkeletonText />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-label', 'Loading 3 lines of text');
  });

  it('renders custom number of lines', () => {
    render(<SkeletonText lines={5} />);
    const container = screen.getByRole('status');
    const lines = container.querySelectorAll('.h-4');
    expect(lines).toHaveLength(5);
  });

  it('has natural width variation', () => {
    const { container } = render(<SkeletonText lines={3} />);
    const lines = container.querySelectorAll('.h-4');
    
    // Check last line is shorter (80%)
    const lastLine = lines[lines.length - 1];
    expect(lastLine).toHaveStyle({ width: '80%' });
  });

  it('has ARIA attributes', () => {
    render(<SkeletonText />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading text content...')).toHaveClass('sr-only');
  });
});

describe('SkeletonCard (UI)', () => {
  it('renders correctly', () => {
    render(<SkeletonCard />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('contains image placeholder', () => {
    const { container } = render(<SkeletonCard />);
    const image = container.querySelector('.h-\\[200px\\]');
    expect(image).toBeInTheDocument();
  });

  it('contains title placeholder', () => {
    const { container } = render(<SkeletonCard />);
    const title = container.querySelector('.h-6');
    expect(title).toBeInTheDocument();
  });

  it('contains text lines', () => {
    const { container } = render(<SkeletonCard />);
    const textLines = container.querySelectorAll('.h-4');
    expect(textLines.length).toBeGreaterThan(0);
  });

  it('contains button placeholders', () => {
    const { container } = render(<SkeletonCard />);
    const buttons = container.querySelectorAll('.h-8.w-20');
    expect(buttons.length).toBe(2);
  });

  it('has ARIA attributes', () => {
    render(<SkeletonCard />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading card...')).toHaveClass('sr-only');
  });

  it('has dark mode support', () => {
    const { container } = render(<SkeletonCard />);
    const darkElements = container.querySelectorAll('.dark\\:border-gray-700');
    expect(darkElements.length).toBeGreaterThan(0);
  });
});

describe('SkeletonAvatar (UI)', () => {
  it('renders with default size', () => {
    const { container } = render(<SkeletonAvatar />);
    const element = container.querySelector('.rounded-full');
    expect(element).toHaveStyle({ width: 40, height: 40 });
  });

  it('renders with custom size', () => {
    const { container } = render(<SkeletonAvatar size={64} />);
    const element = container.querySelector('.rounded-full');
    expect(element).toHaveStyle({ width: 64, height: 64 });
  });

  it('is circular', () => {
    const { container } = render(<SkeletonAvatar />);
    const element = container.querySelector('.rounded-full');
    expect(element).toBeInTheDocument();
  });

  it('has ARIA attributes', () => {
    render(<SkeletonAvatar />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });
});

describe('SkeletonButton (UI)', () => {
  it('renders with default width', () => {
    const { container } = render(<SkeletonButton />);
    const element = container.querySelector('.h-10');
    expect(element).toHaveStyle({ width: 100 });
  });

  it('renders with custom width', () => {
    const { container } = render(<SkeletonButton width={150} />);
    const element = container.querySelector('.h-10');
    expect(element).toHaveStyle({ width: 150 });
  });

  it('has rounded corners', () => {
    const { container } = render(<SkeletonButton />);
    const element = container.querySelector('.rounded-lg');
    expect(element).toBeInTheDocument();
  });

  it('has ARIA attributes', () => {
    render(<SkeletonButton />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });
});

describe('SkeletonTable (UI)', () => {
  it('renders with default 5 rows and 4 columns', () => {
    render(<SkeletonTable />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-label', 'Loading table with 5 rows and 4 columns');
  });

  it('renders custom rows and columns', () => {
    render(<SkeletonTable rows={10} cols={6} />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-label', 'Loading table with 10 rows and 6 columns');
  });

  it('has header row', () => {
    const { container } = render(<SkeletonTable />);
    const header = container.querySelector('.border-b');
    expect(header).toBeInTheDocument();
  });

  it('renders correct number of data rows', () => {
    const { container } = render(<SkeletonTable rows={5} />);
    // Count all flex containers (header + rows)
    const allRows = container.querySelectorAll('.flex.gap-4');
    expect(allRows.length).toBe(6); // 1 header + 5 data rows
  });

  it('has ARIA attributes', () => {
    render(<SkeletonTable />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading table data...')).toHaveClass('sr-only');
  });

  it('has dark mode support', () => {
    const { container } = render(<SkeletonTable />);
    const darkElements = container.querySelectorAll('.dark\\:border-gray-700');
    expect(darkElements.length).toBeGreaterThan(0);
  });
});

// Comprehensive accessibility tests
describe('Accessibility Tests - UI Components', () => {
  it('all UI skeletons have role="status"', () => {
    render(<Skeleton />);
    render(<SkeletonText />);
    render(<SkeletonCard />);
    render(<SkeletonAvatar />);
    render(<SkeletonButton />);
    render(<SkeletonTable />);
    
    const statusElements = screen.getAllByRole('status');
    expect(statusElements.length).toBe(6);
  });

  it('all UI skeletons have aria-live="polite"', () => {
    render(<Skeleton />);
    render(<SkeletonText />);
    render(<SkeletonCard />);
    render(<SkeletonAvatar />);
    render(<SkeletonButton />);
    render(<SkeletonTable />);
    
    const statusElements = screen.getAllByRole('status');
    statusElements.forEach(element => {
      expect(element).toHaveAttribute('aria-live', 'polite');
    });
  });
});

// Animation tests
describe('Animation Tests - UI Components', () => {
  it('supports multiple animation types', () => {
    const { container: pulse } = render(<Skeleton animation="pulse" />);
    const { container: wave } = render(<Skeleton animation="wave" />);
    const { container: none } = render(<Skeleton animation="none" />);
    
    expect(pulse.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(wave.querySelector('.animate-shimmer')).toBeInTheDocument();
    expect(none.querySelector('[class*="animate"]')).toBeNull();
  });

  it('card uses pulse animation', () => {
    const { container } = render(<SkeletonCard />);
    const animatedElements = container.querySelectorAll('.animate-pulse');
    expect(animatedElements.length).toBeGreaterThan(0);
  });
});

// Dark mode tests
describe('Dark Mode Tests - UI Components', () => {
  it('all UI components support dark mode', () => {
    const { container: skeleton } = render(<Skeleton />);
    const { container: text } = render(<SkeletonText />);
    const { container: card } = render(<SkeletonCard />);
    const { container: avatar } = render(<SkeletonAvatar />);
    const { container: button } = render(<SkeletonButton />);
    const { container: table } = render(<SkeletonTable />);
    
    expect(skeleton.querySelector('.dark\\:bg-gray-700')).toBeInTheDocument();
    expect(text.querySelector('.dark\\:bg-gray-700')).toBeInTheDocument();
    expect(card.querySelector('.dark\\:border-gray-700')).toBeInTheDocument();
    expect(avatar.querySelector('.dark\\:bg-gray-700')).toBeInTheDocument();
    expect(button.querySelector('.dark\\:bg-gray-700')).toBeInTheDocument();
    expect(table.querySelector('.dark\\:border-gray-700')).toBeInTheDocument();
  });
});
