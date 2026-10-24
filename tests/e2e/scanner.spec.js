import { expect, test } from '@playwright/test';

const scheduledClaim = {
  id: 'CL-SCAN-0147',
  item: {
    id: 'dompet-kartu-identitas',
    name: 'Dompet / kartu identitas',
    category: 'Sensitif',
  },
  status: 'SCHEDULED',
  schedule: {
    ticketId: 'ET-CL-SCAN-0147',
    date: 'Rabu, 14 Okt, 2026',
    time: '11.00 - 12.00',
    qrToken: 'A'.repeat(64),
    qrGeneratedAt: new Date().toISOString(),
  },
};

async function prepareAdminPreview(page, claims = [scheduledClaim]) {
  await page.addInitScript((storedClaims) => {
    localStorage.setItem(
      'ubakrie-lf-auth',
      JSON.stringify({
        token: 'admin-preview-token',
        user: { id: 'ADMIN-01', role: 'Admin_BEM', name: 'Admin BEM' },
      }),
    );
    localStorage.setItem(
      'ubakrie-lf-preview-claims',
      JSON.stringify(storedClaims),
    );
  }, claims);
  await page.goto('/admin/scanner', { waitUntil: 'domcontentloaded' });
}

test('admin validates a ticket, confirms handover, and rejects its reused token', async ({
  page,
}) => {
  await prepareAdminPreview(page);
  await expect(
    page.getByRole('heading', { name: 'Scan E-Ticket' }),
  ).toBeVisible();
  await page.getByLabel('Input token manual (fallback)').fill('A'.repeat(64));
  await page.getByRole('button', { name: 'Validasi Token' }).click();

  await expect(
    page.getByRole('heading', { name: 'Hasil Validasi' }),
  ).toBeVisible();
  await expect(page.getByText('VALID / MATCH')).toBeVisible();
  await expect(page.getByText('Najwa Naela Fawwaz')).toBeVisible();
  await page.getByRole('button', { name: 'Konfirmasi Serah-Terima' }).click();
  await expect(page.getByText('SERAH-TERIMA SELESAI')).toBeVisible();
  await expect(page.getByText(/status klaim menjadi CLAIMED/)).toBeVisible();

  const updatedClaims = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('ubakrie-lf-preview-claims')),
  );
  expect(updatedClaims[0].status).toBe('CLAIMED');
  expect(updatedClaims[0].schedule.qrUsedAt).toBeTruthy();
  await expect(
    page.getByRole('button', { name: 'Scan E-Ticket Berikutnya' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Scan E-Ticket Berikutnya' }).click();
  await page.getByLabel('Input token manual (fallback)').fill('A'.repeat(64));
  await page.getByRole('button', { name: 'Validasi Token' }).click();
  await expect(
    page.getByRole('heading', { name: 'Token Sudah Pernah Dipakai' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Scan Ulang' }).click();
  await page.getByLabel('Input token manual (fallback)').fill('Z'.repeat(64));
  await page.getByRole('button', { name: 'Validasi Token' }).click();
  await expect(
    page.getByRole('heading', { name: 'QR Code Tidak Valid' }),
  ).toBeVisible();

  const auditEvents = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('ubakrie-lf-preview-audit')),
  );
  expect(auditEvents[0].event_type).toBe('TICKET_VALIDATION_INVALID');
  expect(auditEvents[0].actor_id).toBe('ADMIN-01');
  expect(
    auditEvents.some((event) => event.event_type === 'HANDOVER_CONFIRMED'),
  ).toBe(true);
});

test('admin sees an expired token screen and can scan again', async ({
  page,
}) => {
  const expiredClaim = {
    ...scheduledClaim,
    schedule: {
      ...scheduledClaim.schedule,
      qrGeneratedAt: new Date(Date.now() - 31 * 60 * 1000).toISOString(),
    },
  };
  await prepareAdminPreview(page, [expiredClaim]);
  await page.getByLabel('Input token manual (fallback)').fill('A'.repeat(64));
  await page.getByRole('button', { name: 'Validasi Token' }).click();

  await expect(
    page.getByRole('heading', { name: 'QR Code Kedaluwarsa' }),
  ).toBeVisible();
  await expect(
    page.getByText(/Verifikasi ulang identitas pemohon/),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Scan Ulang' }).click();
  await expect(
    page.getByRole('heading', { name: 'Scan E-Ticket' }),
  ).toBeVisible();
});

test('admin rejects a second scheduled claim for the same item', async ({
  page,
}) => {
  const duplicateClaim = {
    ...scheduledClaim,
    id: 'CL-SCAN-DUPLICATE',
    schedule: {
      ...scheduledClaim.schedule,
      ticketId: 'ET-CL-SCAN-DUPLICATE',
      qrToken: 'B'.repeat(64),
    },
  };
  await prepareAdminPreview(page, [scheduledClaim, duplicateClaim]);
  await page.getByLabel('Input token manual (fallback)').fill('A'.repeat(64));
  await page.getByRole('button', { name: 'Validasi Token' }).click();

  await expect(
    page.getByRole('heading', { name: 'Klaim Ganda' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Scan Ulang' })).toBeVisible();
});
