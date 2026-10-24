import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HistoryItemCard } from '../components/HistoryItemCard.jsx';
import { ClaimTimeline } from '../components/ClaimTimeline.jsx';
import { getProfile } from '../api/profileApi.js';
import { getStoredClaims } from '../../../lib/claimStorage.js';
import { paths } from '../../../app/router/paths.js';
import { formatShortDate } from '../../../lib/format.js';
import { getMediaUrl } from '../../../lib/media.js';

const tabs = [
  { id: 'claims', label: 'Riwayat Klaim' },
  { id: 'reports', label: 'Riwayat Lapor' },
];

function getItemIcon(name) {
  const normalizedName = String(name).toLowerCase();
  if (normalizedName.includes('dompet') || normalizedName.includes('wallet')) {
    return 'wallet';
  }
  if (normalizedName.includes('kunci') || normalizedName.includes('key')) {
    return 'key';
  }
  return 'backpack';
}

function formatTimelineTime(value) {
  if (!value) return '-';

  const date = new Date(
    typeof value === 'string' ? value.replace(' ', 'T') : value,
  );
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function buildClaimSteps(claim, status) {
  const submittedTime = formatTimelineTime(
    claim.submittedAt ?? claim.create_at,
  );
  const processedTime = formatTimelineTime(claim.processed_at);

  const steps = [
    {
      key: 'SUBMITTED',
      label: 'Klaim dikirim',
      time: submittedTime,
      complete: true,
    },
  ];

  if (status === 'REJECTED') {
    return [
      ...steps,
      {
        key: 'VERIFYING',
        label: 'Verifikasi manual Admin BEM',
        time: processedTime,
        complete: true,
      },
      {
        key: 'REJECTED',
        label: 'Klaim ditolak (REJECTED)',
        time: processedTime,
        complete: true,
      },
    ];
  }

  const isReviewed = ['APPROVED', 'SCHEDULED', 'CLAIMED'].includes(status);
  const isScheduled = ['SCHEDULED', 'CLAIMED'].includes(status);

  return [
    ...steps,
    status === 'PENDING'
      ? {
          key: 'PENDING',
          label: 'Menunggu persetujuan Admin BEM (PENDING)',
          time: 'Menunggu persetujuan',
          complete: false,
        }
      : {
          key: 'VERIFYING',
          label: 'Verifikasi manual Admin BEM',
          time: processedTime,
          complete: isReviewed,
        },
    {
      key: 'APPROVED',
      label: 'Disetujui (APPROVED)',
      time: isReviewed ? processedTime : '-',
      complete: isReviewed,
    },
    {
      key: 'SCHEDULED',
      label: 'Jadwal dipilih (TERJADWAL)',
      time: isScheduled ? formatTimelineTime(claim.scheduled_date) : '-',
      complete: isScheduled,
    },
    {
      key: 'CLAIMED',
      label: 'Diambil (CLAIMED)',
      time:
        status === 'CLAIMED'
          ? formatTimelineTime(claim.claimed_at ?? claim.processed_at)
          : '-',
      complete: status === 'CLAIMED',
    },
  ];
}

function normalizeClaim(claim) {
  const name = claim.item?.name ?? claim.item_name ?? 'Barang';
  const status = String(claim.status ?? '').toUpperCase();
  const normalizedStatus = status === 'VERIFIED' ? 'APPROVED' : status;
  const category =
    claim.item?.category ??
    claim.category_name ??
    (Number(claim.is_sensitive) ? 'Sensitif' : 'Umum');
  const scheduledDate = claim.scheduled_date;

  return {
    ...claim,
    id: String(claim.id ?? claim.claim_id),
    status: normalizedStatus,
    detailed: true,
    steps: claim.steps ?? buildClaimSteps(claim, normalizedStatus),
    item: {
      ...claim.item,
      id: String(claim.item?.id ?? claim.item_id ?? ''),
      name,
      category,
      icon: claim.item?.icon ?? getItemIcon(name),
      imageUrl: getMediaUrl(
        claim.item?.imageUrl ??
          claim.item?.image_url ??
          claim.item?.image_path ??
          claim.image_url ??
          claim.image_path ??
          claim.item_image_path,
      ),
    },
    ...(scheduledDate && {
      schedule: {
        ...claim.schedule,
        date: formatShortDate(scheduledDate),
      },
    }),
  };
}

function normalizeReport(report) {
  const name = report.item?.name ?? report.name ?? report.item_name ?? 'Barang';
  const category =
    report.item?.category ??
    report.category_name ??
    report.category ??
    (Number(report.is_sensitive) ? 'Sensitif' : 'Umum');
  const reportType = String(
    report.report_type ?? report.type ?? '',
  ).toLowerCase();
  const date =
    report.report_date ??
    report.lost_date ??
    report.found_date ??
    report.date ??
    report.created_at;
  const rawStatus = String(
    report.status ?? report.display_status ?? report.report_review_status ?? '',
  ).toUpperCase();
  const statusAliases = {
    TERSEDIA: 'AVAILABLE',
    'LAPORAN AKTIF': 'ACTIVE',
    DIKLAIM: 'CLAIMED',
    DIDONASIKAN: 'DONATED',
  };

  return {
    ...report,
    id: String(report.id ?? report.item_id),
    item: {
      ...report.item,
      name,
      category,
      icon: report.item?.icon ?? getItemIcon(name),
      imageUrl: getMediaUrl(
        report.item?.imageUrl ??
          report.item?.image_url ??
          report.item?.image_path ??
          report.image_url ??
          report.image_path,
      ),
    },
    type: reportType === 'lost' ? 'Hilang' : 'Temuan',
    status: statusAliases[rawStatus] ?? rawStatus,
    date: formatShortDate(date),
  };
}

function readPreviewHistory() {
  try {
    return { claims: getStoredClaims(), error: '' };
  } catch {
    return {
      claims: [],
      error:
        'Riwayat klaim lokal tidak dapat dibaca. Riwayat dari akun tetap tersedia.',
    };
  }
}

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
  const [previewHistory] = useState(readPreviewHistory);
  const { claims: previewClaims, error: previewError } = previewHistory;

  useEffect(() => {
    let mounted = true;

    getProfile()
      .then((response) => {
        const data = response?.data ?? response;
        if (!Array.isArray(data?.claims) || !Array.isArray(data?.reports)) {
          throw new TypeError(
            'Profile response is missing claim or report history.',
          );
        }

        if (mounted) {
          setProfile({
            claims: data.claims.map(normalizeClaim),
            reports: data.reports.map(normalizeReport),
          });
        }
      })
      .catch(() => {
        if (mounted) setError('Profil tidak dapat dimuat. Silakan coba lagi.');
      });

    return () => {
      mounted = false;
    };
  }, []);

  const claimsById = new Map(
    previewClaims.map((claim) => [String(claim.id), normalizeClaim(claim)]),
  );
  for (const claim of profile?.claims ?? []) {
    const preview = claimsById.get(claim.id);
    claimsById.set(claim.id, {
      ...preview,
      ...claim,
      item: { ...preview?.item, ...claim.item },
      schedule: claim.schedule ?? preview?.schedule,
      detailed: claim.detailed ?? preview?.detailed,
      steps: claim.steps ?? preview?.steps,
    });
  }
  const claims = [...claimsById.values()];
  const updatedClaim = claims.find((claim) => claim.id === claimId);
  const submittedClaim = updatedClaim;

  return (
    <div className="profile-page">
      <header className="profile-hero">
        <div className="profile-hero-content">
          <h1>Riwayat Saya</h1>
        </div>
      </header>

      <div className="profile-content">
        {error && <p role="alert">{error}</p>}
        {previewError && <p role="alert">{previewError}</p>}
        {!profile && !error && <p role="status">Memuat riwayat...</p>}
        {submittedClaim?.status === 'PENDING' && (
          <aside className="profile-pending-banner" role="status">
            Klaim #{submittedClaim.id} berhasil disimpan dan berstatus PENDING.
            Tunggu persetujuan Admin BEM sebelum melanjutkan.
          </aside>
        )}
        {scheduled && updatedClaim?.status === 'SCHEDULED' && (
          <aside className="profile-pending-banner" role="status">
            Jadwal pengambilan klaim #{updatedClaim.id} telah dikonfirmasi.
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
            {profile &&
              (claims.length ? (
                claims.map((claim) => (
                  <HistoryItemCard
                    key={claim.id}
                    item={claim.item}
                    id={claim.id}
                    status={claim.status}
                    to={
                      claim.status === 'SCHEDULED'
                        ? paths.eticket(claim.schedule?.ticketId ?? claim.id)
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
                ))
              ) : (
                <p>Belum ada riwayat klaim.</p>
              ))}
          </section>
        ) : (
          <section
            className="profile-history-list"
            id="profile-reports-panel"
            role="tabpanel"
            aria-labelledby="profile-reports-tab"
          >
            {profile &&
              (profile.reports.length ? (
                profile.reports.map((report) => (
                  <HistoryItemCard
                    key={report.id}
                    item={report.item}
                    id={report.id}
                    idLabel="Laporan"
                    status={report.status}
                    type={report.type}
                    date={report.date}
                  />
                ))
              ) : (
                <p>Belum ada riwayat laporan.</p>
              ))}
          </section>
        )}
      </div>
    </div>
  );
}
