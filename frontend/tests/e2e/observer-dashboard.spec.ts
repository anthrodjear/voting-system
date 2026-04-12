import { test, expect } from '@playwright/test';

test.describe('Observer Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/observer');
  });

  test('should load observer dashboard without login', async ({ page }) => {
    await expect(page).toHaveURL(/\/observer/);
    await expect(page.locator('text=Live Election Observer')).toBeVisible();
    await expect(page.locator('text=Public Observer')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Candidates' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Blockchain' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Reports' })).toBeVisible();
  });

  test('should show LIVE indicator', async ({ page }) => {
    await expect(page.getByText('LIVE', { exact: true })).toBeVisible();
  });

  test('should navigate to candidates page', async ({ page }) => {
    await page.goto('/observer/candidates');
    await expect(page).toHaveURL(/\/observer\/candidates/);
    await expect(page.locator('text=Candidate Results')).toBeVisible();
  });

  test('should navigate to blockchain page', async ({ page }) => {
    await page.goto('/observer/blockchain');
    await expect(page).toHaveURL(/\/observer\/blockchain/);
    await expect(page.getByRole('heading', { name: 'Blockchain Verification', exact: true })).toBeVisible();
  });

  test('should navigate to reports page', async ({ page }) => {
    await page.goto('/observer/reports');
    await expect(page).toHaveURL(/\/observer\/reports/);
    await expect(page.getByRole('heading', { name: 'Reports Generation', exact: true })).toBeVisible();
  });

  test('should have theme toggle', async ({ page }) => {
    await expect(page.locator('button[title*="mode"]')).toBeVisible();
  });

  test('should have exit observer link', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Exit Observer' })).toBeVisible();
  });

  test('should display election stats card', async ({ page }) => {
    await expect(page.locator('text=Total Registered')).toBeVisible({ timeout: 10000 });
  });

  test('should have auto-refresh toggle', async ({ page }) => {
    await expect(page.locator('text=Auto-refresh ON')).toBeVisible();
  });

  test('should navigate back to home from exit', async ({ page }) => {
    await page.locator('aside').getByRole('link', { name: 'Exit Observer' }).click({ force: true });
    await expect(page).toHaveURL('/');
  });
});