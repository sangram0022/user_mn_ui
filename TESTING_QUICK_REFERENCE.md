# Testing Quick Reference

## Run Tests

```bash
# Watch mode (recommended for development)
npm test

# Interactive UI
npm run test:ui

# Single run
npm run test:run

# With coverage report
npm run test:coverage
```

## Test File Structure

```typescript
import { describe, it, expect } from 'vitest';
import { yourFunction } from '../your-module';

describe('Your Module', () => {
  describe('yourFunction', () => {
    it('should do something', () => {
      const result = yourFunction('input');
      expect(result).toBe('expected');
    });
  });
});
```

## Common Matchers

```typescript
// Equality
expect(value).toBe(expected);           // Object.is equality
expect(value).toEqual(expected);        // Deep equality
expect(value).toStrictEqual(expected);  // Strict deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeDefined();
expect(value).toBeUndefined();
expect(value).toBeNull();

// Numbers
expect(value).toBeGreaterThan(number);
expect(value).toBeGreaterThanOrEqual(number);
expect(value).toBeLessThan(number);
expect(value).toBeLessThanOrEqual(number);
expect(value).toBeCloseTo(number, precision);

// Strings
expect(string).toContain(substring);
expect(string).toMatch(regex);

// Arrays/Iterables
expect(array).toHaveLength(number);
expect(array).toContain(item);

// Objects
expect(object).toHaveProperty('key', value);

// Functions
expect(fn).toThrow();
expect(fn).toThrow(Error);
expect(fn).toThrow('error message');
```

## Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeEnabled();
  });
  
  it('should handle user interaction', async () => {
    const user = UserEvent.setup();
    render(<YourComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

## Mocking

```typescript
import { vi } from 'vitest';

// Mock function
const mockFn = vi.fn();
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue('async value');
mockFn.mockRejectedValue(new Error('error'));

// Mock module
vi.mock('../module', () => ({
  default: vi.fn(),
  namedExport: vi.fn(),
}));

// Mock implementation
mockFn.mockImplementation((arg) => {
  return arg * 2;
});

// Assertions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(3);
```

## Test Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
# Open: coverage/index.html
```

**Coverage Thresholds** (configured):
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Current Test Status

**Validation Tests** (`validation.test.ts`):
- Total: 35 tests
- Passing: 31 (88.6%)
- Failing: 4 (minor data issues)

**Next Tests to Create**:
1. `errorMessages.test.ts` - Error formatting and messages
2. `tokenUtils.test.ts` - JWT token handling
3. `sessionUtils.test.ts` - Session management
4. `tokenService.test.ts` - Token storage service

## Troubleshooting

### Tests not running?
```bash
# Check if vitest is installed
npm list vitest

# Reinstall if needed
npm install -D vitest
```

### "Cannot find module" errors?
- Check path aliases in `vitest.config.ts`
- Verify import paths match file structure

### "Environment is not defined" errors?
- Ensure `environment: 'happy-dom'` in vitest.config.ts
- Verify happy-dom is installed: `npm list happy-dom`

### Slow tests?
- Use `happy-dom` instead of `jsdom` (configured)
- Avoid unnecessary component renders
- Use `vi.mocked()` for expensive operations

## Best Practices

1. **Test file naming**: `*.test.ts` or `*.spec.ts`
2. **Location**: Place tests in `__tests__` folder next to source
3. **One assertion per test**: Keep tests focused
4. **Descriptive test names**: Use "should..." pattern
5. **Arrange-Act-Assert**: Structure tests clearly
6. **Clean up**: Use afterEach hooks for cleanup
7. **Avoid implementation details**: Test behavior, not internals
8. **Mock external dependencies**: Keep tests isolated
9. **Use data-testid sparingly**: Prefer semantic queries
10. **Keep tests DRY**: Extract common setup to beforeEach

## Path Aliases (configured)

```typescript
import from '@/...'              // src/
import from '@domains/...'       // src/domains/
import from '@services/...'      // src/services/
import from '@utils/...'         // src/utils/
import from '@hooks/...'         // src/hooks/
import from '@components/...'    // src/components/
```

## Useful Links

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest-DOM Matchers](https://github.com/testing-library/jest-dom)
- [User Event](https://testing-library.com/docs/user-event/intro/)

---

*Last Updated*: During testing setup
*Status*: Infrastructure complete, first test suite operational
