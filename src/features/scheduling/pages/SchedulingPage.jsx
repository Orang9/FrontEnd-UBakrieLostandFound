import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { claimHistory } from '../../profile/index.js';
import {
  getStoredClaims,
  upsertPreviewClaim,
} from '../../../lib/claimStorage.js';
import { paths } from '../../../app/router/paths.js';

const dates = [
  { id: '12', weekday: 'Sen', heading: 'Senin, 12 Okt' },
  { id: '13', weekday: 'Sel', heading: 'Selasa, 13 Okt' },
  { id: '14', weekday: 'Rab', heading: 'Rabu, 14 Okt' },
  { id: '15', weekday: 'Kam', heading: 'Kamis, 15 Okt' },
  { id: '16', weekday: 'Jum', heading: 'Jumat, 16 Okt' },
];

const slots = [
  { id: '09-10', label: '09.00 - 10.00', available: true },
  { id: '10-11', label: '10.00 - 11.00', available: false },
  { id: '11-12', label: '11.00 - 12.00', available: true },
  { id: '13-14', label: '13.00 - 14.00', available: true },
  { id: '14-15', label: '14.00 - 15.00', available: true },
];

function findClaim(claimId) {
  const storedClaim = getStoredClaims().find((claim) => claim.id === claimId);
  return storedClaim ?? claimHistory.find((claim) => claim.id === claimId);
}

export function SchedulingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const claimId = searchParams.get('claimId');
  const claim = claimId ? findClaim(claimId) : null;
  const [selectedDate, setSelectedDate] = useState('14');
  const [selectedSlot, setSelectedSlot] = useState('11-12');
  const selectedDateInfo = dates.find((date) => date.id === selectedDate);
  const canSchedule = claim?.status === 'APPROVED';

  function confirmSchedule(event) {
    event.preventDefault();
    const slot = slots.find((option) => option.id === selectedSlot);
    if (!canSchedule || !slot?.available || !selectedDateInfo) return;

    const scheduledTime = `${selectedDateInfo.heading}, 2026 • ${slot.label}`;
    upsertPreviewClaim({
      ...claim,
      status: 'SCHEDULED',
      schedule: {
        date: `${selectedDateInfo.heading}, 2026`,
        time: slot.label,
        ticketId: `ET-${claim.id}`,
      },
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
            <h2 id="date-title">Oktober 2026</h2>
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
                  <strong>{date.id}</strong>
                </label>
              ))}
            </div>
          </section>

          <section className="scheduling-section" aria-labelledby="slot-title">
            <h2 id="slot-title">Slot tersedia - {selectedDateInfo.heading}</h2>
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
              !slots.find((slot) => slot.id === selectedSlot)?.available
            }
          >
            Konfirmasi Jadwal
          </button>
          <p className="scheduling-footnote">
            Status klaim otomatis menjadi TERJADWAL. Kendala? Hubungi Admin BEM
            via WhatsApp (opsional).
          </p>
          <p className="scheduling-preview-note">
            Jadwal ini disimpan sebagai preview lokal; kuota dan tiket QR belum
            terhubung ke backend.
          </p>
        </form>
      )}
    </main>
  );
}
