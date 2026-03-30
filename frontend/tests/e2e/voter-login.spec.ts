import { test, expect } from '@playwright/test';

test.describe('Voter Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Login');
    await expect(page.locator('input[name="nationalId"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('text=National ID is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="nationalId"]', '00000000');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 10000 });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.fill('input[name="nationalId"]', '12345678');
    await page.fill('input[name="password"]', 'validpassword');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test('should redirect to voter portal after login', async ({ page }) => {
    await page.fill('input[name="nationalId"]', '12345678');
    await page.fill('input[name="password"]', 'validpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 15000 });
  });

  test('should have forgot password link', async ({ page }) => {
    await expect(page.locator('text=Forgot password?')).toBeVisible();
  });

  test('should have register link for new voters', async ({ page }) => {
    await expect(page.locator('text=Register as a voter')).toBeVisible();
  });

  test('should handle biometric authentication prompt', async ({ page }) => {
    await page.fill('input[name="nationalId"]', '12345678');
    await page.fill('input[name="password"]', 'validpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Biometric Verification')).toBeVisible({ timeout: 10000 });
  });
});
