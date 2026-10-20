import { useEffect, useMemo, useState } from 'react';
import {
  Backpack,
  LockKeyhole,
  Laptop,
  PackageSearch,
  RefreshCw,
  Umbrella,
} from 'lucide-react';
import { useToast } from '../../../app/providers/ToastProvider.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import {
  approveAdminItem,
  getAdminItems,
  rejectAdminItem,
  restoreAdminItem,
} from '../../admin/api/adminApi.js';

const initialReports = [
  {
    id: 'RP-0113',
    type: 'Temuan',
    name: 'Botol minum stainless',
    category: 'Umum',
    categoryDetail: 'Botol / Peralatan pribadi',
    location: 'Perpustakaan',
    date: '12 Okt 2026',
    reporter: 'Andi Pratama',
    nim: '1232001091',
    description: 'Botol minum stainless ditemukan di meja baca lantai dua.',
    icon: PackageSearch,
    status: 'Pending',
  },
  {
    id: 'RP-0112',
    type: 'Temuan',
    name: 'Tas ransel hitam',
    category: 'Umum',
    categoryDetail: 'Tas / Aksesori',
    location: 'Aula',
    date: '12 Okt 2026',
    reporter: 'Rafi Pratama',
    nim: '1232001045',
    description:
      'Tas ransel hitam, ada gantungan kunci beruang di resleting depan.',
    icon: Backpack,
    status: 'Pending',
  },
  {
    id: 'RP-0111',
    type: 'Temuan',
    name: 'Laptop Lenovo ThinkPad T14',
    category: 'Sensitif',
    categoryDetail: 'Elektronik (HP, Laptop, Tab, Earphone)',
    location: 'Lab 3',
    date: '12 Okt 2026',
    reporter: 'Dewi Lestari',
    nim: '1232001062',
    description: 'Laptop abu-abu dengan stiker kucing di bagian atas.',
    icon: Laptop,
    status: 'Pending',
  },
  {
    id: 'RP-0108',
    type: 'Hilang',
    name: 'Payung biru',
    category: 'Umum',
    categoryDetail: 'Tas / Aksesori',
    location: 'Aula',
    date: '11 Okt 2026',
    reporter: 'Bima Saputra',
    nim: '1232001078',
    description: '',
    icon: Umbrella,
    status: 'Ditolak',
    rejection: {
      reason: 'Laporan iseng / tidak valid',
      note: 'Barang tidak ditemukan saat dicek di Pos Satpam.',
      by: 'admin-bem',
      at: '11 Okt 14.20',
    },
  },
];

const rejectionReasons = [
  'Laporan iseng / tidak valid',
  'Informasi laporan tidak lengkap',
  'Barang tidak ditemukan saat diverifikasi',
];

function getStatusTone(status) {
  if (status === 'Pending') return 'tone-warning';
  if (status === 'Diterima') return 'tone-success';
  return 'tone-danger';
}

function currentRejectionTime() {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date());
}

