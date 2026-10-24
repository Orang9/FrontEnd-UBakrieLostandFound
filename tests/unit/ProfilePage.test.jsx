import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { getProfile } from '../../src/features/profile/api/profileApi.js';
import { ProfilePage } from '../../src/features/profile/index.js';

vi.mock('../../src/features/profile/api/profileApi.js', () => ({
  getProfile: vi.fn(),
}));

afterEach(cleanup);

describe('ProfilePage', () => {
  beforeEach(() => {
    localStorage.clear();
    getProfile.mockResolvedValue({
      status: 'success',
      data: {
        claims: [
          {
            claim_id: 147,
            item_id: 21,
            item_name: 'Dompet / kartu identitas',
            image_path: 'public/uploads/claimed-wallet.jpg',
            category_name: 'Sensitif',
            status: 'verified',
            create_at: '2026-10-12',
          },
        ],
        reports: [
          {
            item_id: 108,
            name: 'Dompet / kartu identitas',
            category_name: 'Sensitif',
            report_type: 'found',
            status: 'available',
            display_status: 'Tersedia',
            report_date: '2026-10-09',
          },
          {
            item_id: 96,
            name: 'Kunci motor Honda',
            category_name: 'Umum',
            report_type: 'lost',
            status: 'active',
            display_status: 'Laporan aktif',
            report_date: '2026-10-07',
          },
        ],
      },
    });
  });

  it('shows backend claim history and allows scheduling approved claims', async () => {
    const { container } = render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Riwayat Saya' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Riwayat Klaim' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      await screen.findByRole('heading', {
        name: 'Dompet / kartu identitas',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Klaim #147')).toBeInTheDocument();
    expect(
      container.querySelector('.profile-history-thumbnail img'),
    ).toHaveAttribute(
      'src',
      'http://localhost:5001/uploads/claimed-wallet.jpg',
    );
    expect(screen.getByText('Klaim dikirim').closest('li')).toHaveClass(
      'is-complete',
    );
    expect(
      screen.getByText('Verifikasi manual Admin BEM').closest('li'),
    ).toHaveClass('is-complete');
    expect(screen.getByText('Disetujui (APPROVED)').closest('li')).toHaveClass(
      'is-complete',
    );
    expect(
      screen.getByText('Jadwal dipilih (TERJADWAL)').closest('li'),
    ).not.toHaveClass('is-complete');
    expect(
      screen.getByRole('link', { name: 'Pilih jadwal pengambilan' }),
    ).toHaveAttribute('href', '/schedule?claimId=147');
  });

  it('switches to backend report history', async () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Riwayat Lapor' }));

    expect(screen.getByRole('tab', { name: 'Riwayat Lapor' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(await screen.findByText('Laporan #108')).toBeInTheDocument();
    expect(screen.getByText('Temuan')).toBeInTheDocument();
    expect(screen.getByText('Tersedia')).toHaveClass(
      'status-badge',
      'status-success',
    );
    expect(screen.getByText('Laporan aktif')).toHaveClass(
      'status-badge',
      'status-info',
    );
    expect(screen.queryByText('Klaim #147')).not.toBeInTheDocument();
    expect(screen.getByText('Laporan #96')).toBeInTheDocument();
  });

  it('shows an E-Ticket link for scheduled backend claims using the claim ID', async () => {
    getProfile.mockResolvedValueOnce({
      status: 'success',
      data: {
        claims: [
          {
            claim_id: 253,
            item_id: 32,
            item_name: 'Tas ransel',
            status: 'scheduled',
            scheduled_date: '2026-10-25',
          },
        ],
        reports: [],
      },
    });

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('link', {
        name: 'Tampilkan E-Ticket untuk Tas ransel, klaim 253',
      }),
    ).toHaveAttribute('href', '/tickets/253');
  });

  it('keeps backend history available when stored preview claims are invalid', async () => {
    localStorage.setItem(
      'ubakrie-lf-preview-claims',
      JSON.stringify([{ id: 'CL-legacy', status: 'PENDING' }]),
    );

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Klaim #147')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Riwayat klaim lokal tidak dapat dibaca. Riwayat dari akun tetap tersedia.',
    );
  });

  it('builds claim timelines for pending, scheduled, claimed, and rejected statuses', async () => {
    const statusCases = [
      {
        status: 'pending',
        completeStep: 'Klaim dikirim',
        pendingStep: 'Menunggu persetujuan Admin BEM (PENDING)',
      },
      {
        status: 'scheduled',
        completeStep: 'Jadwal dipilih (TERJADWAL)',
        pendingStep: 'Diambil (CLAIMED)',
      },
      {
        status: 'claimed',
        completeStep: 'Diambil (CLAIMED)',
      },
      {
        status: 'rejected',
        completeStep: 'Klaim ditolak (REJECTED)',
        absentStep: 'Disetujui (APPROVED)',
      },
    ];

    for (const testCase of statusCases) {
      getProfile.mockResolvedValueOnce({
        data: {
          claims: [
            {
              claim_id: 147,
              item_id: 21,
              item_name: 'Dompet / kartu identitas',
              status: testCase.status,
              create_at: '2026-10-12 08:10:00',
              processed_at: '2026-10-12 11:02:00',
              scheduled_date: '2026-10-13',
            },
          ],
          reports: [],
        },
      });

      const { unmount } = render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      const completedStep = await screen.findByText(testCase.completeStep);
      expect(completedStep.closest('li')).toHaveClass('is-complete');

      if (testCase.pendingStep) {
        const pendingStep = screen.getByText(testCase.pendingStep);
        expect(pendingStep.closest('li')).not.toHaveClass('is-complete');
      }
      if (testCase.absentStep) {
        expect(screen.queryByText(testCase.absentStep)).not.toBeInTheDocument();
      }

      unmount();
    }
  });
});
