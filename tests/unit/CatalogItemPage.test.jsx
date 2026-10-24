import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CatalogItemPage } from '../../src/features/catalog/pages/CatalogItemPage.jsx';

vi.mock('../../src/features/catalog/api/catalogApi.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getCatalogItem: vi.fn() };
});

import { getCatalogItem } from '../../src/features/catalog/api/catalogApi.js';

afterEach(cleanup);

describe('CatalogItemPage', () => {
  it('eagerly loads the item image and shows ownership-verification details', async () => {
    getCatalogItem.mockResolvedValue({
      item_id: 7,
      name: 'Kartu mahasiswa',
      image_url: '',
      image_path: 'public/uploads/kartu.png',
      report_type: 'found',
      status: 'available',
      category_name: 'Umum',
      location: 'Perpustakaan',
      report_date: '2026-10-21T00:00:00.000Z',
      description: 'Kartu berwarna biru',
      claim_questions: ['Apa ciri khusus kartu ini?'],
    });

    render(
      <MemoryRouter initialEntries={['/items/7']}>
        <Routes>
          <Route path="/items/:itemId" element={<CatalogItemPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const image = await screen.findByRole('img', { name: 'Foto Kartu mahasiswa' });
    expect(image).toHaveAttribute(
      'src',
      'http://localhost:5001/uploads/kartu.png',
    );
    expect(image).toHaveAttribute('loading', 'eager');
    expect(screen.getByText('Perpustakaan · 21 Okt 2026')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Verifikasi Kepemilikan' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Jawab 1 pertanyaan kunci. Admin BEM akan meninjau jawaban secara manual sebelum klaim disetujui.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Apa ciri khusus kartu ini?')).toBeInTheDocument();
  });
});
