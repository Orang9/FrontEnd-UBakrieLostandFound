import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../../src/app/providers/ToastProvider.jsx';
import { ReportItemPage } from '../../src/features/report-item/index.js';
import { validateReportPhoto } from '../../src/features/report-item/schemas/reportItemValidation.js';

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
  it('supports direct entry without an authenticated session', () => {
    renderReport('/report?type=lost');

    expect(
      screen.getByRole('heading', { name: 'Lapor Barang' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Barang Hilang' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Lokasi hilang')).toBeInTheDocument();
  });

  it('switches report type and shows blind-listing notice for sensitive items', () => {
    renderReport();

    fireEvent.click(screen.getByRole('button', { name: 'Barang Hilang' }));
    expect(screen.getByLabelText('Lokasi hilang')).toBeInTheDocument();

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
