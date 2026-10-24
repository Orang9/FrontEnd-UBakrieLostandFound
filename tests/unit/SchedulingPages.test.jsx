import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../src/app/providers/ToastProvider.jsx';
import { AdminSchedulingPage, SchedulingPage } from '../../src/features/scheduling/index.js';
import { upsertPreviewClaim } from '../../src/lib/claimStorage.js';

afterEach(cleanup);

function renderWithProviders(component, initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ToastProvider>{component}</ToastProvider>
    </MemoryRouter>,
  );
}

describe('AdminSchedulingPage', () => {
  it('renders correctly with default slots and matches READTHIS layout', () => {
    renderWithProviders(<AdminSchedulingPage />);

    expect(
      screen.getByRole('heading', { name: 'Kelola Slot Pengambilan' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Jadwal Slot' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('09.00 - 10.00').length).toBeGreaterThan(0);
    expect(screen.getByText('Rabu, 14 Okt, 2026')).toBeInTheDocument();
  });

  it('allows switching to Add Slot tab and validates form', () => {
    renderWithProviders(<AdminSchedulingPage />);

    const addTab = screen.getByRole('tab', { name: '+ Tambah Slot' });
    fireEvent.click(addTab);

    expect(
      screen.getByRole('heading', { name: 'Tambah Slot' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Senin - Jumat, 09.00 - 15.00 WIB'),
    ).toBeInTheDocument();
  });

  it('switches dates using the date picker', () => {
    renderWithProviders(<AdminSchedulingPage />);

    const thursdayRadio = screen.getByRole('radio', { name: /Kam/i });
    fireEvent.click(thursdayRadio);

    expect(screen.getByText('Kamis, 15 Okt, 2026')).toBeInTheDocument();
  });
});

describe('SchedulingPage', () => {
  it('renders unavailable status when claim is not found or not approved', () => {
    renderWithProviders(<SchedulingPage />, ['/scheduling?claimId=non-existent']);

    expect(
      screen.getByRole('heading', { name: 'Pilih Slot Pengambilan' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Klaim yang disetujui tidak ditemukan/i),
    ).toBeInTheDocument();
  });

  it('renders date list, slot options, and confirmation button when claim is approved', () => {
    upsertPreviewClaim({
      id: 'CLM-TEST-01',
      status: 'APPROVED',
      item: { id: 'ITM-01', name: 'Laptop Asus' },
    });

    renderWithProviders(<SchedulingPage />, ['/scheduling?claimId=CLM-TEST-01']);

    expect(
      screen.getByText('Klaim disetujui. Pilih jadwal pengambilan.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Slot tersedia - Rabu, 14 Okt/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Konfirmasi Jadwal' })).toBeInTheDocument();
  });
});
