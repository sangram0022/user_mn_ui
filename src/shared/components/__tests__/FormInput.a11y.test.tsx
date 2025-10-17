import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { FormInput } from '../FormInput';

expect.extend(toHaveNoViolations);

describe('FormInput Accessibility', () => {
  describe('WCAG Compliance', () => {
    it('should have no a11y violations with label', async () => {
      const { container } = render(
        <FormInput label="Email Address" type="email" value="" onChange={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations with error message', async () => {
      const { container } = render(
        <FormInput
          label="Password"
          type="password"
          value=""
          onChange={() => {}}
          error="Password is required"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations when disabled', async () => {
      const { container } = render(
        <FormInput label="Username" type="text" value="" onChange={() => {}} disabled />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations when required', async () => {
      const { container } = render(
        <FormInput label="Full Name" type="text" value="" onChange={() => {}} required />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Label Association', () => {
    it('should have properly associated label', () => {
      render(
        <FormInput label="Email" type="email" value="" onChange={() => {}} id="email-input" />
      );

      const input = screen.getByLabelText('Email');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('should show required indicator in label', () => {
      render(
        <FormInput label="Required Field" type="text" value="" onChange={() => {}} required />
      );

      const input = screen.getByLabelText(/Required Field/i);
      expect(input).toBeRequired();
    });
  });

  describe('Error Messaging', () => {
    it('should announce errors to screen readers', () => {
      render(
        <FormInput
          label="Email"
          type="email"
          value="invalid"
          onChange={() => {}}
          error="Invalid email format"
          id="email-input"
        />
      );

      const input = screen.getByLabelText('Email');
      const errorId = `${input.id}-error`;

      // Input should reference error message
      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining(errorId));
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have visible error message', () => {
      render(
        <FormInput
          label="Password"
          type="password"
          value=""
          onChange={() => {}}
          error="Password must be at least 8 characters"
        />
      );

      const errorMessage = screen.getByText(/Password must be at least 8 characters/i);
      expect(errorMessage).toBeVisible();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be focusable with Tab', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <FormInput label="First" type="text" value="" onChange={() => {}} />
          <FormInput label="Second" type="text" value="" onChange={() => {}} />
        </div>
      );

      await user.tab();
      expect(screen.getByLabelText('First')).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText('Second')).toHaveFocus();
    });

    it('should not be focusable when disabled', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <FormInput label="Enabled" type="text" value="" onChange={() => {}} />
          <FormInput label="Disabled" type="text" value="" onChange={() => {}} disabled />
          <FormInput label="Enabled 2" type="text" value="" onChange={() => {}} />
        </div>
      );

      await user.tab();
      expect(screen.getByLabelText('Enabled')).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText('Enabled 2')).toHaveFocus();
    });
  });

  describe('ARIA Attributes', () => {
    it('should have aria-required when required', () => {
      render(
        <FormInput label="Required Input" type="text" value="" onChange={() => {}} required />
      );

      const input = screen.getByLabelText(/Required Input/i);
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('should have aria-invalid when error present', () => {
      render(
        <FormInput
          label="Email"
          type="email"
          value="bad-email"
          onChange={() => {}}
          error="Invalid email"
        />
      );

      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-describedby for help text', () => {
      render(
        <FormInput
          label="Password"
          type="password"
          value=""
          onChange={() => {}}
          helperText="Must be at least 8 characters"
          id="pwd-input"
        />
      );

      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('pwd-input'));
    });
  });

  describe('Autocomplete Support', () => {
    it('should support autocomplete attribute', () => {
      render(
        <FormInput label="Email" type="email" value="" onChange={() => {}} autoComplete="email" />
      );

      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('autocomplete', 'email');
    });
  });
});
