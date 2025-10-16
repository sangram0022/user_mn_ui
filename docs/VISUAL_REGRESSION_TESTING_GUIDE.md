# Visual Regression Testing Guide

## Overview

Visual regression testing automatically detects unintended visual changes in the UI by comparing screenshots. This ensures that code changes don't introduce unexpected visual bugs.

**By 25-year React veteran - Production-ready visual testing setup**

---

## Features

✅ **Automated Screenshot Comparison** - Detect pixel-level differences  
✅ **Multi-Viewport Testing** - Test mobile, tablet, and desktop layouts  
✅ **Dark Mode Testing** - Verify dark theme consistency  
✅ **Storybook Integration** - Test isolated component stories  
✅ **CI/CD Ready** - Automated testing in continuous integration  
✅ **Interactive Debugging** - UI mode for visual inspection

---

## Quick Start

### 1. Install Playwright Browsers

```bash
npx playwright install
```

### 2. Start Storybook

```bash
npm run storybook
```

### 3. Create Baseline Screenshots

```bash
# Create initial baseline screenshots (run this first time)
npm run test:visual:storybook:update
```

### 4. Run Visual Tests

```bash
# Run visual regression tests
npm run test:visual:storybook

# Run in interactive UI mode
npm run test:visual:storybook:ui
```

---

## Available Commands

### Storybook Visual Tests (Recommended)

Tests isolated component stories in Storybook:

```bash
# Run all Storybook visual tests
npm run test:visual:storybook

# Update baseline screenshots (after intentional changes)
npm run test:visual:storybook:update

# Run in interactive UI mode (debug)
npm run test:visual:storybook:ui
```

### Full Application Visual Tests

Tests the complete running application:

```bash
# Run full app visual tests
npm run test:visual

# Update baseline screenshots
npm run test:visual:update

# Run in UI mode
npm run test:visual:ui

# Debug mode
npm run test:visual:debug
```

### All Visual Tests

```bash
# Run all visual tests (Storybook + App)
npm run test:visual:all

# Update all baselines
npm run test:visual:all:update
```

### E2E Tests

```bash
# Run all E2E tests (including visual)
npm run test:e2e

# Run E2E in UI mode
npm run test:e2e:ui
```

---

## Test Structure

### Storybook Visual Tests

File: `e2e/visual-storybook.spec.ts`

- Tests isolated component stories
- More reliable than full app tests
- Faster execution
- Better for component-level regression

**Components Tested:**

- Buttons (all variants, sizes, states)
- Tabs (line, enclosed, pills, vertical, dark mode)
- Accordion (single, multiple, collapsible, icons, dark mode)
- Form inputs (variants, error states, disabled)
- Tables (basic, sorting, pagination)
- Modals (sizes, states)
- Container Queries (responsive layouts)

### Full Application Visual Tests

File: `e2e/visual-regression.spec.ts`

- Tests complete application pages
- Tests interaction states
- Tests real-world scenarios

---

## How It Works

### 1. Baseline Creation

First run creates baseline screenshots:

```bash
npm run test:visual:storybook:update
```

Screenshots are saved to: `e2e/visual-storybook.spec.ts-snapshots/`

### 2. Comparison

Subsequent runs compare current UI against baselines:

```bash
npm run test:visual:storybook
```

### 3. Diff Detection

If differences are detected:

- ❌ Test fails
- 📸 Diff images are generated
- 📊 HTML report shows comparison

### 4. Review & Update

**If changes are intentional:**

```bash
npm run test:visual:storybook:update
```

**If changes are bugs:**

- Fix the code
- Re-run tests
- Verify tests pass

---

## Configuration

### Playwright Config

