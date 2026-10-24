import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Backpack,
  KeyRound,
  Laptop,
  LockKeyhole,
  Upload,
  Wallet,
} from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../../app/providers/ToastProvider.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { StatusBadge } from '../../../components/domain/StatusBadge.jsx';
import { ITEM_STATUS } from '../../../constants/status.js';
import { SYSTEM_MESSAGES } from '../../../constants/messages.js';
import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_SIZE_MB,
} from '../../../constants/limits.js';
import { paths } from '../../../app/router/paths.js';
import { getCatalogItem, normalizeItem } from '../../catalog/api/catalogApi.js';
import { createClaim } from '../api/claimApi.js';
import {
  hasActiveClaimForItem,
  savePreviewClaim,
} from '../../../lib/claimStorage.js';
import {
  validateClaimAnswers,
  validateClaimEvidence,
} from '../schemas/claimValidation.js';

function ItemSummary({ item }) {
  const ItemIcon =
    item.category === 'Sensitif'
      ? LockKeyhole
      : ({ key: KeyRound, wallet: Wallet, backpack: Backpack, laptop: Laptop }[
          item.icon
        ] ?? LockKeyhole);

  return (
    <section className="claim-item-summary" aria-label="Ringkasan barang">
      <div
        className={`claim-item-thumbnail${item.category === 'Sensitif' ? ' is-sensitive' : ` tone-${item.thumbnailTone ?? 'primary'}`}`}
        aria-hidden="true"
      >
        <ItemIcon size={28} aria-hidden="true" />
      </div>
      <div className="claim-item-copy">
        <h2>{item.name}</h2>
        <span className="claim-category-badge">
          {item.category.toUpperCase()}
        </span>
        <p>
          {item.location}, {item.fullDate ?? item.date}
        </p>
        <StatusBadge status={item.status} />
      </div>
      {item.category === 'Sensitif' && (
        <span className="claim-item-lock" aria-label="Foto barang disamarkan">
          <LockKeyhole size={17} />
        </span>
      )}
    </section>
  );
}

