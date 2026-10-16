import { expect, test } from '@playwright/test';

test('approved claim can book an available slot and open its preview ticket', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/profile?tab=claims');
  await page.getByRole('link', { name: 'Pilih jadwal pengambilan' }).click();

  await expect(page).toHaveURL(/\/schedule\?claimId=CL-0147$/);
  await expect(
    page.getByRole('heading', { name: 'Pilih Slot Pengambilan' }),
  ).toBeVisible();
  await expect(page.getByText('Slot tersedia - Rabu, 14 Okt')).toBeVisible();
  await expect(
    page.getByRole('radio', { name: /10\.00 - 11\.00/ }),
  ).toBeDisabled();
  await page.getByRole('radio', { name: /09\.00 - 10\.00/ }).check();
  await page.getByRole('button', { name: 'Konfirmasi Jadwal' }).click();

  await expect(page).toHaveURL(
    /\/profile\?tab=claims&claimId=CL-0147&scheduled=1$/,
  );
  await expect(
    page.getByText(
      'Jadwal pengambilan klaim #CL-0147 telah dikonfirmasi untuk preview.',
    ),
  ).toBeVisible();
  await expect(page.getByText('Terjadwal', { exact: true })).toBeVisible();
  await page
    .getByRole('link', {
      name: 'Tampilkan E-Ticket untuk Dompet / kartu identitas, klaim CL-0147',
    })
    .click();

  await expect(page).toHaveURL(/\/tickets\/ET-CL-0147$/);
  await expect(
    page.getByRole('heading', { name: 'Profil & E-Ticket' }),
  ).toBeVisible();
  await expect(page.getByText('Najwa Naela Fawwaz')).toBeVisible();
  await expect(page.getByText(/^Berlaku (30:00|29:)/)).toBeVisible();
  await expect(page.locator('.eticket-qr svg')).toBeVisible();
  await expect(page.locator('.eticket-qr svg title')).toHaveText(
    'QR code tiket ET-CL-0147',
  );
  await expect(
    page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('link', {
      name: /Profil/,
    }),
  ).toHaveClass(/is-active/);
});

test('expired preview QR stays disabled until the user refreshes it', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'ubakrie-lf-preview-claims',
      JSON.stringify([
        {
          id: 'CL-EXPIRED',
          item: { id: 'item-expired', name: 'Barang contoh', category: 'Umum' },
          status: 'SCHEDULED',
          schedule: {
            ticketId: 'ET-CL-EXPIRED',
            date: 'Rabu, 14 Okt, 2026',
            time: '11.00 - 12.00',
            qrToken: 'expired-preview-token',
            qrGeneratedAt: new Date(Date.now() - 31 * 60 * 1000).toISOString(),
          },
        },
      ]),
    );
  });
  await page.goto('/tickets/ET-CL-EXPIRED');

  await expect(page.getByRole('status')).toHaveText('Expired');
  await expect(page.locator('.eticket-qr')).toHaveClass(/is-expired/);
  await page
    .getByRole('button', { name: 'Tampilkan / Perbarui QR Code' })
    .click();

  await expect(page.getByText(/^Berlaku (30:00|29:)/)).toBeVisible();
  await expect(page.locator('.eticket-qr')).not.toHaveClass(/is-expired/);
});

test('schedule route does not allow pending claims to proceed', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'ubakrie-lf-preview-claims',
      JSON.stringify([
        {
          id: 'CL-PENDING',
          item: { id: 'item-pending', name: 'Barang contoh' },
          status: 'PENDING',
        },
      ]),
    );
  });
  await page.goto('/schedule?claimId=CL-PENDING');
  await expect(
    page.getByText('Jadwal hanya dapat dipilih setelah klaim disetujui.'),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Konfirmasi Jadwal' }),
  ).toHaveCount(0);
});
