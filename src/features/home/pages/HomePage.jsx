import {
  Clock3,
  MapPin,
  MessageCircle,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '../../../app/router/paths.js';
import { useAuth } from '../../../app/providers/AuthProvider.jsx';
import { appInfo } from '../../../config/appInfo.js';
import { Button } from '../../../components/ui/Button.jsx';

const usageSteps = [
  { text: 'Cari barangmu di Katalog', to: paths.catalog },
  { text: 'Ajukan klaim & jawab verifikasi' },
  { text: 'Pilih slot jadwal pengambilan' },
  { text: 'Tunjukkan E-Ticket QR ke Admin BEM' },
];

export function HomePage() {
  const { user } = useAuth();
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Najwa';

  return (
    <div className="home-page">
      <header className="home-hero">
        <div className="home-hero-content">
          <p className="home-greeting">Halo, {firstName}</p>
          <h1>Beranda</h1>
        </div>
      </header>

      <div className="home-content">
        <section
          className="home-quick-actions"
          aria-labelledby="quick-action-title"
        >
          <h2 id="quick-action-title">Kehilangan atau menemukan barang?</h2>
          <div className="home-action-buttons">
            <Link to={`${paths.reportItem}?type=lost`}>
              <Button className="home-action-button">Lapor Hilang</Button>
            </Link>
            <Link to={`${paths.reportItem}?type=found`}>
              <Button className="home-action-button" variant="secondary">
                Lapor Temuan
              </Button>
            </Link>
          </div>
        </section>

        <section className="home-section" aria-labelledby="usage-guide-title">
          <h2 id="usage-guide-title">Panduan Penggunaan</h2>
          <ol className="home-steps">
            {usageSteps.map((step, index) => {
              const content = (
                <>
                  <span className="home-step-number">{index + 1}</span>
                  <span>{step.text}</span>
                </>
              );

              return (
                <li className="home-step" key={step.text}>
                  {step.to ? (
                    <Link className="home-step-link" to={step.to}>
                      {content}
                      <Search
                        className="home-step-icon"
                        size={18}
                        aria-hidden="true"
                      />
                    </Link>
                  ) : (
                    <div className="home-step-content">{content}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <section className="home-info-card" aria-labelledby="storage-title">
          <h2 id="storage-title">{appInfo.storageName}</h2>
          <ul className="home-info-list">
            <li>
              <MapPin size={18} aria-hidden="true" />
              <span>{appInfo.storageLocation}</span>
            </li>
            <li>
              <Clock3 size={18} aria-hidden="true" />
              <span>{appInfo.operatingHours}</span>
            </li>
            <li>
              <MessageCircle size={18} aria-hidden="true" />
              <span>{appInfo.administratorContact}</span>
            </li>
          </ul>
          <p className="home-info-note">
            Slot pengambilan dipilih lewat sistem
          </p>
        </section>

        <aside className="home-warning" aria-label="Catatan penting">
          <ShieldAlert size={20} aria-hidden="true" />
          <p>
            Barang bernilai tinggi (KTM, kartu ATM, elektronik) memerlukan
            verifikasi manual.
          </p>
        </aside>
      </div>
    </div>
  );
}
