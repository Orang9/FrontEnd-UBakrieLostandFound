import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../../app/providers/ToastProvider.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { SYSTEM_MESSAGES } from '../../../constants/messages.js';
import { paths } from '../../../app/router/paths.js';
import { ReportCategoryField } from '../components/ReportCategoryField.jsx';
import { ReportPhotoField } from '../components/ReportPhotoField.jsx';
import { createItemReport } from '../api/reportItemApi.js';

const reportTypes = [
  { value: 'found', label: 'Barang Temuan' },
  { value: 'lost', label: 'Barang Hilang' },
];

export function ReportItemPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useToast();
  const initialType = searchParams.get('type') === 'lost' ? 'lost' : 'found';
  const [reportType, setReportType] = useState(initialType);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { category: 'sensitive' },
  });
  const category = watch('category');
  const isSensitive = category === 'sensitive';

  async function onSubmit(values) {
    setSubmitting(true);
    setSubmitError('');
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'photo') {
          if (value?.[0]) formData.append('photo', value[0]);
        } else if (value !== undefined) formData.append(key, value);
      });
      formData.append('type', reportType);
      await createItemReport(formData);
      notify('Laporan barang berhasil dikirim.', 'success');
      navigate(paths.catalog);
    } catch (error) {
      setSubmitError(error?.response?.data?.message ?? 'Laporan tidak dapat dikirim.');
      notify(SYSTEM_MESSAGES.genericError, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="report-page">
      <header className="report-hero">
        <div className="report-hero-content">
          <button
            className="report-back-button"
            type="button"
            aria-label="Kembali"
            onClick={() =>
              navigate(location.key === 'default' ? paths.home : -1)
            }
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </button>
          <h1>Lapor Barang</h1>
        </div>
      </header>

      <div className="report-content">
        <div
          className="report-segmented"
          role="group"
          aria-label="Jenis laporan"
        >
          {reportTypes.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`report-segment${reportType === value ? ' is-active' : ''}`}
              aria-pressed={reportType === value}
              onClick={() => setReportType(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <form
          className="report-form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {submitError && <p className="report-error" role="alert">{submitError}</p>}
          <label className="report-field" htmlFor="item-name">
            <span>Nama barang</span>
            <input
              id="item-name"
              type="text"
              placeholder="Contoh: Dompet kulit hitam"
              aria-invalid={Boolean(errors.name)}
              {...register('name', { required: 'Nama barang wajib diisi.' })}
            />
            {errors.name && (
              <span className="report-error">{errors.name.message}</span>
            )}
          </label>

          <ReportCategoryField
            category={category}
            error={errors.category}
            isSensitive={isSensitive}
            register={register}
          />

          <label className="report-field" htmlFor="item-location">
            <span>{reportType === 'lost' ? 'Lokasi hilang' : 'Lokasi ditemukan'}</span>
            <input
              id="item-location"
              type="text"
              placeholder={
                reportType === 'lost'
                  ? 'Contoh: Kantin gedung A'
                  : 'Contoh: Kantin gedung A'
              }
              aria-invalid={Boolean(errors.location)}
              {...register('location', { required: 'Lokasi wajib diisi.' })}
            />
            {errors.location && (
              <span className="report-error">{errors.location.message}</span>
            )}
          </label>

          <div className="report-datetime-grid">
            <label className="report-field" htmlFor="item-date">
              <span>Tanggal</span>
              <input
                id="item-date"
                type="date"
                aria-invalid={Boolean(errors.date)}
                {...register('date', { required: 'Tanggal wajib diisi.' })}
              />
              {errors.date && (
                <span className="report-error">{errors.date.message}</span>
              )}
            </label>
            <label className="report-field" htmlFor="item-time">
              <span>Waktu</span>
              <input
                id="item-time"
                type="time"
                aria-invalid={Boolean(errors.time)}
                {...register('time', { required: 'Waktu wajib diisi.' })}
              />
              {errors.time && (
                <span className="report-error">{errors.time.message}</span>
              )}
            </label>
          </div>

          <ReportPhotoField
            errors={errors}
            isSensitive={isSensitive}
            register={register}
          />

          <label className="report-field" htmlFor="item-description">
            <span>Deskripsi</span>
            <textarea
              id="item-description"
              rows={4}
              placeholder="Tambahkan ciri-ciri barang"
              {...register('description')}
            />
          </label>

          <div className="report-submit-area">
            <Button className="report-submit-button" type="submit" disabled={submitting}>
              {submitting ? 'Mengirim...' : 'Kirim Laporan'}
            </Button>
            <p>Laporan akan ditampilkan setelah ditinjau Admin BEM.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
