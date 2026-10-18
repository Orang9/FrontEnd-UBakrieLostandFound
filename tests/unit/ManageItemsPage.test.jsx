import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../src/app/providers/ToastProvider.jsx';
import { ManageItemsPage } from '../../src/features/items/index.js';

afterEach(cleanup);

function renderManageItems() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <ManageItemsPage />
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('ManageItemsPage', () => {
  it('shows pending reports by default and filters to rejected reports', () => {
    renderManageItems();

    expect(screen.getByText('Tas ransel hitam')).toBeInTheDocument();
    expect(screen.getByText('Laptop Lenovo ThinkPad T14')).toBeInTheDocument();
    expect(screen.queryByText('Payung biru')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Ditolak 4' }));

    expect(screen.getByText('Payung biru')).toBeInTheDocument();
    expect(screen.queryByText('Tas ransel hitam')).not.toBeInTheDocument();
    expect(
      screen.getByText('Laporan iseng / tidak valid.'),
    ).toBeInTheDocument();
  });

  it('accepts a pending report in the local preview', () => {
    renderManageItems();
    const report = screen
      .getByRole('heading', { name: 'Tas ransel hitam' })
      .closest('article');

    fireEvent.click(
      within(report).getByRole('button', { name: 'Terima & Catat' }),
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Diterima 15' }));

    const acceptedReport = screen
      .getByRole('heading', { name: 'Tas ransel hitam' })
      .closest('article');
    expect(within(acceptedReport).getByText('Diterima')).toBeInTheDocument();
    expect(
      screen.getByText(/Pembaruan katalog memerlukan backend/),
    ).toBeInTheDocument();
  });

  it('opens rejection reason and reporter note fields and records rejection', () => {
    renderManageItems();
    const report = screen
      .getByRole('heading', { name: 'Tas ransel hitam' })
      .closest('article');

    fireEvent.click(within(report).getByRole('button', { name: 'Tolak' }));
    fireEvent.change(within(report).getByLabelText('Alasan penolakan'), {
      target: { value: 'Laporan iseng / tidak valid' },
    });
    fireEvent.change(
      within(report).getByLabelText(
        'Catatan untuk pelapor (dikirim lewat email)',
      ),
      {
        target: { value: 'Barang tidak ditemukan saat dicek di Pos Satpam.' },
      },
    );
    fireEvent.click(
      within(report).getByRole('button', { name: 'Konfirmasi Tolak' }),
    );

    expect(screen.queryByText('Tas ransel hitam')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Ditolak 4' }));
    const rejectedReport = screen
      .getByRole('heading', { name: 'Tas ransel hitam' })
      .closest('article');
    expect(
      within(rejectedReport).getByText(
        /Catatan: Barang tidak ditemukan saat dicek/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Audit Trail dan email belum terhubung ke backend/),
    ).toBeInTheDocument();
  });

  it('allows a rejected report to be returned to pending review', () => {
    renderManageItems();
    fireEvent.click(screen.getByRole('tab', { name: 'Ditolak 4' }));

    fireEvent.click(screen.getByRole('button', { name: 'Tinjau Ulang' }));

    expect(screen.getByRole('tab', { name: 'Pending 5' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Payung biru')).toBeInTheDocument();
    expect(
      screen.queryByText('Laporan iseng / tidak valid.'),
    ).not.toBeInTheDocument();
  });

  it('restores sample report data with the refresh action', () => {
    renderManageItems();
    fireEvent.click(screen.getByRole('tab', { name: 'Ditolak 4' }));
    fireEvent.click(screen.getByRole('button', { name: 'Refresh Data' }));

    expect(screen.getByRole('tab', { name: 'Pending 5' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Tas ransel hitam')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Data contoh dipulihkan. Refresh dari server memerlukan backend.',
      ),
    ).toBeInTheDocument();
  });
});
