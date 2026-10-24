import { useEffect, useState } from 'react';
import { useToast } from '../../../app/providers/ToastProvider.jsx';
import {
  createAdminSlot,
  getAdminSlots,
  updateAdminSlot,
} from '../api/schedulingApi.js';
import { getAdminClaims } from '../../admin/api/adminApi.js';

const dates = [
  { id: '12', weekday: 'Sen', full: 'Senin, 12 Okt', date: '2026-10-12', day: 'Monday' },
  { id: '13', weekday: 'Sel', full: 'Selasa, 13 Okt', date: '2026-10-13', day: 'Tuesday' },
  { id: '14', weekday: 'Rab', full: 'Rabu, 14 Okt', date: '2026-10-14', day: 'Wednesday' },
  { id: '15', weekday: 'Kam', full: 'Kamis, 15 Okt', date: '2026-10-15', day: 'Thursday' },
  { id: '16', weekday: 'Jum', full: 'Jumat, 16 Okt', date: '2026-10-16', day: 'Friday' },
];

const dayToDateId = {
  Monday: '12',
  Tuesday: '13',
  Wednesday: '14',
  Thursday: '15',
  Friday: '16',
};

const initialSlots = [
  {
    id: 'slot-1',
    date: '14',
    time: '09.00 - 10.00',
    status: 'Tersedia',
    applicant: '-',
  },
  {
    id: 'slot-2',
    date: '14',
    time: '10.00 - 11.00',
    status: 'Penuh',
    applicant: 'Raka Pratama',
  },
  {
    id: 'slot-3',
    date: '14',
    time: '11.00 - 12.00',
    status: 'Terjadwal',
    applicant: 'Najwa Naela Fawwaz',
  },
  {
    id: 'slot-4',
    date: '14',
    time: '13.00 - 14.00',
    status: 'Tersedia',
    applicant: '-',
  },
];

function statusTone(status) {
  if (status === 'Penuh') return 'tone-muted';
  if (status === 'Terjadwal') return 'tone-info';
  if (status === 'Ditutup') return 'tone-danger';
  return 'tone-success';
}

