import { expect, test } from '@playwright/test';

test('searches and filters catalog on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/catalog');

  await expect(
    page.getByRole('heading', { name: 'Temukan Barang' }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Navigasi utama' })
      .getByText('Katalog'),
  ).toBeVisible();
  await expect(page.locator('.app-shell.is-catalog .topbar')).toBeHidden();

  await page.getByRole('searchbox', { name: 'Cari barang' }).fill('Parkir B');
  await expect(
    page.getByRole('heading', { name: 'Kunci motor Honda' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Tas ransel hitam' }),
  ).toHaveCount(0);

  await page.getByRole('searchbox', { name: 'Cari barang' }).clear();
  await page.getByRole('button', { name: 'Sensitif' }).click();
  await expect(
    page.getByRole('heading', { name: 'Dompet / kartu identitas' }),
  ).toBeVisible();
  await expect(page.getByText('Foto diburamkan (Sensitif)')).toBeVisible();
});
