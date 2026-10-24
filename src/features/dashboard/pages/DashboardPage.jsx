import { Download, FileBarChart2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { KpiCard } from '../../../components/domain/KpiCard.jsx';
import { useToast } from '../../../app/providers/ToastProvider.jsx';
import { getDashboardSummary } from '../api/dashboardApi.js';

export function DashboardPage() {
  const { notify } = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardSummary()
      .then((response) => setDashboard(response.data))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Dashboard tidak dapat dimuat.'));
  }, []);

  const itemSummary = dashboard?.items || {};
  const distribution = [
    { label: 'Laporan aktif', count: itemSummary.active_lost || 0, tone: 'info' },
    { label: 'Tersedia', count: itemSummary.available_found || 0, tone: 'success' },
    { label: 'Diklaim', count: itemSummary.claimed || 0, tone: 'info' },
    { label: 'Didonasikan / Diarsipkan', count: itemSummary.donated || 0, tone: 'muted' },
  ];

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
        <span className="admin-preview-label">Data database</span>
      </header>

      <section className="dashboard-kpis" aria-label="Metrik utama">
        <KpiCard
          label="Total Laporan"
          value={itemSummary.total_items ?? '-'}
          detail="Total barang tercatat"
        />
        <KpiCard
          label="Rasio Klaim Berhasil"
          value={dashboard?.claims?.success_rate_percentage ? `${dashboard.claims.success_rate_percentage}%` : '-'}
          detail="Rasio klaim berhasil"
        />
        <KpiCard
          label="Rata-rata Waktu Serah-Terima"
          value={dashboard?.claims?.avg_handover_turnaround_days ?? '-'}
          detail="Rata-rata pemrosesan"
        />
        <KpiCard
          label="Barang tersedia"
          value={itemSummary.available_found ?? '-'}
          detail="Barang temuan siap diklaim"
        />
      </section>

      <section className="dashboard-analytics" aria-label="Analisis laporan">
        <article className="admin-panel dashboard-chart-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Laporan &amp; Klaim per Bulan</h2>
              <p>Ringkasan bulanan belum disediakan oleh API dashboard.</p>
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
              {distribution.map(({ label, count }) => (
                <div className="dashboard-chart-month" key={label}>
                  <div className="dashboard-chart-bars">
                    <span
                      className="dashboard-chart-bar is-reports"
                      style={{ height: `${Math.min(count, 30) / 30 * 100}%` }}
                      title={`${count} barang`}
                    />
                    <span
                      className="dashboard-chart-bar is-claims"
                      style={{ height: '0%' }}
                      title="Data klaim bulanan tidak tersedia"
                    />
                  </div>
                  <span className="dashboard-chart-month-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="admin-panel dashboard-distribution-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Distribusi Status Barang</h2>
              <p>{itemSummary.total_items ?? 0} barang terdata</p>
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
                  aria-valuemax={itemSummary.total_items || 1}
                  aria-valuenow={status.count}
                >
                  <span
                    className={`dashboard-progress-fill tone-${status.tone}`}
                    style={{ width: `${((status.count / (itemSummary.total_items || 1)) * 100)}%` }}
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
              <tr>
                <td colSpan="5">Daftar batch belum disediakan oleh API dashboard.</td>
              </tr>
            </tbody>
          </table>
        </div>
        {error && <p className="admin-data-note" role="alert">{error}</p>}
      </section>
    </div>
  );
}
