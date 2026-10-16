import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HistoryItemCard } from '../components/HistoryItemCard.jsx';
import { ClaimTimeline } from '../components/ClaimTimeline.jsx';
import { claimHistory, reportHistory } from '../data/profileHistory.js';
import { getStoredClaims } from '../../../lib/claimStorage.js';
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
  const [previewClaims] = useState(getStoredClaims);
  const previewClaimIds = new Set(previewClaims.map((claim) => claim.id));
  const claims = [
    ...previewClaims,
    ...claimHistory.filter((claim) => !previewClaimIds.has(claim.id)),
  ];
  const submittedClaim = previewClaims.find((claim) => claim.id === claimId);
  const updatedClaim = claims.find((claim) => claim.id === claimId);

  return (
    <div className="profile-page">
      <header className="profile-hero">
        <div className="profile-hero-content">
          <h1>Riwayat Saya</h1>
        </div>
      </header>

      <div className="profile-content">
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
            {reportHistory.map((report) => (
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
