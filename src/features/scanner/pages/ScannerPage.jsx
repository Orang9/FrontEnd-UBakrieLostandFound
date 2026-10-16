import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Flashlight,
  ScanLine,
} from 'lucide-react';
import { validateTicket } from '../api/scannerApi.js';
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

export function ScannerPage() {
  const [screen, setScreen] = useState('scan');
  const [scanAttempt, setScanAttempt] = useState(0);
  const [manualToken, setManualToken] = useState('');
  const [validation, setValidation] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [flashSupported, setFlashSupported] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [handoverComplete, setHandoverComplete] = useState(false);
  const scannerRef = useRef(null);
  const screenRef = useRef(screen);
  const processTokenRef = useRef(null);

  screenRef.current = screen;

  const processToken = useCallback(async (rawToken) => {
    if (screenRef.current !== 'scan') return;
    screenRef.current = 'processing';
    setManualToken('');
    try {
      const response = await validateTicket(rawToken);
      const result = { valid: true, message: response.message };
      setValidation(result);
      setHandoverComplete(true);
      screenRef.current = 'valid';
      setScreen('valid');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Token tidak valid atau server tidak dapat dihubungi.';
      const reason = /expired/i.test(message)
        ? 'EXPIRED'
        : /already been claimed|already claimed|used/i.test(message)
          ? 'USED'
          : 'INVALID';
      setValidation({ valid: false, reason, message });
      screenRef.current = 'failure';
      setScreen('failure');
    }
  }, []);

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
    setHandoverComplete(false);
  }

  if (screen === 'valid' && validation?.valid) {
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
              <h2>SERAH-TERIMA SELESAI</h2>
              <p>
                {validation.message ||
                  'Barang telah diserahkan dan status klaim menjadi CLAIMED.'}
              </p>
            </div>
          </section>
          <p className="scanner-identity-notice">
            Backend telah memvalidasi token dan mencatat serah-terima secara
            atomik.
          </p>
          <button
            className="scanner-primary-action"
            type="button"
            onClick={scanAgain}
          >
            Scan E-Ticket Berikutnya
          </button>
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
          {validation.message && (
            <p className="scanner-failure-claim">{validation.message}</p>
          )}
          <button
            className="scanner-retry-action"
            type="button"
            onClick={scanAgain}
          >
            Scan Ulang
          </button>
          <p className="scanner-audit-note">
            Semua validasi yang diproses dicatat oleh backend.
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
    </main>
  );
}