export function ManageItemsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('Pending');
  const [rejectingId, setRejectingId] = useState(null);
  const { notify } = useToast();

  async function refreshReports() {
    setLoading(true);
    try {
      const response = await getAdminItems({ review_status: 'all' });
      const items = response.data || [];
      setReports(items.map((item) => ({
        id: item.item_id,
        type: item.report_type === 'lost' ? 'Hilang' : 'Temuan',
        name: item.name,
        category: item.is_sensitive ? 'Sensitif' : 'Umum',
        categoryDetail: item.category_name || '-',
        location: item.found_location || item.last_seen_location || '-',
        date: item.found_date || item.created_at || '-',
        reporter: item.reporter_name || item.finder_name || item.owner_name || '-',
        nim: item.reporter_nim || item.finder_nim || item.owner_nim || '-',
        description: item.description || '',
        icon: PackageSearch,
        status: item.report_review_status === 'rejected'
          ? 'Ditolak'
          : item.report_review_status === 'accepted'
            ? 'Diterima'
            : 'Pending',
        backendStatus: item.report_review_status,
        rejection: item.rejection_reason ? {
          reason: item.rejection_reason,
          note: item.rejection_note,
          by: item.rejected_by || '-',
          at: item.rejected_at || '-',
        } : undefined,
      })));
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Data laporan tidak dapat dimuat.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshReports(); }, []);

  const statusFilters = [
    { id: 'Semua', count: reports.length },
    { id: 'Pending', count: reports.filter((report) => report.status === 'Pending').length },
    { id: 'Diterima', count: reports.filter((report) => report.status === 'Diterima').length },
    { id: 'Ditolak', count: reports.filter((report) => report.status === 'Ditolak').length },
  ];

  const visibleReports = useMemo(
    () =>
      activeFilter === 'Semua'
        ? reports
        : reports.filter((report) => report.status === activeFilter),
    [activeFilter, reports],
  );
  const selectedFilter = statusFilters.find(
    (filter) => filter.id === activeFilter,
  );

  async function acceptReport(reportId) {
    try {
      await approveAdminItem(reportId);
      notify('Laporan berhasil diterima.', 'success');
      await refreshReports();
    } catch (requestError) {
      notify(requestError.response?.data?.message || 'Laporan gagal diterima.', 'error');
    }
  }

  function confirmRejection(event, reportId) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const reason = String(formData.get('reason'));
    const note = String(formData.get('note')).trim();
    if (!reason) {
      notify('Pilih alasan penolakan sebelum melanjutkan.', 'error');
      return;
    }

    rejectAdminItem(reportId, { reason, note })
      .then(() => {
        setRejectingId(null);
        notify('Laporan berhasil ditolak.', 'success');
        return refreshReports();
      })
      .catch((requestError) => notify(
        requestError.response?.data?.message || 'Laporan gagal ditolak.',
        'error',
      ));
  }

  function reviewAgain(reportId) {
    restoreAdminItem(reportId)
      .then(() => {
        setActiveFilter('Pending');
        notify('Laporan dikembalikan untuk ditinjau.', 'success');
        return refreshReports();
      })
      .catch((requestError) => notify(
        requestError.response?.data?.message || 'Laporan gagal dipulihkan.',
        'error',
      ));
  }

  return (
    <div className="admin-page admin-manage-items-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Moderasi laporan pengguna</p>
          <h1>Kelola Barang</h1>
          <p className="admin-page-description">
            Tinjau laporan barang sebelum diterima ke katalog atau ditolak.
          </p>
        </div>
        <span className="admin-intake-month">Data database</span>
      </header>

      <section className="admin-items-toolbar" aria-label="Filter laporan">
        <div
          className="admin-item-status-filters"
          role="tablist"
          aria-label="Filter status laporan"
        >
          {statusFilters.map(({ id, count }) => (
            <button
              key={id}
              id={`admin-items-filter-${id.toLowerCase()}`}
              className={`admin-item-filter${activeFilter === id ? ' is-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeFilter === id}
              aria-controls="admin-item-report-list"
              onClick={() => {
                setActiveFilter(id);
                setRejectingId(null);
              }}
            >
              <span>{id}</span>
              <span className="admin-item-filter-count">{count}</span>
            </button>
          ))}
        </div>
        <Button
          className="admin-items-refresh"
          variant="secondary"
          type="button"
          onClick={refreshReports}
        >
          <RefreshCw size={16} aria-hidden="true" />
          Refresh Data
        </Button>
      </section>

      <section
        className="admin-item-report-list"
        id="admin-item-report-list"
        role="tabpanel"
        aria-labelledby={`admin-items-filter-${activeFilter.toLowerCase()}`}
      >
        {loading ? <section className="admin-panel admin-item-empty"><p>Memuat laporan...</p></section> : error ? <section className="admin-panel admin-item-empty"><p role="alert">{error}</p></section> : visibleReports.length ? (
          visibleReports.map((report) => {
            const ThumbnailIcon = report.icon;
            const isRejecting = rejectingId === report.id;

            return (
              <article className="admin-item-report-card" key={report.id}>
                <div className="admin-item-report-main">
                  <div
                    className={`admin-item-thumbnail${report.category === 'Sensitif' ? ' is-sensitive' : ''}${report.status === 'Ditolak' ? ' is-rejected' : ''}`}
                    aria-hidden="true"
                  >
                    <ThumbnailIcon size={30} />
                    {report.category === 'Sensitif' && (
                      <span className="admin-item-blind-listing">
                        <LockKeyhole size={16} />
                      </span>
                    )}
                  </div>
                  <div className="admin-item-report-content">
                    <div className="admin-item-report-heading">
                      <div className="admin-item-report-title">
                        <p className="admin-item-report-type">
                          Laporan {report.type}
                        </p>
                        <h2>{report.name}</h2>
                      </div>
                      <div className="admin-item-badges">
                        <span
                          className={`admin-status-pill ${getStatusTone(report.status)}`}
                        >
                          {report.status}
                        </span>
                        <span
                          className={`admin-category-pill${report.category === 'Sensitif' ? ' is-sensitive' : ''}`}
                        >
                          {report.category}
                        </span>
                      </div>
                    </div>
                    <p className="admin-item-category-detail">
                      {report.categoryDetail}
                    </p>
                    <dl className="admin-item-metadata">
                      <div>
                        <dt>Lokasi</dt>
                        <dd>{report.location}</dd>
                      </div>
                      <div>
                        <dt>Tanggal</dt>
                        <dd>{report.date}</dd>
                      </div>
                      <div>
                        <dt>Pelapor</dt>
                        <dd>
                          {report.reporter} ({report.nim})
                        </dd>
                      </div>
                    </dl>
                    {report.description && (
                      <p className="admin-item-description">
                        {report.description}
                      </p>
                    )}
                    {report.rejection && (
                      <div className="admin-item-rejection-details">
                        <p>
                          Alasan: <strong>{report.rejection.reason}.</strong>
                        </p>
                        {report.rejection.note && (
                          <p>Catatan: {report.rejection.note}</p>
                        )}
                        <span>
                          Ditolak oleh {report.rejection.by},{' '}
                          {report.rejection.at}.
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="admin-item-report-actions">
                    {report.status === 'Pending' && (
                      <>
                        <Button
                          type="button"
                          onClick={() => acceptReport(report.id)}
                        >
                          Terima &amp; Catat
                        </Button>
                        <Button
                          className="admin-item-reject-trigger"
                          variant="secondary"
                          type="button"
                          onClick={() =>
                            setRejectingId(isRejecting ? null : report.id)
                          }
                        >
                          {isRejecting ? 'Tutup Form Tolak' : 'Tolak'}
                        </Button>
                      </>
                    )}
                    {report.status === 'Ditolak' && (
                      <>
                        <Button
                          className="admin-item-review-button"
                          variant="secondary"
                          type="button"
                          onClick={() => reviewAgain(report.id)}
                        >
                          Tinjau Ulang
                        </Button>
                        <span className="admin-item-action-helper">
                          Pelapor sudah diberi tahu lewat email.
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {isRejecting && (
                  <form
                    className="admin-item-rejection-form"
                    onSubmit={(event) => confirmRejection(event, report.id)}
                  >
                    <label className="admin-field">
                      Alasan penolakan
                      <select name="reason" required defaultValue="">
                        <option value="" disabled>
                          Pilih alasan penolakan
                        </option>
                        {rejectionReasons.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="admin-field">
                      Catatan untuk pelapor (dikirim lewat email)
                      <textarea
                        name="note"
                        rows="3"
                        placeholder="Tambahkan catatan untuk pelapor"
                      />
                    </label>
                    <div className="admin-item-rejection-actions">
                      <Button
                        className="admin-item-cancel-button"
                        variant="secondary"
                        type="button"
                        onClick={() => setRejectingId(null)}
                      >
                        Batal
                      </Button>
                      <Button
                        className="admin-item-confirm-reject"
                        type="submit"
                      >
                        Konfirmasi Tolak
                      </Button>
                    </div>
                    <p className="admin-data-note">
                      Penolakan akan tercatat di Audit Trail dan pemberitahuan
                      email dikirim jika backend tersedia.
                    </p>
                  </form>
                )}
              </article>
            );
          })
        ) : (
          <section className="admin-panel admin-item-empty">
            <h2>Tidak ada laporan {activeFilter.toLowerCase()}</h2>
            <p>
              Belum ada laporan dengan status ini.
            </p>
          </section>
        )}
      </section>

      <footer className="admin-item-list-footer" role="status">
        Menampilkan {visibleReports.length} dari {selectedFilter.count} laporan{' '}
        {activeFilter === 'Semua' ? 'di semua status' : activeFilter}.
        {activeFilter === 'Pending' &&
          ' Laporan Pending perlu divalidasi Admin BEM sebelum tampil di katalog.'}
        <span>
          Data ditampilkan dari backend dan perubahan disimpan ke database.
        </span>
      </footer>
    </div>
  );
}
