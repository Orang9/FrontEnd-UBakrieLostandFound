import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getMyClaims } from '../../claim/api/claimApi.js';
import { getSlots, createSchedule } from '../api/schedulingApi.js';
import { paths } from '../../../app/router/paths.js';

function dateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function nextWeekdays(count = 15) {
  const dates = [];
  const date = new Date();
  date.setDate(date.getDate() + 1);
  while (dates.length < count) {
    if (date.getDay() > 0 && date.getDay() < 6) {
      dates.push(dateString(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${value}T12:00:00`));
}

export function SchedulingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const claimId = searchParams.get('claimId');
  const dates = useMemo(() => nextWeekdays(), []);
  const [date, setDate] = useState(dates[0]);
  const [claim, setClaim] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    getMyClaims()
      .then((response) => {
        const found = (response.data ?? []).find(
          (row) => String(row.claim_id) === String(claimId),
        );
        if (isCurrent) setClaim(found ?? null);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(
            requestError.response?.data?.message ||
              'Klaim gagal dimuat. Coba kembali.',
          );
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [claimId]);

  useEffect(() => {
    let isCurrent = true;
    setSelectedSlot('');
    setError('');
    getSlots({ date })
      .then((response) => {
        if (isCurrent) setSlots(response.data?.slots ?? []);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(
            requestError.response?.data?.message ||
              'Ketersediaan slot gagal dimuat.',
          );
        }
      });
    return () => {
      isCurrent = false;
    };
  }, [date]);

  const canSchedule = claim && ['verified', 'scheduled'].includes(claim.status);

  async function confirmSchedule(event) {
    event.preventDefault();
    if (!canSchedule || !selectedSlot) return;
    setSubmitting(true);
    setError('');
    try {
      await createSchedule({
        claimId,
        slot_id: Number(selectedSlot),
        scheduled_date: date,
      });
      navigate(`${paths.profile}?tab=claims`);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Jadwal gagal disimpan.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const availableSlots = slots.filter(
    (slot) => slot.is_available && slot.available_quota > 0,
  );

  return (
    <main className="scheduling-page">
      <header className="scheduling-header">
        <Link
          className="scheduling-back"
          to={`${paths.profile}?tab=claims`}
          aria-label="Kembali ke profil"
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </Link>
        <h1>Pilih Slot Pengambilan</h1>
      </header>

      {loading ? (
        <p role="status">Memuat klaim...</p>
      ) : !canSchedule ? (
        <section className="scheduling-unavailable" role="status">
          <p>
            {error ||
              (claim
                ? 'Jadwal hanya dapat dipilih setelah klaim diverifikasi.'
                : 'Klaim terverifikasi tidak ditemukan.')}
          </p>
          <Link to={`${paths.profile}?tab=claims`}>Kembali ke profil</Link>
        </section>
      ) : (
        <form className="scheduling-content" onSubmit={confirmSchedule}>
          <div className="scheduling-approval" role="status">
            Klaim {claim.item_name} telah diverifikasi. Pilih jadwal
            pengambilan.
          </div>
          {error && <p role="alert">{error}</p>}

          <section className="scheduling-section" aria-labelledby="date-title">
            <h2 id="date-title">Tanggal pengambilan</h2>
            <select
              aria-label="Pilih tanggal"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            >
              {dates.map((option) => (
                <option key={option} value={option}>
                  {formatDate(option)}
                </option>
              ))}
            </select>
          </section>

          <section className="scheduling-section" aria-labelledby="slot-title">
            <h2 id="slot-title">Slot tersedia - {formatDate(date)}</h2>
            {slots.length === 0 ? (
              <p role="status">Tidak ada slot untuk tanggal ini.</p>
            ) : (
              <div
                className="scheduling-slot-list"
                role="radiogroup"
                aria-label="Pilih slot waktu"
              >
                {slots.map((slot) => {
                  const available =
                    slot.is_available && slot.available_quota > 0;
                  return (
                    <label
                      className={`scheduling-slot${selectedSlot === String(slot.slot_id) ? ' is-selected' : ''}${available ? '' : ' is-full'}`}
                      key={slot.slot_id}
                    >
                      <input
                        type="radio"
                        name="schedule-slot"
                        value={slot.slot_id}
                        checked={selectedSlot === String(slot.slot_id)}
                        disabled={!available}
                        onChange={() => setSelectedSlot(String(slot.slot_id))}
                      />
                      <span className="scheduling-radio" aria-hidden="true" />
                      <strong>
                        {slot.start_time.slice(0, 5)} -{' '}
                        {slot.end_time.slice(0, 5)}
                      </strong>
                      {!available && (
                        <span className="scheduling-full-badge">Penuh</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </section>

          <button
            className="scheduling-confirm"
            type="submit"
            disabled={submitting || !availableSlots.length || !selectedSlot}
          >
            {submitting ? 'Menyimpan...' : 'Konfirmasi Jadwal'}
          </button>
          <p className="scheduling-footnote">
            Jadwal tersimpan di backend dan status klaim akan menjadi terjadwal.
          </p>
        </form>
      )}
    </main>
  );
}
