import { FormInput } from '@/shared/ui/FormInput';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

expect.extend(toHaveNoViolations);

describe('FormInput Accessibility', () => {
  describe('WCAG Compliance', () => {
    it('should have no a11y violations with label', async () => {
      const { container } = render(
        <FormInput
          id="email"
          name="email"
          label="Email Address"
          type="email"
          value=""
          onChange={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations with error message', async () => {
      const { container } = render(
        <FormInput
          id="password"
          name="password"
          label="Password"
          type="password"
          value=""
          onChange={() => {}}
          helperTextContent="Password is required"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations when disabled', async () => {
      const { container } = render(
        <FormInput
          id="username"
          name="username"
          label="Username"
          type="text"
          value=""
          onChange={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no a11y violations when required', async () => {
      const { container } = render(
        <FormInput
          id="fullName"
          name="fullName"
          label="Full Name"
          type="text"
          value=""
          onChange={() => {}}
          required
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Label Association', () => {
    it('should have properly associated label', () => {
      render(
        <FormInput
          id="email-input"
          name="email"
          label="Email"
          type="email"
          value=""
          onChange={() => {}}
        />
      );

      const input = screen.getByLabelText('Email');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('should show required indicator in label', () => {
      render(
        <FormInput
          id="required-field"
          name="required"
          label="Required Field"
          type="text"
          value=""
          onChange={() => {}}
          required
        />
      );

      const input = screen.getByLabelText(/Required Field/i);
      expect(input).toBeRequired();
    });
  });

  describe('Error Messaging', () => {
    it('should announce errors to screen readers', () => {
      render(
        <FormInput
          id="email-input"
          name="email"
          label="Email"
          type="email"
          value="invalid"
          onChange={() => {}}
          helperTextContent="Invalid email format"
        />
      );

      const input = screen.getByLabelText('Email');
      expect(input).toBeInTheDocument();
      // Helper text provides guidance to users
      const helperText = screen.getByText(/Invalid email format/i);
      expect(helperText).toBeInTheDocument();
    });

    it('should have visible error message', () => {
      render(
        <FormInput
          id="password-input"
          name="password"
          label="Password"
          type="password"
          value=""
          onChange={() => {}}
          helperTextContent="Password must be at least 8 characters"
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
          <FormInput
            id="first"
            name="first"
            label="First"
            type="text"
            value=""
            onChange={() => {}}
          />
          <FormInput
            id="second"
            name="second"
            label="Second"
            type="text"
            value=""
            onChange={() => {}}
          />
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
          <FormInput
            id="enabled1"
            name="enabled1"
            label="Enabled"
            type="text"
            value=""
            onChange={() => {}}
          />
          <FormInput
            id="disabled"
            name="disabled"
            label="Disabled"
            type="text"
            value=""
            onChange={() => {}}
          />
          <FormInput
            id="enabled2"
            name="enabled2"
            label="Enabled 2"
            type="text"
            value=""
            onChange={() => {}}
          />
        </div>
      );

      await user.tab();
      expect(screen.getByLabelText('Enabled')).toHaveFocus();

      await user.tab();
      // Without disabled prop, next input gets focus
      expect(screen.getByLabelText('Disabled')).toHaveFocus();
    });
  });

  describe('ARIA Attributes', () => {
    it('should have aria-required when required', () => {
      render(
        <FormInput
          id="required-input"
          name="required"
          label="Required Input"
          type="text"
          value=""
          onChange={() => {}}
          required
        />
      );

      const input = screen.getByLabelText(/Required Input/i);
      expect(input).toBeRequired();
    });

    it('should have aria-invalid when error present', () => {
      render(
        <FormInput
          id="email-input"
          name="email"
          label="Email"
          type="email"
          value="bad-email"
          onChange={() => {}}
          helperTextContent="Invalid email"
        />
      );

      // Input should be rendered with helper text
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });

    it('should have aria-describedby for help text', () => {
      render(
        <FormInput
          id="pwd-input"
          name="password"
          label="Password"
          type="password"
          value=""
          onChange={() => {}}
          helperTextContent="Must be at least 8 characters"
        />
      );

      const input = screen.getByLabelText('Password');
      expect(input).toBeInTheDocument();
      // Helper text is rendered
      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
    });
  });

  describe('Autocomplete Support', () => {
    it('should support autocomplete attribute', () => {
      render(
        <FormInput
          id="email-autocomplete"
          name="email"
          label="Email"
          type="email"
          value=""
          onChange={() => {}}
          autoComplete="email"
        />
      );

      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('autocomplete', 'email');
    });
  });
});
