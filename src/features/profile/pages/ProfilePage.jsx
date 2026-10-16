import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HistoryItemCard } from '../components/HistoryItemCard.jsx';
import { getProfile } from '../api/profileApi.js';
import { paths } from '../../../app/router/paths.js';

const tabs = [
  { id: 'claims', label: 'Riwayat Klaim' },
  { id: 'reports', label: 'Riwayat Lapor' },
];

const claimStatus = {
  pending: 'PENDING',
  verified: 'APPROVED',
  scheduled: 'SCHEDULED',
  rejected: 'REJECTED',
  claimed: 'CLAIMED',
};

export function ProfilePage() {
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    requestedTab === 'reports' ? 'reports' : 'claims',
  );
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    getProfile()
      .then((response) => {
        if (isCurrent) setClaims(response.data ?? []);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(
            requestError.response?.data?.message ||
              'Riwayat klaim gagal dimuat.',
          );
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <div className="profile-page">
      <header className="profile-hero">
        <div className="profile-hero-content">
          <h1>Riwayat Saya</h1>
        </div>
      </header>

      <div className="profile-content">
        <div
          className="profile-tabs"
          role="tablist"
          aria-label="Riwayat profil"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`profile-${tab.id}-tab`}
              className={`profile-tab${activeTab === tab.id ? ' is-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`profile-${tab.id}-panel`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'claims' ? (
          <section
            className="profile-history-list"
            id="profile-claims-panel"
            role="tabpanel"
            aria-labelledby="profile-claims-tab"
          >
            {loading ? (
              <p role="status">Memuat riwayat klaim...</p>
            ) : error ? (
              <p role="alert">{error}</p>
            ) : claims.length ? (
              claims.map((claim) => {
                const status = claimStatus[claim.status] ?? claim.status;
                const item = {
                  name: claim.item_name,
                  category: claim.category_name,
                  icon: 'wallet',
                };
                return (
                  <HistoryItemCard
                    key={claim.claim_id}
                    item={item}
                    id={claim.claim_id}
                    status={status}
                    to={
                      claim.status === 'scheduled'
                        ? paths.eticket(claim.claim_id)
                        : undefined
                    }
                  >
                    {claim.status === 'verified' && (
                      <Link
                        className="profile-schedule-link"
                        to={`${paths.scheduling}?claimId=${encodeURIComponent(claim.claim_id)}`}
                      >
                        Pilih jadwal pengambilan
                      </Link>
                    )}
                  </HistoryItemCard>
                );
              })
            ) : (
              <p>Belum ada klaim yang diajukan.</p>
            )}
          </section>
        ) : (
          <section
            className="profile-history-list"
            id="profile-reports-panel"
            role="tabpanel"
            aria-labelledby="profile-reports-tab"
          >
            <p>
              Riwayat laporan barang belum tersedia: backend belum menyediakan
              endpoint untuk mengambil laporan milik pengguna.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
