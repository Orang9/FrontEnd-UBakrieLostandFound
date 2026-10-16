import { expect, test } from '@playwright/test';

test('submits a catalog claim and tracks pending approval in profile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/catalog');
  await page
    .getByRole('link', { name: 'Lihat detail Dompet / kartu identitas' })
    .click();

  await expect(page).toHaveURL(/\/catalog\/dompet-kartu-identitas$/);
  await expect(
    page.getByRole('heading', { name: 'Ajukan Klaim' }),
  ).toBeVisible();
  await page
    .getByLabel('1. Sebutkan isi dompet selain kartu identitas')
    .fill('Kartu ATM dan struk');
  await page
    .getByLabel('2. Warna / ciri khusus dompet')
    .fill('Hitam dengan gantungan kunci kecil');
  await page.getByRole('button', { name: 'Kirim Klaim' }).click();

  await expect(page).toHaveURL(/\/profile\?tab=claims&claimId=CL-/);
  await expect(page.getByText(/berstatus PENDING/)).toBeVisible();
  await expect(
    page.getByText('Menunggu persetujuan Admin BEM (PENDING)'),
  ).toBeVisible();
  const pendingClaimId = new URL(page.url()).searchParams.get('claimId');
  const pendingClaimCard = page
    .locator('.profile-history-card')
    .filter({ hasText: `Klaim #${pendingClaimId}` });
  await expect(
    pendingClaimCard.getByRole('link', { name: 'Pilih jadwal pengambilan' }),
  ).toHaveCount(0);

  await page.goto('/catalog/dompet-kartu-identitas');
  await expect(
    page.getByText(/Anda sudah memiliki klaim aktif untuk barang ini/),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kirim Klaim' })).toHaveCount(
    0,
  );
});
