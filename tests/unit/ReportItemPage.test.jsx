import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../../src/app/providers/ToastProvider.jsx';
import { ReportItemPage } from '../../src/features/report-item/index.js';
import { validateReportPhoto } from '../../src/features/report-item/schemas/reportItemValidation.js';
import { getCategories } from '../../src/features/catalog/api/catalogApi.js';

vi.mock('../../src/features/catalog/api/catalogApi.js', () => ({
  getCategories: vi.fn(),
  getCatalog: vi.fn(),
  getCatalogItem: vi.fn(),
}));

afterEach(cleanup);
beforeEach(() => {
  getCategories.mockResolvedValue({
    data: [
      { category_id: 1, name: 'Dompet', default_sensitive: 1 },
      { category_id: 2, name: 'Buku', default_sensitive: 0 },
    ],
  });
});

function renderReport(initialEntry = '/report') {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/report" element={<ReportItemPage />} />
          <Route path="/catalog" element={<h1>Katalog</h1>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('ReportItemPage', () => {
  it('only offers the found-item report supported by the backend', () => {
    renderReport('/report?type=lost');

    expect(
      screen.getByRole('heading', { name: 'Lapor Barang' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Saat ini laporan yang dapat dikirim adalah barang temuan.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('Barang Hilang')).not.toBeInTheDocument();
  });

  it('uses backend category sensitivity to show the privacy notice', async () => {
    renderReport();

    fireEvent.change(await screen.findByLabelText('Kategori barang'), {
      target: { value: '1' },
    });
    expect(screen.getByText('Blind Listing aktif')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Foto barang Sensitif otomatis diburamkan di katalog publik.',
      ),
    ).toBeInTheDocument();
  });

  it('validates required backend fields and accepted photo size and type', async () => {
    renderReport();
    await screen.findByRole('option', { name: 'Dompet' });
    fireEvent.click(screen.getByRole('button', { name: 'Kirim Laporan' }));

    expect(
      await screen.findByText('Nama barang wajib diisi.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Pilih kategori barang.')).toBeInTheDocument();
    expect(screen.getByText('Lokasi wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Tanggal wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Deskripsi wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Foto barang wajib diunggah.')).toBeInTheDocument();

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
