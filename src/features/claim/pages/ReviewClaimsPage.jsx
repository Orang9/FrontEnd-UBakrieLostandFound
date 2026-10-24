import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Backpack,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { StatusBadge } from '../../../components/domain/StatusBadge.jsx';
import { useToast } from '../../../app/providers/ToastProvider.jsx';
import { getMediaUrl } from '../../../lib/media.js';
import {
  getAdminClaims,
  getClaimEvidence,
  processAdminClaim,
} from '../../admin/api/adminApi.js';

const statusTabs = [
  { id: 'PENDING', label: 'PENDING' },
  { id: 'APPROVED', label: 'APPROVED' },
  { id: 'REJECTED', label: 'Ditolak' },
];

function ClaimListCard({ claim, selected, onSelect }) {
  return (
    <button
      className={`review-claim-item${selected ? ' is-selected' : ''}`}
      type="button"
      onClick={() => onSelect(claim)}
    >
      <span className="review-claim-item-main">
        <strong>Klaim #{claim.id}</strong>
        <span>{claim.item}</span>
        <small>{claim.applicant}</small>
      </span>
      <span className="review-claim-item-meta">
        <span
          className={`admin-category-pill${claim.category === 'Sensitif' ? ' is-sensitive' : ''}`}
        >
          {claim.category}
        </span>
        <StatusBadge status={claim.status} />
      </span>
    </button>
  );
}

