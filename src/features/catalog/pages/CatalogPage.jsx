import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ItemCard } from '../../../components/domain/ItemCard.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { paths } from '../../../app/router/paths.js';
import { STATUS_LABELS } from '../../../constants/status.js';
import { catalogItems } from '../data/catalogItems.js';

const filters = ['Semua', 'Hilang', 'Temuan', 'Umum', 'Sensitif'];
const typeFilters = ['Hilang', 'Temuan'];
const categoryFilters = ['Umum', 'Sensitif'];
const statusFilters = [
  'WAITING_AT_SECURITY',
  'AVAILABLE',
  'CLAIMED',
  'SCHEDULED',
];

export function CatalogPage() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [desktopFilters, setDesktopFilters] = useState({
    type: [],
    category: [],
    status: [],
  });

  function toggleDesktopFilter(group, value) {
    setDesktopFilters((current) => ({
      ...current,
      [group]: current[group].includes(value)
        ? current[group].filter((filter) => filter !== value)
        : [...current[group], value],
    }));
  }

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
      const matchesType =
        desktopFilters.type.length === 0 ||
        desktopFilters.type.includes(item.type);
      const matchesCategory =
        desktopFilters.category.length === 0 ||
        desktopFilters.category.includes(item.category);
      const matchesStatus =
        desktopFilters.status.length === 0 ||
        desktopFilters.status.includes(item.status);

      return (
        matchesQuery &&
        matchesFilter &&
        matchesType &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [activeFilter, desktopFilters, query]);

  function renderCheckboxGroup(title, group, options) {
    return (
      <fieldset className="catalog-filter-group">
        <legend>{title}</legend>
        {options.map(({ value, label }) => (
          <label className="catalog-checkbox" key={value}>
            <input
              type="checkbox"
              checked={desktopFilters[group].includes(value)}
              onChange={() => toggleDesktopFilter(group, value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
    );
  }

  return (
    <div className="catalog-page">
      <header className="catalog-hero">
        <div className="catalog-hero-content">
          <h1>Temukan Barang</h1>
          <p>
            Telusuri barang hilang dan temuan sebelum mengisi laporan apa pun.
          </p>
        </div>
      </header>

      <div className="catalog-content">
        <form
          className="catalog-search-row"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
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
          <button
            className="button button-primary catalog-search-button"
            type="submit"
          >
            Cari
          </button>
          <Link
            className="button button-secondary catalog-report-button"
            to={paths.reportItem}
          >
            Lapor Barang
          </Link>
        </form>

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

        <aside className="catalog-sidebar" aria-label="Filter barang">
          <h2>Filter</h2>
          {renderCheckboxGroup(
            'Jenis',
            'type',
            typeFilters.map((value) => ({ value, label: value })),
          )}
          {renderCheckboxGroup(
            'Kategori',
            'category',
            categoryFilters.map((value) => ({ value, label: value })),
          )}
          {renderCheckboxGroup(
            'Status',
            'status',
            statusFilters.map((value) => ({
              value,
              label: STATUS_LABELS[value],
            })),
          )}
        </aside>

        <p className="catalog-result-count" role="status">
          {visibleItems.length} barang ditemukan
        </p>
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
