import { useEffect, useState } from 'react';
import {
  batchSecureItems,
  downloadMonthlyReport,
  getAdminItems,
  getDashboardSummary,
  secureItem,
} from '../api/dashboardApi.js';

const metricItems = [
  ['Total barang', (data) => data.items?.total_items],
  ['Menunggu di pos', (data) => data.items?.waiting_security_post],
  ['Tersedia di lemari', (data) => data.items?.in_display_case],
  ['Sudah diklaim', (data) => data.items?.claimed],
  ['Total klaim', (data) => data.claims?.total_claims],
  ['Menunggu verifikasi', (data) => data.claims?.pending],
  [
    'Tingkat keberhasilan',
    (data) => `${data.claims?.success_rate_percentage ?? 0}%`,
  ],
  [
    'Rata-rata serah-terima',
    (data) => `${data.claims?.avg_handover_turnaround_hours ?? 0} jam`,
  ],
];

function monthStart() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function monthEnd() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;
}

export function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingItems, setPendingItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [processingItem, setProcessingItem] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    getDashboardSummary()
      .then((response) => {
        if (isCurrent) setSummary(response.data);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(
            requestError.response?.data?.message ||
              'Statistik dashboard gagal dimuat.',
          );
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    getAdminItems({ status: 'pending' })
      .then((response) => {
        if (isCurrent) setPendingItems(response.data ?? []);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(
            requestError.response?.data?.message ||
              'Daftar barang yang menunggu gagal dimuat.',
          );
        }
      })
      .finally(() => {
        if (isCurrent) setItemsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  async function refreshPendingItems() {
    const response = await getAdminItems({ status: 'pending' });
    setPendingItems(response.data ?? []);
  }

  async function secure(itemId) {
    setProcessingItem(true);
    setError('');
    try {
      await secureItem(itemId);
      await refreshPendingItems();
      const response = await getDashboardSummary();
      setSummary(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Barang gagal dipindahkan ke lemari.',
      );
    } finally {
      setProcessingItem(false);
    }
  }

  async function secureAll() {
    setProcessingItem(true);
    setError('');
    try {
      await batchSecureItems(pendingItems.map((item) => item.item_id));
      await refreshPendingItems();
      const response = await getDashboardSummary();
      setSummary(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Barang gagal dipindahkan ke lemari.',
      );
    } finally {
      setProcessingItem(false);
    }
  }

  async function exportReport() {
    setDownloading(true);
    setError('');
    try {
      const { blob, contentDisposition } = await downloadMonthlyReport({
        startDate: monthStart(),
        endDate: monthEnd(),
      });
      const filename =
        contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1] ||
        `lost-found-report-${monthStart()}.pdf`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Laporan PDF gagal diunduh.',
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="admin-page">
      <h1>Dashboard Admin</h1>
      <p>Ringkasan operasional barang hilang dan ditemukan.</p>
      {error && <p role="alert">{error}</p>}
      {loading ? (
        <p role="status">Memuat statistik...</p>
      ) : summary ? (
        <div className="dashboard-metrics">
          {metricItems.map(([label, readValue]) => (
            <article className="feature-placeholder" key={label}>
              <p>{label}</p>
              <strong>{readValue(summary) ?? 0}</strong>
            </article>
          ))}
        </div>
      ) : null}
      <section>
        <h2>Menunggu di Pos Satpam</h2>
        {itemsLoading ? (
          <p role="status">Memuat barang...</p>
        ) : pendingItems.length ? (
          <>
            <button type="button" onClick={secureAll} disabled={processingItem}>
              Amankan semua barang
            </button>
            <ul>
              {pendingItems.map((item) => (
                <li key={item.item_id}>
                  {item.name} · {item.found_location} · {item.found_date}{' '}
                  <button
                    type="button"
                    onClick={() => secure(item.item_id)}
                    disabled={processingItem}
                  >
                    Amankan
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Tidak ada barang yang menunggu diamankan.</p>
        )}
      </section>
      <button type="button" onClick={exportReport} disabled={downloading}>
        {downloading ? 'Mengunduh...' : 'Unduh laporan bulanan (PDF)'}
      </button>
      {summary?.recent_activities?.length > 0 && (
        <section>
          <h2>Aktivitas terbaru</h2>
          <ul>
            {summary.recent_activities.map((activity) => (
              <li key={activity._id}>
                {activity.actor?.name} · {activity.action} ·{' '}
                {new Date(activity.timestamp).toLocaleString('id-ID')}
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
