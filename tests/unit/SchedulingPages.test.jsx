import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../src/app/providers/ToastProvider.jsx';
import {
  AdminSchedulingPage,
  SchedulingPage,
} from '../../src/features/scheduling/index.js';
import { upsertPreviewClaim } from '../../src/lib/claimStorage.js';
import { getScheduleDates } from '../../src/features/scheduling/lib/scheduleDates.js';

afterEach(cleanup);

function renderWithProviders(component, initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ToastProvider>{component}</ToastProvider>
    </MemoryRouter>,
  );
}

describe('AdminSchedulingPage', () => {
  it('renders dynamically generated upcoming dates with default slots', () => {
    renderWithProviders(<AdminSchedulingPage />);

    expect(
      screen.getByRole('heading', { name: 'Kelola Slot Pengambilan' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Jadwal Slot' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('09.00 - 10.00').length).toBeGreaterThan(0);
    expect(screen.getByText(getScheduleDates()[0].full)).toBeInTheDocument();
    expect(
      screen.getByRole('radio', {
        name: new RegExp(getScheduleDates()[0].weekday),
      }),
    ).toBeChecked();
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

    const nextDate = getScheduleDates()[1];
    fireEvent.click(
      screen.getByRole('radio', { name: new RegExp(nextDate.weekday) }),
    );

    expect(screen.getByText(nextDate.full)).toBeInTheDocument();
  });
});

describe('SchedulingPage', () => {
  it('renders unavailable status when claim is not found or not approved', () => {
    renderWithProviders(<SchedulingPage />, [
      '/scheduling?claimId=non-existent',
    ]);

    expect(
      screen.getByRole('heading', { name: 'Pilih Slot Pengambilan' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Klaim yang disetujui tidak ditemukan/i),
    ).toBeInTheDocument();
  });

  it('renders upcoming dates, slot options, and confirmation for approved claims', () => {
    upsertPreviewClaim({
      id: 'CLM-TEST-01',
      status: 'APPROVED',
      item: { id: 'ITM-01', name: 'Laptop Asus' },
    });

    renderWithProviders(<SchedulingPage />, [
      '/scheduling?claimId=CLM-TEST-01',
    ]);

    expect(
      screen.getByText('Klaim disetujui. Pilih jadwal pengambilan.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: `Slot tersedia - ${getScheduleDates()[0].full}`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', {
        name: new RegExp(getScheduleDates()[0].weekday),
      }),
    ).toBeChecked();
    expect(
      screen.getByRole('button', { name: 'Konfirmasi Jadwal' }),
    ).toBeInTheDocument();
  });
});
