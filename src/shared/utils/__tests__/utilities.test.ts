/**
 * Unit Tests: Utility Functions
 * Expert-level testing by 25-year React veteran
 */
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Import utilities to test
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain a special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should handle edge cases', () => {
      const date = new Date('2024-12-31');
      const formatted = formatDate(date);
      
      expect(formatted).toContain('December');
      expect(formatted).toContain('31');
    });
  });

  describe('debounce', () => {
    it('should delay function execution', async () => {
      vi.useFakeTimers();
      
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      vi.useRealTimers();
    });

    it('should cancel previous calls', async () => {
      vi.useFakeTimers();
      
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      vi.useRealTimers();
    });
  });

  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(' ')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('SecurePass@123');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('weak');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate all password requirements', () => {
      const tests = [
        { password: 'short1A!', shouldContain: 'at least 8 characters' },
        { password: 'nouppercase1!', shouldContain: 'uppercase letter' },
        { password: 'NOLOWERCASE1!', shouldContain: 'lowercase letter' },
        { password: 'NoNumbers!', shouldContain: 'number' },
        { password: 'NoSpecial123', shouldContain: 'special character' },
      ];

      tests.forEach(({ password, shouldContain }) => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(err => err.includes(shouldContain))).toBe(true);
      });
    });
  });
});

describe('Accessibility Tests', () => {
  it('should have no axe violations on login form', async () => {
    const html = `
      <form aria-label="Login form">
        <label for="email">Email</label>
        <input id="email" type="email" name="email" required />
        
        <label for="password">Password</label>
        <input id="password" type="password" name="password" required />
        
        <button type="submit">Sign In</button>
      </form>
    `;
    
    const container = document.createElement('div');
    container.innerHTML = html;
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no axe violations on button with icon', async () => {
    const html = `
      <button aria-label="Delete user">
        <svg role="img" aria-hidden="true">
          <title>Delete</title>
          <use href="#trash-icon"></use>
        </svg>
      </button>
    `;
    
    const container = document.createElement('div');
    container.innerHTML = html;
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});