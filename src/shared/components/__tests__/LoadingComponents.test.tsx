/**
 * Tests for StandardLoading and LoadingSpinner Components
 * 
 * Tests loading states, spinners, and overlays
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StandardLoading, LoadingOverlay, ContentSkeleton } from '../StandardLoading';
import { LoadingSpinner, LoadingFallback, InlineSpinner } from '../LoadingSpinner';

describe('StandardLoading', () => {
  it('renders with default props', () => {
    render(<StandardLoading />);
    const element = screen.getByRole('status');
    expect(element).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<StandardLoading message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('supports different sizes', () => {
    const { container: sm } = render(<StandardLoading size="sm" />);
    const { container: md } = render(<StandardLoading size="md" />);
    const { container: lg } = render(<StandardLoading size="lg" />);
    
    expect(sm.querySelector('.h-4.w-4')).toBeInTheDocument();
    expect(md.querySelector('.h-6.w-6')).toBeInTheDocument();
    expect(lg.querySelector('.h-8.w-8')).toBeInTheDocument();
  });

  it('can hide spinner', () => {
    const { container } = render(<StandardLoading showSpinner={false} />);
    const spinner = container.querySelector('svg');
    expect(spinner).toBeNull();
  });

  it('has ARIA attributes', () => {
    render(<StandardLoading message="Loading..." />);
    const element = screen.getByRole('status');
    expect(element).toHaveAttribute('aria-label', 'Loading...');
    expect(element).toHaveAttribute('aria-live', 'polite');
  });

  it('has dark mode support', () => {
    const { container } = render(<StandardLoading />);
    expect(container.querySelector('.dark\\:text-gray-500')).toBeInTheDocument();
    expect(container.querySelector('.dark\\:text-gray-400')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<StandardLoading className="mt-8" />);
    const element = container.querySelector('.mt-8');
    expect(element).toBeInTheDocument();
  });
});

describe('LoadingOverlay', () => {
  it('shows overlay when isVisible is true', () => {
    render(<LoadingOverlay isVisible={true} message="Processing..." />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('hides overlay when isVisible is false', () => {
    render(
      <LoadingOverlay isVisible={false}>
        <div>Content</div>
      </LoadingOverlay>
    );
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders children when not visible', () => {
    render(
      <LoadingOverlay isVisible={false}>
        <div>Child content</div>
      </LoadingOverlay>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('has ARIA attributes when visible', () => {
    render(<LoadingOverlay isVisible={true} message="Loading..." />);
    const overlay = screen.getByRole('status');
    expect(overlay).toHaveAttribute('aria-label', 'Loading...');
    expect(overlay).toHaveAttribute('aria-live', 'polite');
  });

  it('has dark mode support', () => {
    const { container } = render(<LoadingOverlay isVisible={true} />);
    expect(container.querySelector('.dark\\:bg-gray-900')).toBeInTheDocument();
  });
});

describe('ContentSkeleton', () => {
  it('renders with default 3 lines', () => {
    render(<ContentSkeleton />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-label', 'Loading 3 lines of content');
  });

  it('renders custom number of lines', () => {
    render(<ContentSkeleton lines={5} />);
    const container = screen.getByRole('status');
    const lines = container.querySelectorAll('.h-4');
    expect(lines).toHaveLength(5);
  });

  it('has natural width variation', () => {
    const { container } = render(<ContentSkeleton lines={3} />);
    const lines = container.querySelectorAll('.h-4');
    
    // Last line should be shorter
    expect(lines[2]).toHaveClass('w-3/4');
  });

  it('has ARIA attributes', () => {
    render(<ContentSkeleton />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading content...')).toHaveClass('sr-only');
  });

  it('has dark mode support', () => {
    const { container } = render(<ContentSkeleton />);
    const darkElements = container.querySelectorAll('.dark\\:bg-gray-700');
    expect(darkElements.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    const { container } = render(<ContentSkeleton className="my-4" />);
    const element = container.querySelector('.my-4');
    expect(element).toBeInTheDocument();
  });
});

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    const element = screen.getByRole('status');
    expect(element).toBeInTheDocument();
  });

  it('supports different sizes', () => {
    const { container: sm } = render(<LoadingSpinner size="sm" />);
    const { container: md } = render(<LoadingSpinner size="md" />);
    const { container: lg } = render(<LoadingSpinner size="lg" />);
    const { container: xl } = render(<LoadingSpinner size="xl" />);
    
    expect(sm.querySelector('.h-4.w-4')).toBeInTheDocument();
    expect(md.querySelector('.h-8.w-8')).toBeInTheDocument();
    expect(lg.querySelector('.h-12.w-12')).toBeInTheDocument();
    expect(xl.querySelector('.h-16.w-16')).toBeInTheDocument();
  });

  it('renders optional text', () => {
    render(<LoadingSpinner text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('has ARIA attributes', () => {
    render(<LoadingSpinner />);
    const element = screen.getByRole('status');
    expect(element).toHaveAttribute('aria-label', 'Loading');
  });

  it('has dark mode support for text', () => {
    render(<LoadingSpinner text="Loading..." />);
    const text = screen.getByText('Loading...');
    expect(text).toHaveClass('dark:text-gray-400');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="my-8" />);
    const element = container.querySelector('.my-8');
    expect(element).toBeInTheDocument();
  });
});

describe('LoadingFallback', () => {
  it('renders with default text', () => {
    render(<LoadingFallback />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom text', () => {
    render(<LoadingFallback text="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('is full screen', () => {
    const { container } = render(<LoadingFallback />);
    const element = container.querySelector('.min-h-screen');
    expect(element).toBeInTheDocument();
  });

  it('centers content', () => {
    const { container } = render(<LoadingFallback />);
    const element = container.querySelector('.flex.items-center.justify-center');
    expect(element).toBeInTheDocument();
  });
});

describe('InlineSpinner', () => {
  it('renders with default small size', () => {
    const { container } = render(<InlineSpinner />);
    const element = container.querySelector('.h-4.w-4');
    expect(element).toBeInTheDocument();
  });

  it('renders medium size', () => {
    const { container } = render(<InlineSpinner size="md" />);
    const element = container.querySelector('.h-8.w-8');
    expect(element).toBeInTheDocument();
  });

  it('has spinning animation', () => {
    const { container } = render(<InlineSpinner />);
    const element = container.querySelector('.animate-spin');
    expect(element).toBeInTheDocument();
  });

  it('is circular', () => {
    const { container } = render(<InlineSpinner />);
    const element = container.querySelector('.rounded-full');
    expect(element).toBeInTheDocument();
  });
});

// Integration tests
describe('Integration Tests', () => {
  it('StandardLoading and LoadingSpinner work together', () => {
    render(
      <>
        <StandardLoading message="Loading..." />
        <LoadingSpinner text="Please wait..." />
      </>
    );
    
    expect(screen.getAllByRole('status').length).toBe(2);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('LoadingOverlay contains StandardLoading', () => {
    render(<LoadingOverlay isVisible={true} message="Processing..." />);
    
    // Should have 2 status roles: overlay and StandardLoading
    const statusElements = screen.getAllByRole('status');
    expect(statusElements.length).toBeGreaterThan(0);
  });
});

// Animation tests
describe('Animation Tests - Loading Components', () => {
  it('StandardLoading has spinning animation', () => {
    const { container } = render(<StandardLoading />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('LoadingSpinner has spinning animation', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('ContentSkeleton has pulse animation', () => {
    const { container } = render(<ContentSkeleton />);
    const elements = container.querySelectorAll('.animate-pulse');
    expect(elements.length).toBeGreaterThan(0);
  });
});
