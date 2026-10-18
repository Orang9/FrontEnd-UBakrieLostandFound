import { useMemo, useState } from 'react';
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

const claims = [
  {
    id: 'CL-0147',
    item: 'Dompet / kartu identitas',
    applicant: 'Najwa Naela Fawwaz',
    category: 'Sensitif',
    status: 'PENDING',
    icon: 'wallet',
    questions: [
      ['Isi dompet selain kartu identitas', 'Kartu ATM dan struk belanja'],
      ['Warna / ciri khusus dompet', 'Hitam, ada gantungan kunci kecil'],
    ],
    evidence: 'foto_ktm.jpg',
  },
  {
    id: 'CL-0148',
    item: 'Kunci motor Honda',
    applicant: 'Raka Pratama',
    category: 'Umum',
    status: 'PENDING',
    icon: 'key',
    questions: [
      ['Ciri khusus pada gantungan kunci', 'Gantungan karet warna merah'],
      ['Kapan terakhir menggunakan kunci?', 'Kemarin sore di parkir B'],
    ],
    evidence: null,
  },
  {
    id: 'CL-0142',
    item: 'Tas ransel hitam',
    applicant: 'Dina Putri',
    category: 'Umum',
    status: 'APPROVED',
    icon: 'backpack',
    questions: [
      ['Isi barang di dalam tas', 'Buku catatan dan tempat pensil'],
      ['Ciri khusus tas', 'Ada pin berbentuk bunga di sisi kanan'],
    ],
    evidence: null,
  },
];

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
  const ClaimIcon =
    claim.icon === 'wallet'
      ? Wallet
      : claim.icon === 'key'
        ? KeyRound
        : Backpack;

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
          {claim.category === 'Sensitif' ? (
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
        {claim.evidence ? (
          <a href="#claim-evidence" onClick={(event) => event.preventDefault()}>
            {claim.evidence}
          </a>
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
        Data klaim ini contoh tampilan. Keputusan belum disimpan ke backend.
      </p>
    </article>
  );
}

export function ReviewClaimsPage() {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [selectedClaim, setSelectedClaim] = useState(claims[0]);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const { notify } = useToast();

  const filteredClaims = useMemo(
    () => claims.filter((claim) => claim.status === activeTab),
    [activeTab],
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
        <span className="admin-preview-label">Data contoh</span>
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
            {filteredClaims.length ? (
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
            onAction={(action) =>
              notify(`${action} hanya preview dan belum disimpan.`, 'info')
            }
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
