import { test, expect } from '@playwright/test';

test.describe('Cashier Full Checkout Flow E2E', () => {
  test('creates a product, adds to cart, processes cash payment, and verifies sales history', async ({
    page,
  }) => {
    await page.goto('/products');

    // 1. Add a new product in Products Catalog
    await page.getByRole('button', { name: /Tambah Produk/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel(/Nama Produk/i).fill('Kopi Susu Gula Aren');
    await page.getByLabel(/Kategori/i).fill('Minuman');
    await page.getByLabel(/Harga/i).fill('18000');
    await page.getByLabel(/Jumlah Stok/i).fill('20');

    await page
      .getByRole('dialog')
      .getByRole('button', { name: /Tambah Produk/i })
      .click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify product card in catalog
    await expect(page.locator('text=Kopi Susu Gula Aren')).toBeVisible();

    // 2. Go to Cashier Terminal
    await page.getByRole('link', { name: /Kasir/i }).click();
    await expect(page.locator('text=Kopi Susu Gula Aren')).toBeVisible();

    // 3. Add product to cart
    await page.locator('text=Kopi Susu Gula Aren').click();
    await expect(page.locator('text=1 item')).toBeVisible();

    // 4. Proceed to Payment
    await page.getByRole('button', { name: /Bayar Sekarang/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click exact cash button or enter cash
    await page.getByRole('button', { name: /Uang Pas/i }).click();

    // Confirm Payment
    await page.getByRole('button', { name: /Konfirmasi Pembayaran/i }).click();

    // 5. Success Dialog Verification
    await expect(page.locator('text=Pembayaran Berhasil')).toBeVisible();
    await page.getByRole('button', { name: /Transaksi Baru/i }).click();
    await expect(page.locator('text=Keranjang masih kosong')).toBeVisible();

    // 6. Verify in Orders History
    await page.getByRole('link', { name: /Riwayat/i }).click();
    await expect(page.locator('text=Kopi Susu Gula Aren')).toBeVisible();
  });
});
