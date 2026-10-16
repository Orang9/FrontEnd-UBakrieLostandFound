import { expect, test } from '@playwright/test';

test('opens the public home page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Beranda' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Panduan Penggunaan' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Lapor Hilang/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Lapor Temuan/ })).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Navigasi utama' }),
  ).toBeVisible();
  await expect(page.locator('.app-shell.is-home .topbar')).toBeHidden();
});