File: `playwright.config.ts`

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,        // Max pixel difference allowed
    maxDiffPixelRatio: 0.1,    // Max 10% difference
    threshold: 0.2,            // Pixel color threshold
    animations: 'disabled',     // Disable animations
    scale: 'css',              // CSS pixel scaling
  },
}
```

### Viewports

```typescript
const VIEWPORTS = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1920, height: 1080 }, // Full HD
};
```

---

## Best Practices

### ✅ DO

1. **Create baselines in controlled environment**
   - Same OS, same browser version
   - Disable animations and transitions
   - Hide dynamic content (timestamps, random IDs)

2. **Test isolated components in Storybook**
   - More reliable than full app tests
   - Faster feedback
   - Easier to debug

3. **Review diffs carefully**
   - Not all pixel differences are bugs
   - Anti-aliasing can cause minor differences
   - Font rendering varies by OS

4. **Update baselines after intentional changes**

   ```bash
   npm run test:visual:storybook:update
   ```

5. **Run tests in CI/CD**
   - Automate visual regression checks
   - Block merges with visual regressions

### ❌ DON'T

1. **Don't test animations**
   - Disable animations in tests
   - Animations cause flaky tests

2. **Don't test dynamic content**
   - Hide timestamps, random data
   - Use stable test data

3. **Don't ignore legitimate failures**
   - Every pixel difference should be reviewed
   - Don't blindly update baselines

4. **Don't test across different OS**
   - Font rendering differs
   - Use Docker or consistent CI environment

---

## Debugging Failed Tests

### 1. View HTML Report

```bash
npx playwright show-report
```

### 2. Interactive UI Mode

```bash
npm run test:visual:storybook:ui
```

### 3. Debug Mode

```bash
npm run test:visual:debug
```

### 4. Review Diff Images

Failed tests generate 3 images:

- `*-actual.png` - Current screenshot
- `*-expected.png` - Baseline screenshot
- `*-diff.png` - Visual diff highlighting changes

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Visual Regression Tests

on: [pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Build Storybook
        run: npm run build-storybook

      - name: Start Storybook
        run: npx http-server storybook-static -p 6006 &

      - name: Run visual tests
        run: npm run test:visual:storybook

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Troubleshooting

### Issue: Tests fail in CI but pass locally

**Solution:**

- Use Docker for consistent environment
- Or update baselines in CI environment
- Check OS font rendering differences

### Issue: Flaky tests (sometimes pass, sometimes fail)

**Solution:**

- Increase wait times for animations
- Disable all animations/transitions
- Hide dynamic content
- Use stable test data

### Issue: Large diff files

**Solution:**

- Reduce viewport sizes
- Test smaller component areas
- Compress baseline images

### Issue: Slow test execution

**Solution:**

- Run tests in parallel (already configured)
- Test only changed components
- Use faster storage (SSD)

---

## Test Coverage

### Components Covered

- ✅ Button (5 tests)
- ✅ Tabs (6 tests)
- ✅ Accordion (6 tests)
- ✅ Input (3 tests)
- ✅ Table (3 tests)
- ✅ Modal (2 tests)
- ✅ Container Queries (3 tests)
- ✅ Responsive layouts (6 tests)

**Total: 34+ visual regression tests**

### Test Types

1. **Component Variants** - Different visual styles
2. **Responsive** - Mobile, tablet, desktop
3. **Themes** - Light and dark mode
4. **States** - Hover, focus, disabled, error
5. **Interactions** - Expanded, collapsed, selected

---

## Performance

### Test Execution Time

- **Storybook tests**: ~2-3 minutes (34 tests)
- **Full app tests**: ~5-7 minutes (varies)
- **Total**: ~7-10 minutes

### Optimization Tips

1. **Parallel execution** (already enabled)
2. **Test only changed components**
3. **Use Chromium only** (unless cross-browser needed)
4. **Reduce viewport sizes** if needed

---

## Maintenance

### When to Update Baselines

✅ **Update when:**

- Intentional design changes
- New features added
- Component improvements
- Accessibility enhancements

❌ **Don't update when:**

- Tests randomly fail
- CI environment differs from local
- Visual bugs detected
- Unexplained pixel differences

### Regular Maintenance

1. **Review test coverage** - Add tests for new components
2. **Clean old snapshots** - Remove unused baselines
3. **Update Playwright** - Keep browser versions current
4. **Monitor test performance** - Optimize slow tests

---

## Resources

### Documentation

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [CI/CD Integration](https://playwright.dev/docs/ci)

### Tools

- **Playwright Test Runner** - Test execution framework
- **Playwright Inspector** - Debug UI mode
- **Trace Viewer** - Timeline debugging
- **HTML Reporter** - Visual diff viewer

---

## Summary

Visual regression testing provides:

✅ **Confidence** - Catch visual bugs before production  
✅ **Speed** - Automated detection vs manual QA  
✅ **Coverage** - Test all components and viewports  
✅ **History** - Visual changelog of UI changes  
✅ **CI/CD** - Automated checks in every PR

**Status**: Production-ready, fully configured, 34+ tests ✅

**Next Steps**:

1. Start Storybook: `npm run storybook`
2. Create baselines: `npm run test:visual:storybook:update`
3. Run tests: `npm run test:visual:storybook`

---

**Created by**: 25-year React veteran  
**Date**: October 16, 2025  
**Version**: 1.0.0  
**Status**: Production-ready ✅
