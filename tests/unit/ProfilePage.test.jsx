import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ProfilePage } from '../../src/features/profile/index.js';
import { getProfile } from '../../src/features/profile/api/profileApi.js';

vi.mock('../../src/features/profile/api/profileApi.js', () => ({
  getProfile: vi.fn(),
}));

afterEach(cleanup);
beforeEach(() => {
  getProfile.mockResolvedValue({
    data: [
      {
        claim_id: 147,
        item_name: 'Dompet kulit',
        category_name: 'Dompet',
        status: 'verified',
      },
      {
        claim_id: 148,
        item_name: 'Kunci motor',
        category_name: 'Aksesori',
        status: 'scheduled',
      },
    ],
  });
});

describe('ProfilePage', () => {
  it('loads claim history and links verified and scheduled claims to next steps', async () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Riwayat Saya' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Dompet kulit' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Klaim #147')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Pilih jadwal pengambilan' }),
    ).toHaveAttribute('href', '/schedule?claimId=147');
    expect(
      screen.getByRole('link', {
        name: 'Tampilkan E-Ticket untuk Kunci motor, klaim 148',
      }),
    ).toHaveAttribute('href', '/tickets/148');
  });

  it('explains that report history is unavailable in the backend API', async () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Riwayat Lapor' }));
    expect(
      screen.getByText(/backend belum menyediakan endpoint/),
    ).toBeInTheDocument();
  });
});
