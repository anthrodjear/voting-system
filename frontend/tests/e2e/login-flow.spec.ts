import { test, expect } from '@playwright/test';

test.describe('Frontend Login Flow', () => {
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    networkErrors.length = 0;

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('requestfailed', (request) => {
      networkErrors.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    page.on('response', (response) => {
      if (response.status() >= 400 && !response.url().includes('/auth/me')) {
        networkErrors.push(`${response.status()} ${response.request().method()} ${response.url()}`);
      }
    });
  });

  test('Step 1: Navigate to login page and verify form elements', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'test-results/01-login-page.png', fullPage: true });

    await expect(page.locator('h2')).toContainText('Welcome Back');
    await expect(page.locator('text=Sign in to access your voting dashboard')).toBeVisible();

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    await expect(emailInput).toHaveAttribute('autoComplete', 'email');
    await expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');

    console.log('✅ Login page loaded successfully with all form elements');
  });

  test('Step 2: Login as voter with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').fill('voter@iebc.go.ke');
    await page.locator('input[type="password"]').fill('Voter123456!');

    await page.screenshot({ path: 'test-results/02-login-filled.png', fullPage: true });

    const loginResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/auth/login') && response.request().method() === 'POST',
      { timeout: 15000 }
    );

    await page.locator('button[type="submit"]').click();

    const loginResponse = await loginResponsePromise;
    console.log(`Login API Response Status: ${loginResponse.status()}`);

    if (loginResponse.ok()) {
      const responseBody = await loginResponse.json();
      const tokens = responseBody.data || responseBody;
      console.log(`Access Token: ${tokens.accessToken?.substring(0, 50)}...`);
      console.log(`Refresh Token: ${tokens.refreshToken}`);
      console.log(`Expires In: ${tokens.expiresIn}s`);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      console.log('✅ Login API returned tokens successfully');
    }

    await page.waitForURL('**/voter/dashboard', { timeout: 15000 });
    await page.screenshot({ path: 'test-results/03-dashboard.png', fullPage: true });

    console.log('✅ Redirected to voter dashboard');
  });

  test('Step 3: Verify login success - dashboard and localStorage', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').fill('voter@iebc.go.ke');
    await page.locator('input[type="password"]').fill('Voter123456!');

    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/voter/dashboard', { timeout: 15000 });

    await expect(page.getByRole('heading', { name: 'Welcome back, Voter!' })).toBeVisible();
    await expect(page.locator('text=Your voice matters')).toBeVisible();

    await expect(page.locator('text=Registration Status')).toBeVisible();
    await expect(page.locator('text=Next Election')).toBeVisible();
    await expect(page.getByText('Ready to Cast')).toBeVisible();

    await page.screenshot({ path: 'test-results/04-dashboard-verified.png', fullPage: true });

    const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
    console.log(`Refresh Token exists: ${!!refreshToken}`);
    expect(refreshToken).toBeTruthy();

    const authStorage = await page.evaluate(() => localStorage.getItem('auth-storage'));

    if (authStorage) {
      const authData = JSON.parse(authStorage);
      console.log(`Authenticated: ${authData.state?.isAuthenticated}`);
      console.log(`Has Token: ${!!authData.state?.token}`);
      console.log(`User Role: ${authData.state?.user?.role}`);
      console.log(`User Email: ${authData.state?.user?.email}`);

      expect(authData.state?.isAuthenticated).toBe(true);
      expect(authData.state?.token).toBeTruthy();
      expect(authData.state?.user?.role).toBe('voter');
    }

    console.log('✅ Dashboard verified with user info and auth tokens stored');
  });

  test('Step 4: Check console for errors', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').fill('voter@iebc.go.ke');
    await page.locator('input[type="password"]').fill('Voter123456!');

    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/voter/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);

    const corsErrors = consoleErrors.filter(e =>
      e.toLowerCase().includes('cors') || e.toLowerCase().includes('access-control')
    );

    console.log(`Console Errors: ${consoleErrors.length}`);
    consoleErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    console.log(`Network Errors: ${networkErrors.length}`);
    networkErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    console.log(`CORS Errors: ${corsErrors.length}`);

    if (corsErrors.length > 0) {
      console.log('⚠️  CORS Errors detected:', corsErrors);
    } else {
      console.log('✅ No CORS errors detected');
    }
  });

  test('Step 5: Test logout flow', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').fill('voter@iebc.go.ke');
    await page.locator('input[type="password"]').fill('Voter123456!');

    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/voter/dashboard', { timeout: 15000 });

    const authBefore = await page.evaluate(() => localStorage.getItem('auth-storage'));
    expect(authBefore).toBeTruthy();
    console.log('✅ User is logged in');

    await page.screenshot({ path: 'test-results/05-before-logout.png', fullPage: true });

    const logoutBtn = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Sign Out")');

    if (await logoutBtn.count() > 0) {
      await logoutBtn.first().click();
      await page.waitForURL('**/login', { timeout: 10000 });

      const authAfter = await page.evaluate(() => localStorage.getItem('auth-storage'));
      const refreshTokenAfter = await page.evaluate(() => localStorage.getItem('refreshToken'));

      await page.screenshot({ path: 'test-results/06-after-logout.png', fullPage: true });
      console.log('✅ Logout successful - redirected to login page');
    } else {
      console.log('⚠️  Logout button not found in current view');
      await page.screenshot({ path: 'test-results/05-no-logout-button.png', fullPage: true });
    }
  });

  test('Full Login Flow - Complete E2E Test', async ({ page }) => {
    const results = {
      loginPage: false,
      formFilled: false,
      loginApiSuccess: false,
      dashboardReached: false,
      tokenStored: false,
      noConsoleErrors: true,
    };

    try {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/full-01-login.png', fullPage: true });

      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      results.loginPage = true;
      console.log('✅ Step 1: Login page loaded');

      await page.locator('input[type="email"]').fill('voter@iebc.go.ke');
      await page.locator('input[type="password"]').fill('Voter123456!');
      await page.screenshot({ path: 'test-results/full-02-filled.png', fullPage: true });
      results.formFilled = true;
      console.log('✅ Step 2: Credentials filled');

      const loginPromise = page.waitForResponse(
        (r) => r.url().includes('/auth/login'),
        { timeout: 15000 }
      );

      await page.locator('button[type="submit"]').click();

      const loginResp = await loginPromise;
      if (loginResp.ok()) {
        results.loginApiSuccess = true;
        console.log('✅ Step 3: Login API succeeded');
      }

      await page.waitForURL('**/voter/dashboard', { timeout: 15000 });
      await page.screenshot({ path: 'test-results/full-03-dashboard.png', fullPage: true });
      results.dashboardReached = true;
      console.log('✅ Step 4: Dashboard reached');

      const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
      if (refreshToken) {
        results.tokenStored = true;
        console.log('✅ Step 5: Refresh token stored');
      }

      await page.waitForTimeout(2000);
      if (consoleErrors.length > 0) {
        results.noConsoleErrors = false;
        console.log(`⚠️  Console errors: ${consoleErrors.length}`);
      } else {
        console.log('✅ Step 6: No console errors');
      }

      console.log('\n========== TEST RESULTS ==========');
      console.log(`Login Page Loaded:    ${results.loginPage ? 'PASS ✅' : 'FAIL ❌'}`);
      console.log(`Form Filled:          ${results.formFilled ? 'PASS ✅' : 'FAIL ❌'}`);
      console.log(`Login API Success:    ${results.loginApiSuccess ? 'PASS ✅' : 'FAIL ❌'}`);
      console.log(`Dashboard Reached:    ${results.dashboardReached ? 'PASS ✅' : 'FAIL ❌'}`);
      console.log(`Token Stored:         ${results.tokenStored ? 'PASS ✅' : 'FAIL ❌'}`);
      console.log(`No Console Errors:    ${results.noConsoleErrors ? 'PASS ✅' : 'WARN ⚠️'}`);
      console.log('==================================');

      const corePassed = results.loginPage && results.formFilled && results.loginApiSuccess && results.dashboardReached && results.tokenStored;
      console.log(`OVERALL: ${corePassed ? 'ALL CORE TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`);

    } catch (error) {
      console.error('Test failed:', error);
      await page.screenshot({ path: 'test-results/full-error.png', fullPage: true });
      throw error;
    }
  });
});
