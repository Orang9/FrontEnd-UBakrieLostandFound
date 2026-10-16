import { expect, test } from '@playwright/test';

test('opens report page without login and validates the mobile report form', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/report');

  await expect(page).toHaveURL(/\/report$/);
  await expect(
    page.getByRole('heading', { name: 'Lapor Barang' }),
  ).toBeVisible();
  await expect(page.locator('.app-shell.is-report .topbar')).toBeHidden();
  await expect(page.getByLabel('Nama barang')).toBeVisible();
  await expect(page.getByLabel('Lokasi ditemukan')).toBeVisible();

  await page.getByRole('button', { name: 'Barang Hilang' }).click();
  await expect(page.getByLabel('Lokasi hilang')).toBeVisible();

  await page.getByRole('radio', { name: 'Sensitif' }).check();
  await expect(page.getByText('Blind Listing aktif')).toBeVisible();
  await page.getByLabel('Tambah foto barang').setInputFiles({
    name: 'dompet.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/zWQAAAAASUVORK5CYII=',
      'base64',
    ),
  });
  await expect(
    page.getByAltText('Pratinjau foto sensitif yang diburamkan'),
  ).toHaveClass(/is-blurred/);

  await page.getByRole('button', { name: 'Kirim Laporan' }).click();
  await expect(page.getByText('Nama barang wajib diisi.')).toBeVisible();
});
