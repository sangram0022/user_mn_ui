import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Button } from '../ui/Button/Button';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  describe('WCAG Compliance', () => {
    it('should have no a11y violations with default props', async () => {
      const { container } = render(<Button onClick={() => {}}>Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations when disabled', async () => {
      const { container } = render(
        <Button onClick={() => {}} disabled>
          Disabled Button
        </Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations with different variants', async () => {
      const variants = ['primary', 'secondary', 'outline', 'ghost'] as const;

      for (const variant of variants) {
        const { container } = render(
          <Button onClick={() => {}} variant={variant}>
            {variant} Button
          </Button>
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be keyboard navigable with Tab', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Button onClick={() => {}}>First</Button>
          <Button onClick={() => {}}>Second</Button>
        </div>
      );

      const firstButton = screen.getByRole('button', { name: 'First' });
      const secondButton = screen.getByRole('button', { name: 'Second' });

      // Tab to first button
      await user.tab();
      expect(firstButton).toHaveFocus();

      // Tab to second button
      await user.tab();
      expect(secondButton).toHaveFocus();

      // Shift+Tab back to first
      await user.tab({ shift: true });
      expect(firstButton).toHaveFocus();
    });

    it('should be activated with Enter key', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Press Enter</Button>);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should be activated with Space key', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Press Space</Button>);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard(' ');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not be keyboard accessible when disabled', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <div>
          <Button onClick={() => {}}>Enabled</Button>
          <Button onClick={onClick} disabled>
            Disabled
          </Button>
          <Button onClick={() => {}}>Enabled 2</Button>
        </div>
      );

      // Tab through - should skip disabled button
      await user.tab();
      expect(screen.getByRole('button', { name: 'Enabled' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Enabled 2' })).toHaveFocus();

      // Disabled button should not be in tab order
      expect(screen.getByRole('button', { name: 'Disabled' })).not.toHaveFocus();
    });
  });

  describe('ARIA Attributes', () => {
    it('should have proper button role', () => {
      render(<Button onClick={() => {}}>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should have aria-disabled when disabled', () => {
      render(
        <Button onClick={() => {}} disabled>
          Disabled
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
      expect(button).toBeDisabled();
    });

    it('should support aria-label', () => {
      render(
        <Button onClick={() => {}} aria-label="Custom label">
          <span aria-hidden="true">Icon</span>
        </Button>
      );
      const button = screen.getByRole('button', { name: 'Custom label' });
      expect(button).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <div>
          <Button onClick={() => {}} aria-describedby="btn-desc">
            Submit
          </Button>
          <div id="btn-desc">This button submits the form</div>
        </div>
      );
      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toHaveAttribute('aria-describedby', 'btn-desc');
    });
  });

  describe('Visual Accessibility', () => {
    it('should have visible text content', () => {
      render(<Button onClick={() => {}}>Visible Text</Button>);
      const button = screen.getByRole('button', { name: 'Visible Text' });
      expect(button).toHaveTextContent('Visible Text');
    });

    it('should maintain focus visibility', async () => {
      const user = userEvent.setup();
      render(<Button onClick={() => {}}>Focus Test</Button>);

      const button = screen.getByRole('button');
      await user.tab();

      expect(button).toHaveFocus();
      // Button should have focus styles (this would need visual regression testing)
    });
  });

  describe('Screen Reader Support', () => {
    it('should have accessible name', () => {
      render(<Button onClick={() => {}}>Click Me</Button>);
      const button = screen.getByRole('button', { name: 'Click Me' });
      expect(button).toBeInTheDocument();
    });

    it('should announce loading state', () => {
      render(
        <Button onClick={() => {}} aria-busy="true" disabled>
          Loading...
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });
});
