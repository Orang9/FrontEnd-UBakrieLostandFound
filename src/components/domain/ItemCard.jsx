import { Backpack, KeyRound, Laptop, LockKeyhole, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '../../app/router/paths.js';
import { getItemImageUrl } from '../../lib/media.js';
import { StatusBadge } from './StatusBadge.jsx';

const itemIcons = {
  key: KeyRound,
  wallet: Wallet,
  backpack: Backpack,
  laptop: Laptop,
};

export function ItemCard({ item }) {
  const Icon =
    item.category === 'Sensitif'
      ? LockKeyhole
      : (itemIcons[item.icon] ?? Backpack);
  const imageUrl = getItemImageUrl(item.image_path);

  return (
    <article className="catalog-item-card">
      <Link
        className="catalog-item-link"
        to={paths.catalogItem(encodeURIComponent(item.id))}
        aria-label={`Lihat detail ${item.name}`}
      >
        <div
          className={`catalog-item-thumbnail${item.thumbnailTone ? ` tone-${item.thumbnailTone}` : ''}${item.category === 'Sensitif' ? ' is-sensitive' : ''}`}
          aria-hidden="true"
        >
          {imageUrl ? (
            <img src={imageUrl} alt="" />
          ) : (
            <Icon size={30} strokeWidth={1.8} />
          )}
        </div>
        <div className="catalog-item-content">
          <h2>{item.name}</h2>
          <p className="catalog-item-meta">
            {item.location} <span aria-hidden="true">·</span> {item.date}
          </p>
          <div className="catalog-item-status">
            <StatusBadge status={item.status} />
            <span className="catalog-item-type">{item.type}</span>
          </div>
          {item.category === 'Sensitif' && (
            <p className="catalog-sensitive-note">Foto diburamkan (Sensitif)</p>
          )}
        </div>
      </Link>
    </article>
  );
}
