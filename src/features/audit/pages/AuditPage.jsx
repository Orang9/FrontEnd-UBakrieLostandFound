import { useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';

const auditEvents = [
  {
    time: '12 Okt 2026, 11.02',
    actor: 'admin-bem',
    event: 'CLAIM_APPROVED',
    ip: '10.20.4.17',
    detail: 'Klaim #CL-0147 menjadi APPROVED',
  },
  {
    time: '12 Okt 2026, 10.45',
    actor: 'admin-bem',
    event: 'CLAIM_REVIEWED',
    ip: '10.20.4.17',
    detail: 'Verifikasi manual klaim #CL-0147 selesai',
  },
  {
    time: '11 Okt 2026, 14.28',
    actor: 'security-desk',
    event: 'ITEM_INTAKED',
    ip: '10.20.4.22',
    detail: 'Barang IT-0241 diterima dari Pos Satpam',
  },
  {
    time: '10 Okt 2026, 09.12',
    actor: 'admin-bem',
    event: 'SLOT_UPDATED',
    ip: '10.20.4.17',
    detail: 'Slot 10.00 - 11.00 ditandai penuh',
  },
  {
    time: '09 Okt 2026, 16.04',
    actor: 'admin-bem',
    event: 'TICKET_VALIDATION_EXPIRED',
    ip: '10.20.4.17',
    detail: 'Token E-Ticket melewati batas TTL',
  },
];

export function AuditPage() {
  const [actor, setActor] = useState('');
  const [eventType, setEventType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    actor: '',
    eventType: '',
    dateFrom: '',
    dateTo: '',
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredEvents = useMemo(
    () =>
      auditEvents.filter((event) => {
        const eventDate = new Date(
          `${event.time.slice(0, 2)} ${event.time.slice(3, 6)} ${event.time.slice(7, 11)}`,
        );
        const actorMatch = event.actor
          .toLocaleLowerCase('id-ID')
          .includes(appliedFilters.actor.toLocaleLowerCase('id-ID'));
        const typeMatch =
          !appliedFilters.eventType || event.event === appliedFilters.eventType;
        const fromMatch =
          !appliedFilters.dateFrom ||
          eventDate >= new Date(appliedFilters.dateFrom);
        const toDate = appliedFilters.dateTo
          ? new Date(`${appliedFilters.dateTo}T23:59:59`)
          : null;
        const toMatch = !toDate || eventDate <= toDate;
        return actorMatch && typeMatch && fromMatch && toMatch;
      }),
    [appliedFilters],
  );

  function applyFilters(event) {
    event.preventDefault();
    setAppliedFilters({ actor, eventType, dateFrom, dateTo });
    setFiltersOpen(false);
  }

  return (
    <div className="admin-page audit-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Aktivitas administrator</p>
          <h1>Audit Trail</h1>
          <p className="admin-page-description">
            Telusuri aktivitas sistem berdasarkan aktor, peristiwa, dan periode.
          </p>
        </div>
        <span className="admin-preview-label">Data contoh</span>
      </header>

      <button
        className="audit-filter-toggle"
        type="button"
        aria-expanded={filtersOpen}
        aria-controls="audit-filter-form"
        onClick={() => setFiltersOpen((open) => !open)}
      >
        <Filter size={18} aria-hidden="true" />
        Filter Data
      </button>

      <form
        className={`admin-panel audit-filter-form${filtersOpen ? ' is-open' : ''}`}
        id="audit-filter-form"
        onSubmit={applyFilters}
      >
        <label className="admin-field audit-actor-field">
          <span>Aktor (actor_id)</span>
          <span className="admin-input-with-icon">
            <Search size={17} aria-hidden="true" />
            <input
              value={actor}
              onChange={(event) => setActor(event.target.value)}
              placeholder="Contoh: admin-bem"
            />
          </span>
        </label>
        <label className="admin-field">
          <span>Peristiwa</span>
          <select
            value={eventType}
            onChange={(event) => setEventType(event.target.value)}
          >
            <option value="">Semua peristiwa</option>
            {[...new Set(auditEvents.map((event) => event.event))].map(
              (event) => (
                <option value={event} key={event}>
                  {event}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="admin-field">
          <span>Dari tanggal</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>Sampai tanggal</span>
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
          />
        </label>
        <button
          className="button button-primary audit-apply-button"
          type="submit"
        >
          Terapkan
        </button>
      </form>

      <section
        className="admin-panel audit-results"
        aria-labelledby="audit-results-title"
      >
        <div className="admin-panel-heading">
          <div>
            <h2 id="audit-results-title">Riwayat Aktivitas</h2>
            <p>{filteredEvents.length} peristiwa ditemukan</p>
          </div>
        </div>
        <div className="admin-table-wrap audit-table-wrap">
          <table className="admin-table audit-table">
            <thead>
              <tr>
                <th scope="col">Waktu</th>
                <th scope="col">Actor ID</th>
                <th scope="col">Peristiwa</th>
                <th scope="col">IP Address</th>
                <th scope="col">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={`${event.time}-${event.event}`}>
                  <td data-label="Waktu">{event.time}</td>
                  <td data-label="Actor ID">{event.actor}</td>
                  <td data-label="Peristiwa">
                    <span className="audit-event-pill">{event.event}</span>
                  </td>
                  <td data-label="IP Address">{event.ip}</td>
                  <td data-label="Detail">{event.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredEvents.length === 0 && (
          <p className="admin-empty-note">
            Tidak ada peristiwa yang sesuai filter.
          </p>
        )}
        <p className="admin-data-note">
          Data audit ini contoh tampilan dan belum berasal dari backend.
        </p>
      </section>
    </div>
  );
}
