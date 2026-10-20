import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ItemCard } from '../../../components/domain/ItemCard.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { paths } from '../../../app/router/paths.js';
import { STATUS_LABELS } from '../../../constants/status.js';
import { getCatalog, normalizeItem } from '../api/catalogApi.js';

const filters = ['Semua', 'Umum', 'Sensitif'];
const categoryFilters = ['Umum', 'Sensitif'];
const statusFilters = [
  'WAITING_AT_SECURITY',
  'AVAILABLE',
  'CLAIMED',
];

export function CatalogPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [desktopFilters, setDesktopFilters] = useState({
    category: [],
    status: [],
  });

  useEffect(() => {
    let active = true;
    getCatalog()
      .then((data) => {
        const rows = Array.isArray(data) ? data : data?.items ?? [];
        if (active) setItems(rows.map(normalizeItem));
      })
      .catch(() => active && setError('Katalog tidak dapat dimuat. Coba lagi.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

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

    return items.filter((item) => {
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
        item.category === activeFilter;
      const matchesCategory =
        desktopFilters.category.length === 0 ||
        desktopFilters.category.includes(item.category);
      const matchesStatus =
        desktopFilters.status.length === 0 ||
        desktopFilters.status.includes(item.status);

      return (
        matchesQuery &&
        matchesFilter &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [activeFilter, desktopFilters, query, items]);

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

        {loading && <p role="status">Memuat katalog...</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && <p className="catalog-result-count" role="status">{visibleItems.length} barang ditemukan</p>}
        <section className="catalog-results" aria-label="Daftar barang">
          {loading ? null : visibleItems.length ? (
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