export function ClaimPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    getCatalogItem(itemId).then((data) => setItem(normalizeItem(data)))
      .catch(() => setSubmitError('Barang tidak dapat dimuat.'))
      .finally(() => setLoading(false));
  }, [itemId]);
  const [duplicateClaim, setDuplicateClaim] = useState(() =>
    item ? hasActiveClaimForItem(item.id) : false,
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { answers: [] } });

  if (loading) return <div className="claim-page"><p role="status">Memuat barang...</p></div>;
  if (!item) {
    return (
      <div className="claim-page">
        <header className="claim-hero">
          <div className="claim-hero-content">
            <button
              className="claim-back-button"
              type="button"
              onClick={() => navigate(paths.catalog)}
              aria-label="Kembali ke katalog"
            >
              <ArrowLeft size={22} aria-hidden="true" />
            </button>
            <h1>Ajukan Klaim</h1>
          </div>
        </header>
        <div className="claim-content">
          <section className="claim-empty-state">
            <h2>Barang tidak ditemukan</h2>
            <p>Barang ini tidak tersedia di katalog saat ini.</p>
            <Button type="button" onClick={() => navigate(paths.catalog)}>
              Kembali ke katalog
            </Button>
          </section>
        </div>
      </div>
    );
  }

  const questions = item.claimQuestions ?? [];
  const cannotClaim = item.status !== ITEM_STATUS.AVAILABLE || questions.length === 0;

  async function onSubmit(values) {
    const answers = Array.isArray(values.answers) ? values.answers : [];
    if (validateClaimAnswers(answers, questions.length) !== true) return;

    try {
      if (hasActiveClaimForItem(item.id)) {
        setDuplicateClaim(true);
        return;
      }

      setSubmitting(true);
      setSubmitError('');
      const payload = new FormData();
      payload.append('answers', JSON.stringify(answers));
      if (values.evidence?.[0]) payload.append('evidence', values.evidence[0]);
      const result = await createClaim(item.id, payload);
      const id = String(result?.claim_id ?? result?.id ?? `CL-${String(Date.now()).slice(-6)}`);
      const submittedAt = new Date();
      const submittedTime = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(submittedAt);

      savePreviewClaim({
        id,
        item: {
          id: item.id,
          name: item.name,
          icon: item.icon,
          category: item.category,
        },
        status: 'PENDING',
        detailed: true,
        previewOnly: true,
        submittedAt: submittedAt.toISOString(),
        steps: [
          {
            key: 'SUBMITTED',
            label: 'Klaim dikirim',
            time: submittedTime,
            complete: true,
          },
          {
            key: 'PENDING',
            label: 'Menunggu persetujuan Admin BEM (PENDING)',
            time: 'Menunggu persetujuan',
            complete: false,
          },
          {
            key: 'APPROVED',
            label: 'Disetujui (APPROVED)',
            time: '-',
            complete: false,
          },
          {
            key: 'SCHEDULED',
            label: 'Jadwal dipilih (TERJADWAL)',
            time: '-',
            complete: false,
          },
          {
            key: 'CLAIMED',
            label: 'Diambil (CLAIMED)',
            time: '-',
            complete: false,
          },
        ],
      });

      navigate(`${paths.profile}?tab=claims&claimId=${encodeURIComponent(id)}`);
    } catch (error) {
      console.error('Could not save preview claim.', error);
      setSubmitError(error?.response?.data?.message ?? 'Klaim tidak dapat dikirim.');
      notify(SYSTEM_MESSAGES.genericError, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const backPath = location.key === 'default' ? paths.catalog : -1;

  return (
    <div className="claim-page">
      <header className="claim-hero">
        <div className="claim-hero-content">
          <button
            className="claim-back-button"
            type="button"
            onClick={() => navigate(backPath)}
            aria-label="Kembali"
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </button>
          <h1>Ajukan Klaim</h1>
        </div>
      </header>

      <nav className="claim-breadcrumb" aria-label="Breadcrumb">
        <Link to={paths.catalog}>Katalog</Link>
        <span aria-hidden="true">/</span>
        <span>{item.name}</span>
        <span aria-hidden="true">/</span>
        <span>Ajukan Klaim</span>
      </nav>

      <div className="claim-content">
        <ItemSummary item={item} />
        {submitError && <p className="claim-error" role="alert">{submitError}</p>}

        <section className="claim-verification">
          <h2>{cannotClaim ? 'Klaim belum tersedia' : 'Verifikasi Kepemilikan'}</h2>
          {cannotClaim ? (
            <p className="claim-description">
              {questions.length === 0 && item.status === ITEM_STATUS.AVAILABLE
                ? 'Pertanyaan verifikasi untuk barang ini belum diatur oleh Admin BEM.'
                : 'Klaim hanya tersedia untuk barang temuan yang berstatus Tersedia dan memiliki pertanyaan verifikasi.'}
            </p>
          ) : (
            <>
          <p className="claim-description">
            Jawab {questions.length} pertanyaan kunci. Admin BEM akan meninjau
            jawaban secara manual sebelum klaim disetujui.
          </p>
          <form
            className="claim-form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            {questions.map((question, index) => (
              <label
                className="claim-field"
                htmlFor={`claim-answer-${index}`}
                key={question}
              >
                <span>
                  {index + 1}. {question}
                </span>
                <input
                  id={`claim-answer-${index}`}
                  type="text"
                  placeholder={
                    'Tulis jawaban Anda'
                  }
                  aria-invalid={Boolean(errors.answers?.[index])}
                  {...register(`answers.${index}`, {
                    required: 'Jawaban verifikasi wajib diisi.',
                  })}
                />
                {errors.answers?.[index] && (
                  <span className="claim-error">
                    {errors.answers[index].message}
                  </span>
                )}
              </label>
            ))}

            <label className="claim-field" htmlFor="claim-evidence">
              <span>
                Bukti kepemilikan (opsional, maks {MAX_PHOTO_SIZE_MB} MB)
              </span>
              <span className="claim-upload">
                <Upload size={20} aria-hidden="true" />
                <span>+ Unggah foto KTM / nota pembelian JPG / PNG</span>
                <input
                  id="claim-evidence"
                  type="file"
                  accept={ACCEPTED_PHOTO_TYPES.join(',')}
                  {...register('evidence', { validate: validateClaimEvidence })}
                />
              </span>
              {errors.evidence && (
                <span className="claim-error">{errors.evidence.message}</span>
              )}
            </label>

            {duplicateClaim ? (
              <div className="claim-duplicate-notice" role="status">
                Anda sudah memiliki klaim aktif untuk barang ini. Sistem menolak
                klaim ganda.
              </div>
            ) : (
              <div className="claim-submit-area">
                <p className="claim-pending-notice">
                  Status setelah dikirim: PENDING
                </p>
                <Button
                  className="claim-submit-button"
                  type="submit"
                  disabled={cannotClaim || submitting}
                >
                  {cannotClaim ? 'Barang sudah diklaim' : submitting ? 'Mengirim...' : 'Kirim Klaim'}
                </Button>
                <p className="claim-footnote">
                  Anda sudah punya klaim aktif? Sistem menolak klaim ganda.
                </p>
              </div>
            )}
          </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
