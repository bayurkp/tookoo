import { test, expect } from '@playwright/test';

test.describe('Smoke & Navigation E2E Suite', () => {
  test('loads Tookoo POS and renders main navigation layout', async ({ page }) => {
    await page.goto('/');

    // Verify Title & Brand Header
    await expect(page).toHaveTitle(/Tookoo/i);
    await expect(page.locator('header')).toContainText('Tookoo');

    // Verify Default Tab is Cashier
    await expect(page.getByRole('heading', { level: 2 })).toContainText(
      /Terminal Kasir|Cashier Terminal/i
    );

    // Navigate to Products Page
    await page.getByRole('link', { name: /Produk|Products/i }).click();
    await expect(page).toHaveURL(/.*products/);
    await expect(page.getByRole('heading', { level: 2 })).toContainText(/Daftar Produk|Products/i);

    // Navigate to Orders History Page
    await page.getByRole('link', { name: /Riwayat|History/i }).click();
    await expect(page).toHaveURL(/.*orders/);
    await expect(page.getByRole('heading', { level: 2 })).toContainText(
      /Riwayat Transaksi|Transaction History/i
    );

    // Navigate to Sync Page
    await page.getByRole('link', { name: /Sambung Perangkat|Connect Devices/i }).click();
    await expect(page).toHaveURL(/.*sync/);
    await expect(page.getByRole('heading', { level: 2 })).toContainText(
      /Sambung Perangkat|Connect Store Devices/i
    );
  });

  test('switches language between ID and EN dynamically', async ({ page }) => {
    await page.goto('/');

    // Switch to English
    await page.getByRole('button', { name: /EN/i }).click();
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Cashier Terminal');

    // Switch back to Indonesian
    await page.getByRole('button', { name: /ID/i }).click();
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Terminal Kasir');
  });

  test('verifies PWA manifest link is present in head', async ({ page }) => {
    await page.goto('/');
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
  });
});
