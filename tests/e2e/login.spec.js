import { expect, test } from '@playwright/test';

test('shows the mobile login layout and validates numeric NIM', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/login');

  await expect(
    page.getByRole('heading', { name: 'UBakrie Lost & Found' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible();
  await expect(
    page.getByText('Hanya untuk civitas academica Universitas Bakrie'),
  ).toBeVisible();
  await expect(
    page.getByText('Hanya Admin BEM yang memiliki akun administrator'),
  ).toBeVisible();
  await expect(page.getByLabel('Kata Sandi')).toHaveAttribute(
    'type',
    'password',
  );

  await page.getByLabel('NIM').fill('nim-mahasiswa');
  await page.getByLabel('Kata Sandi').fill('password');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page.getByText('NIM hanya boleh berisi angka.')).toBeVisible();
});
