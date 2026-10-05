# E2E Tests Documentation

This directory contains end-to-end (E2E) tests for the Devxhub Tools boilerplate using Playwright.

## Test Files

### Core Tests
- **`test.ts`** - Basic home page tests
- **`navigation.test.ts`** - Navigation menu tests (desktop & mobile)
- **`theme-selector.test.ts`** - Theme selector dropdown tests
- **`header-footer.test.ts`** - Header and Footer component tests

### Feature Tests
- **`clipboard.test.ts`** - Clipboard functionality tests
- **`toast.test.ts`** - Toast notification tests
- **`accessibility.test.ts`** - Accessibility compliance tests
- **`responsive.test.ts`** - Responsive design tests
- **`seo.test.ts`** - SEO metadata tests

## Running Tests

### Run all tests
```bash
pnpm test:e2e
```

### Run specific test file
```bash
pnpm test:e2e tests/navigation.test.ts
```

### Run tests in headed mode (see browser)
```bash
pnpm test:e2e --headed
```

### Run tests in debug mode
```bash
pnpm test:e2e --debug
```

### Run tests for specific browser
```bash
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit
```

### Run tests on mobile viewports
```bash
pnpm test:e2e --project="Mobile Chrome"
pnpm test:e2e --project="Mobile Safari"
```

## Test Coverage

### Navigation Tests
- ✅ Desktop navigation menu
- ✅ Mobile menu toggle
- ✅ Keyboard navigation
- ✅ Dropdown interactions
- ✅ Link functionality

### Theme Selector Tests
- ✅ Dropdown open/close
- ✅ Keyboard navigation
- ✅ Theme selection
- ✅ ARIA attributes

### Accessibility Tests
- ✅ Skip links
- ✅ Keyboard navigation
- ✅ ARIA labels and roles
- ✅ Focus indicators
- ✅ Screen reader support
- ✅ Semantic HTML

### Responsive Tests
- ✅ Mobile viewport (375x667)
- ✅ Tablet viewport (768x1024)
- ✅ Desktop viewport (1280x720)
- ✅ Touch target sizes
- ✅ Layout adaptation

### SEO Tests
- ✅ Meta tags
- ✅ Open Graph tags
- ✅ Twitter Cards
- ✅ Schema.org markup
- ✅ Canonical URLs

## Browser Support

Tests run on:
- **Chromium** (Chrome/Edge)
- **Firefox**
- **WebKit** (Safari)
- **Mobile Chrome** (Android)
- **Mobile Safari** (iOS)

## Test Configuration

Configuration is in `playwright.config.ts`:
- **Timeout:** 30 seconds per test
- **Retries:** 2 retries in CI, 0 locally
- **Workers:** 1 in CI, auto locally
- **Reporter:** HTML and list reporters

## Writing New Tests

### Test Structure
```typescript
import { expect, test } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

### Best Practices
1. Use `test.describe` to group related tests
2. Use `test.beforeEach` for common setup
3. Use semantic selectors (`getByRole`, `getByLabel`)
4. Wait for elements with `expect().toBeVisible()`
5. Test both mouse and keyboard interactions
6. Test accessibility features
7. Test responsive behavior

### Common Patterns

#### Waiting for elements
```typescript
await expect(page.locator('selector')).toBeVisible();
```

#### Keyboard navigation
```typescript
await page.keyboard.press('Tab');
await page.keyboard.press('Enter');
```

#### Viewport changes
```typescript
await page.setViewportSize({ width: 375, height: 667 });
```

#### Checking attributes
```typescript
await expect(element).toHaveAttribute('aria-expanded', 'true');
```

## CI/CD Integration

Tests are configured to run in CI environments:
- Automatic retries on failure
- Single worker for stability
- HTML report generation
- Screenshot on failure (automatic)

## Debugging Failed Tests

1. **Run in headed mode:**
   ```bash
   pnpm test:e2e --headed
   ```

2. **Run in debug mode:**
   ```bash
   pnpm test:e2e --debug
   ```

3. **Run specific test:**
   ```bash
   pnpm test:e2e -g "test name"
   ```

4. **View HTML report:**
   ```bash
   pnpm test:e2e --reporter=html
   # Then open playwright-report/index.html
   ```

## Maintenance

- Keep tests updated when components change
- Add tests for new features
- Remove obsolete tests
- Update selectors if UI changes
- Test across all supported browsers regularly

