import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ItemCard } from '../../../components/domain/ItemCard.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { getCatalog } from '../api/catalogApi.js';
import { useAuth } from '../../../app/providers/AuthProvider.jsx';
import { Link } from 'react-router-dom';
import { paths } from '../../../app/router/paths.js';

const filters = [
  { label: 'Semua', value: 'all' },
  { label: 'Menunggu di pos', value: 'pending' },
  { label: 'Tersedia', value: 'secured' },
  { label: 'Sudah diklaim', value: 'claimed' },
  { label: 'Didonasikan', value: 'donated' },
];

export function CatalogPage() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let isCurrent = true;
    getCatalog({
      status:
        filters.find((filter) => filter.label === activeFilter)?.value ?? 'all',
    })
      .then((response) => {
        if (isCurrent) setItems(response.data ?? []);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(
            requestError.response?.data?.message ||
              'Katalog gagal dimuat. Periksa koneksi ke server.',
          );
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [activeFilter]);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('id-ID');

    return items
      .map((item) => ({
        ...item,
        id: String(item.item_id),
        name: item.name,
        location: item.found_location,
        date: item.found_date,
        category: item.is_sensitive ? 'Sensitif' : item.category_name,
        type: 'Barang Temuan',
        status: item.status,
      }))
      .filter((item) => {
        const matchesQuery = [item.name, item.location, item.category].some(
          (value) =>
            (value ?? '').toLocaleLowerCase('id-ID').includes(normalizedQuery),
        );
        return matchesQuery;
      });
  }, [items, query]);

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
          {filters.map(({ label }) => (
            <button
              key={label}
              type="button"
              className={`catalog-filter${activeFilter === label ? ' is-active' : ''}`}
              aria-pressed={activeFilter === label}
              onClick={() => {
                setLoading(true);
                setError('');
                setActiveFilter(label);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <section className="catalog-results" aria-label="Daftar barang">
          {loading ? (
            <p role="status">Memuat katalog...</p>
          ) : error ? (
            <EmptyState title="Katalog tidak tersedia" description={error} />
          ) : visibleItems.length ? (
            visibleItems.map((item) => <ItemCard key={item.id} item={item} />)
          ) : (
            <EmptyState
              title="Barang tidak ditemukan"
              description="Coba ubah kata pencarian atau pilih filter lainnya."
            />
          )}
        </section>
        {!isAuthenticated && (
          <p className="catalog-login-note">
            <Link to={paths.login}>Masuk</Link> untuk mengajukan klaim barang.
          </p>
        )}
      </div>
    </div>
  );
}
