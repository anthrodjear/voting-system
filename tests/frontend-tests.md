# Frontend Tests

## Overview

The frontend testing strategy for the Blockchain Voting System ensures reliability, correctness, and user experience quality. The Next.js frontend uses Jest and React Testing Library for unit/integration tests, and Playwright for end-to-end (E2E) tests.

---

## Test Setup

### Prerequisites

- Node.js 20+
- npm 9+
- Browser dependencies (for Playwright)

### Dependencies

The frontend uses the following testing packages:

```json
{
  "devDependencies": {
    "@playwright/test": "^1.58.2",
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^14.2.2",
    "@testing-library/user-event": "^14.5.2",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

### Jest Configuration

The `jest.config.js` file configures Jest for unit tests:

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

### Jest Setup File

Create `jest.setup.js` for global test configuration:

```javascript
import '@testing-library/jest-dom';

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.IntersectionObserver = MockIntersectionObserver;

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
```

### Playwright Configuration

The `playwright.config.ts` file configures E2E tests:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

---

## Running Tests

### Unit and Component Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- voting.store.spec.ts

# Run tests matching a pattern
npm test -- --testNamePattern="selectCandidate"

# Run tests and watch for changes in specific files
npm test -- --watch --testPathPattern="stores"
```

### End-to-End Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode (interactive)
npm run test:e2e:ui

# Run E2E tests with visible browser (headed)
npm run test:e2e:headed

# Run specific E2E test file
npm run test:e2e -- voter-registration.spec.ts

# Run tests matching a pattern
npm run test:e2e -- --grep="voter registration"

# Run E2E tests in specific project (browser)
npm run test:e2e -- --project=chromium

# Generate report after tests
npm run test:e2e -- --reporter=html
```

### CI/CD Commands

```bash
# Run tests for CI
npm test && npm run test:e2e

# Run with CI-specific configuration
CI=true npm run test:e2e
```

---

## Component Testing Setup

### Testing Library Best Practices

The project uses React Testing Library with Jest for component testing. Here's the recommended approach:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VotingForm } from './VotingForm';

describe('VotingForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the voting form correctly', () => {
    render(
      <VotingForm
        positions={mockPositions}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('heading', { name: /cast your vote/i })).toBeInTheDocument();
  });

  it('allows candidate selection', async () => {
    const user = userEvent.setup();
    
    render(
      <VotingForm
        positions={mockPositions}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const candidateButton = screen.getByRole('radio', { name: /candidate a/i });
    await user.click(candidateButton);

    expect(candidateButton).toBeChecked();
  });

  it('validates form before submission', async () => {
    const user = userEvent.setup();
    
    render(
      <VotingForm
        positions={mockPositions}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: /submit vote/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('shows error message on submission failure', async () => {
    mockOnSubmit.mockRejectedValueOnce(new Error('Network error'));
    
    render(
      <VotingForm
        positions={mockPositions}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Select candidates first
    const candidateButton = screen.getByRole('radio', { name: /candidate a/i });
    await userEvent.click(candidateButton);

    // Submit
    const submitButton = screen.getByRole('button', { name: /submit vote/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
```

---

## Store Testing (Zustand)

### Testing Zustand Stores

The project uses Zustand for state management. Here's how to test stores:

```typescript
import { useVotingStore } from './voting.store';

describe('voting.store', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useVotingStore.getState();
    store.reset();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('has null batchId', () => {
      const { batchId } = useVotingStore.getState();
      expect(batchId).toBeNull();
    });

    it('has waiting batchStatus', () => {
      const { batchStatus } = useVotingStore.getState();
      expect(batchStatus).toBe('waiting');
    });

    it('has empty selections object', () => {
      const { selections } = useVotingStore.getState();
      expect(selections).toEqual({});
    });
  });

  describe('selectCandidate', () => {
    it('selects a candidate for a position', () => {
      const { selectCandidate } = useVotingStore.getState();
      
      selectCandidate('position-1', 'candidate-1');
      
      const state = useVotingStore.getState();
      expect(state.selections).toEqual({ 'position-1': 'candidate-1' });
    });

    it('replaces existing selection for same position', () => {
      const { selectCandidate } = useVotingStore.getState();
      
      selectCandidate('position-1', 'candidate-1');
      selectCandidate('position-1', 'candidate-2');
      
      const state = useVotingStore.getState();
      expect(state.selections).toEqual({ 'position-1': 'candidate-2' });
    });
  });

  describe('Complete Voting Flow', () => {
    it('handles complete voting workflow', () => {
      const store = useVotingStore.getState();
      
      // 1. Join batch
      store.setBatchInfo({
        batchId: 'batch-1',
        batchStatus: 'waiting',
        positionInBatch: 1,
        totalInBatch: 10,
      });
      
      // 2. Batch becomes active
      store.setBatchInfo({ batchStatus: 'active' });
      
      // 3. Load ballot
      store.setPositions(mockPositions);
      
      // 4. Make selections
      store.selectCandidate('position-1', 'candidate-1');
      
      // 5. Start submission
      store.setSubmitting(true);
      
      // 6. Complete submission
      store.setConfirmation({
        confirmationNumber: 'VNABC123DEF456',
        timestamp: new Date().toISOString(),
        txHash: '0x1234567890',
        blockNumber: 123456,
      });
      
      const finalState = useVotingStore.getState();
      expect(finalState.confirmation).not.toBeNull();
    });
  });
});
```

---

## E2E Test Setup with Playwright

