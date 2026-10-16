import { useEffect, useState } from 'react';
import { getAuditEvents } from '../api/auditApi.js';

export function AuditPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    getAuditEvents()
      .then((response) => {
        if (isCurrent) setEvents(response.data ?? []);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(
            requestError.response?.data?.message || 'Audit trail gagal dimuat.',
          );
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <section className="admin-page">
      <h1>Audit Trail</h1>
      <p>Riwayat aktivitas yang dicatat oleh backend.</p>
      {error && <p role="alert">{error}</p>}
      {loading ? (
        <p role="status">Memuat aktivitas...</p>
      ) : events.length ? (
        <div className="audit-event-list">
          {events.map((event) => (
            <article className="feature-placeholder" key={event._id}>
              <h2>{event.action}</h2>
              <p>
                {event.actor?.name} ({event.actor?.role}) ·{' '}
                {new Date(event.timestamp).toLocaleString('id-ID')}
              </p>
              <p>
                {event.target?.entity} #{event.target?.entityId} ·{' '}
                {event.target?.details}
              </p>
              {event.ip && <small>IP: {event.ip}</small>}
            </article>
          ))}
        </div>
      ) : (
        <p>Belum ada aktivitas yang tercatat.</p>
      )}
    </section>
  );
}
