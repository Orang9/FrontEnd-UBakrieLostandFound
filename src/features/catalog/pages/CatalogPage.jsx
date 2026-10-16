import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ItemCard } from '../../../components/domain/ItemCard.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { catalogItems } from '../data/catalogItems.js';

const filters = ['Semua', 'Hilang', 'Temuan', 'Umum', 'Sensitif'];

export function CatalogPage() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('id-ID');

    return catalogItems.filter((item) => {
      const matchesQuery = [
        item.name,
        item.location,
        item.category,
        item.type,
      ].some((value) =>
        value.toLocaleLowerCase('id-ID').includes(normalizedQuery),
      );
      const matchesFilter =
        activeFilter === 'Semua' ||
        (activeFilter === 'Hilang' && item.type === 'Hilang') ||
        (activeFilter === 'Temuan' && item.type === 'Temuan') ||
        item.category === activeFilter;

      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, query]);

  return (
    <div className="catalog-page">
      <header className="catalog-hero">
        <div className="catalog-hero-content">
          <h1>Temukan Barang</h1>
        </div>
      </header>

      <div className="catalog-content">
        <label className="catalog-search">
          <Search size={20} aria-hidden="true" />
          <span className="sr-only">Cari barang</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama barang, lokasi, kategori"
          />
        </label>

        <div className="catalog-filters" aria-label="Filter katalog">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`catalog-filter${activeFilter === filter ? ' is-active' : ''}`}
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <section className="catalog-results" aria-label="Daftar barang">
          {visibleItems.length ? (
            visibleItems.map((item) => <ItemCard key={item.id} item={item} />)
          ) : (
            <EmptyState
              title="Barang tidak ditemukan"
              description="Coba ubah kata pencarian atau pilih filter lainnya."
            />
          )}
        </section>
      </div>
    </div>
  );
}
