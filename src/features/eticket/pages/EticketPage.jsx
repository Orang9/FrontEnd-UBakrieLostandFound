import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../../app/providers/AuthProvider.jsx';
import { getTicket } from '../api/eticketApi.js';
import { paths } from '../../../app/router/paths.js';

function formatCountdown(milliseconds) {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatDate(value) {
  if (!value) return 'Jadwal tercatat di profil';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
}

export function EticketPage() {
  const { ticketId: claimId } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadTicket = useCallback(async () => {
    setRefreshing(true);
    setError('');
    try {
      const response = await getTicket(claimId);
      setTicket({
        ...response.data,
        deadline:
          Date.now() + Number(response.data.time_to_live_seconds) * 1000,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'E-Ticket gagal dimuat. Silakan coba kembali.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [claimId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const expiresAt = ticket?.deadline ?? 0;
  const remaining = Math.max(0, expiresAt - now);
  const isExpired =
    !ticket?.qr_token || !Number.isFinite(expiresAt) || remaining === 0;

  return (
    <main className="eticket-page">
      <header className="eticket-header">
        <h1>Profil &amp; E-Ticket</h1>
      </header>

      <div className="eticket-content">
        <section className="eticket-profile-card" aria-label="Profil pengguna">
          <div className="eticket-avatar" aria-hidden="true">
            {(user?.name || 'UB').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2>{user?.name || 'Pengguna'}</h2>
            <p>{user?.email || user?.role}</p>
          </div>
        </section>

        {error && (
          <p className="eticket-error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <section className="eticket-card" role="status">
            Menyiapkan E-Ticket...
          </section>
        ) : ticket ? (
          <section className="eticket-card" aria-labelledby="ticket-title">
            <div className="eticket-heading">
              <span>E-TICKET PENGAMBILAN</span>
              <h2 id="ticket-title">Klaim #{claimId}</h2>
            </div>
            <div className="eticket-qr-frame">
              <div
                className={`eticket-qr${isExpired ? ' is-expired' : ''}`}
                aria-label={
                  isExpired ? 'QR Code telah kedaluwarsa' : 'QR Code aktif'
                }
              >
                <QRCodeSVG
                  value={ticket.qr_token}
                  size={208}
                  title={`QR code klaim ${claimId}`}
                />
                {isExpired && (
                  <span className="eticket-expired-overlay">Expired</span>
                )}
              </div>
            </div>
            <p
              className={`eticket-countdown${isExpired ? ' is-expired' : ''}`}
              role="status"
              aria-live="polite"
            >
              {isExpired
                ? 'Token QR kedaluwarsa'
                : `Berlaku ${formatCountdown(remaining)} lagi`}
            </p>
            <div className="eticket-schedule">
              <span>Masa berlaku hingga</span>
              <strong>{formatDate(ticket.expires_at)}</strong>
            </div>
            <span className="eticket-status">TERVERIFIKASI</span>
            <p className="eticket-note">
              Tunjukkan kode ini kepada petugas Satpam untuk menyelesaikan
              serah-terima barang.
            </p>
            <button
              className="eticket-refresh"
              type="button"
              onClick={loadTicket}
              disabled={refreshing}
            >
              {refreshing ? 'Memuat...' : 'Tampilkan / Perbarui QR Code'}
            </button>
          </section>
        ) : (
          <section className="eticket-card" role="status">
            Tiket tidak tersedia. QR hanya dapat dibuat untuk klaim yang
            terverifikasi atau terjadwal.
          </section>
        )}
        <Link className="eticket-back-link" to={`${paths.profile}?tab=claims`}>
          Kembali ke profil
        </Link>
      </div>
    </main>
  );
}
