import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HistoryItemCard } from '../components/HistoryItemCard.jsx';
import { ClaimTimeline } from '../components/ClaimTimeline.jsx';
import { getProfile } from '../api/profileApi.js';
import { paths } from '../../../app/router/paths.js';

const tabs = [
  { id: 'claims', label: 'Riwayat Klaim' },
  { id: 'reports', label: 'Riwayat Lapor' },
];

export function ProfilePage() {
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const claimId = searchParams.get('claimId');
  const scheduled = searchParams.get('scheduled') === '1';
  const [activeTab, setActiveTab] = useState(
    requestedTab === 'reports' ? 'reports' : 'claims',
  );
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    getProfile().then(setProfile).catch(() => setError('Profil tidak dapat dimuat.'));
  }, []);
  const raw = profile?.data ?? profile ?? {};
  const claims = (raw.claims ?? []).map((claim) => ({
    ...claim,
    id: String(claim.id ?? claim.claim_id),
    status: String(claim.status ?? '').toUpperCase(),
    item: claim.item ?? { id: claim.item_id, name: claim.item_name ?? 'Barang', category: claim.category ?? 'Umum', icon: claim.icon ?? 'backpack' },
  }));
  const reports = (raw.reports ?? []).map((report) => ({
    ...report,
    id: String(report.id ?? report.item_id),
    item: { name: report.name ?? report.item_name ?? 'Barang', category: report.category ?? (Number(report.is_sensitive) ? 'Sensitif' : 'Umum'), icon: report.icon ?? 'backpack' },
    type: report.report_type === 'lost' ? 'Hilang' : 'Temuan',
    status: String(report.status ?? report.report_review_status ?? '').toUpperCase(),
    date: report.found_date ?? report.date,
  }));
  const submittedClaim = claims.find((claim) => claim.id === claimId);
  const updatedClaim = claims.find((claim) => claim.id === claimId);

  return (
    <div className="profile-page">
      <header className="profile-hero">
        <div className="profile-hero-content">
          <h1>Riwayat Saya</h1>
        </div>
      </header>

      <div className="profile-content">
        {error && <p role="alert">{error}</p>}
        {!profile && !error && <p role="status">Memuat riwayat...</p>}
        {submittedClaim?.status === 'PENDING' && (
          <aside className="profile-pending-banner" role="status">
            Klaim #{submittedClaim.id} berhasil disimpan untuk preview dan
            berstatus PENDING. Tunggu persetujuan Admin BEM sebelum melanjutkan.
          </aside>
        )}
        {scheduled && updatedClaim?.status === 'SCHEDULED' && (
          <aside className="profile-pending-banner" role="status">
            Jadwal pengambilan klaim #{updatedClaim.id} telah dikonfirmasi untuk
            preview.
          </aside>
        )}
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
            {claims.map((claim) => (
              <HistoryItemCard
                key={claim.id}
                item={claim.item}
                id={claim.id}
                status={claim.status}
                to={
                  claim.status === 'SCHEDULED' && claim.schedule?.ticketId
                    ? paths.eticket(claim.schedule.ticketId)
                    : undefined
                }
              >
                {claim.detailed && <ClaimTimeline steps={claim.steps} />}
                {claim.status === 'APPROVED' && (
                  <Link
                    className="profile-schedule-link"
                    to={`${paths.scheduling}?claimId=${encodeURIComponent(claim.id)}`}
                  >
                    Pilih jadwal pengambilan
                  </Link>
                )}
              </HistoryItemCard>
            ))}
          </section>
        ) : (
          <section
            className="profile-history-list"
            id="profile-reports-panel"
            role="tabpanel"
            aria-labelledby="profile-reports-tab"
          >
            {reports.map((report) => (
              <HistoryItemCard
                key={report.id}
                item={report.item}
                id={report.id}
                idLabel="Laporan"
                status={report.status}
                type={report.type}
                date={report.date}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