function ClaimDetail({ claim, onBack, onAction }) {
  const [manualVerified, setManualVerified] = useState(false);
  const [evidenceImage, setEvidenceImage] = useState('');
  const [evidenceError, setEvidenceError] = useState('');
  const ClaimIcon =
    claim.icon === 'wallet'
      ? Wallet
      : claim.icon === 'key'
        ? KeyRound
        : Backpack;

  useEffect(() => {
    if (!claim.evidenceUrl) {
      setEvidenceImage('');
      setEvidenceError('');
      return undefined;
    }

    let active = true;
    let objectUrl = '';
    setEvidenceImage('');
    setEvidenceError('');

    getClaimEvidence(claim.id)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setEvidenceImage(objectUrl);
      })
      .catch(() => {
        if (active) setEvidenceError('Bukti kepemilikan tidak dapat dimuat.');
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [claim.evidenceUrl, claim.id]);

  return (
    <article className="admin-panel review-claim-detail">
      <button className="review-mobile-back" type="button" onClick={onBack}>
        <ArrowLeft size={18} aria-hidden="true" />
        Kembali ke Daftar
      </button>
      <header className="review-detail-heading">
        <div>
          <p className="admin-eyebrow">Detail pengajuan</p>
          <h2>Klaim #{claim.id}</h2>
        </div>
        <StatusBadge status={claim.status} />
      </header>

      <section className="review-item-summary" aria-label="Barang yang diklaim">
        <div
          className={`review-item-image${claim.category === 'Sensitif' ? ' is-sensitive' : ''}`}
          aria-label={
            claim.category === 'Sensitif'
              ? 'Foto barang diburamkan demi privasi'
              : 'Pratinjau barang'
          }
        >
          {claim.imageUrl ? (
            <img src={claim.imageUrl} alt={`Foto ${claim.item}`} />
          ) : claim.category === 'Sensitif' ? (
            <LockKeyhole size={28} aria-hidden="true" />
          ) : (
            <ClaimIcon size={28} aria-hidden="true" />
          )}
        </div>
        <div>
          <h3>{claim.item}</h3>
          <p>Pemohon: {claim.applicant}</p>
          <span
            className={`admin-category-pill${claim.category === 'Sensitif' ? ' is-sensitive' : ''}`}
          >
            {claim.category}
          </span>
        </div>
      </section>

      <section
        className="review-answers"
        aria-labelledby="review-answers-title"
      >
        <h3 id="review-answers-title">Jawaban verifikasi kepemilikan</h3>
        {claim.questions.map(([question, answer], index) => (
          <div className="review-answer" key={question}>
            <span>
              {index + 1}. {question}
            </span>
            <p>{answer}</p>
          </div>
        ))}
      </section>

      <section className="review-evidence">
        <h3>Bukti kepemilikan</h3>
        {evidenceImage ? (
          <img
            className="review-evidence-image"
            src={evidenceImage}
            alt={`Bukti kepemilikan klaim ${claim.id}`}
          />
        ) : evidenceError ? (
          <p role="alert">{evidenceError}</p>
        ) : claim.evidence && !claim.evidenceUrl ? (
          <p role="alert">Bukti kepemilikan tidak dapat dimuat.</p>
        ) : claim.evidence ? (
          <p role="status">Memuat bukti kepemilikan...</p>
        ) : (
          <p>Pemohon tidak melampirkan bukti tambahan.</p>
        )}
      </section>

      {claim.category === 'Sensitif' && (
        <label className="review-manual-check">
          <input
            type="checkbox"
            checked={manualVerified}
            onChange={(event) => setManualVerified(event.target.checked)}
          />
          <span>
            <ShieldCheck size={18} aria-hidden="true" />
            Verifikasi manual selesai (wajib untuk Sensitif)
          </span>
        </label>
      )}

      <footer className="review-detail-actions">
        <p>Pastikan jawaban dan bukti sesuai sebelum mengambil keputusan.</p>
        <div>
          <button
            className="button button-secondary review-reject-button"
            type="button"
            onClick={() => onAction('Penolakan klaim')}
          >
            Tolak
          </button>
          <button
            className="button button-primary"
            type="button"
            disabled={claim.category === 'Sensitif' && !manualVerified}
            onClick={() => onAction('Persetujuan klaim')}
          >
            Setujui
          </button>
        </div>
      </footer>
      <p className="admin-data-note">
        Data klaim berasal dari backend. Keputusan disimpan ke database.
      </p>
    </article>
  );
}

export function ReviewClaimsPage() {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [error, setError] = useState('');
  const { notify } = useToast();

  async function loadClaims() {
    try {
      const response = await getAdminClaims('all');
      const values = (response.data || []).map((claim) => ({
        id: claim.claim_id,
        item: claim.item_name,
        applicant: claim.claimer_name,
        category: claim.is_sensitive ? 'Sensitif' : 'Umum',
        status:
          claim.status === 'verified' ? 'APPROVED' : claim.status.toUpperCase(),
        icon: 'backpack',
        imageUrl: getMediaUrl(
          claim.image_url ?? claim.image_path ?? claim.item_image_path,
        ),
        evidenceUrl: claim.evidence_url,
        questions: claim.verification_answers?.length
          ? claim.verification_answers.map(({ question, answer }) => [
              question,
              answer,
            ])
          : [['Jawaban verifikasi', claim.challange_answer || '-']],
        evidence: claim.has_evidence ? 'Bukti terlampir' : null,
      }));
      setClaims(values);
      setSelectedClaim(
        (current) =>
          values.find((claim) => claim.id === current?.id) || values[0] || null,
      );
      setError('');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Klaim tidak dapat dimuat.',
      );
    }
  }

  useEffect(() => {
    loadClaims();
  }, []);

  const filteredClaims = useMemo(
    () => claims.filter((claim) => claim.status === activeTab),
    [activeTab, claims],
  );

  function changeTab(status) {
    setActiveTab(status);
    const firstClaim = claims.find((claim) => claim.status === status) ?? null;
    setSelectedClaim(firstClaim);
    setMobileDetailOpen(false);
  }

  function selectClaim(claim) {
    setSelectedClaim(claim);
    setMobileDetailOpen(true);
  }

  return (
    <div className="admin-page review-claims-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Pemeriksaan pengajuan</p>
          <h1>Verifikasi Klaim</h1>
          <p className="admin-page-description">
            Tinjau jawaban pemohon dan bukti kepemilikan sebelum mengambil
            keputusan.
          </p>
        </div>
        <span className="admin-preview-label">Data database</span>
      </header>

      <div
        className={`review-workspace${mobileDetailOpen ? ' is-detail-open' : ''}`}
      >
        <section
          className="admin-panel review-claim-list"
          aria-label="Daftar klaim"
        >
          <div
            className="review-tabs"
            role="tablist"
            aria-label="Filter status klaim"
          >
            {statusTabs.map((tab) => {
              const count = claims.filter(
                (claim) => claim.status === tab.id,
              ).length;
              return (
                <button
                  key={tab.id}
                  id={`review-tab-${tab.id}`}
                  className={`review-tab${activeTab === tab.id ? ' is-active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls="review-claim-list"
                  onClick={() => changeTab(tab.id)}
                >
                  {tab.label} {tab.id === 'PENDING' && `(${count})`}
                </button>
              );
            })}
          </div>
          <div
            className="review-claim-items"
            id="review-claim-list"
            role="tabpanel"
            aria-labelledby={`review-tab-${activeTab}`}
          >
            {error ? (
              <p className="admin-empty-note" role="alert">
                {error}
              </p>
            ) : filteredClaims.length ? (
              filteredClaims.map((claim) => (
                <ClaimListCard
                  key={claim.id}
                  claim={claim}
                  selected={selectedClaim?.id === claim.id}
                  onSelect={selectClaim}
                />
              ))
            ) : (
              <p className="admin-empty-note">
                Tidak ada klaim dengan status {activeTab.toLowerCase()}.
              </p>
            )}
          </div>
        </section>

        {selectedClaim ? (
          <ClaimDetail
            key={selectedClaim.id}
            claim={selectedClaim}
            onBack={() => setMobileDetailOpen(false)}
            onAction={async (action) => {
              const status =
                action === 'Persetujuan klaim' ? 'verified' : 'rejected';
              try {
                await processAdminClaim(selectedClaim.id, status);
                notify(
                  `Klaim berhasil ${status === 'verified' ? 'disetujui' : 'ditolak'}.`,
                  'success',
                );
                await loadClaims();
              } catch (requestError) {
                notify(
                  requestError.response?.data?.message ||
                    'Keputusan klaim gagal disimpan.',
                  'error',
                );
              }
            }}
          />
        ) : (
          <section className="admin-panel review-detail-empty">
            <h2>Pilih pengajuan klaim</h2>
            <p>Pilih salah satu klaim untuk melihat detail verifikasinya.</p>
          </section>
        )}
      </div>
    </div>
  );
}
