import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../src/app/providers/AuthProvider.jsx';
import { CatalogPage } from '../../src/features/catalog/index.js';
import { getCatalog } from '../../src/features/catalog/api/catalogApi.js';

vi.mock('../../src/features/catalog/api/catalogApi.js', () => ({
  getCatalog: vi.fn(),
}));

const items = [
  {
    item_id: 1,
    name: 'Dompet kulit',
    found_location: 'Kantin',
    found_date: '2026-10-10',
    category_name: 'Dompet',
    is_sensitive: 1,
    status: 'secured',
  },
  {
    item_id: 2,
    name: 'Kunci motor',
    found_location: 'Parkir B',
    found_date: '2026-10-09',
    category_name: 'Aksesori',
    is_sensitive: 0,
    status: 'pending',
  },
];

afterEach(cleanup);
beforeEach(() => {
  getCatalog.mockImplementation(({ status }) =>
    Promise.resolve({
      data:
        status === 'secured'
          ? items.filter((item) => item.status === 'secured')
          : items,
    }),
  );
});

function renderCatalog() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('CatalogPage', () => {
  it('loads public found items from the backend API', async () => {
    renderCatalog();

    expect(
      await screen.findByRole('heading', { name: 'Dompet kulit' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Foto diburamkan (Sensitif)')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Lihat detail/ })).toHaveLength(
      2,
    );
    expect(getCatalog).toHaveBeenCalledWith({ status: 'all' });
  });

  it('filters the returned items by text and requests the selected lifecycle status', async () => {
    renderCatalog();
    await screen.findByRole('heading', { name: 'Dompet kulit' });

    fireEvent.change(screen.getByRole('searchbox', { name: 'Cari barang' }), {
      target: { value: 'parkir' },
    });
    expect(
      screen.getByRole('heading', { name: 'Kunci motor' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Dompet kulit' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tersedia' }));
    await waitFor(() =>
      expect(getCatalog).toHaveBeenLastCalledWith({ status: 'secured' }),
    );
  });
});