export function AdminSchedulingPage() {
  const [selectedDate, setSelectedDate] = useState('14');
  const [slots, setSlots] = useState(initialSlots);
  const [isLive, setIsLive] = useState(false);
  const [activeView, setActiveView] = useState('schedule');
  const [newSlot, setNewSlot] = useState({
    date: '2026-10-14',
    start: '09:00',
    end: '10:00',
  });
  const { notify } = useToast();
  const selectedDateInfo =
    dates.find((date) => date.id === selectedDate) ?? dates[2];
  const visibleSlots = slots.filter((slot) => slot.date === selectedDate);

  async function loadSlots() {
    try {
      const [slotsRes, claimsRes] = await Promise.allSettled([
        getAdminSlots(),
        getAdminClaims('all'),
      ]);

      if (slotsRes.status === 'fulfilled' && slotsRes.value?.data) {
        const backendSlots = slotsRes.value.data;
        const backendClaims =
          claimsRes.status === 'fulfilled' && Array.isArray(claimsRes.value?.data)
            ? claimsRes.value.data
            : [];

        // Map claim bookings by slot_id and dateId
        const scheduledMap = new Map();
        for (const claim of backendClaims) {
          if (
            ['scheduled', 'verified', 'claimed'].includes(claim.status) &&
            claim.scheduled_slot_id
          ) {
            const dateStr = claim.scheduled_date
              ? String(claim.scheduled_date).slice(0, 10)
              : '';
            const dateId = dateStr ? dateStr.slice(-2) : '';
            const key = `${claim.scheduled_slot_id}-${dateId}`;
            scheduledMap.set(key, claim.claimer_name || 'Pemohon');
          }
        }

        const mapped = [];
        for (const slot of backendSlots) {
          const startTime = String(slot.start_time || '').slice(0, 5).replace(':', '.');
          const endTime = String(slot.end_time || '').slice(0, 5).replace(':', '.');
          const timeFormatted = `${startTime} - ${endTime}`;
          const isClosed = !slot.is_active;

          if (slot.slot_date) {
            const slotDateStr = String(slot.slot_date).slice(0, 10);
            const dateId = slotDateStr.slice(-2);
            const scheduledApplicant = scheduledMap.get(`${slot.slot_id}-${dateId}`);
            let status = 'Tersedia';
            if (isClosed) status = 'Ditutup';
            else if (scheduledApplicant) status = 'Terjadwal';
            else if (slot.booked_count >= slot.max_quota) status = 'Penuh';

            mapped.push({
              id: String(slot.slot_id),
              rawId: slot.slot_id,
              date: dateId,
              time: timeFormatted,
              status,
              applicant: scheduledApplicant || slot.claimant_name || '-',
              isActive: Boolean(slot.is_active),
            });
          } else if (slot.day_of_week) {
            const dateId = dayToDateId[slot.day_of_week];
            if (dateId) {
              const scheduledApplicant = scheduledMap.get(`${slot.slot_id}-${dateId}`);
              let status = 'Tersedia';
              if (isClosed) status = 'Ditutup';
              else if (scheduledApplicant) status = 'Terjadwal';
              else if (slot.booked_count >= slot.max_quota) status = 'Penuh';

              mapped.push({
                id: `${slot.slot_id}-${dateId}`,
                rawId: slot.slot_id,
                date: dateId,
                time: timeFormatted,
                status,
                applicant: scheduledApplicant || slot.claimant_name || '-',
                isActive: Boolean(slot.is_active),
              });
            }
          }
        }

        if (mapped.length > 0) {
          setSlots(mapped);
          setIsLive(true);
        }
      }
    } catch {
      // Keep initialSlots if loading fails
    }
  }

  useEffect(() => {
    loadSlots();
  }, []);

  async function addSlot(event) {
    event.preventDefault();
    const dateId = newSlot.date.slice(-2);
    if (!dates.some((date) => date.id === dateId)) {
      notify('Tanggal preview harus berada pada 12-16 Oktober 2026.', 'error');
      return;
    }
    if (newSlot.start >= newSlot.end) {
      notify('Jam selesai harus setelah jam mulai.', 'error');
      return;
    }
    if (newSlot.start < '09:00' || newSlot.end > '15:00') {
      notify(
        'Slot harus berada dalam jam operasional 09.00-15.00 WIB.',
        'error',
      );
      return;
    }

    try {
      await createAdminSlot({
        date: newSlot.date,
        start_time: newSlot.start,
        end_time: newSlot.end,
        max_quota: 5,
        location: 'Lemari Kaca Lost & Found',
      });
      setSelectedDate(dateId);
      setActiveView('schedule');
      notify('Slot berhasil ditambahkan.', 'success');
      await loadSlots();
      return;
    } catch (requestError) {
      const msg = requestError.response?.data?.message;
      if (msg) {
        notify(msg, 'error');
        return;
      }
    }

    // Fallback if offline/preview mode
    setSlots((current) => [
      ...current,
      {
        id: `slot-${Date.now()}`,
        date: dateId,
        time: `${newSlot.start.replace(':', '.')} - ${newSlot.end.replace(':', '.')}`,
        status: 'Tersedia',
        applicant: '-',
      },
    ]);
    setSelectedDate(dateId);
    setActiveView('schedule');
    notify('Slot contoh ditambahkan pada tampilan ini.', 'success');
  }

  async function toggleSlot(slot) {
    if (slot.status === 'Terjadwal') {
      notify('Slot terjadwal tidak dapat ditutup pada preview.', 'info');
      return;
    }

    if (slot.rawId) {
      try {
        const nextIsActive = slot.status === 'Ditutup' ? 1 : 0;
        await updateAdminSlot(slot.rawId, { is_active: nextIsActive });
        notify(
          `Slot berhasil ${nextIsActive ? 'dibuka' : 'ditutup'}.`,
          'success',
        );
        await loadSlots();
        return;
      } catch (requestError) {
        notify(
          requestError.response?.data?.message || 'Status slot gagal diubah.',
          'error',
        );
        return;
      }
    }

    // Fallback local update
    setSlots((current) =>
      current.map((item) =>
        item.id === slot.id
          ? {
              ...item,
              status: item.status === 'Ditutup' ? 'Tersedia' : 'Ditutup',
            }
          : item,
      ),
    );
  }

  function moveSlot(slot) {
    notify(
      `Pemindahan jadwal ${slot.time} belum terhubung ke backend.`,
      'info',
    );
  }

  return (
    <div className="admin-page admin-scheduling-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Pengaturan jadwal</p>
          <h1>Kelola Slot Pengambilan</h1>
          <p className="admin-page-description">
            Atur ketersediaan dan kapasitas jadwal pengambilan barang.
          </p>
        </div>
        <span className="admin-preview-label">
          {isLive ? 'Data database' : 'Data contoh'}
        </span>
      </header>

      <div
        className="admin-mobile-tabs"
        role="tablist"
        aria-label="Kelola slot"
      >
        <button
          className={activeView === 'schedule' ? 'is-active' : ''}
          type="button"
          role="tab"
          aria-selected={activeView === 'schedule'}
          onClick={() => setActiveView('schedule')}
        >
          Jadwal Slot
        </button>
        <button
          className={activeView === 'add' ? 'is-active' : ''}
          type="button"
          role="tab"
          aria-selected={activeView === 'add'}
          onClick={() => setActiveView('add')}
        >
          + Tambah Slot
        </button>
      </div>

      <div className="admin-scheduling-workspace">
        <section
          className={`admin-panel admin-slot-list-panel${activeView === 'schedule' ? ' is-mobile-active' : ''}`}
          aria-labelledby="admin-slot-list-title"
        >
          <div className="admin-panel-heading">
            <div>
              <h2 id="admin-slot-list-title">Jadwal Slot</h2>
              <p>{selectedDateInfo.full}, 2026</p>
            </div>
          </div>
          <div
            className="admin-date-picker"
            role="radiogroup"
            aria-label="Pilih tanggal jadwal"
          >
            {dates.map((date) => (
              <label
                className={`admin-date-option${selectedDate === date.id ? ' is-selected' : ''}`}
                key={date.id}
              >
                <input
                  type="radio"
                  name="admin-date"
                  value={date.id}
                  checked={selectedDate === date.id}
                  onChange={() => setSelectedDate(date.id)}
                />
                <span>{date.weekday}</span>
                <strong>{date.id}</strong>
              </label>
            ))}
          </div>

          {visibleSlots.length ? (
            <>
              <div className="admin-table-wrap admin-slot-table-wrap">
                <table className="admin-table admin-slot-table">
                  <thead>
                    <tr>
                      <th scope="col">Jam Slot</th>
                      <th scope="col">Status</th>
                      <th scope="col">Pemohon</th>
                      <th scope="col">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSlots.map((slot) => (
                      <tr key={slot.id}>
                        <td data-label="Jam Slot">{slot.time}</td>
                        <td data-label="Status">
                          <span
                            className={`admin-status-pill ${statusTone(slot.status)}`}
                          >
                            {slot.status}
                          </span>
                        </td>
                        <td data-label="Pemohon">{slot.applicant}</td>
                        <td data-label="Aksi">
                          <div className="admin-slot-actions">
                            <button
                              className="admin-text-action"
                              type="button"
                              onClick={() => toggleSlot(slot)}
                              disabled={slot.status === 'Terjadwal'}
                            >
                              {slot.status === 'Ditutup' ? 'Buka' : 'Tutup'}
                            </button>
                            {slot.status === 'Terjadwal' && (
                              <button
                                className="admin-text-action"
                                type="button"
                                onClick={() => moveSlot(slot)}
                              >
                                Pindahkan
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-slot-cards">
                {visibleSlots.map((slot) => (
                  <article className="admin-slot-card" key={slot.id}>
                    <div className="admin-slot-card-heading">
                      <strong>{slot.time}</strong>
                      <span
                        className={`admin-status-pill ${statusTone(slot.status)}`}
                      >
                        {slot.status}
                      </span>
                    </div>
                    <p>Pemohon: {slot.applicant}</p>
                    <div className="admin-slot-actions">
                      <button
                        className="admin-text-action"
                        type="button"
                        onClick={() => toggleSlot(slot)}
                        disabled={slot.status === 'Terjadwal'}
                      >
                        {slot.status === 'Ditutup' ? 'Buka Slot' : 'Tutup Slot'}
                      </button>
                      {slot.status === 'Terjadwal' && (
                        <button
                          className="admin-text-action"
                          type="button"
                          onClick={() => moveSlot(slot)}
                        >
                          Pindahkan
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <p className="admin-empty-note">
              Belum ada slot untuk tanggal ini.
            </p>
          )}
        </section>

        <section
          className={`admin-panel admin-add-slot-panel${activeView === 'add' ? ' is-mobile-active' : ''}`}
          aria-labelledby="admin-add-slot-title"
        >
          <div className="admin-panel-heading">
            <div>
              <h2 id="admin-add-slot-title">Tambah Slot</h2>
              <p>Buat jadwal pengambilan baru</p>
            </div>
          </div>
          <form className="admin-form" onSubmit={addSlot}>
            <label className="admin-field">
              <span>Tanggal</span>
              <input
                type="date"
                value={newSlot.date}
                onChange={(event) =>
                  setNewSlot((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
                required
              />
            </label>
            <div className="admin-form-row">
              <label className="admin-field">
                <span>Jam mulai</span>
                <input
                  type="time"
                  value={newSlot.start}
                  onChange={(event) =>
                    setNewSlot((current) => ({
                      ...current,
                      start: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label className="admin-field">
                <span>Jam selesai</span>
                <input
                  type="time"
                  value={newSlot.end}
                  onChange={(event) =>
                    setNewSlot((current) => ({
                      ...current,
                      end: event.target.value,
                    }))
                  }
                  required
                />
              </label>
            </div>
            <button className="button button-primary" type="submit">
              Tambah Slot
            </button>
          </form>
          <aside className="admin-hours-note">
            <strong>Jam operasional</strong>
            <p>Senin - Jumat, 09.00 - 15.00 WIB</p>
          </aside>
          <p className="admin-data-note">
            {isLive
              ? 'Perubahan slot disimpan ke database.'
              : 'Perubahan slot hanya disimpan sementara di halaman ini.'}
          </p>
        </section>
      </div>
    </div>
  );
}
