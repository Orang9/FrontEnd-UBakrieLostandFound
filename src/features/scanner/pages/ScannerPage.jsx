import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Flashlight,
  ScanLine,
} from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider.jsx';
import {
  confirmPreviewHandover,
  recordPreviewAudit,
  validatePreviewTicket,
} from '../lib/previewTicketValidation.js';
import { createScanner } from '../components/ScannerAdapter.jsx';

const scannerConfig = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1,
};

const failureCopy = {
  EXPIRED: {
    title: 'QR Code Kedaluwarsa',
    description:
      'Token melewati batas TTL. Verifikasi ulang identitas pemohon sebelum pemohon memperbarui tokennya.',
  },
  USED: {
    title: 'Token Sudah Pernah Dipakai',
    description: 'Transaksi ditolak karena token ini sudah digunakan.',
  },
  DUPLICATE: {
    title: 'Klaim Ganda',
    description:
      'Transaksi ditolak karena ada klaim aktif lain untuk barang ini.',
  },
  INVALID: {
    title: 'QR Code Tidak Valid',
    description: 'Token tidak dikenal atau formatnya tidak sesuai.',
  },
};

function ClaimSummary({ claim, handoverComplete }) {
  const details = [
    ['Barang', claim.item.name],
    ['Pemohon', 'Najwa Naela Fawwaz'],
    [
      'Kategori',
      `${claim.item.category ?? 'Umum'} (sudah diverifikasi manual)`,
    ],
    [
      'Slot',
      `${claim.schedule.date.replace(', 2026', '')} - ${claim.schedule.time}`,
    ],
    [
      'Status klaim',
      handoverComplete
        ? 'APPROVED > TERJADWAL > CLAIMED'
        : 'APPROVED > TERJADWAL',
    ],
  ];

  return (
    <dl className="scanner-summary">
      {details.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ScannerPage() {
  const { user } = useAuth();
  const [screen, setScreen] = useState('scan');
  const [scanAttempt, setScanAttempt] = useState(0);
  const [manualToken, setManualToken] = useState('');
  const [validation, setValidation] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [flashSupported, setFlashSupported] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [actionError, setActionError] = useState('');
  const [handoverComplete, setHandoverComplete] = useState(false);
  const scannerRef = useRef(null);
  const screenRef = useRef(screen);
  const processTokenRef = useRef(null);

  screenRef.current = screen;

  const processToken = useCallback(
    (rawToken) => {
      if (screenRef.current !== 'scan') return;
      const result = validatePreviewTicket(rawToken);
      screenRef.current = result.valid ? 'valid' : 'failure';
      setValidation(result);
      setScreen(result.valid ? 'valid' : 'failure');
      setManualToken('');
      setActionError('');

      try {
        recordPreviewAudit(
          `TICKET_VALIDATION_${result.reason}`,
          user?.id ?? user?.email ?? 'ADMIN_BEM_PREVIEW',
          result.claim?.id,
        );
      } catch (error) {
        setActionError(
          error instanceof Error
            ? `Hasil scan diperoleh, tetapi audit preview gagal disimpan: ${error.message}`
            : 'Hasil scan diperoleh, tetapi audit preview gagal disimpan.',
        );
      }
    },
    [user],
  );

  processTokenRef.current = processToken;

  useEffect(() => {
    if (screen !== 'scan') return undefined;

    let disposed = false;
    let scanner;
    setCameraError('');
    setCameraReady(false);
    setFlashOn(false);
    setFlashSupported(false);

    async function startScanner() {
      try {
        scanner = await createScanner('admin-qr-reader');
        if (disposed) return;
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          scannerConfig,
          (decodedText) => processTokenRef.current?.(decodedText),
          () => {},
        );
        if (disposed) {
          if (scanner.isScanning) await scanner.stop();
          return;
        }
        setCameraReady(true);
        try {
          setFlashSupported(
            Boolean(scanner.getRunningTrackCapabilities().torch),
          );
        } catch (error) {
          setCameraError(
            error instanceof Error
              ? `Status flash tidak dapat dibaca: ${error.message}`
              : 'Status flash tidak dapat dibaca dari kamera.',
          );
        }
      } catch (error) {
        if (disposed) return;
        setCameraError(
          error instanceof Error
            ? `Kamera tidak dapat dibuka: ${error.message}`
            : 'Kamera tidak dapat dibuka. Gunakan input token manual.',
        );
      }
    }

    startScanner();

    return () => {
      disposed = true;
      scannerRef.current = null;
      if (scanner?.isScanning) {
        scanner.stop().catch((error) => {
          console.error('Could not stop the QR scanner.', error);
        });
      }
    };
  }, [screen, scanAttempt]);

  async function toggleFlash() {
    const scanner = scannerRef.current;
    if (!scanner || !flashSupported || !cameraReady) return;

    try {
      await scanner.applyVideoConstraints({
        advanced: [{ torch: !flashOn }],
      });
      setFlashOn((current) => !current);
      setCameraError('');
    } catch (error) {
      setCameraError(
        error instanceof Error
          ? `Flash kamera gagal diperbarui: ${error.message}`
          : 'Flash kamera gagal diperbarui.',
      );
    }
  }

  function submitManualToken(event) {
    event.preventDefault();
    processToken(manualToken);
  }

  function scanAgain() {
    screenRef.current = 'scan';
    setScreen('scan');
    setScanAttempt((attempt) => attempt + 1);
    setValidation(null);
    setManualToken('');
    setActionError('');
    setHandoverComplete(false);
  }

  function confirmHandover() {
    if (!validation?.valid || handoverComplete) return;
    try {
      const result = confirmPreviewHandover(
        validation,
        user?.id ?? user?.email ?? 'ADMIN_BEM_PREVIEW',
      );
      if (!result.valid) {
        setValidation(result);
        screenRef.current = 'failure';
        setScreen('failure');
        return;
      }
      setValidation(result);
      setHandoverComplete(true);
      setActionError(
        result.auditError
          ? `Serah-terima tersimpan, tetapi audit preview gagal: ${result.auditError}`
          : '',
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? `Serah-terima preview gagal disimpan: ${error.message}`
          : 'Serah-terima preview gagal disimpan.',
      );
    }
  }

  if (screen === 'valid' && validation?.claim) {
    return (
      <main className="scanner-page scanner-result-page">
        <header className="scanner-header">
          <button
            className="scanner-back"
            onClick={scanAgain}
            type="button"
            aria-label="Kembali ke scanner"
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </button>
          <div>
            <h1>Hasil Validasi</h1>
            <p>Admin BEM</p>
          </div>
        </header>
        <div className="scanner-result-content">
          <section
            className={`scanner-valid-banner${handoverComplete ? ' is-complete' : ''}`}
            role="status"
          >
            <span className="scanner-valid-icon" aria-hidden="true">
              <Check size={22} />
            </span>
            <div>
              <h2>
                {handoverComplete ? 'SERAH-TERIMA SELESAI' : 'VALID / MATCH'}
              </h2>
              <p>
                {handoverComplete
                  ? 'Barang telah diserahkan dan status klaim menjadi CLAIMED.'
                  : 'Token sah, TTL belum habis.'}
              </p>
            </div>
          </section>

          <section
            className="scanner-result-card"
            aria-labelledby="claim-summary-title"
          >
            <h2 id="claim-summary-title">
              Ringkasan Klaim #{validation.claim.id}
            </h2>
            <ClaimSummary
              claim={validation.claim}
              handoverComplete={handoverComplete}
            />
          </section>

          {!handoverComplete && (
            <aside className="scanner-identity-notice">
              Cocokkan identitas pemohon sebelum menyerahkan barang.
            </aside>
          )}
          {actionError && (
            <p className="scanner-action-error" role="alert">
              {actionError}
            </p>
          )}
          {handoverComplete ? (
            <button
              className="scanner-primary-action"
              type="button"
              onClick={scanAgain}
            >
              Scan E-Ticket Berikutnya
            </button>
          ) : (
            <div className="scanner-result-actions">
              <button
                className="scanner-primary-action"
                type="button"
                onClick={confirmHandover}
              >
                Konfirmasi Serah-Terima
              </button>
              <button
                className="scanner-secondary-action"
                type="button"
                onClick={scanAgain}
              >
                Batalkan
              </button>
              <p>
                Status preview menjadi CLAIMED setelah konfirmasi. Pengiriman
                email bukti memerlukan integrasi backend.
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  if (screen === 'failure' && validation) {
    const copy = failureCopy[validation.reason] ?? failureCopy.INVALID;
    const wasUsed = validation.reason === 'USED';
    return (
      <main className="scanner-page scanner-failure-page">
        <header className="scanner-header">
          <div className="scanner-header-icon">
            <ScanLine size={22} aria-hidden="true" />
          </div>
          <div>
            <h1>Scan E-Ticket</h1>
            <p>Admin BEM</p>
          </div>
        </header>
        <div className="scanner-failure-content">
          <section className="scanner-failure-banner" role="alert">
            <span className="scanner-failure-icon" aria-hidden="true">
              <AlertCircle size={24} />
            </span>
            <div>
              <h2>{copy.title}</h2>
              <p>{copy.description}</p>
            </div>
          </section>
          <aside
            className={`scanner-failure-info${wasUsed ? ' is-error' : ''}`}
          >
            <p>
              {wasUsed
                ? 'Token sudah pernah dipakai: peringatan merah, transaksi ditolak.'
                : 'Token tidak valid atau klaim ganda akan ditolak sistem.'}
            </p>
          </aside>
          {validation.claim && (
            <p className="scanner-failure-claim">
              Klaim #{validation.claim.id} · {validation.claim.item.name}
            </p>
          )}
          <button
            className="scanner-retry-action"
            type="button"
            onClick={scanAgain}
          >
            Scan Ulang
          </button>
          <p className="scanner-audit-note">
            Seluruh kejadian dicatat di Audit Trail preview (actor_id, jenis
            peristiwa, timestamp). IP aktual hanya dapat dicatat backend.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="scanner-page">
      <header className="scanner-header">
        <div className="scanner-header-icon">
          <ScanLine size={22} aria-hidden="true" />
        </div>
        <div>
          <h1>Scan E-Ticket</h1>
          <p>Admin BEM</p>
        </div>
        <button
          className={`scanner-flash-button${flashOn ? ' is-on' : ''}`}
          type="button"
          onClick={toggleFlash}
          disabled={!flashSupported || !cameraReady}
          aria-pressed={flashOn}
        >
          <Flashlight size={17} aria-hidden="true" />
          Flash
        </button>
      </header>

      <section className="scanner-camera-section" aria-label="Pemindai QR Code">
        <div className="scanner-viewfinder">
          <div id="admin-qr-reader" className="scanner-camera-feed" />
          <span className="scanner-corner scanner-corner-tl" />
          <span className="scanner-corner scanner-corner-tr" />
          <span className="scanner-corner scanner-corner-bl" />
          <span className="scanner-corner scanner-corner-br" />
          <span className="scanner-laser" />
          {!cameraReady && (
            <p className="scanner-camera-placeholder">
              {cameraError || 'Meminta akses kamera...'}
            </p>
          )}
        </div>
        <p className="scanner-instruction">Arahkan kamera ke QR Code pemohon</p>
        {!flashSupported && cameraReady && (
          <p className="scanner-flash-note">
            Flash tidak didukung oleh kamera ini.
          </p>
        )}
      </section>

      <section className="scanner-manual-section">
        <p className="scanner-manual-help">
          Kamera gagal fokus / cahaya kurang?
        </p>
        <form onSubmit={submitManualToken}>
          <label htmlFor="manual-qr-token">Input token manual (fallback)</label>
          <input
            id="manual-qr-token"
            type="text"
            autoComplete="off"
            placeholder="Tempel / ketik token..."
            maxLength={256}
            pattern="[A-Za-z0-9]+"
            value={manualToken}
            onChange={(event) => setManualToken(event.target.value)}
            required
          />
          <button className="scanner-validate-action" type="submit">
            Validasi Token
          </button>
        </form>
      </section>
      <p className="scanner-touch-note">
        Area sentuh min. 44 x 44 px - kontras tinggi outdoor
      </p>
      {actionError && (
        <p className="scanner-action-error scanner-dark-error" role="alert">
          {actionError}
        </p>
      )}
    </main>
  );
}
