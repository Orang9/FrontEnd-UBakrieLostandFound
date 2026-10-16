import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../../app/providers/ToastProvider.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { getCategories } from '../../catalog/api/catalogApi.js';
import { createItemReport } from '../api/reportItemApi.js';
import { paths } from '../../../app/router/paths.js';
import { ReportCategoryField } from '../components/ReportCategoryField.jsx';
import { ReportPhotoField } from '../components/ReportPhotoField.jsx';

export function ReportItemPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useToast();
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { category: '' },
  });
  const category = watch('category');
  const selectedCategory = categories.find(
    (option) => String(option.category_id) === String(category),
  );
  const isSensitive = selectedCategory?.default_sensitive === 1;

  useEffect(() => {
    let isCurrent = true;
    getCategories()
      .then((response) => {
        if (isCurrent) setCategories(response.data ?? []);
      })
      .catch((error) => {
        if (isCurrent) {
          setCategoryError(
            error.response?.data?.message ||
              'Kategori gagal dimuat. Periksa koneksi ke server.',
          );
        }
      })
      .finally(() => {
        if (isCurrent) setLoadingCategories(false);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  async function onSubmit(values) {
    const formData = new FormData();
    formData.append('name', values.name.trim());
    formData.append('description', values.description?.trim() ?? '');
    formData.append('found_location', values.location.trim());
    formData.append('category_id', values.category);
    formData.append('found_date', values.date);
    formData.append('image', values.photo[0]);

    setSubmitting(true);
    try {
      const response = await createItemReport(formData);
      notify(response.message || 'Laporan barang berhasil dikirim.', 'success');
      reset();
      navigate(paths.catalog);
    } catch (error) {
      notify(
        error.response?.data?.message || 'Laporan barang gagal dikirim.',
        'error',
      );
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
        <p role="status">
          Saat ini laporan yang dapat dikirim adalah barang temuan.
        </p>
        {categoryError && <p role="alert">{categoryError}</p>}

        <form
          className="report-form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
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
            categories={categories}
            error={errors.category}
            register={register}
          />

          <label className="report-field" htmlFor="item-location">
            <span>Lokasi ditemukan</span>
            <input
              id="item-location"
              type="text"
              placeholder="Contoh: Kantin gedung A"
              aria-invalid={Boolean(errors.location)}
              {...register('location', { required: 'Lokasi wajib diisi.' })}
            />
            {errors.location && (
              <span className="report-error">{errors.location.message}</span>
            )}
          </label>

          <label className="report-field" htmlFor="item-date">
            <span>Tanggal ditemukan</span>
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
              aria-invalid={Boolean(errors.description)}
              {...register('description', {
                required: 'Deskripsi wajib diisi.',
              })}
            />
            {errors.description && (
              <span className="report-error">{errors.description.message}</span>
            )}
          </label>

          <div className="report-submit-area">
            <Button
              className="report-submit-button"
              type="submit"
              disabled={
                submitting ||
                loadingCategories ||
                Boolean(categoryError) ||
                categories.length === 0
              }
            >
              {submitting || loadingCategories
                ? 'Memproses...'
                : 'Kirim Laporan'}
            </Button>
            <p>Status awal: Menunggu di Pos Satpam</p>
          </div>
        </form>
      </div>
    </div>
  );
}
