import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CatalogPage } from '../../src/features/catalog/index.js';

vi.mock('../../src/features/catalog/api/catalogApi.js', () => ({
  getCatalog: vi.fn(),
  normalizeItem: (item) => ({
    ...item,
    id: String(item.item_id),
    type: item.report_type === 'lost' ? 'Hilang' : 'Temuan',
    category: item.is_sensitive ? 'Sensitif' : 'Umum',
    location: item.location,
    status: item.status === 'active'
      ? 'ACTIVE'
      : item.status === 'available'
        ? 'AVAILABLE'
        : 'CLAIMED',
    icon: 'backpack',
    imageUrl: '',
    description: item.description ?? '',
  }),
}));

import { getCatalog } from '../../src/features/catalog/api/catalogApi.js';

afterEach(cleanup);

const catalogItems = [
  {
    item_id: 1,
    report_type: 'found',
    name: 'Kunci motor Honda',
    location: 'Parkir B',
    category_name: 'Umum',
    is_sensitive: 0,
    status: 'active',
  },
  {
    item_id: 2,
    report_type: 'found',
    name: 'Dompet / kartu identitas',
    location: 'Kantin',
    category_name: 'Sensitif',
    is_sensitive: 1,
    status: 'available',
  },
  {
    item_id: 3,
    report_type: 'found',
    name: 'Tas ransel hitam',
    location: 'Aula',
    category_name: 'Umum',
    is_sensitive: 0,
    status: 'available',
  },
  {
    item_id: 4,
    report_type: 'found',
    name: 'Laptop abu-abu',
    location: 'Lab 3',
    category_name: 'Umum',
    is_sensitive: 0,
    status: 'claimed',
  },
  {
    item_id: 5,
    report_type: 'lost',
    name: 'Kartu mahasiswa',
    location: 'Perpustakaan',
    category_name: 'Umum',
    is_sensitive: 0,
    status: 'active',
  },
];

beforeEach(() => {
  getCatalog.mockImplementation(({ report_type = 'all' } = {}) =>
    Promise.resolve(
      report_type === 'all'
        ? catalogItems
        : catalogItems.filter((item) => item.report_type === report_type),
    ),
  );
});

function renderCatalog() {
  return render(
    <MemoryRouter>
      <CatalogPage />
    </MemoryRouter>,
  );
}

describe('CatalogPage', () => {
  it('shows catalog items and the sensitive-item privacy note', async () => {
    renderCatalog();

    expect(
      screen.getByRole('heading', { name: 'Temukan Barang' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Kunci motor Honda' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Foto diburamkan (Sensitif)')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Lihat detail/ })).toHaveLength(
      5,
    );
  });

  it('filters the catalog as the user types and selects a category', async () => {
    renderCatalog();
    await screen.findByRole('heading', { name: 'Kunci motor Honda' });

    fireEvent.change(screen.getByRole('searchbox', { name: 'Cari barang' }), {
      target: { value: 'parkir' },
    });
    expect(
      screen.getByRole('heading', { name: 'Kunci motor Honda' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Laptop abu-abu' }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('searchbox', { name: 'Cari barang' }), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sensitif' }));
    expect(
      screen.getByRole('heading', { name: 'Dompet / kartu identitas' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Lihat detail/ })).toHaveLength(
      1,
    );
  });

  it('shows an empty state when a filter has no matching items', async () => {
    renderCatalog();
    await screen.findByRole('heading', { name: 'Kunci motor Honda' });

    fireEvent.click(screen.getByRole('checkbox', { name: 'Barang Hilang' }));
    await screen.findByRole('heading', { name: 'Kartu mahasiswa' });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Sensitif' }));

    expect(
      await screen.findByRole('heading', { name: 'Barang tidak ditemukan' }),
    ).toBeInTheDocument();
  });

  it('filters by category and status groups', async () => {
    renderCatalog();
    await screen.findByRole('heading', { name: 'Kunci motor Honda' });

    fireEvent.click(screen.getByRole('checkbox', { name: 'Sensitif' }));
    expect(
      screen.getByRole('heading', { name: 'Dompet / kartu identitas' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Lihat detail/ })).toHaveLength(
      1,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Diklaim' }));
    expect(
      screen.getByRole('heading', { name: 'Barang tidak ditemukan' }),
    ).toBeInTheDocument();
  });

  it('filters found and lost reports through the catalog API', async () => {
    renderCatalog();
    await screen.findByRole('heading', { name: 'Kunci motor Honda' });

    fireEvent.click(screen.getByRole('checkbox', { name: 'Barang Hilang' }));
    expect(
      await screen.findByRole('heading', { name: 'Kartu mahasiswa' }),
    ).toBeInTheDocument();
    expect(getCatalog).toHaveBeenLastCalledWith({ report_type: 'lost' });
    expect(
      screen.queryByRole('heading', { name: 'Kunci motor Honda' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Barang Temuan' }));
    await waitFor(() =>
      expect(getCatalog).toHaveBeenLastCalledWith({ report_type: 'all' }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Kunci motor Honda' }),
    ).toBeInTheDocument();
  });
});
