import { useEffect, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { getAuditEvents } from '../api/auditApi.js';

function formatDate(value) {
  return value ? new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value)) : '-';
}

export function AuditPage() {
  const [filters, setFilters] = useState({ actor: '', eventType: '', dateFrom: '', dateTo: '' });
  const [draft, setDraft] = useState(filters);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getAuditEvents(filters)
      .then((response) => active && setEvents(response.data ?? []))
      .catch((requestError) => active && setError(requestError.response?.data?.message || 'Audit tidak dapat dimuat.'));
    return () => { active = false; };
  }, [filters]);

  function applyFilters(event) {
    event.preventDefault();
    setFilters(draft);
    setFiltersOpen(false);
  }

  return (
    <div className="admin-page audit-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Aktivitas administrator</p>
          <h1>Audit Trail</h1>
          <p className="admin-page-description">Telusuri aktivitas sistem dari database audit.</p>
        </div>
      </header>
      <button className="audit-filter-toggle" type="button" onClick={() => setFiltersOpen((open) => !open)}>
        <Filter size={18} aria-hidden="true" /> Filter Data
      </button>
      <form className={`admin-panel audit-filter-form${filtersOpen ? ' is-open' : ''}`} onSubmit={applyFilters}>
        <label className="admin-field"><span>Aktor</span><span className="admin-input-with-icon"><Search size={17} aria-hidden="true" /><input value={draft.actor} onChange={(event) => setDraft({ ...draft, actor: event.target.value })} /></span></label>
        <label className="admin-field"><span>Peristiwa</span><input value={draft.eventType} onChange={(event) => setDraft({ ...draft, eventType: event.target.value })} placeholder="LOGIN" /></label>
        <label className="admin-field"><span>Dari tanggal</span><input type="date" value={draft.dateFrom} onChange={(event) => setDraft({ ...draft, dateFrom: event.target.value })} /></label>
        <label className="admin-field"><span>Sampai tanggal</span><input type="date" value={draft.dateTo} onChange={(event) => setDraft({ ...draft, dateTo: event.target.value })} /></label>
        <button className="button button-primary audit-apply-button" type="submit">Terapkan</button>
      </form>
      <section className="admin-panel audit-results">
        <div className="admin-panel-heading"><div><h2>Riwayat Aktivitas</h2><p>{events.length} peristiwa ditemukan</p></div></div>
        {error && <p className="admin-empty-note" role="alert">{error}</p>}
        <div className="admin-table-wrap audit-table-wrap">
          <table className="admin-table audit-table">
            <thead><tr><th>Waktu</th><th>Actor ID</th><th>Peristiwa</th><th>IP Address</th><th>Detail</th></tr></thead>
            <tbody>{events.map((event) => (
              <tr key={String(event._id || `${event.timestamp}-${event.action}`)}>
                <td data-label="Waktu">{formatDate(event.timestamp)}</td>
                <td data-label="Actor ID">{event.actor?.id ?? '-'}</td>
                <td data-label="Peristiwa"><span className="audit-event-pill">{event.action}</span></td>
                <td data-label="IP Address">{event.metadata?.ip_address ?? '-'}</td>
                <td data-label="Detail">{event.target?.details ?? '-'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        {!error && events.length === 0 && <p className="admin-empty-note">Tidak ada peristiwa.</p>}
      </section>
    </div>
  );
}
