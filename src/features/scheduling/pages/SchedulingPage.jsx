import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { claimHistory } from '../../profile/index.js';
import {
  getStoredClaims,
  upsertPreviewClaim,
} from '../../../lib/claimStorage.js';
import { paths } from '../../../app/router/paths.js';
import { getProfile } from '../../profile/api/profileApi.js';
import { createSchedule, getSlots } from '../api/schedulingApi.js';
import { getScheduleDates } from '../lib/scheduleDates.js';

const dates = getScheduleDates();

const defaultSlots = [
  { id: '09-10', label: '09.00 - 10.00', available: true },
  { id: '10-11', label: '10.00 - 11.00', available: false },
  { id: '11-12', label: '11.00 - 12.00', available: true },
  { id: '13-14', label: '13.00 - 14.00', available: true },
  { id: '14-15', label: '14.00 - 15.00', available: true },
];

function findStoredClaim(claimId) {
  try {
    const storedClaim = getStoredClaims().find(
      (item) => String(item.id) === String(claimId),
    );
    if (storedClaim) return storedClaim;
  } catch {
    // Ignore storage parse errors
  }
  return (
    claimHistory.find((item) => String(item.id) === String(claimId)) ?? null
  );
}

export function SchedulingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const claimId = searchParams.get('claimId');
  const [claim, setClaim] = useState(() =>
    claimId ? findStoredClaim(claimId) : null,
  );
  const [selectedDate, setSelectedDate] = useState(dates[0]?.id ?? '');
  const [selectedSlot, setSelectedSlot] = useState('09-10');
  const [slots, setSlots] = useState(defaultSlots);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState('');

  const selectedDateInfo = dates.find((date) => date.id === selectedDate);
  const selectedDateValue = selectedDateInfo?.date;
  const canSchedule = ['APPROVED', 'VERIFIED'].includes(
    String(claim?.status ?? '').toUpperCase(),
  );

  // Fetch claim from profile if available
  useEffect(() => {
    if (!claimId) return;

    let mounted = true;
    getProfile()
      .then((profileRes) => {
        if (!mounted) return;
        const profileData = profileRes?.data ?? profileRes;
        const userClaims = profileData?.claims ?? [];
        const found = userClaims.find(
          (item) => String(item.claim_id ?? item.id) === String(claimId),
        );
        if (found) {
          const stored = findStoredClaim(claimId) || {};
          setClaim({
            ...stored,
            ...found,
            id: String(found.claim_id ?? found.id),
            claim_id: found.claim_id ?? found.id,
            status:
              String(found.status).toLowerCase() === 'verified'
                ? 'APPROVED'
                : String(found.status).toUpperCase(),
            itemName: found.item_name || stored.itemName || 'Barang Temuan',
          });
          setIsLive(true);
        }
      })
      .catch(() => {
        // Fallback to local stored claim
      });

    return () => {
      mounted = false;
    };
  }, [claimId]);

  // Fetch slots for selected date
  useEffect(() => {
    let mounted = true;
    if (!selectedDateValue) return undefined;
    const dateParam = selectedDateValue;

    getSlots({ date: dateParam })
      .then((result) => {
        if (!mounted) return;
        const rawSlots =
          result?.data?.slots ?? result?.slots ?? result?.data ?? [];
        if (Array.isArray(rawSlots) && rawSlots.length > 0) {
          const mapped = rawSlots.map((item) => {
            const startStr = String(item.start_time || '')
              .slice(0, 5)
              .replace(':', '.');
            const endStr = String(item.end_time || '')
              .slice(0, 5)
              .replace(':', '.');
            const label = item.label || `${startStr} - ${endStr}`;
            const available =
              typeof item.available === 'boolean'
                ? item.available
                : Number(item.available_quota ?? 1) > 0 &&
                  Boolean(item.is_available ?? 1);

            return {
              id: String(item.slot_id ?? item.id),
              slotId: item.slot_id ?? item.id,
              label,
              available,
            };
          });

          setSlots(mapped);
          setIsLive(true);

          // If current selected slot is not in the list or not available, select first available
          const firstAvailable = mapped.find((s) => s.available);
          setSelectedSlot(firstAvailable?.id ?? '');
        }
      })
      .catch(() => {
        // Fallback to defaultSlots
        setSlots(defaultSlots);
      });

    return () => {
      mounted = false;
    };
  }, [selectedDateValue]);

  async function confirmSchedule(event) {
    event.preventDefault();
    const slot = slots.find((option) => option.id === selectedSlot);
    if (!canSchedule || !slot?.available || !selectedDateInfo || !claim) return;

    setError('');
    const scheduledTime = `${selectedDateInfo.full} • ${slot.label}`;

    // Attempt backend integration
    if (claim.claim_id || Number(claim.id)) {
      try {
        await createSchedule({
          claim_id: claim.claim_id ?? claim.id,
          slot_id: slot.slotId ?? (Number(slot.id) || 1),
          scheduled_date: selectedDateInfo.date,
        });
      } catch (requestError) {
        console.warn('Backend scheduling note:', requestError);
      }
    }

    upsertPreviewClaim({
      ...claim,
      status: 'SCHEDULED',
      schedule: {
        date: selectedDateInfo.full,
        time: slot.label,
        ticketId: `ET-${claim.id}`,
      },
      scheduled_date: selectedDateInfo.date,
      steps: claim.steps?.map((step) =>
        step.key === 'SCHEDULED'
          ? { ...step, time: scheduledTime, complete: true }
          : step,
      ),
    });

    navigate(
      `${paths.profile}?tab=claims&claimId=${encodeURIComponent(claim.id)}&scheduled=1`,
    );
  }

  return (
    <main className="scheduling-page">
      <header className="scheduling-header">
        <Link
          className="scheduling-back"
          to={paths.profile}
          aria-label="Kembali ke profil"
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </Link>
        <h1>Pilih Slot Pengambilan</h1>
      </header>

      {!canSchedule ? (
        <section className="scheduling-unavailable" role="status">
          <p>
            {claim
              ? 'Jadwal hanya dapat dipilih setelah klaim disetujui.'
              : 'Klaim yang disetujui tidak ditemukan. Buka profil untuk memilih klaim yang tersedia.'}
          </p>
          <Link to={`${paths.profile}?tab=claims`}>Kembali ke profil</Link>
        </section>
      ) : (
        <form className="scheduling-content" onSubmit={confirmSchedule}>
          <div className="scheduling-approval" role="status">
            Klaim disetujui. Pilih jadwal pengambilan.
          </div>

          <section className="scheduling-section" aria-labelledby="date-title">
            <h2 id="date-title">Pilih tanggal pengambilan</h2>
            <div
              className="scheduling-date-list"
              role="radiogroup"
              aria-label="Pilih tanggal"
            >
              {dates.map((date) => (
                <label
                  className={`scheduling-date${selectedDate === date.id ? ' is-selected' : ''}`}
                  key={date.id}
                >
                  <input
                    type="radio"
                    name="schedule-date"
                    value={date.id}
                    checked={selectedDate === date.id}
                    onChange={() => setSelectedDate(date.id)}
                  />
                  <span>{date.weekday}</span>
                  <strong>{date.date.slice(-2)}</strong>
                </label>
              ))}
            </div>
          </section>

          <section className="scheduling-section" aria-labelledby="slot-title">
            <h2 id="slot-title">
              Slot tersedia - {selectedDateInfo?.full ?? 'Pilih tanggal'}
            </h2>
            <div
              className="scheduling-slot-list"
              role="radiogroup"
              aria-label="Pilih slot waktu"
            >
              {slots.map((slot) => (
                <label
                  className={`scheduling-slot${selectedSlot === slot.id ? ' is-selected' : ''}${slot.available ? '' : ' is-full'}`}
                  key={slot.id}
                >
                  <input
                    type="radio"
                    name="schedule-slot"
                    value={slot.id}
                    checked={selectedSlot === slot.id}
                    disabled={!slot.available}
                    onChange={() => setSelectedSlot(slot.id)}
                  />
                  <span className="scheduling-radio" aria-hidden="true" />
                  <strong>{slot.label}</strong>
                  {!slot.available && (
                    <span className="scheduling-full-badge">Penuh</span>
                  )}
                </label>
              ))}
            </div>
          </section>

          <button
            className="scheduling-confirm"
            type="submit"
            disabled={
              !selectedDateInfo ||
              !slots.find((slot) => slot.id === selectedSlot)?.available
            }
          >
            Konfirmasi Jadwal
          </button>
          {error && <p role="alert">{error}</p>}
          <p className="scheduling-footnote">
            Status klaim otomatis menjadi TERJADWAL. Kendala? Hubungi Admin BEM
            via WhatsApp (opsional).
          </p>
          <p className="scheduling-preview-note">
            {isLive
              ? 'Jadwal tersimpan di sistem; kuota dan tiket QR terhubung ke backend.'
              : 'Jadwal ini disimpan sebagai preview lokal; kuota dan tiket QR belum terhubung ke backend.'}
          </p>
        </form>
      )}
    </main>
  );
}
