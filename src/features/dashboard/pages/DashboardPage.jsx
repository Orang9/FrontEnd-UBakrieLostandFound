import { Download, FileBarChart2 } from 'lucide-react';
import { KpiCard } from '../../../components/domain/KpiCard.jsx';
import { useToast } from '../../../app/providers/ToastProvider.jsx';

const monthlyData = [
  { month: 'Mei', reports: 18, claims: 11 },
  { month: 'Jun', reports: 22, claims: 14 },
  { month: 'Jul', reports: 17, claims: 12 },
  { month: 'Agu', reports: 26, claims: 18 },
  { month: 'Sep', reports: 21, claims: 16 },
  { month: 'Okt', reports: 24, claims: 20 },
];

const distribution = [
  { label: 'Menunggu di Pos Satpam', count: 5, tone: 'warning' },
  { label: 'Tersedia di Lemari', count: 18, tone: 'success' },
  { label: 'Diklaim', count: 12, tone: 'info' },
  { label: 'Didonasikan / Diarsipkan', count: 4, tone: 'muted' },
];

const batchItems = [
  {
    id: 'IT-0241',
    name: 'Kunci motor Honda',
    location: 'Pos Satpam Gedung A',
    date: '14 Okt 2026',
    status: 'Menunggu dipindahkan',
  },
  {
    id: 'IT-0240',
    name: 'Botol minum biru',
    location: 'Pos Satpam Gedung B',
    date: '13 Okt 2026',
    status: 'Menunggu dipindahkan',
  },
  {
    id: 'IT-0238',
    name: 'Payung lipat hitam',
    location: 'Pos Satpam Gedung A',
    date: '12 Okt 2026',
    status: 'Menunggu dipindahkan',
  },
];

export function DashboardPage() {
  const { notify } = useToast();

  function notifyPreview() {
    notify('Ekspor laporan tersedia setelah integrasi backend.', 'info');
  }

  return (
    <div className="admin-page dashboard-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Ringkasan operasional</p>
          <h1>Dashboard Monitoring</h1>
          <p className="admin-page-description">
            Pantau laporan barang, klaim, dan perpindahan barang di kampus.
          </p>
        </div>
        <span className="admin-preview-label">Data contoh</span>
      </header>

      <section className="dashboard-kpis" aria-label="Metrik utama">
        <KpiCard
          label="Total Laporan"
          value="128"
          detail="+12% vs bulan lalu"
        />
        <KpiCard
          label="Rasio Klaim Berhasil"
          value="71%"
          detail="91 dari 128 laporan"
        />
        <KpiCard
          label="Rata-rata Waktu Serah-Terima"
          value="2,4 hari"
          detail="Dari klaim disetujui"
        />
        <KpiCard
          label="Menunggu di Pos Satpam"
          value="5"
          detail="Perlu dipindah ke lemari"
        />
      </section>

      <section className="dashboard-analytics" aria-label="Analisis laporan">
        <article className="admin-panel dashboard-chart-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Laporan &amp; Klaim per Bulan</h2>
              <p>Perbandingan aktivitas Mei - Okt</p>
            </div>
          </div>
          <div
            className="dashboard-chart"
            role="img"
            aria-label="Grafik batang laporan dan klaim per bulan"
          >
            <div className="dashboard-chart-legend" aria-hidden="true">
              <span className="is-reports">Laporan</span>
              <span className="is-claims">Klaim</span>
            </div>
            <div className="dashboard-chart-grid">
              {monthlyData.map(({ month, reports, claims }) => (
                <div className="dashboard-chart-month" key={month}>
                  <div className="dashboard-chart-bars">
                    <span
                      className="dashboard-chart-bar is-reports"
                      style={{ height: `${(reports / 30) * 100}%` }}
                      title={`${reports} laporan`}
                    />
                    <span
                      className="dashboard-chart-bar is-claims"
                      style={{ height: `${(claims / 30) * 100}%` }}
                      title={`${claims} klaim`}
                    />
                  </div>
                  <span className="dashboard-chart-month-label">{month}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="admin-panel dashboard-distribution-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Distribusi Status Barang</h2>
              <p>39 barang terdata</p>
            </div>
          </div>
          <div className="dashboard-distribution">
            {distribution.map((status) => (
              <div className="dashboard-distribution-row" key={status.label}>
                <div className="dashboard-distribution-label">
                  <span>{status.label}</span>
                  <strong>{status.count}</strong>
                </div>
                <div
                  className="dashboard-progress-track"
                  role="meter"
                  aria-label={status.label}
                  aria-valuemin="0"
                  aria-valuemax="39"
                  aria-valuenow={status.count}
                >
                  <span
                    className={`dashboard-progress-fill tone-${status.tone}`}
                    style={{ width: `${(status.count / 39) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-panel dashboard-batch-panel">
        <div className="admin-panel-heading dashboard-batch-heading">
          <div>
            <h2>Barang di Pos Satpam</h2>
            <p>Batch mingguan yang perlu dipindahkan ke lemari</p>
          </div>
          <div className="admin-panel-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={notifyPreview}
            >
              <Download size={16} aria-hidden="true" />
              Unduh PDF Bulanan
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={notifyPreview}
            >
              <FileBarChart2 size={16} aria-hidden="true" />
              Agregasi Laporan Tahunan
            </button>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">ID Barang</th>
                <th scope="col">Nama Barang</th>
                <th scope="col">Lokasi Penyimpanan</th>
                <th scope="col">Tanggal Masuk</th>
                <th scope="col">Status Batch</th>
              </tr>
            </thead>
            <tbody>
              {batchItems.map((item) => (
                <tr key={item.id}>
                  <td data-label="ID Barang">{item.id}</td>
                  <td data-label="Nama Barang">{item.name}</td>
                  <td data-label="Lokasi Penyimpanan">{item.location}</td>
                  <td data-label="Tanggal Masuk">{item.date}</td>
                  <td data-label="Status Batch">
                    <span className="admin-status-pill tone-warning">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="admin-data-note">
          Data dashboard ini bersifat ilustrasi dan belum terhubung ke backend.
        </p>
      </section>
    </div>
  );
}
