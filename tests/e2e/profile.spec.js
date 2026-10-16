import { expect, test } from '@playwright/test';

test('opens profile history without login and switches history tabs on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/profile');

  await expect(page).toHaveURL(/\/profile$/);
  await expect(
    page.getByRole('heading', { name: 'Riwayat Saya' }),
  ).toBeVisible();
  await expect(page.locator('.app-shell.is-profile .topbar')).toBeHidden();
  await expect(
    page
      .getByRole('navigation', { name: 'Navigasi utama' })
      .getByText('Profil'),
  ).toBeVisible();
  await expect(page.getByText('Klaim #CL-0147')).toBeVisible();
  await expect(page.getByText('Verifikasi manual Admin BEM')).toBeVisible();

  await page.getByRole('tab', { name: 'Riwayat Lapor' }).click();
  await expect(page.getByText('Laporan #RP-0108')).toBeVisible();
  await expect(page.getByText('Klaim #CL-0147')).toHaveCount(0);
});
