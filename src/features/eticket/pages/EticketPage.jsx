import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  getTicket,
} from '../api/eticketApi.js';
import { paths } from '../../../app/router/paths.js';
import { formatShortDate } from '../../../lib/format.js';

const QR_VALIDITY_MS = 30 * 60 * 1000;

function formatCountdown(milliseconds) {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function EticketPage() {
  const { ticketId } = useParams();
  const [claim, setClaim] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [ticketError, setTicketError] = useState('');
  const [ticketReady, setTicketReady] = useState(false);

  useEffect(() => {
    getTicket(ticketId).then((ticket) => {
      const qr = ticket?.qr_token ?? ticket?.qrValue;
      setClaim({
        ...ticket,
        id: ticket?.claim_id ?? ticketId,
        item: ticket?.item ?? { name: ticket?.item_name ?? 'Barang' },
        schedule: {
          ...(ticket?.schedule ?? {}),
          ticketId,
          qrToken: qr,
          qrGeneratedAt: ticket?.issued_at ?? ticket?.issuedAt ?? new Date().toISOString(),
          date: formatShortDate(ticket?.scheduled_date ?? ticket?.schedule?.date),
          time: ticket?.time ?? ticket?.schedule?.time ?? '-',
        },
      });
      setTicketReady(true);
    }).catch((error) => {
      setTicketError(
        error instanceof Error
          ? error.message
          : 'E-Ticket preview gagal dimuat.',
      );
      setTicketReady(true);
    });

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [ticketId]);

  function refreshQr() {
    setTicketError('QR dikelola oleh backend dan tidak dapat diperbarui secara lokal.');
  }

  const expiresAt = claim
    ? Date.parse(claim.schedule.qrGeneratedAt) + QR_VALIDITY_MS
    : 0;
  const remaining = Math.max(0, expiresAt - now);
  const isExpired =
    !claim?.schedule.qrToken || !Number.isFinite(expiresAt) || remaining === 0;

  return (
    <main className="eticket-page">
      <header className="eticket-header">
        <h1>Profil &amp; E-Ticket</h1>
      </header>

      <div className="eticket-content">
        <section className="eticket-profile-card" aria-label="Profil pengguna">
          <div className="eticket-avatar" aria-hidden="true">
            NF
          </div>
          <div>
            <h2>Najwa Naela Fawwaz</h2>
            <p>Mahasiswa - Informatika</p>
          </div>
        </section>

        {ticketError && (
          <p className="eticket-error" role="alert">
            {ticketError}
          </p>
        )}

        {claim ? (
          <section className="eticket-card" aria-labelledby="ticket-title">
            <div className="eticket-heading">
              <span>E-TICKET PENGAMBILAN</span>
              <h2 id="ticket-title">{claim.item.name}</h2>
              <p>Tiket #{ticketId}</p>
            </div>

            <div className="eticket-qr-frame">
              {ticketReady && claim.schedule.qrToken ? (
                <div
                  className={`eticket-qr${isExpired ? ' is-expired' : ''}`}
                  aria-label={
                    isExpired ? 'QR Code telah kedaluwarsa' : 'QR Code aktif'
                  }
                >
                  <QRCodeSVG
                    value={claim.schedule.qrToken}
                    size={208}
                    title={`QR code tiket ${ticketId}`}
                  />
                  {isExpired && (
                    <span className="eticket-expired-overlay">Expired</span>
                  )}
                </div>
              ) : (
                <p className="eticket-qr-loading">
                  {ticketError || 'Menyiapkan QR Code...'}
                </p>
              )}
            </div>

            <p
              className={`eticket-countdown${isExpired ? ' is-expired' : ''}`}
              role="status"
              aria-live="polite"
            >
              {isExpired
                ? 'Expired'
                : `Berlaku ${formatCountdown(remaining)} lagi`}
            </p>

            <div className="eticket-schedule">
              <span>Jadwal Pengambilan</span>
              <strong>
                {claim.schedule.date} - {claim.schedule.time}
              </strong>
            </div>
            <span className="eticket-status">TERJADWAL</span>
            <p className="eticket-note">
              Token QR preview. Tunjukkan ke Admin BEM di Lemari Kaca untuk
              proses validasi.
            </p>
            <button
              className="eticket-refresh"
              type="button"
              onClick={refreshQr}
              disabled={!ticketReady}
            >
              Tampilkan / Perbarui QR Code
            </button>
          </section>
        ) : (
          <section className="eticket-card" role="status">
            <p>
              Tiket tidak ditemukan. Tiket hanya tersedia setelah jadwal
              dikonfirmasi dari profil.
            </p>
          </section>
        )}

        <p className="eticket-preview-note">
          QR dan penghitung waktu ini hanya preview lokal. Pembuatan token
          terenkripsi, validasi satu kali, dan konfirmasi pengambilan memerlukan
          backend.
        </p>
        <Link className="eticket-back-link" to={`${paths.profile}?tab=claims`}>
          Kembali ke profil
        </Link>
      </div>
    </main>
  );
}
