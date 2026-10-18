import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { CatalogPage } from '../../src/features/catalog/index.js';

afterEach(cleanup);

function renderCatalog() {
  return render(
    <MemoryRouter>
      <CatalogPage />
    </MemoryRouter>,
  );
}

describe('CatalogPage', () => {
  it('shows catalog items and the sensitive-item privacy note', () => {
    renderCatalog();

    expect(
      screen.getByRole('heading', { name: 'Temukan Barang' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Kunci motor Honda' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Foto diburamkan (Sensitif)')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Lihat detail/ })).toHaveLength(
      4,
    );
  });

  it('filters the catalog as the user types and selects a category', () => {
    renderCatalog();

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

  it('shows an empty state when a filter has no matching items', () => {
    renderCatalog();

    fireEvent.click(screen.getByRole('button', { name: 'Hilang' }));

    expect(
      screen.getByRole('heading', { name: 'Barang tidak ditemukan' }),
    ).toBeInTheDocument();
  });

  it('filters by desktop type, category, and status groups', () => {
    renderCatalog();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Temuan' }));
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
});
