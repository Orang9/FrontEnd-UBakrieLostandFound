import { useEffect, useMemo, useState } from 'react';
import { LockKeyhole, PackageSearch, RefreshCw } from 'lucide-react';
import { useToast } from '../../../app/providers/ToastProvider.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { getMediaUrl } from '../../../lib/media.js';
import {
  approveAdminItem,
  configureAdminItemVerificationQuestions,
  getAdminItems,
  rejectAdminItem,
  restoreAdminItem,
} from '../../admin/api/adminApi.js';
import { formatShortDate } from '../../../lib/format.js';

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

export function ManageItemsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('Pending');
  const [rejectingId, setRejectingId] = useState(null);
  const [questionEditorId, setQuestionEditorId] = useState(null);
  const [questionDraft, setQuestionDraft] = useState(['']);
  const [savingQuestionItemId, setSavingQuestionItemId] = useState(null);
  const { notify } = useToast();

  async function refreshReports() {
    setLoading(true);
    try {
      const response = await getAdminItems({ review_status: 'all' });
      const items = response.data || [];
      setReports(
        items.map((item) => ({
          id: item.item_id,
          imageUrl: getMediaUrl(item.image_url ?? item.image_path),
          type: item.report_type === 'lost' ? 'Hilang' : 'Temuan',
          name: item.name,
          category: item.is_sensitive ? 'Sensitif' : 'Umum',
          categoryDetail: item.category_name || '-',
          location:
            item.location || item.lost_location || item.found_location || '-',
          date: formatShortDate(
            item.report_date ||
              item.lost_date ||
              item.found_date ||
              item.created_at,
          ),
          reporter:
            item.reporter_name || item.finder_name || item.owner_name || '-',
          nim: item.reporter_nim || item.finder_nim || item.owner_nim || '-',
          description: item.description || '',
          reportType: item.report_type,
          claimQuestions: item.claim_questions || [],
          claimQuestionCount: Number(
            item.claim_question_count || item.claim_questions?.length || 0,
          ),
          icon: PackageSearch,
          status:
            item.report_review_status === 'rejected'
              ? 'Ditolak'
              : item.report_review_status === 'accepted'
                ? 'Diterima'
                : 'Pending',
          backendStatus: item.report_review_status,
          rejection: item.rejection_reason
            ? {
                reason: item.rejection_reason,
                note: item.rejection_note,
                by: item.rejected_by || '-',
                at: item.rejected_at || '-',
              }
            : undefined,
        })),
      );
      setError('');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Data laporan tidak dapat dimuat.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshReports();
  }, []);

  const statusFilters = [
    { id: 'Semua', count: reports.length },
    {
      id: 'Pending',
      count: reports.filter((report) => report.status === 'Pending').length,
    },
    {
      id: 'Diterima',
      count: reports.filter((report) => report.status === 'Diterima').length,
    },
    {
      id: 'Ditolak',
      count: reports.filter((report) => report.status === 'Ditolak').length,
    },
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

  function openQuestionEditor(report) {
    setQuestionEditorId(report.id);
    setQuestionDraft(
      report.claimQuestions.length ? [...report.claimQuestions] : [''],
    );
  }

  function updateQuestion(index, value) {
    setQuestionDraft((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? value : question,
      ),
    );
  }

  function addQuestion() {
    setQuestionDraft((current) =>
      current.length < 10 ? [...current, ''] : current,
    );
  }

  function removeQuestion(index) {
    setQuestionDraft((current) =>
      current.length > 1
        ? current.filter((_, questionIndex) => questionIndex !== index)
        : current,
    );
  }

  async function saveVerificationQuestions(event, report) {
    event.preventDefault();
    const questions = questionDraft.map((question) => question.trim());
    if (
      questions.length < 1 ||
      questions.length > 10 ||
      questions.some((question) => !question || question.length > 500)
    ) {
      notify(
        'Masukkan 1–10 pertanyaan, masing-masing maksimal 500 karakter.',
        'error',
      );
      return;
    }

    setSavingQuestionItemId(report.id);
    try {
      if (report.status === 'Pending') {
        await approveAdminItem(report.id, questions);
        notify(
          'Pertanyaan tersimpan dan laporan berhasil diterima.',
          'success',
        );
      } else {
        await configureAdminItemVerificationQuestions(report.id, questions);
        notify('Pertanyaan verifikasi berhasil disimpan.', 'success');
      }
      setQuestionEditorId(null);
      await refreshReports();
    } catch (requestError) {
      notify(
        requestError.response?.data?.message ||
          'Pertanyaan verifikasi gagal disimpan.',
        'error',
      );
    } finally {
      setSavingQuestionItemId(null);
    }
  }

  async function acceptReport(report) {
    if (report.reportType === 'found') {
      openQuestionEditor(report);
      return;
    }
    try {
      await approveAdminItem(report.id);
      notify('Laporan berhasil diterima.', 'success');
      await refreshReports();
    } catch (requestError) {
      notify(
        requestError.response?.data?.message || 'Laporan gagal diterima.',
        'error',
      );
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
      .catch((requestError) =>
        notify(
          requestError.response?.data?.message || 'Laporan gagal ditolak.',
          'error',
        ),
      );
  }

  function reviewAgain(reportId) {
    restoreAdminItem(reportId)
      .then(() => {
        setActiveFilter('Pending');
        notify('Laporan dikembalikan untuk ditinjau.', 'success');
        return refreshReports();
      })
      .catch((requestError) =>
        notify(
          requestError.response?.data?.message || 'Laporan gagal dipulihkan.',
          'error',
        ),
      );
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
        {loading ? (
          <section className="admin-panel admin-item-empty">
            <p>Memuat laporan...</p>
          </section>
        ) : error ? (
          <section className="admin-panel admin-item-empty">
            <p role="alert">{error}</p>
          </section>
        ) : visibleReports.length ? (
          visibleReports.map((report) => {
            const ThumbnailIcon = report.icon;
            const isRejecting = rejectingId === report.id;
            const isEditingQuestions = questionEditorId === report.id;

            return (
              <article className="admin-item-report-card" key={report.id}>
                <div className="admin-item-report-main">
                  <div
                    className={`admin-item-thumbnail${report.category === 'Sensitif' ? ' is-sensitive' : ''}${report.status === 'Ditolak' ? ' is-rejected' : ''}`}
                    aria-hidden="true"
                  >
                    {report.imageUrl ? (
                      <img src={report.imageUrl} alt="" loading="lazy" />
                    ) : (
                      <ThumbnailIcon size={30} />
                    )}
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
                          onClick={() => acceptReport(report)}
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
                    {report.status === 'Diterima' &&
                      report.reportType === 'found' &&
                      report.claimQuestionCount === 0 && (
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => openQuestionEditor(report)}
                        >
                          Atur Pertanyaan Klaim
                        </Button>
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

                {isEditingQuestions && (
                  <form
                    className="admin-item-verification-form"
                    onSubmit={(event) =>
                      saveVerificationQuestions(event, report)
                    }
                  >
                    <div className="admin-item-verification-heading">
                      <div>
                        <h3>Pertanyaan verifikasi kepemilikan</h3>
                        <p>
                          Pemohon klaim akan menjawab pertanyaan ini. Isi 1–10
                          pertanyaan; jawaban akan diperiksa manual oleh Admin
                          BEM.
                        </p>
                      </div>
                      <span>{questionDraft.length}/10</span>
                    </div>
                    <div className="admin-item-verification-fields">
                      {questionDraft.map((question, index) => (
                        <label
                          className="admin-field"
                          key={`${report.id}-question-${index}`}
                        >
                          Pertanyaan {index + 1}
                          <textarea
                            name="verification-question"
                            rows="2"
                            maxLength={500}
                            required
                            value={question}
                            onChange={(event) =>
                              updateQuestion(index, event.target.value)
                            }
                            placeholder="Contoh: Apa ciri khusus barang yang tidak terlihat pada foto?"
                          />
                          {questionDraft.length > 1 && (
                            <button
                              className="admin-item-question-remove"
                              type="button"
                              onClick={() => removeQuestion(index)}
                            >
                              Hapus pertanyaan
                            </button>
                          )}
                        </label>
                      ))}
                    </div>
                    <div className="admin-item-verification-actions">
                      <Button
                        variant="secondary"
                        type="button"
                        disabled={
                          questionDraft.length >= 10 ||
                          Boolean(savingQuestionItemId)
                        }
                        onClick={addQuestion}
                      >
                        Tambah Pertanyaan
                      </Button>
                      <Button
                        className="admin-item-cancel-button"
                        variant="secondary"
                        type="button"
                        disabled={Boolean(savingQuestionItemId)}
                        onClick={() => setQuestionEditorId(null)}
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        disabled={Boolean(savingQuestionItemId)}
                      >
                        {savingQuestionItemId === report.id
                          ? 'Menyimpan...'
                          : report.status === 'Pending'
                            ? 'Simpan & Terima'
                            : 'Simpan Pertanyaan'}
                      </Button>
                    </div>
                  </form>
                )}

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
            <p>Belum ada laporan dengan status ini.</p>
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
