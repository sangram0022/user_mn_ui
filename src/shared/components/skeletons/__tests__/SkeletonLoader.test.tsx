/**
 * Tests for Basic Skeleton Primitive Components
 * 
 * Tests:
 * - Component rendering
 * - ARIA attributes
 * - Dark mode support
 * - Custom props
 * - Accessibility
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  SkeletonLine,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
} from '../SkeletonLoader';

describe('SkeletonLine', () => {
  it('renders with default props', () => {
    render(<SkeletonLine />);
    const element = screen.getByRole('status');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('aria-label', 'Loading content');
  });

  it('applies custom width', () => {
    const { container } = render(<SkeletonLine width="w-1/2" />);
    const element = container.querySelector('.w-1\\/2');
    expect(element).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonLine className="mb-4" />);
    const element = container.querySelector('.mb-4');
    expect(element).toBeInTheDocument();
  });

  it('has ARIA attributes', () => {
    render(<SkeletonLine />);
    const element = screen.getByRole('status');
    expect(element).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });

  it('has dark mode classes', () => {
    const { container } = render(<SkeletonLine />);
    const element = container.querySelector('.dark\\:bg-gray-700');
    expect(element).toBeInTheDocument();
  });
});

describe('SkeletonText', () => {
  it('renders with default 3 lines', () => {
    render(<SkeletonText />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-label', 'Loading 3 lines of text');
  });

  it('renders custom number of lines', () => {
    render(<SkeletonText lines={5} />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-label', 'Loading 5 lines of text');
    
    const lines = container.querySelectorAll('.h-4');
    expect(lines).toHaveLength(5);
  });

  it('has varying widths for natural text appearance', () => {
    const { container } = render(<SkeletonText lines={3} />);
    const lines = container.querySelectorAll('.h-4');
    
    // Last line should be shorter
    expect(lines[2]).toHaveClass('w-2/3');
    expect(lines[1]).toHaveClass('w-3/4');
    expect(lines[0]).toHaveClass('w-full');
  });

  it('has ARIA attributes', () => {
    render(<SkeletonText />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading text content...')).toHaveClass('sr-only');
  });
});

describe('SkeletonCard', () => {
  it('renders correctly', () => {
    render(<SkeletonCard />);
    const element = screen.getByRole('status');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('aria-label', 'Loading card content');
  });

  it('has ARIA attributes', () => {
    render(<SkeletonCard />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading card...')).toHaveClass('sr-only');
  });

  it('contains header, text, and button elements', () => {
    const { container } = render(<SkeletonCard />);
    
    // Header (h-8)
    const header = container.querySelector('.h-8');
    expect(header).toBeInTheDocument();
    
    // Text lines (h-4)
    const textLines = container.querySelectorAll('.h-4');
    expect(textLines.length).toBeGreaterThan(0);
    
    // Button (h-10)
    const button = container.querySelector('.h-10');
    expect(button).toBeInTheDocument();
  });

  it('has dark mode support', () => {
    const { container } = render(<SkeletonCard />);
    const darkElements = container.querySelectorAll('.dark\\:bg-gray-800, .dark\\:bg-gray-700');
    expect(darkElements.length).toBeGreaterThan(0);
  });
});

describe('SkeletonAvatar', () => {
  it('renders with default medium size', () => {
    render(<SkeletonAvatar />);
    const element = screen.getByRole('status');
    expect(element).toHaveAttribute('aria-label', 'Loading md avatar');
  });

  it('renders small size', () => {
    render(<SkeletonAvatar size="sm" />);
    const element = screen.getByRole('status');
    expect(element).toHaveAttribute('aria-label', 'Loading sm avatar');
  });

  it('renders large size', () => {
    render(<SkeletonAvatar size="lg" />);
    const element = screen.getByRole('status');
    expect(element).toHaveAttribute('aria-label', 'Loading lg avatar');
  });

  it('is circular', () => {
    const { container } = render(<SkeletonAvatar />);
    const element = container.querySelector('.rounded-full');
    expect(element).toBeInTheDocument();
  });

  it('has ARIA attributes', () => {
    render(<SkeletonAvatar />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading avatar...')).toHaveClass('sr-only');
  });

  it('has dark mode support', () => {
    const { container } = render(<SkeletonAvatar />);
    const element = container.querySelector('.dark\\:bg-gray-700');
    expect(element).toBeInTheDocument();
  });
});

describe('SkeletonButton', () => {
  it('renders correctly', () => {
    render(<SkeletonButton />);
    const element = screen.getByRole('status');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('aria-label', 'Loading button');
  });

  it('has ARIA attributes', () => {
    render(<SkeletonButton />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading button...')).toHaveClass('sr-only');
  });

  it('has correct dimensions', () => {
    const { container } = render(<SkeletonButton />);
    const element = container.querySelector('.h-10.w-24');
    expect(element).toBeInTheDocument();
  });

  it('has dark mode support', () => {
    const { container } = render(<SkeletonButton />);
    const element = container.querySelector('.dark\\:bg-gray-700');
    expect(element).toBeInTheDocument();
  });
});

// Accessibility tests for all primitives
describe('Accessibility Tests - Primitives', () => {
  it('all primitives have role="status"', () => {
    render(<SkeletonLine />);
    render(<SkeletonText />);
    render(<SkeletonCard />);
    render(<SkeletonAvatar />);
    render(<SkeletonButton />);
    
    const statusElements = screen.getAllByRole('status');
    expect(statusElements.length).toBe(5);
  });

  it('all primitives have aria-live="polite"', () => {
    render(<SkeletonLine />);
    render(<SkeletonText />);
    render(<SkeletonCard />);
    render(<SkeletonAvatar />);
    render(<SkeletonButton />);
    
    const statusElements = screen.getAllByRole('status');
    statusElements.forEach(element => {
      expect(element).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('all primitives have sr-only text', () => {
    render(<SkeletonLine />);
    render(<SkeletonText />);
    render(<SkeletonCard />);
    render(<SkeletonAvatar />);
    render(<SkeletonButton />);
    
    const srOnlyElements = document.querySelectorAll('.sr-only');
    expect(srOnlyElements.length).toBeGreaterThan(0);
  });
});

// Animation tests
describe('Animation Tests - Primitives', () => {
  it('all primitives have animate-pulse', () => {
    const { container: line } = render(<SkeletonLine />);
    const { container: card } = render(<SkeletonCard />);
    const { container: avatar } = render(<SkeletonAvatar />);
    const { container: button } = render(<SkeletonButton />);
    
    expect(line.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(card.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(avatar.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(button.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

// Dark mode tests
describe('Dark Mode Tests - Primitives', () => {
  it('all primitives support dark mode', () => {
    const { container: line } = render(<SkeletonLine />);
    const { container: text } = render(<SkeletonText />);
    const { container: card } = render(<SkeletonCard />);
    const { container: avatar } = render(<SkeletonAvatar />);
    const { container: button } = render(<SkeletonButton />);
    
    expect(line.querySelector('.dark\\:bg-gray-700')).toBeInTheDocument();
    expect(text.querySelector('.dark\\:bg-gray-700')).toBeInTheDocument();
    expect(card.querySelector('.dark\\:bg-gray-800')).toBeInTheDocument();
    expect(avatar.querySelector('.dark\\:bg-gray-700')).toBeInTheDocument();
    expect(button.querySelector('.dark\\:bg-gray-700')).toBeInTheDocument();
  });
});
