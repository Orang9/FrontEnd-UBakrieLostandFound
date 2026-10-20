import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCatalogItem, normalizeItem } from '../api/catalogApi.js';
import { paths } from '../../../app/router/paths.js';
import { StatusBadge } from '../../../components/domain/StatusBadge.jsx';

export function CatalogItemPage() {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    getCatalogItem(itemId).then((data) => setItem(normalizeItem(data)))
      .catch(() => setError('Detail barang tidak dapat dimuat.'));
  }, [itemId]);
  if (error) return <main className="catalog-detail-page"><p role="alert">{error}</p><Link to={paths.catalog}>Kembali ke katalog</Link></main>;
  if (!item) return <main className="catalog-detail-page"><p role="status">Memuat detail barang...</p></main>;
  return <main className="catalog-detail-page">
    <Link to={paths.catalog}>← Kembali ke katalog</Link>
    <article>
      <h1>{item.name}</h1>
      {item.imageUrl && (
        <img
          className="catalog-detail-image"
          src={item.imageUrl}
          alt={`Foto ${item.name}`}
          loading="lazy"
        />
      )}
      <StatusBadge status={item.status} />
      <p>{item.type} · {item.category}</p>
      <p>{item.location} · {item.date}</p>
      <p>{item.description}</p>
      {item.status !== 'CLAIMED' && <Link className="button button-primary" to={paths.claim(item.id)}>Ajukan Klaim</Link>}
    </article>
  </main>;
}
