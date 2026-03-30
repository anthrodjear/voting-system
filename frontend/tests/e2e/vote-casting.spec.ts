import { test, expect } from '@playwright/test';

test.describe('Vote Casting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="nationalId"]', '12345678');
    await page.fill('input[name="password"]', 'validpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  });

  test('should display active elections', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Active Elections')).toBeVisible();
  });

  test('should show election details when selected', async ({ page }) => {
    await page.click('button:has-text("Presidential Election 2024")');
    await expect(page.locator('text=Candidates')).toBeVisible();
  });

  test('should display candidate list', async ({ page }) => {
    await page.click('button:has-text("Vote Now")');
    await expect(page.locator('text=Select Your Candidate')).toBeVisible();
    await expect(page.locator('[data-testid="candidate-card"]')).toHaveCount(3);
  });

  test('should allow candidate selection', async ({ page }) => {
    await page.click('button:has-text("Vote Now")');
    await page.click('[data-testid="candidate-card"]:first-child');
    await expect(page.locator('button:has-text("Confirm Vote")')).toBeEnabled();
  });

  test('should show confirmation before casting vote', async ({ page }) => {
    await page.click('button:has-text("Vote Now")');
    await page.click('[data-testid="candidate-card"]:first-child');
    await page.click('button:has-text("Confirm Vote")');
    await expect(page.locator('text=Confirm Your Vote')).toBeVisible();
    await expect(page.locator('text=Once cast, your vote cannot be changed')).toBeVisible();
  });

  test('should successfully cast vote', async ({ page }) => {
    await page.click('button:has-text("Vote Now")');
    await page.click('[data-testid="candidate-card"]:first-child');
    await page.click('button:has-text("Confirm Vote")');
    await page.click('button:has-text("Cast Vote")');
    
    await expect(page.locator('text=Vote Cast Successfully')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Your vote has been recorded')).toBeVisible();
  });

  test('should prevent double voting', async ({ page }) => {
    await page.reload();
    await expect(page.locator('text=You have already voted')).toBeVisible();
    await expect(page.locator('button:has-text("Vote Now")')).toBeDisabled();
  });

  test('should show vote receipt after casting', async ({ page }) => {
    await page.click('button:has-text("Vote Now")');
    await page.click('[data-testid="candidate-card"]:first-child');
    await page.click('button:has-text("Confirm Vote")');
    await page.click('button:has-text("Cast Vote")');
    
    await expect(page.locator('text=Vote Receipt')).toBeVisible();
    await expect(page.locator('[data-testid="receipt-number"]')).toBeVisible();
  });

  test('should navigate to results after voting', async ({ page }) => {
    await page.click('button:has-text("Vote Now")');
    await page.click('[data-testid="candidate-card"]:first-child');
    await page.click('button:has-text("Confirm Vote")');
    await page.click('button:has-text("Cast Vote")');
    await page.click('button:has-text("View Results")');
    
    await expect(page).toHaveURL(/\/results/);
    await expect(page.locator('text=Election Results')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid="election-list"]')).toBeVisible();
    }
  });
});
