import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../../app/providers/ToastProvider.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { StatusBadge } from '../../../components/domain/StatusBadge.jsx';
import { getCatalogItem } from '../../catalog/api/catalogApi.js';
import { createClaim, getMyClaims } from '../api/claimApi.js';
import { paths } from '../../../app/router/paths.js';

export function ClaimPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [duplicateClaim, setDuplicateClaim] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    let isCurrent = true;
    Promise.all([getCatalogItem(itemId), getMyClaims()])
      .then(([itemResponse, claimsResponse]) => {
        if (!isCurrent) return;
        setItem(itemResponse.data);
        setDuplicateClaim(
          (claimsResponse.data ?? []).some(
            (claim) =>
              String(claim.item_id) === String(itemId) &&
              ['pending', 'verified', 'scheduled'].includes(claim.status),
          ),
        );
      })
      .catch((error) => {
        if (isCurrent) {
          setLoadError(
            error.response?.data?.message ||
              'Informasi barang atau klaim gagal dimuat.',
          );
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [itemId]);

  if (loading) return <p role="status">Memuat informasi barang...</p>;
  if (loadError || !item) {
    return (
      <section className="claim-page">
        <div className="claim-content">
          <h1>Ajukan Klaim</h1>
          <p role="alert">{loadError || 'Barang tidak ditemukan.'}</p>
          <Button type="button" onClick={() => navigate(paths.catalog)}>
            Kembali ke katalog
          </Button>
        </div>
      </section>
    );
  }

  const isSensitive = Boolean(item.is_sensitive);
  const cannotClaim = ['claimed', 'donated'].includes(item.status);
  const status =
    item.status === 'secured'
      ? 'AVAILABLE'
      : item.status === 'pending'
        ? 'WAITING_AT_SECURITY'
        : item.status.toUpperCase();

  async function onSubmit(values) {
    if (duplicateClaim) return;
    const answers = [values.answer1?.trim(), values.answer2?.trim()].filter(
      Boolean,
    );
    setSubmitting(true);
    try {
      const payload = { item_id: Number(item.item_id) };
      if (answers.length > 0) {
        payload.challange_answer = answers
          .map((answer, index) => `${index + 1}. ${answer}`)
          .join('\n');
      }
      const response = await createClaim(payload);
      const claimId = response.data?.claim_id;
      notify(response.message || 'Klaim berhasil dikirim.', 'success');
      navigate(
        `${paths.profile}?tab=claims${claimId ? `&claimId=${encodeURIComponent(claimId)}` : ''}`,
      );
    } catch (error) {
      const message = error.response?.data?.message || 'Klaim gagal dikirim.';
      if (error.response?.status === 400 && /already claimed/i.test(message)) {
        setDuplicateClaim(true);
      }
      notify(message, 'error');
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

      <div className="claim-content">
        <section className="claim-item-summary" aria-label="Ringkasan barang">
          <div
            className={`claim-item-thumbnail${isSensitive ? ' is-sensitive' : ''}`}
            aria-hidden="true"
          >
            {isSensitive && <LockKeyhole size={28} />}
          </div>
          <div className="claim-item-copy">
            <h2>{item.name}</h2>
            <span className="claim-category-badge">{item.category_name}</span>
            <p>
              {item.found_location}, {item.found_date}
            </p>
            <StatusBadge status={status} />
          </div>
          {isSensitive && (
            <span
              className="claim-item-lock"
              aria-label="Foto barang disamarkan"
            >
              <LockKeyhole size={17} />
            </span>
          )}
        </section>

        <section className="claim-verification">
          <h2>Verifikasi Kepemilikan</h2>
          <p className="claim-description">
            {isSensitive
              ? 'Jelaskan ciri khusus barang. Jawaban wajib untuk barang sensitif.'
              : 'Berikan informasi yang membantu Admin memverifikasi kepemilikan barang.'}
          </p>
          <form
            className="claim-form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <label className="claim-field" htmlFor="claim-answer-1">
              <span>Jelaskan ciri khusus barang yang ingin Anda klaim.</span>
              <textarea
                id="claim-answer-1"
                rows={4}
                aria-invalid={Boolean(errors.answer1)}
                {...register('answer1', {
                  required: isSensitive
                    ? 'Jawaban wajib diisi untuk barang sensitif.'
                    : false,
                })}
              />
              {errors.answer1 && (
                <span className="claim-error">{errors.answer1.message}</span>
              )}
            </label>

            {!cannotClaim && !duplicateClaim ? (
              <div className="claim-submit-area">
                <p className="claim-pending-notice">
                  Status setelah dikirim: Menunggu persetujuan
                </p>
                <Button
                  className="claim-submit-button"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Mengirim...' : 'Kirim Klaim'}
                </Button>
              </div>
            ) : (
              <div className="claim-duplicate-notice" role="status">
                {cannotClaim
                  ? 'Barang ini sudah tidak tersedia untuk diklaim.'
                  : 'Anda sudah memiliki klaim aktif untuk barang ini.'}
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
