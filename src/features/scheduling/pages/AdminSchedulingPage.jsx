import { useEffect, useState } from 'react';
import { useToast } from '../../../app/providers/ToastProvider.jsx';
import { createAdminSlot, getAdminSlots, updateAdminSlot } from '../api/schedulingApi.js';

const dates = [
  { id: '12', weekday: 'Sen', full: 'Senin, 12 Okt' },
  { id: '13', weekday: 'Sel', full: 'Selasa, 13 Okt' },
  { id: '14', weekday: 'Rab', full: 'Rabu, 14 Okt' },
  { id: '15', weekday: 'Kam', full: 'Kamis, 15 Okt' },
  { id: '16', weekday: 'Jum', full: 'Jumat, 16 Okt' },
];

function statusTone(status) {
  if (status === 'Penuh') return 'tone-muted';
  if (status === 'Terjadwal') return 'tone-info';
  if (status === 'Ditutup') return 'tone-danger';
  return 'tone-success';
}

export function AdminSchedulingPage() {
  const [selectedDate, setSelectedDate] = useState('14');
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('schedule');
  const [newSlot, setNewSlot] = useState({
    date: '2026-10-14',
    start: '09:00',
    end: '10:00',
  });
  const { notify } = useToast();
  const selectedDateInfo = dates.find((date) => date.id === selectedDate);
  const visibleSlots = slots.filter((slot) => slot.date === selectedDate);

  async function loadSlots() {
    try {
      const response = await getAdminSlots();
      setSlots((response.data || []).map((slot) => ({
        id: slot.slot_id,
        date: String(slot.slot_date || '').slice(-2),
        time: `${String(slot.start_time).slice(0, 5).replace(':', '.')} - ${String(slot.end_time).slice(0, 5).replace(':', '.')}`,
        status: slot.is_active ? (slot.booked_count >= slot.max_quota ? 'Penuh' : 'Tersedia') : 'Ditutup',
        applicant: slot.claimant_name || '-',
        isActive: Boolean(slot.is_active),
      })));
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Slot tidak dapat dimuat.');
    }
  }

  useEffect(() => { loadSlots(); }, []);

  function addSlot(event) {
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
    createAdminSlot({ date: newSlot.date, start_time: newSlot.start, end_time: newSlot.end })
      .then(() => {
        setSelectedDate(dateId);
        setActiveView('schedule');
        notify('Slot berhasil ditambahkan.', 'success');
        return loadSlots();
      })
      .catch((requestError) => notify(requestError.response?.data?.message || 'Slot gagal ditambahkan.', 'error'));
  }

  function toggleSlot(slot) {
    if (slot.status === 'Terjadwal') {
      notify('Slot terjadwal tidak dapat ditutup pada preview.', 'info');
      return;
    }
    updateAdminSlot(slot.id, { is_active: slot.status === 'Ditutup' })
      .then(() => loadSlots())
      .catch((requestError) => notify(requestError.response?.data?.message || 'Status slot gagal diubah.', 'error'));
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
        <span className="admin-preview-label">Data database</span>
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

          {error ? <p className="admin-empty-note" role="alert">{error}</p> : visibleSlots.length ? (
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
            Perubahan slot hanya disimpan sementara di halaman ini.
          </p>
        </section>
      </div>
    </div>
  );
}