### Test File Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/route');
  });

  test('should describe the test scenario', async ({ page }) => {
    // Test implementation
  });
});
```

### E2E Test Examples

#### Voter Registration Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Voter Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Register');
    await expect(page.locator('input[name="nationalId"]')).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('text=National ID is required')).toBeVisible();
    await expect(page.locator('text=First name is required')).toBeVisible();
  });

  test('should show error for invalid email', async ({ page }) => {
    await page.fill('input[name="nationalId"]', '12345678');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid email address')).toBeVisible();
  });

  test('should successfully register with valid data', async ({ page }) => {
    await page.fill('input[name="nationalId"]', '12345678');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="phoneNumber"]', '+254700000000');
    await page.fill('input[name="dateOfBirth"]', '1990-01-01');
    await page.selectOption('select[name="county"]', 'Nairobi');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Registration successful')).toBeVisible({ 
      timeout: 10000 
    });
  });

  test('should show error for duplicate National ID', async ({ page }) => {
    // First registration would succeed, this tests duplicate handling
    await page.fill('input[name="nationalId"]', '12345678');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="phoneNumber"]', '+254700000000');
    
    await page.click('button[type="submit"]');
    
    await expect(
      page.locator('text=Voter with this National ID already exists')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('form')).toBeVisible();
    }
  });
});
```

#### Vote Casting Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Vote Casting', () => {
  // Login before tests
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="nationalId"]', '12345678');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display ballot with candidates', async ({ page }) => {
    await page.goto('/vote');
    
    await expect(page.locator('h1')).toContainText('Cast Your Vote');
    await expect(page.locator('.candidate-card')).toHaveCount(2);
  });

  test('should allow candidate selection', async ({ page }) => {
    await page.goto('/vote');
    
    // Select a candidate
    await page.click('input[name="position-president"][value="candidate-1"]');
    
    // Verify selection
    const selectedCandidate = page.locator('input[name="position-president"]:checked');
    await expect(selectedCandidate).toBeVisible();
  });

  test('should submit vote successfully', async ({ page }) => {
    await page.goto('/vote');
    
    // Make selection
    await page.click('input[name="position-president"][value="candidate-1"]');
    
    // Submit vote
    await page.click('button[type="submit"]');
    
    // Verify confirmation
    await expect(page.locator('text=Vote Submitted')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.confirmation-number')).toBeVisible();
  });

  test('should prevent double voting', async ({ page }) => {
    await page.goto('/vote');
    
    // Try to submit without making selection
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=Please select a candidate')).toBeVisible();
  });
});
```

---

## Coverage Targets

### Unit Test Coverage Goals

| Category | Target |
|----------|--------|
| **Stores** | 90%+ |
| **Custom Hooks** | 85%+ |
| **Utility Functions** | 90%+ |
| **Components** | 75%+ |
| **Overall** | 70%+ |

### E2E Test Coverage

| Feature | Test Coverage |
|---------|---------------|
| Voter Registration | Form validation, submission, error handling |
| Voter Login | Authentication, session management |
| Vote Casting | Ballot display, selection, submission |
| Dashboard | Data display, navigation |
| Admin Panel | CRUD operations |

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/frontend-tests.yml
name: Frontend Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Install Playwright browsers
        run: |
          cd frontend
          npx playwright install --with-deps

      - name: Run unit tests
        run: |
          cd frontend
          npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: ./frontend/coverage
          flags: frontend

  e2e:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Install Playwright browsers
        run: |
          cd frontend
          npx playwright install --with-deps

      - name: Run E2E tests
        run: |
          cd frontend
          npm run test:e2e
        env:
          CI: true

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report
```

### Running Tests in CI

```bash
# Full test suite for CI
npm run test:coverage && npm run test:e2e

# Parallel execution
npm test -- --maxWorkers=2
npm run test:e2e -- --parallel
```

---

## Best Practices

### 1. Test File Organization

```
frontend/
├── src/
│   ├── hooks/
│   │   └── useVoting.spec.ts
│   ├── stores/
│   │   └── voting.store.spec.ts
│   └── components/
│       └── VoteButton/
│           └── VoteButton.spec.tsx
├── tests/
│   └── e2e/
│       ├── voter-registration.spec.ts
│       ├── voter-login.spec.ts
│       └── vote-casting.spec.ts
└── jest.setup.js
```

### 2. Component Testing Patterns

```typescript
// Use semantic queries
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)
screen.getByText(/error message/i)

// Avoid test IDs when possible
// Use them only when semantic queries aren't possible

// Test user interactions, not implementation
await userEvent.click(button);
await userEvent.type(input, 'text');
```

### 3. Mocking API Calls

```typescript
// Mock API calls with MSW or jest.mock
jest.mock('@/hooks/useApi', () => ({
  useCastVote: () => ({
    mutateAsync: jest.fn().mockResolvedValue({
      confirmationId: 'VNABC123',
    }),
  }),
}));
```

### 4. Async Testing

```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});

// Use findBy* for auto-waiting
const successMessage = await screen.findByText('Success');
expect(successMessage).toBeInTheDocument();
```

---

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout for slow operations
2. **Flaky tests**: Use `waitFor` for async assertions
3. **Network errors**: Mock API calls in tests
4. **Browser issues**: Use Playwright's built-in retry mechanism

### Debugging Tests

```bash
# Run tests in debug mode
npm test -- --inspect-brk

# Run specific test with verbose output
npm test -- --verbose --testNamePattern="test name"

# Open Playwright UI
npm run test:e2e:ui

# Generate debug report
npm run test:e2e -- --trace on
```

---

## Test Reports

### Viewing Reports

```bash
# Jest coverage report
open frontend/coverage/lcov-report/index.html

# Playwright HTML report
open frontend/playwright-report/index.html
```
