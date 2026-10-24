import { Backpack, KeyRound, LockKeyhole, Wallet } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../../components/domain/StatusBadge.jsx';

const itemIcons = {
  wallet: Wallet,
  key: KeyRound,
  backpack: Backpack,
};

export function HistoryItemCard({
  item,
  id,
  idLabel = 'Klaim',
  status,
  type,
  date,
  to,
  children,
}) {
  const Icon =
    item.category === 'Sensitif' ? LockKeyhole : itemIcons[item.icon];

  const content = (
    <>
      <div className="profile-history-heading">
        <div
          className={`profile-history-thumbnail${item.category === 'Sensitif' ? ' is-sensitive' : ` tone-${item.icon}`}`}
          aria-hidden="true"
        >
          {item.imageUrl ? (
            <img src={item.imageUrl} alt="" loading="lazy" />
          ) : (
            <Icon size={27} strokeWidth={1.8} />
          )}
        </div>
        <div className="profile-history-summary">
          <h2>{item.name}</h2>
          <p>
            {idLabel} #{id}
          </p>
          {type && <span className="profile-history-type">{type}</span>}
          {date && <span className="profile-history-date">{date}</span>}
        </div>
        {status && <StatusBadge status={status} />}
      </div>
      {children}
      {to && (
        <span className="profile-history-open">
          Tampilkan E-Ticket dan QR Code
          <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      )}
    </>
  );

  return to ? (
    <Link
      className="profile-history-card is-ticket-link"
      to={to}
      aria-label={`Tampilkan E-Ticket untuk ${item.name}, klaim ${id}`}
    >
      {content}
    </Link>
  ) : (
    <article className="profile-history-card">{content}</article>
  );
}
