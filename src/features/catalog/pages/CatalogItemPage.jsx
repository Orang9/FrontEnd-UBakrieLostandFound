import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { StatusBadge } from '../../../components/domain/StatusBadge.jsx';
import { getCatalogItem } from '../api/catalogApi.js';
import { paths } from '../../../app/router/paths.js';
import { getItemImageUrl } from '../../../lib/media.js';

export function CatalogItemPage() {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    getCatalogItem(itemId)
      .then((response) => {
        if (isCurrent) setItem(response.data);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(
            requestError.response?.data?.message ||
              'Detail barang gagal dimuat.',
          );
        }
      });
    return () => {
      isCurrent = false;
    };
  }, [itemId]);

  if (error)
    return <EmptyState title="Barang tidak tersedia" description={error} />;
  if (!item) return <p role="status">Memuat detail barang...</p>;

  return (
    <article className="catalog-item-detail">
      <h1>{item.name}</h1>
      {item.image_path && (
        <img src={getItemImageUrl(item.image_path)} alt={`Foto ${item.name}`} />
      )}
      <p>{item.description}</p>
      <dl>
        <dt>Kategori</dt>
        <dd>{item.category_name}</dd>
        <dt>Lokasi ditemukan</dt>
        <dd>{item.found_location}</dd>
        <dt>Tanggal ditemukan</dt>
        <dd>{item.found_date}</dd>
        <dt>Status</dt>
        <dd>
          <StatusBadge status={item.status} />
        </dd>
      </dl>
      {item.status !== 'claimed' && item.status !== 'donated' && (
        <Link to={paths.claim(item.item_id)}>
          <Button type="button">Ajukan Klaim</Button>
        </Link>
      )}
    </article>
  );
}
