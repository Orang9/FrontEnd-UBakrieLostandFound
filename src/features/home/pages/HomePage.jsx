import { Link } from 'react-router-dom';
import { paths } from '../../../app/router/paths.js';
import { appInfo } from '../../../config/appInfo.js';

const statusItems = [
  ['Menunggu tinjauan', 'Laporan sedang diperiksa Admin BEM', 'waiting'],
  ['Tersedia', 'Barang temuan dapat diajukan klaim', 'available'],
  ['Terjadwal', 'Slot pengambilan sudah dipilih', 'scheduled'],
  ['Claimed', 'Diserahkan setelah QR divalidasi', 'claimed'],
];

const processCards = [
  {
    title: 'Kehilangan Barang',
    accent: 'lost',
    steps: [
      ['Ingat waktu & lokasi', 'Kapan dan di mana terakhir Anda bersama barang tersebut.'],
      ['Cek katalog', 'Telusuri katalog barang temuan untuk melihat apakah barang Anda sudah ada.'],
      ['Ajukan klaim', 'Jika ada barang yang sesuai, tekan Ajukan Klaim pada barang tersebut.'],
      ['Isi jawaban / ciri fisik', 'Jelaskan ciri-ciri fisik barang agar Admin BEM dapat memverifikasi.'],
    ],
  },
  {
    title: 'Penemuan Barang',
    accent: 'found',
    steps: [
      ['Serahkan untuk dicatat', 'Titipkan barang kepada petugas atau Admin BEM.'],
      ['Tinjauan Admin BEM', 'Admin memeriksa laporan dan detail barang.'],
      ['Tersedia di katalog', 'Setelah diterima, barang langsung dapat diajukan klaim.'],
    ],
  },
  {
    title: 'Klaim Barang',
    accent: 'claim',
    steps: [
      ['Cari di katalog', 'Temukan barang Anda lalu tekan Ajukan Klaim.'],
      ['Jawab verifikasi', 'Barang sensitif juga ditinjau manual oleh Admin BEM.'],
      ['Pilih slot jadwal', 'Setelah disetujui, pilih waktu pengambilan di sistem.'],
      ['Tunjukkan E-Ticket QR', 'Admin BEM memvalidasi QR saat serah-terima.'],
    ],
  },
];

const preventionTips = [
  ['Periksa sebelum pergi', 'Cek kembali meja, kursi, dan area colokan sebelum beranjak.'],
  ['Beri label', 'Tandai barang kecil seperti kunci atau flashdisk dengan nama atau kontak aktif.'],
  ['Jangan tinggalkan', 'Bawa barang berharga seperti laptop, HP, dan dompet saat meninggalkan meja.'],
  ['Amankan identitas', 'KTM dan kartu ATM yang hilang akan diverifikasi manual saat diklaim.'],
];

export function HomePage() {
  return (
    <div className="home-page">
      <section className="home-reference-hero">
        <div className="home-reference-hero-inner">
          <div className="home-reference-copy">
            <p className="home-reference-eyebrow">Universitas Bakrie</p>
            <h1>Petunjuk Teknis <br />Kehilangan &amp; Penemuan</h1>
            <p className="home-reference-intro">
              Ikuti langkah-langkah berikut jika Anda kehilangan barang, menemukan barang milik orang lain, atau ingin mengklaim barang di lemari kaca BEM.
            </p>
            <Link className="home-reference-cta" to={paths.catalog}>
              Lihat Barang Hilang &amp; Temuan
            </Link>
            <p className="home-reference-note">Masuk dengan akun email kampus untuk melanjutkan. Hanya untuk civitas academica.</p>
          </div>
          <div className="home-status-card">
            <h2>Alur status barang</h2>
            <div className="home-status-list">
              {statusItems.map(([label, description, tone]) => (
                <div className="home-status-row" key={label}>
                  <span className={`home-status-badge is-${tone}`}>{label}</span>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="home-reference-content">
        <section className="home-process-grid" aria-label="Panduan kehilangan dan penemuan barang">
          {processCards.map((card) => (
            <article className="home-process-card" key={card.title}>
              <span className={`home-process-icon is-${card.accent}`} aria-hidden="true" />
              <h2>{card.title}</h2>
              <ol>
                {card.steps.map(([title, description]) => (
                  <li key={title}>
                    <span className="home-process-number" aria-hidden="true" />
                    <p><strong>{title}:</strong> {description}</p>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </section>

        <section className="home-storage-section">
          <div>
            <h2>{appInfo.storageName}</h2>
            <p>Titik serah-terima barang. Pengambilan dilakukan sesuai slot jadwal yang dipilih lewat sistem, dan WhatsApp hanya sebagai cadangan.</p>
          </div>
          <dl>
            <div><dt>Lokasi</dt><dd>{appInfo.storageLocation}</dd></div>
            <div><dt>Jam</dt><dd>{appInfo.operatingHours}</dd></div>
            <div><dt>Kontak</dt><dd>{appInfo.administratorContact}</dd></div>
          </dl>
        </section>

        <section className="home-tips-section">
          <div className="home-section-heading">
            <h2>Tips Pencegahan</h2>
            <p>Jangan biarkan barang Anda hilang. Ikuti tips berikut selama beraktivitas di kampus.</p>
          </div>
          <div className="home-tips-grid">
            {preventionTips.map(([title, description]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="home-reference-footer">
        © 2026 UBakrie Lost &amp; Found, Capstone Project INF701, Universitas Bakrie
      </footer>
    </div>
  );
}
