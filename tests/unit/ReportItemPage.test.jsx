import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../../src/app/providers/ToastProvider.jsx';
import { ReportItemPage } from '../../src/features/report-item/index.js';
import { validateReportPhoto } from '../../src/features/report-item/schemas/reportItemValidation.js';

vi.mock('../../src/features/report-item/api/reportItemApi.js', () => ({
  createItemReport: vi.fn(),
}));

import { createItemReport } from '../../src/features/report-item/api/reportItemApi.js';

afterEach(cleanup);

function renderReport(initialEntry = '/report') {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/report" element={<ReportItemPage />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('ReportItemPage', () => {
  it('shows the found-item report form for direct entry', () => {
    renderReport('/report?type=lost');

    expect(
      screen.getByRole('heading', { name: 'Lapor Barang' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Lokasi hilang')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Barang Hilang' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('sends the selected report type to the reporting API', async () => {
    const user = userEvent.setup();
    createItemReport.mockResolvedValue({ item_id: 10 });
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:report-test'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    renderReport();

    fireEvent.click(screen.getByRole('button', { name: 'Barang Hilang' }));
    fireEvent.change(screen.getByLabelText('Nama barang'), {
      target: { value: 'Dompet hitam' },
    });
    fireEvent.change(screen.getByLabelText('Lokasi hilang'), {
      target: { value: 'Kantin gedung A' },
    });
    fireEvent.change(screen.getByLabelText('Tanggal'), {
      target: { value: '2026-10-24' },
    });
    fireEvent.change(screen.getByLabelText('Waktu'), {
      target: { value: '12:30' },
    });
    await user.upload(
      screen.getByLabelText('Tambah foto barang'),
      new File(['image'], 'dompet.png', { type: 'image/png' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Kirim Laporan' }));

    await waitFor(() => expect(createItemReport).toHaveBeenCalledTimes(1));
    const payload = createItemReport.mock.calls[0][0];
    expect(payload.get('type')).toBe('lost');
    expect(payload.get('location')).toBe('Kantin gedung A');
  });

  it('shows the blind-listing notice for sensitive items', () => {
    renderReport();

    fireEvent.click(screen.getByRole('radio', { name: 'Sensitif' }));
    expect(screen.getByText('Blind Listing aktif')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Foto barang Sensitif otomatis diburamkan di katalog publik.',
      ),
    ).toBeInTheDocument();
  });

  it('validates required fields and accepted photo size and type', async () => {
    renderReport();
    fireEvent.click(screen.getByRole('button', { name: 'Kirim Laporan' }));

    expect(
      await screen.findByText('Nama barang wajib diisi.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Sensitif' })).toBeChecked();
    expect(screen.getByText('Lokasi wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Tanggal wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Waktu wajib diisi.')).toBeInTheDocument();

    expect(validateReportPhoto(undefined)).toBe(true);
    expect(
      validateReportPhoto(
        new File(['image'], 'photo.gif', { type: 'image/gif' }),
      ),
    ).toBe('Foto harus berformat JPG atau PNG.');
    expect(
      validateReportPhoto(
        new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', {
          type: 'image/png',
        }),
      ),
    ).toBe('Ukuran foto maksimal 5 MB.');
  });
});
