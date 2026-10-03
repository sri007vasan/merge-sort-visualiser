import { test, expect } from '@playwright/test';

test.describe('Merge Sort Visualiser', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('applies custom array correctly', async ({ page }) => {
    await page.getByLabel('Custom array').fill('5, 3, 8, 1');
    await page.getByRole('button', { name: 'Apply' }).click();
    const bars = page.locator('[data-testid="bar"]');
    await expect(bars).toHaveCount(4);
    await expect(bars.nth(0)).toHaveAttribute('data-value', '5');
    await expect(bars.nth(1)).toHaveAttribute('data-value', '3');
    await expect(bars.nth(2)).toHaveAttribute('data-value', '8');
    await expect(bars.nth(3)).toHaveAttribute('data-value', '1');
  });

  test('sorting completes fast-forward', async ({ page }) => {
    await page.getByLabel('Custom array').fill('5, 3, 8, 1');
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.getByRole('button', { name: 'Start' }).click();
    await page.clock.install();
    await page.clock.fastForward(10000);
    await expect(page.getByTestId('status')).toHaveText('Sorted!');
    const bars = page.locator('[data-testid="bar"]');
    await expect(bars.nth(0)).toHaveAttribute('data-value', '1');
    await expect(bars.nth(1)).toHaveAttribute('data-value', '3');
    await expect(bars.nth(2)).toHaveAttribute('data-value', '5');
    await expect(bars.nth(3)).toHaveAttribute('data-value', '8');
  });

  test('step mode increments comparisons', async ({ page }) => {
    await page.getByLabel('Custom array').fill('5, 3, 8, 1');
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.getByRole('button', { name: 'Start' }).click();
    await page.getByRole('button', { name: 'Pause' }).click();
    await page.getByRole('button', { name: 'Step' }).click();
    await expect(page.getByTestId('comparisons-count')).toHaveText('1');
    await expect(page.getByTestId('status')).toHaveText('Paused');
  });

  test('invalid input shows error', async ({ page }) => {
    await page.getByLabel('Custom array').fill('4, x, 2');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByTestId('input-error')).toHaveText('All entries must be numbers');
    const bars = page.locator('[data-testid="bar"]');
    await expect(bars).toHaveCount(16); // default array size
  });

  test('reset restores original order', async ({ page }) => {
    await page.getByLabel('Custom array').fill('5, 3, 8, 1');
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.getByRole('button', { name: 'Start' }).click();
    await page.clock.install();
    await page.clock.fastForward(10000);
    await page.getByRole('button', { name: 'Reset' }).click();
    const bars = page.locator('[data-testid="bar"]');
    await expect(bars.nth(0)).toHaveAttribute('data-value', '5');
    await expect(bars.nth(1)).toHaveAttribute('data-value', '3');
    await expect(bars.nth(2)).toHaveAttribute('data-value', '8');
    await expect(bars.nth(3)).toHaveAttribute('data-value', '1');
  });

  test('page loads without console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    expect(errors).toEqual([]);
  });
});
