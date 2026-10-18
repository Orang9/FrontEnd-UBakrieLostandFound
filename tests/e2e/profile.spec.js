import { expect, test } from '@playwright/test';

test('redirects unauthenticated visitors from profile history to login', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/profile');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible();
  await expect(page.getByLabel('NIM')).toBeVisible();
});
