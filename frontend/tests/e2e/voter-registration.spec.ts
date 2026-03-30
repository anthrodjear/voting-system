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
    await expect(page.locator('input[name="phoneNumber"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('text=National ID is required')).toBeVisible();
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Last name is required')).toBeVisible();
  });

  test('should show error for invalid email', async ({ page }) => {
    await page.fill('input[name="nationalId"]', '12345678');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid email address')).toBeVisible();
  });

  test('should show error for invalid phone number', async ({ page }) => {
    await page.fill('input[name="nationalId"]', '12345678');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="phoneNumber"]', 'invalid');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid phone number')).toBeVisible();
  });

  test('should successfully register with valid data', async ({ page }) => {
    await page.fill('input[name="nationalId"]', '12345678');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="phoneNumber"]', '+254700000000');
    await page.fill('input[name="dateOfBirth"]', '1990-01-01');
    await page.selectOption('select[name="county"]', 'Nairobi');
    await page.selectOption('select[name="constituency"]', 'Westlands');
    await page.selectOption('select[name="ward"]', 'Kitisuru');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Registration successful')).toBeVisible({ timeout: 10000 });
  });

  test('should show error for duplicate National ID', async ({ page }) => {
    await page.fill('input[name="nationalId"]', '12345678');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="phoneNumber"]', '+254700000000');
    await page.fill('input[name="dateOfBirth"]', '1990-01-01');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Voter with this National ID already exists')).toBeVisible({ timeout: 10000 });
  });

  test('should have working county/constituency/ward dropdowns', async ({ page }) => {
    await page.selectOption('select[name="county"]', 'Nairobi');
    await expect(page.locator('select[name="constituency"]')).toBeEnabled();
    
    await page.selectOption('select[name="constituency"]', 'Westlands');
    await expect(page.locator('select[name="ward"]')).toBeEnabled();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login');
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    await page.click('button[data-testid="toggle-password"]');
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('form')).toBeVisible();
    }
  });
});
